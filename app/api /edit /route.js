import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, isVideo, style, aspectRatio } = await req.json();

    // ওয়াটারমার্ক, ক্যামেরার নাম, লোগো এবং টেক্সট সরানোর অটো নির্দেশনা
    const cleanPrompt = `${prompt}, remove all watermarks, remove camera brand text, remove camera logos, clear background text, clean photo, high quality, 8k resolution`;

    // Pollinations AI API (Free & Fast)
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const resultUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    return NextResponse.json({
      success: true,
      resultUrl: resultUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
