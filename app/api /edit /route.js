import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    const { prompt, imageUrl } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "AI Prompt দেওয়া হয়নি।",
        },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Image data পাওয়া যায়নি।",
        },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json(
        {
          success: false,
          error: "HF_TOKEN environment variable পাওয়া যায়নি।",
        },
        { status: 500 }
      );
    }

    if (!imageUrl.startsWith("data:image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image format.",
        },
        { status: 400 }
      );
    }

    const match = imageUrl.match(
      /^data:(image\/[^;]+);base64,(.+)$/
    );

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Image data সঠিক নয়।",
        },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const imageBuffer = Buffer.from(base64Data, "base64");

    const client = new InferenceClient(hfToken);

    /*
     * Image-to-image editing model.
     * যদি আপনার Hugging Face account-এ এই model access না থাকে,
     * পরে আপনার available model অনুযায়ী এটি পরিবর্তন করা যাবে।
     */
    const model = "timbrooks/instruct-pix2pix";

    const result = await client.imageToImage({
      model,
      inputs: imageBuffer,
      parameters: {
        prompt: prompt.trim(),
      },
    });

    if (!result) {
      throw new Error("Hugging Face কোনো image result দেয়নি।");
    }

    let outputBuffer;

    if (result instanceof Blob) {
      outputBuffer = Buffer.from(
        await result.arrayBuffer()
      );
    } else if (result instanceof ArrayBuffer) {
      outputBuffer = Buffer.from(result);
    } else if (Buffer.isBuffer(result)) {
      outputBuffer = result;
    } else if (result?.data) {
      outputBuffer = Buffer.from(result.data);
    } else {
      throw new Error("AI image response format সঠিক নয়।");
    }

    if (!outputBuffer || outputBuffer.length === 0) {
      throw new Error("Edited image তৈরি হয়নি।");
    }

    const outputBase64 = outputBuffer.toString("base64");

    const resultUrl = `data:${mimeType};base64,${outputBase64}`;

    return NextResponse.json({
      success: true,
      resultUrl,
    });
  } catch (error) {
    console.error("Image AI Edit Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Image AI editing failed.",
      },
      { status: 500 }
    );
  }
}
