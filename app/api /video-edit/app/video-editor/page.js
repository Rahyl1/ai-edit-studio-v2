"use client";

import { useEffect, useState } from "react";

export default function VideoEditorPage() {
  const [video, setVideo] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [resolution, setResolution] = useState("720p");
  const [audioSetting, setAudioSetting] =
    useState("origin");

  const [processing, setProcessing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [resultUrl, setResultUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setResultUrl("");
    setProgress(0);

    if (!video) {
      setError("Please select a video.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please describe how you want to edit the video.");
      return;
    }

    if (video.size > 100 * 1024 * 1024) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setProcessing(true);
    setMessage("Uploading video...");

    try {
      const formData = new FormData();

      formData.append("video", video);
      formData.append("prompt", prompt);
      formData.append("style", style);
      formData.append("aspectRatio", aspectRatio);
      formData.append("resolution", resolution);
      formData.append("audioSetting", audioSetting);

      const response = await fetch(
        "/api/video-edit",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to start video editing."
        );
      }

      const requestId = data.requestId;

      setMessage(
        "AI processing started..."
      );

      await checkStatus(requestId);
    } catch (err) {
      setError(
        err.message ||
          "Video processing failed."
      );

      setProcessing(false);
    }
  }

  async function checkStatus(requestId) {
    let attempts = 0;
    const maxAttempts = 120;

    const poll = async () => {
      attempts++;

      const response = await fetch(
        `/api/video-edit/status?requestId=${encodeURIComponent(
          requestId
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to check processing status."
        );
      }

      if (data.status === "COMPLETED") {
        setProgress(100);
        setMessage(
          "Video editing completed!"
        );
        setResultUrl(data.videoUrl);
        setProcessing(false);
        return;
      }

      if (data.status === "FAILED") {
        throw new Error(
          data.error ||
            "AI video processing failed."
        );
      }

      const estimatedProgress =
        Math.min(
          95,
          Math.round(
            (attempts / maxAttempts) * 95
          )
        );

      setProgress(
        estimatedProgress
      );

      setMessage(
        "AI is editing your video..."
      );

      if (attempts >= maxAttempts) {
        throw new Error(
          "Processing is taking too long. Please try again later."
        );
      }

      setTimeout(poll, 5000);
    };

    await poll();
  }

  return (
    <main className="video-editor">
      <div className="container">

        <h1>🎬 AI Video Edit</h1>

        <p className="subtitle">
          Upload your video and describe how
          you want AI to edit it.
        </p>

        <form onSubmit={handleSubmit}>

          <label className="upload-box">
            <span>
              📤 Choose Video
            </span>

            <input
              type="file"
              accept="video/mp4,video/mov,video/*"
              onChange={(e) =>
                setVideo(
                  e.target.files?.[0] || null
                )
              }
            />
          </label>

          {video && (
            <div className="selected-file">
              🎬 {video.name}
            </div>
          )}

          {video && (
            <video
              className="preview"
              controls
              src={URL.createObjectURL(video)}
            />
          )}

          <label>
            📝 AI Editing Instruction
          </label>

          <textarea
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            placeholder="Example: Make this video cinematic, improve lighting, add a professional movie look and keep the person natural."
            rows={5}
          />

          <label>
            🎨 Video Style
          </label>

          <select
            value={style}
            onChange={(e) =>
              setStyle(e.target.value)
            }
          >
            <option value="cinematic">
              🎥 Cinematic
            </option>

            <option value="funny">
              😂 Funny
            </option>

            <option value="romantic">
              ❤️ Romantic
            </option>

            <option value="action">
              🔥 Action
            </option>

            <option value="custom">
              ✨ Custom
            </option>
          </select>

          <label>
            📱 Aspect Ratio
          </label>

          <select
            value={aspectRatio}
            onChange={(e) =>
              setAspectRatio(
                e.target.value
              )
            }
          >
            <option value="9:16">
              9:16 — Shorts/Reels/TikTok
            </option>

            <option value="16:9">
              16:9 — YouTube
            </option>

            <option value="1:1">
              1:1 — Square
            </option>

            <option value="4:3">
              4:3
            </option>

            <option value="3:4">
              3:4
            </option>
          </select>

          <label>
            🎞️ Resolution
          </label>

          <select
            value={resolution}
            onChange={(e) =>
              setResolution(
                e.target.value
              )
            }
          >
            <option value="720p">
              720p
            </option>

            <option value="1080p">
              1080p
            </option>
          </select>

          <label>
            🔊 Audio
          </label>

          <select
            value={audioSetting}
            onChange={(e) =>
              setAudioSetting(
                e.target.value
              )
            }
          >
            <option value="origin">
              Keep original audio
            </option>

            <option value="auto">
              AI decide audio
            </option>
          </select>

          <button
            type="submit"
            disabled={processing}
          >
            {processing
              ? "⏳ Processing..."
              : "✨ Edit Video with AI"}
          </button>
        </form>

        {processing && (
          <section className="progress-box">

            <p>{message}</p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <strong>
              {progress}%
            </strong>

          </section>
        )}

        {error && (
          <div className="error">
            ❌ {error}
          </div>
        )}

        {resultUrl && (
          <section className="result">

            <h2>
              ✅ Edited Video
            </h2>

            <video
              controls
              playsInline
              src={resultUrl}
            />

            <a
              href={resultUrl}
              download="ai-edited-video.mp4"
              className="download"
            >
              ⬇️ Download Edited Video
            </a>

          </section>
        )}

      </div>
    </main>
  );
}
