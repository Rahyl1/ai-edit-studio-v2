"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = () => {
    if (!file || !prompt) {
      alert("অনুগ্রহ করে ফাইল এবং প্রম্পট দুটোই দিন!");
      return;
    }
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      setResult("https://via.placeholder.com/600x400?text=AI+Edited+Result");
    }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f19", color: "#fff", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#111827", padding: "24px", borderRadius: "16px", border: "1px solid #1f2937" }}>
        
        {/* Title */}
        <h1 style={{ color: "#22d3ee", textAlign: "center", marginBottom: "8px" }}>✨ AI Edit Studio</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "14px", marginBottom: "20px" }}>
          আপনার টেক্সট প্রম্পট দিয়ে ছবি ও ভিডিও ইচ্ছেমতো এডিট করুন
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", backgroundColor: "#030712", padding: "5px", borderRadius: "10px" }}>
          <button
            onClick={() => setActiveTab("image")}
            style={{
              flex: 1, padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer",
              backgroundColor: activeTab === "image" ? "#0891b2" : "transparent", color: "#fff", fontWeight: "bold"
            }}
          >
            🖼️ Image AI Edit
          </button>
          <button
            onClick={() => setActiveTab("video")}
            style={{
              flex: 1, padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer",
              backgroundColor: activeTab === "video" ? "#0891b2" : "transparent", color: "#fff", fontWeight: "bold"
            }}
          >
            🎥 Video AI Edit
          </button>
        </div>

        {/* Input Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
              {activeTab === "image" ? "ছবি নির্বাচন করুন:" : "ভিডিও নির্বাচন করুন:"}
            </label>
            <input
              type="file"
              accept={activeTab === "image" ? "image/*" : "video/*"}
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: "100%", padding: "10px", backgroundColor: "#030712", color: "#fff", border: "1px solid #374151", borderRadius: "8px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>আপনার প্রম্পট (AI নির্দেশনা):</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTab === "image" ? "যেমন: ছবির ব্যাকগ্রাউন্ড পরিবর্তন করে সূর্যাস্ত দাও..." : "যেমন: ভিডিওর গতি দ্বিগুণ করো এবং সাবটাইটেল দাও..."}
              style={{ width: "100%", padding: "10px", backgroundColor: "#030712", color: "#fff", border: "1px solid #374151", borderRadius: "8px", boxSizing: "border-box", resize: "none" }}
            />
          </div>

          <button
            onClick={handleProcess}
            disabled={loading}
            style={{
              width: "100%", padding: "14px", backgroundColor: loading ? "#374151" : "#06b6d4", color: "#fff",
              border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer"
            }}
          >
            {loading ? "⏳ প্রসেস হচ্ছে..." : "🪄 ম্যাজিক এডিট করুন"}
          </button>
        </div>

        {/* Output Result */}
        {result && (
          <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid #1f2937", paddingTop: "16px" }}>
            <h3 style={{ color: "#22d3ee", fontSize: "14px", marginBottom: "10px" }}>এডিট সম্পন্ন ফলাফল:</h3>
            <img src={result} alt="AI Result" style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }} />
            <a href={result} download style={{ color: "#22d3ee", fontSize: "12px", textDecoration: "none" }}>📥 ডাউনলোড করুন</a>
          </div>
        )}

      </div>
    </div>
  );
}
