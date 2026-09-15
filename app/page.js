"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("অনুগ্রহ করে একটি ছবি বা ভিডিও নির্বাচন করুন।");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", activeTab);
      formData.append("prompt", prompt);

      const res = await fetch("/api/telegram", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setFile(null);
        setPreview(null);
        setPrompt("");
      } else {
        alert("ত্রুটি: " + (data.error || "ফাইল পাঠানো যায়নি।"));
      }
    } catch (err) {
      console.error(err);
      alert("Error details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", width: "100%", padding: "16px 8px", color: "#f8fafc", fontFamily: "sans-serif", display: "flex", justifyContent: "center", alignItems: "flex-start", boxSizing: "border-box" }}>
      <div style={{ backgroundColor: "#1e293b", width: "100%", maxWidth: "550px", borderRadius: "16px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", border: "1px solid #334155", boxSizing: "border-box" }}>
        
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", color: "#38bdf8", margin: "0 0 6px 0", fontWeight: "bold" }}>✨ AI Studio Submission</h1>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>ফাইল ও প্রম্পট জমা দিন</p>
        </div>

        <div style={{ display: "flex", backgroundColor: "#0f172a", borderRadius: "10px", padding: "4px", marginBottom: "18px" }}>
          <button
            onClick={() => { setActiveTab("image"); setSubmitted(false); }}
            style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: activeTab === "image" ? "#38bdf8" : "transparent", color: activeTab === "image" ? "#0f172a" : "#94a3b8", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
          >
            🖼️ Image Request
          </button>
          <button
            onClick={() => { setActiveTab("video"); setSubmitted(false); }}
            style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: activeTab === "video" ? "#38bdf8" : "transparent", color: activeTab === "video" ? "#0f172a" : "#94a3b8", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
          >
            🎥 Video Request
          </button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
            {activeTab === "image" ? "এডিট করার ছবি সিলেক্ট করুন:" : "ভিডিও সিলেক্ট করুন:"}
          </label>
          <input
            type="file"
            accept={activeTab === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f8fafc", fontSize: "12px", boxSizing: "border-box" }}
          />
        </div>

        {preview && (
          <div style={{ marginBottom: "16px", textAlign: "center", backgroundColor: "#0f172a", padding: "10px", borderRadius: "8px", border: "1px solid #334155" }}>
            {activeTab === "image" ? (
              <img src={preview} alt="Preview" style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "6px" }} />
            ) : (
              <video src={preview} controls style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "6px" }} />
            )}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>✨ কী পরিবর্তন বা এডিট চান:</label>
          <textarea
            rows="3"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="যেমন: ব্যাকগ্রাউন্ড পাল্টে দাও..."
            style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "12px", boxSizing: "border-box", resize: "none" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "12px", backgroundColor: loading ? "#64748b" : "#38bdf8", color: "#0f172a", fontWeight: "bold", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
        >
          {loading ? "⏳ ফর্ম জমা হচ্ছে..." : "🚀 এডিট রিকোয়েস্ট পাঠান"}
        </button>

        {submitted && (
          <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#064e3b", border: "1px solid #059669", borderRadius: "8px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "#34d399", fontSize: "13px", fontWeight: "bold" }}>
              ✅ সফলভাবে জমা হয়েছে! আপনার টেলিগ্রাম বটে মেসেজ চলে গেছে।
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
