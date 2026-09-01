import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const prompt = body.prompt || "";
    const imageUrl = body.imageUrl || "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        {
          error:
            "Please upload an image. AI Edit requires an input image.",
        },
        { status: 400 }
      );
    }

    /*
      STEP 2:
      We keep the uploaded image information here.

      The previous version ignored imageUrl and generated
      a completely new image from the prompt.
    */

    return NextResponse.json({
      success: true,
      message:
        "Image received. Image-to-image editing endpoint is ready for the next step.",
      prompt: prompt,
      imageReceived: true,
    });
  } catch (error) {
    console.error("AI Edit Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
