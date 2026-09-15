import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const falKey = process.env.FAL_KEY;

    if (!falKey) {
      return NextResponse.json(
        {
          success: false,
          error: "FAL_KEY is missing.",
        },
        { status: 500 }
      );
    }

    fal.config({
      credentials: falKey,
    });

    const { searchParams } = new URL(req.url);

    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: "requestId is required.",
        },
        { status: 400 }
      );
    }

    const status = await fal.queue.status(
      "fal-ai/wan/v2.7/edit-video",
      {
        requestId,
        logs: false,
      }
    );

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(
        "fal-ai/wan/v2.7/edit-video",
        {
          requestId,
        }
      );

      const videoUrl = result?.data?.video?.url;

      if (!videoUrl) {
        return NextResponse.json(
          {
            success: false,
            error: "AI finished but no output video was returned.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        videoUrl,
      });
    }

    if (status.status === "FAILED") {
      return NextResponse.json({
        success: false,
        status: "FAILED",
        error: "AI video processing failed.",
      });
    }

    return NextResponse.json({
      success: true,
      status: status.status,
      message: "Video is still processing.",
    });

  } catch (error) {
    console.error("Video Edit Status Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to check video status.",
      },
      { status: 500 }
    );
  }
}
