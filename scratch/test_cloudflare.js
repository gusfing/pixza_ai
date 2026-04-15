// Simple test script using Node.js native fetch (v18+)
async function testCloudflare() {
  console.log("Testing Cloudflare Workers AI integration...");
  
  const payload = {
    prompt: "A beautiful futuristic city with flying cars and neon lights, cinematic lighting, high detail",
    selectedModel: {
      provider: "cloudflare",
      modelId: "@cf/black-forest-labs/flux-1-schnell",
      displayName: "FLUX.1 Schnell"
    },
    mediaType: "image"
  };

  try {
    console.log("Sending request to http://localhost:3000/api/generate...");
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data.success) {
        console.log("✅ Success! Image generated.");
        if (data.image) {
          console.log(`Image data received (Base64 string length: ${data.image.length})`);
          console.log("First 50 chars:", data.image.substring(0, 50));
        } else {
          console.log("No image data in response, but success=true?");
        }
      } else {
        console.error("❌ Failed:", data.error || "Unknown error");
        if (data.details) console.error("Details:", data.details);
      }
    } catch (e) {
      console.error("❌ Response was not JSON:");
      console.log(text.substring(0, 1000)); // Show start of HTML error
    }
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }
}

testCloudflare();
