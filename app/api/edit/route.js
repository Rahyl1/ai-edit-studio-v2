import { NextResponse } from "next/server";

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

    // Hugging Face API Token
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "HF_TOKEN is missing in Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    /*
      Browser image:
      data:image/jpeg;base64,...
      data:image/png;base64,...
    */

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

    const imageBuffer = Buffer.from(
      base64Data,
      "base64"
    );

    /*
      Hugging Face image-to-image endpoint.
      FLUX Kontext is designed for image editing
      while preserving the source image.
    */

    const model =
      "black-forest-labs/FLUX.1-Kontext-dev";

    const editPrompt = `
Edit the provided image according to the user's instruction.

IMPORTANT:
- Preserve the exact same person from the original image.
- Do NOT replace the person with another person.
- Preserve the person's identity and facial features.
- Do NOT change the person's gender.
- Preserve hairstyle, body appearance, clothing and pose unless explicitly requested.
- Only make the changes requested by the user.
- Keep the result photorealistic and natural.

User instruction:
${prompt}
`;

    /*
      Hugging Face Inference Providers
    */

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": mimeType,
        },

        body: imageBuffer,
      }
    );

    /*
      Read response safely.
    */

    const responseBuffer =
      await response.arrayBuffer();

    if (!response.ok) {
      const errorText = new TextDecoder().decode(
        responseBuffer
      );

      console.error(
        "Hugging Face API Error:",
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            `Hugging Face AI failed (${response.status}).`,
          details: errorText.slice(0, 1000),
        },
        { status: response.status }
      );
    }

    /*
      Hugging Face returns an image.
      Convert it to a browser Data URL.
    */

    const resultBase64 =
      Buffer.from(responseBuffer).toString(
        "base64"
      );

    return NextResponse.json({
      success: true,
      resultUrl:
        `data:image/png;base64,${resultBase64}`,
    });
  } catch (error) {
    console.error(
      "Image Edit Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
