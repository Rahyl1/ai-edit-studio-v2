import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "AI Prompt দেওয়া হয়নি।" },
        { status: 400 }
      );
    }

    // Pollinations AI
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true`;

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("AI ছবি তৈরি করতে ব্যর্থ হয়েছে।");
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(imageBuffer).toString("base64");
    const resultUrl = `data:image/jpeg;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      resultUrl,
    });
  } catch (error) {
    console.error("Image AI Edit Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Image AI editing failed.",
      },
      { status: 500 }
    );
  }
}
