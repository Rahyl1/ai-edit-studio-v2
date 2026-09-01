import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    let body = {};

    // Safely read JSON request
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request."
        },
        { status: 400 }
      );
    }

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a prompt."
        },
        { status: 400 }
      );
    }

    // Pollinations AI image endpoint
    const safePrompt = encodeURIComponent(prompt);

    const imageUrl =
      `https://image.pollinations.ai/prompt/${safePrompt}` +
      `?width=1024` +
      `&height=1024` +
      `&nologo=true` +
      `&seed=${Math.floor(Math.random() * 1000000)}`;

    return NextResponse.json({
      success: true,
      resultUrl: imageUrl
    });

  } catch (error) {
    console.error("AI Edit API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal Server Error"
      },
      { status: 500 }
    );
  }
}
