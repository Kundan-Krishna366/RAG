"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Link2,
  FileText,
  Plus,
  ArrowUp,
  Zap,
  Trash2,
  Activity,
  BarChart3,
  Settings,
  Cpu,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const onUpload = async (selectedFile: File) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("file", selectedFile);
    try {
      const res = await fetch("http://localhost:8000/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        if (data.stats.has_analytics) setShowAnalytics(true);
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: `System: Neural link with **${selectedFile.name}** established. Data indexed and ready for querying.` },
        ]);
      }
    } catch (err) {
      setChat((prev) => [...prev, { role: "assistant", content: "Link Error: Check Backend Connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const onChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;
    
    const currentPrompt = prompt;
    setChat((prev) => [...prev, { role: "user", content: currentPrompt }]);
    setPrompt("");
    setLoading(true);
    
    const fd = new FormData();
    fd.append("question", currentPrompt);
    try {
      const res = await fetch("http://localhost:8000/chat", { method: "POST", body: fd });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setChat((prev) => [...prev, { role: "assistant", content: "Neural bridge interrupted. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0807] text-white relative overflow-hidden flex flex-col selection:bg-orange-500/30 font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-40 w-[800px] h-[800px] rounded-full opacity-50 animate-blob-slow"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,120,40,0.4), rgba(220,60,20,0.1) 35%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-1/4 w-[700px] h-[600px] rounded-full opacity-40 animate-blob-fast"
          style={{
            background: "radial-gradient(circle, rgba(130,60,220,0.25), transparent 65%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-screen"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 24px)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_80%,#0a0807_100%)]" />
      </div>

      <style>{`
        @keyframes blobSlow { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.05); } }
        @keyframes blobFast { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,-20px) scale(1.08); } }
        .animate-blob-slow { animation: blobSlow 20s ease-in-out infinite; }
        .animate-blob-fast { animation: blobFast 12s ease-in-out infinite; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      <header className="relative z-30 w-full shrink-0 flex items-center justify-between px-8 py-6 text-[11px] tracking-[0.2em] uppercase font-bold text-white/40">
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <Link2 size={14} className="text-orange-500" />
          <span className="text-white/80 tracking-widest">DOCS RAG</span>
        </div>
        <div className="flex items-center gap-6 bg-white/5 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <button
            onClick={() => {
              setChat([]);
              setStats(null);
              setFile(null);
              setShowAnalytics(false);
            }}
            className="flex items-center gap-2 hover:text-rose-400 transition group text-rose-500/60"
          >
            <Trash2 size={13} className="group-hover:scale-110 transition" /> RESET
          </button>
          <div className="h-4 w-px bg-white/10" />
          <Settings size={14} className="hover:text-white transition cursor-pointer" />
        </div>
      </header>

      <main className="relative z-20 w-full max-w-4xl px-4 md:px-8 mx-auto flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 md:px-4 space-y-8 pb-12 pt-4">
            
            <AnimatePresence>
              {showAnalytics && stats?.has_analytics && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full mb-8 rounded-[1.5rem] bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                        <BarChart3 size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white/90">Neural Data Extraction</h3>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">Statistical Overview</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAnalytics(false)}
                      className="text-[11px] bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:text-white text-white/60 transition"
                    >
                      Hide Panel
                    </button>
                  </div>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.raw_values.slice(0, 25).map((v: any, i: number) => ({ n: i, v }))}>
                        <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                          {stats.raw_values.map((_: any, i: number) => (
                            <Cell key={i} fill={i % 2 === 0 ? "#f97316" : "#a855f7"} fillOpacity={0.8} />
                          ))}
                        </Bar>
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.03)" }}
                          contentStyle={{ backgroundColor: "#0a0807", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                          itemStyle={{ color: "#fff" }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
                    <Metric label="Mean Value" value={stats.mean.toFixed(1)} />
                    <Metric label="Peak Value" value={stats.max.toLocaleString()} />
                    <Metric label="Data Points" value={stats.total_points} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {chat.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="pt-24 md:pt-40 text-center flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                  Hello, friend.
                </h1>
                <h2 className="text-lg md:text-xl text-white/40 mt-4 tracking-wide font-light">
                  What shall we process today?
                </h2>
                <div className="mt-14 flex flex-wrap justify-center gap-4 md:gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
                  <span className="hover:text-orange-400 transition cursor-default">Analyze Data</span>
                  <span className="hover:text-purple-400 transition cursor-default">Extract Insights</span>
                  <span className="hover:text-blue-400 transition cursor-default">Query Project</span>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {chat.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex-shrink-0 mr-4 mt-1">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                          <Cpu size={14} className="text-white/70" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] md:max-w-[75%] p-5 text-[15px] leading-relaxed backdrop-blur-md shadow-2xl ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white rounded-[1.5rem] rounded-tr-sm"
                          : "bg-white/[0.02] border border-white/5 text-white/80 rounded-[1.5rem] rounded-tl-sm"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.role === "user" && (
                      <div className="flex-shrink-0 ml-4 mt-1">
                        <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                          <User size={14} className="text-white/70" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                         <Cpu size={14} className="text-white/40 animate-pulse" />
                      </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] rounded-tl-sm p-5 flex items-center gap-2">
                       <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                         <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                         <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                       </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="shrink-0 space-y-4 pb-8 pt-4">
          
          <div className="rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-3 flex items-center gap-4 hover:border-white/20 transition-all hover:bg-white/[0.04] shadow-lg">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                file ? "bg-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : "bg-white/5 text-white/30"
              }`}
            >
              <FileText size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[14px] text-white font-medium truncate tracking-tight">
                {file ? file.name : "Attach Knowledge Base"}
              </p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-0.5">
                {file ? `${(file.size / 1024).toFixed(1)} KB indexed successfully` : "PDF, DOCX, CSV, TXT supported"}
              </p>
            </div>
            <label className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-md group">
              <Plus size={20} className="text-white/70 group-hover:rotate-90 transition-transform duration-300" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.csv,.xlsx,.xls,.txt"
                onChange={(e) => {
                  const s = e.target.files?.[0];
                  if (s) {
                    setFile(s);
                    onUpload(s);
                  }
                }}
              />
            </label>
          </div>

          <div className="rounded-[1.8rem] bg-black/60 backdrop-blur-3xl border border-white/10 p-4 shadow-2xl focus-within:border-orange-500/40 focus-within:ring-1 focus-within:ring-orange-500/40 transition-all duration-300">
            <form onSubmit={onChat} className="flex flex-col">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything about the uploaded data..."
                className="w-full bg-transparent outline-none text-[16px] text-white placeholder:text-white/30 px-3 py-2 font-light"
                disabled={loading}
              />
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-white/60 uppercase tracking-widest border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    llama-3.3-70b
                  </div>
                  {stats?.has_analytics && (
                    <button
                      type="button"
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/50 hover:text-white hover:bg-white/10 transition uppercase tracking-[0.15em] border border-transparent hover:border-white/10"
                    >
                      <Activity size={12} className="text-purple-400" /> View Stats
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim() || loading}
                  className="h-11 w-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black active:scale-95"
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="shrink-0 relative z-30 w-full flex justify-between px-10 py-6 text-[10px] tracking-[0.3em] uppercase text-white/30 font-bold bg-black/20 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-center gap-3">
          <Zap size={13} fill="currentColor" className="text-orange-500 animate-pulse" />
          <span>Powered by GROQ</span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-white/60 transition cursor-pointer">Privacy</span>
          <span className="hover:text-white/60 transition cursor-pointer">Terms</span>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center group hover:bg-white/10 transition">
      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2 group-hover:text-white/60 transition">
        {label}
      </p>
      <p className="text-xl font-mono font-medium text-white/90">{value}</p>
    </div>
  );
}