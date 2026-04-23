import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { WorkflowFile } from "@/store/workflowStore";
import { ContentLevel, getPresetTemplate } from "@/lib/quickstart/templates";
import { buildQuickstartPrompt } from "@/lib/quickstart/prompts";
import {
  validateWorkflowJSON,
  repairWorkflowJSON,
  parseJSONFromResponse,
} from "@/lib/quickstart/validation";
import { ImageInputNodeData } from "@/types";
import fs from "fs/promises";
import path from "path";

export const maxDuration = 60; // 1 minute timeout

/**
 * Convert local image paths (e.g., /sample-images/model.jpg) to base64 data URLs
 */
async function convertLocalImagesToBase64(workflow: WorkflowFile): Promise<WorkflowFile> {
  const updatedNodes = await Promise.all(
    workflow.nodes.map(async (node) => {
      if (node.type === "imageInput") {
        const data = node.data as ImageInputNodeData;
        // Check if image is a local path (starts with /sample-images/)
        if (data.image && data.image.startsWith("/sample-images/")) {
          try {
            // Read file from public folder
            const publicPath = path.join(process.cwd(), "public", data.image);
            const fileBuffer = await fs.readFile(publicPath);
            const base64 = fileBuffer.toString("base64");

            // Determine MIME type from extension
            const ext = path.extname(data.image).toLowerCase();
            const mimeType = ext === ".png" ? "image/png"
              : ext === ".webp" ? "image/webp"
              : "image/jpeg";

            const dataUrl = `data:${mimeType};base64,${base64}`;

            return {
              ...node,
              data: {
                ...data,
                image: dataUrl,
              },
            };
          } catch (error) {
            // Return node unchanged if conversion fails
            return node;
          }
        }
      }
      return node;
    })
  );

  return {
    ...workflow,
    nodes: updatedNodes,
  };
}

interface QuickstartRequest {
  description: string;
  contentLevel: ContentLevel;
  templateId?: string;
}

interface QuickstartResponse {
  success: boolean;
  workflow?: WorkflowFile;
  error?: string;
}

export async function POST(request: NextRequest) {
  const requestId = `qs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  try {
    const body: QuickstartRequest = await request.json();
    const { description, contentLevel, templateId } = body;
    // If a preset template is selected, return it directly
    if (templateId) {
      try {
        const workflow = getPresetTemplate(templateId, contentLevel);
        // Convert any local image paths to base64 for the Gemini API
        const workflowWithBase64 = await convertLocalImagesToBase64(workflow);
        return NextResponse.json<QuickstartResponse>({
          success: true,
          workflow: workflowWithBase64,
        });
      } catch (error) {
        return NextResponse.json<QuickstartResponse>(
          {
            success: false,
            error: error instanceof Error ? error.message : "Failed to load template",
          },
          { status: 400 }
        );
      }
    }

    // Validate description
    if (!description || typeof description !== "string" || description.trim().length < 3) {
      return NextResponse.json<QuickstartResponse>(
        {
          success: false,
          error: "Please provide a description of your workflow (at least 3 characters)",
        },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json<QuickstartResponse>(
        {
          success: false,
          error: "API key not configured. Add GEMINI_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    // Build the prompt
    const prompt = buildQuickstartPrompt(description.trim(), contentLevel);
    // Call Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.3, // Lower for more consistent JSON output
        maxOutputTokens: 16384, // Increased for complex workflows with many nodes
      },
    });

    const duration = Date.now() - startTime;
    // Extract text from response
    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json<QuickstartResponse>(
        {
          success: false,
          error: "No response from AI model",
        },
        { status: 500 }
      );
    }
    // Parse JSON from response
    let parsedWorkflow: unknown;
    try {
      parsedWorkflow = parseJSONFromResponse(responseText);
    } catch (error) {
      return NextResponse.json<QuickstartResponse>(
        {
          success: false,
          error: "Failed to parse workflow from AI response. Please try again.",
        },
        { status: 500 }
      );
    }

    // Validate the workflow
    const validation = validateWorkflowJSON(parsedWorkflow);
    // Repair if needed
    let workflow: WorkflowFile;
    if (!validation.valid) {
      validation.errors.forEach((err) => {
      });
      workflow = repairWorkflowJSON(parsedWorkflow);
    } else {
      workflow = parsedWorkflow as WorkflowFile;
    }

    // Ensure the workflow has an ID
    if (!workflow.id) {
      workflow.id = `wf_${Date.now()}_quickstart`;
    }
    return NextResponse.json<QuickstartResponse>({
      success: true,
      workflow,
    });
  } catch (error) {
    // Handle rate limiting
    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json<QuickstartResponse>(
        {
          success: false,
          error: "Rate limit reached. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json<QuickstartResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate workflow",
      },
      { status: 500 }
    );
  }
}

