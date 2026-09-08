"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
const [activeTab, setActiveTab] = useState("image");

const [file, setFile] = useState(null);
const [prompt, setPrompt] = useState("");
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);

// Video settings
const [style, setStyle] = useState("cinematic");
const [aspectRatio, setAspectRatio] = useState("9:16");
const [resolution, setResolution] = useState("720p");
const [audioSetting, setAudioSetting] = useState("origin");
const [videoStatus, setVideoStatus] = useState("");
const [videoPreview, setVideoPreview] = useState(null);

const videoPreviewRef = useRef(null);

useEffect(() => {
return () => {
if (videoPreviewRef.current) {
URL.revokeObjectURL(videoPreviewRef.current);
}
};
}, []);

const handleTabChange = (tab) => {
setActiveTab(tab);
setFile(null);
setResult(null);
setVideoStatus("");
setVideoPreview(null);
setPrompt("");
};

const handleFileChange = (e) => {
const selectedFile = e.target.files?.[0];

if (!selectedFile) {
  setFile(null);
  return;
}

if (activeTab === "image") {
  if (!selectedFile.type.startsWith("image/")) {
    alert("অনুগ্রহ করে একটি ছবি নির্বাচন করুন।");
    e.target.value = "";
    setFile(null);
    return;
  }
}

if (activeTab === "video") {
  if (!selectedFile.type.startsWith("video/")) {
    alert("অনুগ্রহ করে একটি ভিডিও নির্বাচন করুন।");
    e.target.value = "";
    setFile(null);
    return;
  }

  if (selectedFile.size > 100 * 1024 * 1024) {
    alert("ভিডিও সর্বোচ্চ 100 MB হতে পারবে।");
    e.target.value = "";
    setFile(null);
    return;
  }

  if (videoPreviewRef.current) {
    URL.revokeObjectURL(videoPreviewRef.current);
  }

  const previewUrl = URL.createObjectURL(selectedFile);
  videoPreviewRef.current = previewUrl;
  setVideoPreview(previewUrl);
}

setFile(selectedFile);
setResult(null);
setVideoStatus("");

};

// =========================
// IMAGE AI EDIT
// =========================

const handleImageProcess = async () => {
if (!file) {
alert("প্রথমে একটি ছবি নির্বাচন করুন।");
return;
}

if (!prompt.trim()) {
  alert("অনুগ্রহ করে একটি AI Prompt লিখুন।");
  return;
}

setLoading(true);
setResult(null);

try {
  const imageUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = () => {
      reject(new Error("ছবিটি পড়তে সমস্যা হয়েছে।"));
    };

    reader.readAsDataURL(file);
  });

  if (
    !imageUrl ||
    typeof imageUrl !== "string" ||
    !imageUrl.startsWith("data:image/")
  ) {
    throw new Error("ছবির ডাটা সঠিকভাবে তৈরি হয়নি।");
  }

  const res = await fetch("/api/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      imageUrl,
      isVideo: false,
    }),
  });

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "Server থেকে সঠিক JSON response আসেনি।"
    );
  }

  if (!res.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "AI editing failed."
    );
  }

  if (data.resultUrl) {
    setResult(data.resultUrl);
  } else {
    throw new Error(
      data.error ||
        "AI কোনো edited image ফেরত দেয়নি।"
    );
  }
} catch (err) {
  console.error("Image AI Edit Error:", err);

  alert(
    "প্রসেসিংয়ে ভুল হয়েছে: " +
      (err.message || "Unknown error")
  );
} finally {
  setLoading(false);
}

};

// =========================
// VIDEO AI EDIT
// =========================

const handleVideoProcess = async () => {
if (!file) {
alert("প্রথমে একটি ভিডিও নির্বাচন করুন।");
return;
}

if (!prompt.trim()) {
  alert("অনুগ্রহ করে ভিডিও কীভাবে এডিট করতে চান তা লিখুন।");
  return;
}

if (!file.type.startsWith("video/")) {
  alert("শুধু ভিডিও ফাইল ব্যবহার করুন।");
  return;
}

if (file.size > 100 * 1024 * 1024) {
  alert("ভিডিও সর্বোচ্চ 100 MB হতে পারবে।");
  return;
}

setLoading(true);
setResult(null);
setVideoStatus("📤 ভিডিও আপলোড করা হচ্ছে...");

try {
  const formData = new FormData();

  formData.append("video", file);
  formData.append("prompt", prompt.trim());
  formData.append("style", style);
  formData.append("aspectRatio", aspectRatio);
  formData.append("resolution", resolution);
  formData.append("audioSetting", audioSetting);

  const res = await fetch("/api/video-edit", {
    method: "POST",
    body: formData,
  });

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "Server থেকে সঠিক JSON response আসেনি।"
    );
  }

  if (!res.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Video editing job শুরু করা যায়নি।"
    );
  }

  if (!data.requestId) {
    throw new Error(
      "AI processing request ID পাওয়া যায়নি।"
    );
  }

  setVideoStatus(
    "🤖 AI ভিডিও এডিট করছে... একটু অপেক্ষা করুন।"
  );

  await checkVideoStatus(data.requestId);
} catch (err) {
  console.error("Video AI Edit Error:", err);

  setVideoStatus("");

  alert(
    "প্রসেসিংয়ে ভুল হয়েছে: " +
      (err.message || "Unknown error")
  );

  setLoading(false);
}

};

const checkVideoStatus = async (requestId) => {
const maxAttempts = 120;
let attempts = 0;

const check = async () => {
  attempts++;

  if (attempts > maxAttempts) {
    throw new Error(
      "AI processing অনেক সময় নিচ্ছে। পরে আবার চেষ্টা করুন।"
    );
  }

  const res = await fetch(
    `/api/video-edit/status?requestId=${encodeURIComponent(
      requestId
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "Status server থেকে সঠিক response আসেনি।"
    );
  }

  if (!res.ok || !data.success) {
    throw new Error(
      data.error ||
        "Video processing status পাওয়া যায়নি।"
    );
  }

  if (data.status === "COMPLETED" && data.videoUrl) {
    setResult(data.videoUrl);
    setVideoStatus("✅ AI Video Edit সম্পন্ন হয়েছে!");
    setLoading(false);
    return;
  }

  if (data.status === "FAILED") {
    throw new Error(
      data.error ||
        "AI ভিডিও প্রসেসিং ব্যর্থ হয়েছে।"
    );
  }

  setVideoStatus(
    "⏳ AI ভিডিও প্রসেস করছে... (" +
      data.status +
      ")"
  );

  await new Promise((resolve) =>
    setTimeout(resolve, 5000)
  );

  await check();
};

await check();

};

const handleProcess = () => {
if (activeTab === "image") {
handleImageProcess();
return;
}

if (activeTab === "video") {
  handleVideoProcess();
}

};

return (
<div
style={{
minHeight: "100vh",
backgroundColor: "#0b0f19",
color: "#fff",
padding: "16px",
fontFamily: "sans-serif",
boxSizing: "border-box",
}}
>
<div
style={{
width: "100%",
maxWidth: "600px",
margin: "0 auto",
backgroundColor: "#111827",
padding: "20px",
borderRadius: "16px",
border: "1px solid #1f2937",
boxSizing: "border-box",
}}
>
<h1
style={{
color: "#22d3ee",
textAlign: "center",
marginBottom: "8px",
fontSize: "26px",
}}
>
✨ AI Edit Studio
</h1>

    <p
      style={{
        color: "#9ca3af",
        textAlign: "center",
        fontSize: "14px",
        marginBottom: "20px",
      }}
    >
      ছবি ও ভিডিও AI দিয়ে এডিট করুন
    </p>

    {/* TAB BUTTONS */}

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        backgroundColor: "#030712",
        padding: "6px",
        borderRadius: "12px",
      }}
    >
      <button
        onClick={() => handleTabChange("image")}
        style={{
          flex: 1,
          padding: "12px 8px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor:
            activeTab === "image"
              ? "#0891b2"
              : "transparent",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        🖼️ Image AI Edit
      </button>

      <button
        onClick={() => handleTabChange("video")}
        style={{
          flex: 1,
          padding: "12px 8px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor:
            activeTab === "video"
              ? "#0891b2"
              : "transparent",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        🎥 Video AI Edit
      </button>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* FILE UPLOAD */}

      <div>
        <label
          style={{
            fontSize: "13px",
            color: "#9ca3af",
            display: "block",
            marginBottom: "8px",
          }}
        >
          {activeTab === "image"
            ? "ছবি নির্বাচন করুন:"
            : "ভিডিও নির্বাচন করুন:"}
        </label>

        <input
          type="file"
          accept={
            activeTab === "image"
              ? "image/*"
              : "video/mp4,video/quicktime,video/*"
          }
          onChange={handleFileChange}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#030712",
            color: "#fff",
            border: "1px solid #374151",
            borderRadius: "10px",
            boxSizing: "border-box",
            fontSize: "14px",
          }}
        />

        {file && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "#22d3ee",
              wordBreak: "break-word",
            }}
          >
            ✅ নির্বাচিত ফাইল: {file.name}
          </div>
        )}
      </div>

      {/* VIDEO PREVIEW */}

      {activeTab === "video" && videoPreview && (
        <div>
          <video
            src={videoPreview}
            controls
            playsInline
            style={{
              width: "100%",
              borderRadius: "10px",
              backgroundColor: "#000",
              maxHeight: "360px",
            }}
          />
        </div>
      )}

      {/* VIDEO OPTIONS */}

      {activeTab === "video" && (
        <>
          <div>
            <label
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                display: "block",
                marginBottom: "8px",
              }}
            >
              🎬 Video Style
            </label>

            <select
              value={style}
              onChange={(e) =>
                setStyle(e.target.value)
              }
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#030712",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: "10px",
                fontSize: "14px",
              }}
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                📐 Aspect Ratio
              </label>

              <select
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(
                    e.target.value
                  )
                }
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#030712",
                  color: "#fff",
                  border:
                    "1px solid #374151",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                <option value="9:16">
                  9:16 Shorts
                </option>
                <option value="16:9">
                  16:9 Landscape
                </option>
                <option value="1:1">
                  1:1 Square
                </option>
                <option value="4:3">
                  4:3
                </option>
                <option value="3:4">
                  3:4
                </option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                🎞️ Resolution
              </label>

              <select
                value={resolution}
                onChange={(e) =>
                  setResolution(
                    e.target.value
                  )
                }
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#030712",
                  color: "#fff",
                  border:
                    "1px solid #374151",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                <option value="720p">
                  720p
                </option>
                <option value="1080p">
                  1080p
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                display: "block",
                marginBottom: "8px",
              }}
            >
              🔊 Audio
            </label>

            <select
              value={audioSetting}
              onChange={(e) =>
                setAudioSetting(
                  e.target.value
                )
              }
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#030712",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            >
              <option value="origin">
                🎵 Original Audio
              </option>
              <option value="auto">
                🤖 AI Auto Audio
              </option>
            </select>
          </div>
        </>
      )}

      {/* PROMPT */}

      <div>
        <label
          style={{
            fontSize: "13px",
            color: "#9ca3af",
            display: "block",
            marginBottom: "8px",
          }}
        >
          ✨ {activeTab === "image"
            ? "আপনার Prompt:"
            : "AI Video Edit Prompt:"}
        </label>

        <textarea
          rows={5}
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          disabled={loading}
          placeholder={
            activeTab === "image"
              ? "যেমন: আমার হাতে একটি সুন্দর লাল গোলাপ যোগ করো। আমার মুখ, চেহারা ও পরিচয় অপরিবর্তিত রাখো।"
              : "যেমন: ভিডিওটিকে cinematic look দাও, lighting উন্নত করো এবং natural realistic appearance রাখো।"
          }
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#030712",
            color: "#fff",
            border: "1px solid #374151",
            borderRadius: "10px",
            boxSizing: "border-box",
            resize: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {/* PROCESS BUTTON */}

      <button
        onClick={handleProcess}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor:
            loading
              ? "#374151"
              : "#06b6d4",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: loading
            ? "not-allowed"
            : "pointer",
        }}
      >
        {loading
          ? activeTab === "video"
            ? "⏳ AI Video Processing..."
            : "⏳ AI এডিট হচ্ছে..."
          : activeTab === "video"
          ? "🎬 AI Video Edit করুন"
          : "🪄 ম্যাজিক এডিট করুন"}
      </button>

      {/* VIDEO STATUS */}

      {activeTab === "video" &&
        videoStatus && (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#030712",
              border: "1px solid #1f2937",
              color: "#22d3ee",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {videoStatus}
          </div>
        )}
    </div>

    {/* RESULT */}

    {result && (
      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          borderTop:
            "1px solid #1f2937",
          paddingTop: "16px",
        }}
      >
        <h3
          style={{
            color: "#22d3ee",
            fontSize: "15px",
            marginBottom: "10px",
          }}
        >
          {activeTab === "video"
            ? "✅ AI Video Edit সম্পন্ন"
            : "✅ এডিট সম্পন্ন"}
        </h3>

        {activeTab === "video" ? (
          <>
            <video
              src={result}
              controls
              playsInline
              style={{
                width: "100%",
                borderRadius: "10px",
                backgroundColor: "#000",
                marginBottom: "12px",
              }}
            />

            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                display: "inline-block",
                padding: "12px 20px",
                backgroundColor: "#0891b2",
                color: "#fff",
                fontSize: "14px",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              ⬇️ Edited Video Download
            </a>
          </>
        ) : (
          <>
            <img
              src={result}
              alt="AI Edited Result"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            />

            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                display: "inline-block",
                padding: "10px 16px",
                backgroundColor: "#1f2937",
                color: "#22d3ee",
                fontSize: "13px",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              📥 ডাউনলোড করুন
            </a>
          </>
        )}
      </div>
    )}

    {/* COPYRIGHT / USAGE NOTICE */}

    <div
      style={{
        marginTop: "22px",
        padding: "12px",
        borderRadius: "10px",
        backgroundColor: "#030712",
        color: "#6b7280",
        fontSize: "11px",
        lineHeight: "1.6",
        textAlign: "center",
      }}
    >
      শুধুমাত্র নিজের তৈরি অথবা ব্যবহারের অনুমতি/লাইসেন্স
      থাকা ছবি ও ভিডিও আপলোড করুন। এই টুল কোনো
      copyright ownership পরিবর্তন করে না এবং
      copyright-free ব্যবহারের নিশ্চয়তা দেয় না।
    </div>
  </div>
</div>

);
}
