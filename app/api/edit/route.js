import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

export async function POST(req) {
  try {
    const body = await req.json();

    const prompt = (body.prompt || "").trim();
    const imageUrl = body.imageUrl || "";

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload an image to edit.",
        },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json(
        {
          success: false,
          error: "HF_TOKEN is missing in Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    // Convert browser Data URL to Blob
    const match = imageUrl.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image format.",
        },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const imageBuffer = Buffer.from(base64Data, "base64");

    const imageBlob = new Blob([imageBuffer], {
      type: mimeType,
    });

    const client = new InferenceClient(hfToken);

    const editPrompt = `
Edit this image according to the user's instruction.

Preserve the original person's identity, face, hairstyle,
body appearance, clothing and pose unless the user explicitly
asks to change them.

Do not replace the person with another person.
Keep the result photorealistic and natural.

User instruction:
${prompt}
`;

    const result = await client.imageToImage({
      model: "black-forest-labs/FLUX.1-Kontext-dev",
      inputs: imageBlob,
      parameters: {
        prompt: editPrompt,
      },
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Hugging Face returned an empty result.",
        },
        { status: 502 }
      );
    }

    const resultBuffer = Buffer.from(
      await result.arrayBuffer()
    );

    const resultBase64 = resultBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      resultUrl: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error) {
    console.error("Image Edit Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Hugging Face image editing failed.",
      },
      { status: 500 }
    );
  }
}
