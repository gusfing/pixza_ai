"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Box,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function VercelV0Chat({ 
    onSend, 
    isLoading,
    placeholder = "Ask anything..." 
}: { 
    onSend?: (val: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSend?.(value);
                setValue("");
                adjustHeight(true);
            }
        }
    };

    const handleSend = () => {
        if (value.trim() && !isLoading) {
            onSend?.(value);
            setValue("");
            adjustHeight(true);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
            <div className="w-full">
                <div className="relative bg-[#0D0D0D] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden transition-all focus-within:border-white/10">
                    <div className="overflow-y-auto pt-4 px-4">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none outline-none focus:ring-0 focus-visible:ring-0",
                                "text-white text-base leading-relaxed",
                                "focus:outline-none",
                                "placeholder:text-white/20 placeholder:text-sm font-medium",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-t from-black/20 to-transparent">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2.5 hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-white/5"
                            >
                                <Paperclip className="w-4 h-4 text-white/40 group-hover:text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 hidden group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 transition-all border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center gap-2"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                Project
                            </button>
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!value.trim() || isLoading}
                                className={cn(
                                    "w-10 h-10 rounded-xl transition-all flex items-center justify-center border",
                                    value.trim() && !isLoading
                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                        : "bg-white/5 text-white/10 border-white/5"
                                )}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                                ) : (
                                    <ArrowUpIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide px-4">
                    <ActionButton
                        icon={<ImageIcon className="w-3.5 h-3.5" />}
                        label="Clone Image"
                    />
                    <ActionButton
                        icon={<Box className="w-3.5 h-3.5" />}
                        label="Figma"
                    />
                    <ActionButton
                        icon={<FileUp className="w-3.5 h-3.5" />}
                        label="Upload"
                    />
                    <ActionButton
                        icon={<MonitorIcon className="w-3.5 h-3.5" />}
                        label="UI Design"
                    />
                    <ActionButton
                        icon={<CircleUserRound className="w-3.5 h-3.5" />}
                        label="Auth"
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-white/40 hover:text-white transition-all whitespace-nowrap"
        >
            <span className="opacity-60">{icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
