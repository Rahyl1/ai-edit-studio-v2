import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt, imageUrl, isVideo } = await req.json();

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "FAL_KEY missing in Vercel settings" }, { status: 500 });
    }

    // Image AI Editing via Fal.ai (Flux)
    const endpoint = isVideo 
      ? "https://fal.run/fal-ai/minimax/video-01" 
      : "https://fal.run/fal-ai/flux/dev";

    const payload = isVideo 
      ? { prompt } 
      : { prompt, image_url: imageUrl };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || "AI Processing failed" }, { status: response.status });
    }

    const resultUrl = isVideo ? data.video?.url : data.images?.[0]?.url;
    return NextResponse.json({ resultUrl });

  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
