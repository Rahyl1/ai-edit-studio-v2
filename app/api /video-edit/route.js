import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const falKey = process.env.FAL_KEY;

    if (!falKey) {
      return NextResponse.json(
        {
          success: false,
          error: "FAL_KEY is missing in Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    fal.config({
      credentials: falKey,
    });

    const formData = await req.formData();

    const video = formData.get("video");
    const prompt = (formData.get("prompt") || "").trim();
    const style = (formData.get("style") || "cinematic").trim();
    const aspectRatio = formData.get("aspectRatio") || "9:16";
    const resolution = formData.get("resolution") || "720p";
    const audioSetting = formData.get("audioSetting") || "origin";

    if (!video || typeof video === "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a video.",
        },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter an editing instruction.",
        },
        { status: 400 }
      );
    }

    if (video.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "Video must be smaller than 100 MB.",
        },
        { status: 400 }
      );
    }

    if (!video.type.startsWith("video/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only video files are allowed.",
        },
        { status: 400 }
      );
    }

    const videoUrl = await fal.storage.upload(video);

    const styleInstructions = {
      cinematic:
        "Create a cinematic professional film look with natural lighting, smooth visual treatment and realistic details.",

      funny:
        "Give the video a fun, energetic and playful visual style while keeping the main subject recognizable.",

      romantic:
        "Give the video a warm romantic cinematic look with soft natural lighting and elegant visual atmosphere.",

      action:
        "Give the video an energetic action-movie visual style with dramatic lighting and dynamic cinematic treatment.",

      custom:
        "Follow the user's editing instruction precisely while preserving the main subject and important scene details.",
    };

    const styleText =
      styleInstructions[style] || styleInstructions.custom;

    const finalPrompt = `
Edit the provided video according to the user's instruction.

Video style:
${styleText}

Important requirements:
- Preserve the main person's identity.
- Preserve natural facial appearance.
- Preserve the original motion whenever possible.
- Do not unnecessarily replace the person.
- Keep the result realistic and visually coherent.
- Do not add random objects or people.
- Only make changes requested by the user.

User instruction:
${prompt}
`;

    const { request_id } = await fal.queue.submit(
      "fal-ai/wan/v2.7/edit-video",
      {
        input: {
          prompt: finalPrompt,
          video_url: videoUrl,

          resolution:
            resolution === "1080p" ? "1080p" : "720p",

          aspect_ratio: [
            "16:9",
            "9:16",
            "1:1",
            "4:3",
            "3:4",
          ].includes(aspectRatio)
            ? aspectRatio
            : "9:16",

          audio_setting:
            audioSetting === "auto" ? "auto" : "origin",

          enable_safety_checker: true,
        },
      }
    );

    return NextResponse.json({
      success: true,
      requestId: request_id,
      message: "Video editing job submitted successfully.",
    });

  } catch (error) {
    console.error("Video Edit Submit Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to submit video editing job.",
      },
      { status: 500 }
    );
  }
}
