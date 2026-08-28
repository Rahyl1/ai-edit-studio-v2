"use client";
import { useState } from "react";
import { Image, Video, Wand2, Upload, Sparkles } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = async () => {
    if (!file || !prompt) {
      alert("অনুগ্রহ করে ফাইল এবং প্রম্পট দুটোই দিন!");
      return;
    }
    setLoading(true);
    setResult(null);

    // AI Processing Simulation (পরবর্তীতে ব্যাকএন্ড API যুক্ত হবে)
    setTimeout(() => {
      setLoading(false);
      setResult("https://via.placeholder.com/600x400?text=AI+Edited+Result");
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" /> AI Edit Studio
          </h1>
          <p className="text-slate-400 text-sm">
            আপনার টেক্সট প্রম্পট দিয়ে ছবি ও ভিডিও ইচ্ছেমতো এডিট করুন
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "image" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Image className="w-4 h-4" /> Image AI Edit
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "video" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" /> Video AI Edit
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center transition-all bg-slate-950/50">
            <input
              type="file"
              id="file-upload"
              accept={activeTab === "image" ? "image/*" : "video/*"}
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-300 font-medium">
                {file ? file.name : `এখানে ${activeTab === "image" ? "ছবি" : "ভিডিও"} আপলোড করুন`}
              </span>
              <span className="text-xs text-slate-500">PNG, JPG, MP4 সাপোর্টেড</span>
            </label>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              আপনার প্রম্পট (AI-কে নির্দেশনা দিন):
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === "image"
                  ? "যেমন: ছবিটির ব্যাকগ্রাউন্ড বদলে একটি সুন্দর সূর্যাস্তের দৃশ্য দাও..."
                  : "যেমন: ভিডিওটি থেকে অপ্রয়োজনীয় অংশ কেটে সাবটাইটেল যোগ করো..."
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-slate-600 resize-none"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
          >
            {loading ? (
              <span>এআই প্রসেসিং হচ্ছে...</span>
            ) : (
              <>
                <Wand2 className="w-5 h-5" /> ম্যাজিক এডিট করুন
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-center">
            <h3 className="text-sm font-semibold text-cyan-400">এডিট সম্পন্ন ফলাফল:</h3>
            <img src={result} alt="Result" className="w-full rounded-xl border border-slate-800" />
            <a
              href={result}
              download
              className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-white mt-2"
            >
              ডাউনলোড করুন
            </a>
          </div>
        )}

      </div>
    </main>
  );
}
