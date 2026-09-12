"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    "👗 Change outfit to elegant designer kurti",
    "✨ Add cinematic lighting and 8k realistic polish",
    "🌅 Change background to a peaceful nature landscape",
    "🎨 Transform into studio portrait style",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && activeTab === "image") {
      alert("অনুগ্রহ করে একটি Prompt লিখুন বা প্রিসেট বেছে নিন।");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const enhancedPrompt = `${prompt.trim()}, copyright-free original creation, highly detailed, 8k resolution, photorealistic`;

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          isVideo: activeTab === "video",
          style: videoStyle,
          aspectRatio,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "প্রসেসিং সফল হয়নি।");
      }

      setResult(data.resultUrl);
    } catch (err) {
      console.error(err);
      alert("ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", width: "100%", padding: "12px 8px", color: "#f8fafc", fontFamily: "sans-serif", display: "flex", justifyContent: "center", alignItems: "flex-start", boxSizing: "border-box" }}>
      <div style={{ backgroundColor: "#1e293b", width: "100%", maxWidth: "600px", borderRadius: "16px", padding: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", border: "1px solid #334155", boxSizing: "border-box" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "24px", color: "#38bdf8", margin: "0 0 4px 0", fontWeight: "bold" }}>✨ AI Edit Studio</h1>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>ছবি ও ভিডিও AI দিয়ে এডিট করুন (কপিরাইট মুক্ত)</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", backgroundColor: "#0f172a", borderRadius: "10px", padding: "4px", marginBottom: "16px" }}>
          <button
            onClick={() => { setActiveTab("image"); setResult(null); }}
            style={{ flex: 1, padding: "12px 6px", border: "none", borderRadius: "8px", backgroundColor: activeTab === "image" ? "#38bdf8" : "transparent", color: activeTab === "image" ? "#0f172a" : "#94a3b8", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
          >
            🖼️ Image AI Edit
          </button>
          <button
            onClick={() => { setActiveTab("video"); setResult(null); }}
            style={{ flex: 1, padding: "12px 6px", border: "none", borderRadius: "8px", backgroundColor: activeTab === "video" ? "#38bdf8" : "transparent", color: activeTab === "video" ? "#0f172a" : "#94a3b8", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
          >
            🎥 Video AI Edit
          </button>
        </div>

        {/* File Input */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#cbd5e1", display: "block", marginBottom: "6px", fontWeight: "500" }}>
            {activeTab === "image" ? "ছবি নির্বাচন করুন:" : "ভিডিও নির্বাচন করুন:"}
          </label>
          <input
            type="file"
            accept={activeTab === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f8fafc", fontSize: "12px", boxSizing: "border-box" }}
          />
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginBottom: "16px", textAlign: "center", backgroundColor: "#0f172a", padding: "10px", borderRadius: "8px", border: "1px solid #334155" }}>
            {activeTab === "image" ? (
              <img src={preview} alt="Preview" style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "6px" }} />
            ) : (
              <video src={preview} controls style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "6px" }} />
            )}
          </div>
        )}

        {/* Video Options */}
        {activeTab === "video" && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Style</label>
              <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", fontSize: "12px" }}>
                <option>Cinematic</option>
                <option>Anime</option>
                <option>3D Render</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Ratio</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", fontSize: "12px" }}>
                <option>9:16 Shorts</option>
                <option>16:9 Wide</option>
              </select>
            </div>
          </div>
        )}

        {/* Presets */}
        {activeTab === "image" && (
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>রেডি প্রম্পট (ক্লিক করুন):</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.replace(/^[^\s]+\s/, ""))}
                  style={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#cbd5e1", padding: "8px 12px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "12px" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Field */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontSize: "12px", color: "#cbd5e1", display: "block", marginBottom: "6px", fontWeight: "500" }}>✨ AI Prompt:</label>
          <textarea
            rows="3"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="যেমন: ছবিতে লাল কুর্তি পরিয়ে দাও..."
            style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "12px", boxSizing: "border-box", resize: "none" }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "14px", backgroundColor: loading ? "#64748b" : "#38bdf8", color: "#0f172a", fontWeight: "bold", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)" }}
        >
          {loading ? "⏳ এডিট হচ্ছে..." : activeTab === "image" ? "🪄 ম্যাজিক এডিট করুন" : "🎬 AI Video Edit করুন"}
        </button>

        {/* Result Display */}
        {result && (
          <div style={{ marginTop: "20px", borderTop: "1px solid #334155", paddingTop: "14px", textAlign: "center" }}>
            <h3 style={{ color: "#38bdf8", fontSize: "13px", marginBottom: "8px" }}>ফলাফল (Copyright Free):</h3>
            {activeTab === "image" ? (
              <img src={result} alt="Result" style={{ width: "100%", borderRadius: "8px", border: "1px solid #334155" }} />
            ) : (
              <video src={result} controls style={{ width: "100%", borderRadius: "8px", border: "1px solid #334155" }} />
            )}
            <a href={result} target="_blank" download style={{ display: "inline-block", marginTop: "10px", fontSize: "12px", color: "#38bdf8", textDecoration: "underline" }}>
              ⬇️ ফুল কোয়ালিটিতে ডাউনলোড করুন
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
