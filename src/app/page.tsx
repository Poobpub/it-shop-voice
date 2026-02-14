"use client";

import { useEffect, useRef, useState } from "react";

type ApiResult = {
  transcript?: string;
  answer?: string;
  matches?: Array<any>;
  error?: string;
};

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("พร้อมพูด");
  const [result, setResult] = useState<ApiResult>({});
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("เบราว์เซอร์นี้ไม่รองรับ Web Speech API (ใช้ Chrome)");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "th-TH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("AI กำลังฟัง...");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus("หยุดฟังแล้ว");
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setStatus(`Error: ${e?.error || "unknown"}`);
      setResult({ error: e?.error || "speech error" });
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setStatus("AI กำลังประมวลผล...");
      setResult({ transcript });

      const resp = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      const data: ApiResult = await resp.json();
      setResult(data);
      setStatus(data.error ? "เกิดข้อผิดพลาด" : "เสร็จสิ้น");
    };

    recognitionRef.current = rec;
  }, []);

  function start() {
    setResult({});
    try {
      recognitionRef.current?.start();
    } catch {}
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-3xl space-y-8 bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-blue-500/10">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-widest">
          IT SHOP AI CONSOLE
        </h1>

        <p className="text-center text-gray-400 text-sm">
          พูดเช่น “CPU” หรือ “CPU AMD”
        </p>

        {/* Mic Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={isListening ? stop : start}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300
            ${
              isListening
                ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"
                : "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-blue-500/40 hover:scale-110"
            }`}
          >
            🎙
          </button>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-green-400 tracking-wider">
          {status}
        </div>

        {/* Transcript */}
        <div className="p-5 rounded-xl border border-blue-500/30 bg-black/60">
          <div className="text-purple-400 font-semibold mb-2 tracking-wide">
            ▸ INPUT SIGNAL
          </div>
          <div className="text-gray-200 text-sm min-h-[40px]">
            {result.transcript ?? "..."}
          </div>
        </div>

        {/* Answer */}
        <div className="p-5 rounded-xl border border-cyan-500/30 bg-black/60">
          <div className="text-cyan-400 font-semibold mb-2 tracking-wide">
            ▸ AI RESPONSE
          </div>
          <div className="text-gray-100 text-sm whitespace-pre-line min-h-[60px]">
            {result.answer ?? "..."}
          </div>

          {result.error && (
            <div className="mt-2 text-sm text-red-400">
              {result.error}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
