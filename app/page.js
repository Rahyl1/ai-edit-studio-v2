'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('image'); // 'image' or 'video'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ type: 'error', text: 'দয়া করে একটি ফাইল নির্বাচন করুন!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    formData.append('type', type);

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'আপনার রিকোয়েস্ট সফলভাবে টেলিগ্রামে পাঠানো হয়েছে! 🎉' });
        setPrompt('');
        setFile(null);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: data.error || 'একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সার্ভারে সংযোগ করা সম্ভব হয়নি!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2 text-sky-400">
          ✨ AI Studio Submission
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          ফাইল ও প্রম্পট জমা দিন
        </p>

        {/* Type Selection Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setType('image')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              type === 'image'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🖼️ Image Request
          </button>
          <button
            type="button"
            onClick={() => setType('video')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              type === 'video'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎥 Video Request
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              {type === 'image' ? 'এডিট করার ছবি সিলেক্ট করুন:' : 'এডিট করার ভিডিও সিলেক্ট করুন:'}
            </label>
            <input
              type="file"
              accept={type === 'image' ? 'image/*' : 'video/*'}
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer bg-slate-800/50 rounded-xl p-2 border border-slate-700/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              ✨ কী পরিবর্তন বা এডিট চান:
            </label>
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="যেমন: ব্যাকগ্রাউন্ড পাল্টে দাও..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500 text-white resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20"
          >
            {loading ? '⏳ ফর্ম জমা হচ্ছে...' : '🚀 এডিট রিকোয়েস্ট পাঠান'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-sm text-center ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
