'use client'

import React from 'react'

interface ModuleVisualCoverProps {
  name: string
  description?: string
  className?: string
}

export default function ModuleVisualCover({ name, description = '', className = '' }: ModuleVisualCoverProps) {
  const text = `${name} ${description}`.toLowerCase()

  // 1. Güneş Sistemi / Gezegenler
  if (text.includes('güneş') || text.includes('gezegen') || text.includes('uzay') || text.includes('solar')) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#060814] via-[#0f172a] to-[#1e1145] flex items-center justify-center select-none ${className}`}>
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-70">
          <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[15%] shadow-[0_0_6px_#fff]" />
          <div className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full top-[35%] left-[80%] shadow-[0_0_8px_#67e8f9]" />
          <div className="absolute w-1 h-1 bg-amber-200 rounded-full top-[70%] left-[25%]" />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[15%] left-[60%]" />
          <div className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full top-[80%] left-[75%]" />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[50%] left-[40%]" />
        </div>

        {/* Orbit Ellipses */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 225">
          <ellipse cx="200" cy="115" rx="160" ry="60" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" transform="rotate(-12 200 115)" />
          <ellipse cx="200" cy="115" rx="110" ry="42" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(-12 200 115)" />
          <ellipse cx="200" cy="115" rx="65" ry="25" fill="none" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" transform="rotate(-12 200 115)" />
        </svg>

        {/* Central Sun */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-[0_0_50px_rgba(251,191,36,0.6)] flex items-center justify-center animate-pulse">
            <span className="text-3xl filter drop-shadow-md">☀️</span>
          </div>
        </div>

        {/* Orbiting Planet 1 (Earth) */}
        <div className="absolute top-[28%] left-[22%] z-10 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 via-sky-400 to-emerald-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center text-xs">
            🌍
          </div>
          <span className="text-[9px] font-bold text-sky-200 mt-0.5 bg-black/40 px-1.5 py-0.2 rounded-full">Dünya</span>
        </div>

        {/* Orbiting Planet 2 (Saturn with Ring) */}
        <div className="absolute bottom-[24%] right-[20%] z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center text-2xl">
            🪐
          </div>
          <span className="text-[9px] font-bold text-amber-200 mt-0.5 bg-black/40 px-1.5 py-0.2 rounded-full">Satürn</span>
        </div>

        {/* Floating Tag */}
        <div className="absolute top-2.5 right-2.5 z-10 bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <span>✨ 3D Uzay Keşfi</span>
        </div>
      </div>
    )
  }

  // 2. Harf Çizgi & Yazılış Yönü Atölyesi
  if (text.includes('harf') || text.includes('çizgi') || text.includes('yazılış') || text.includes('el yazısı')) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-amber-50/40 flex items-center justify-center select-none ${className}`}>
        {/* Notebook Guidance Lines (MEB standard 4 lines) */}
        <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-around px-4 pointer-events-none opacity-40">
          <div className="w-full border-b-2 border-red-400" />
          <div className="w-full border-b border-dashed border-sky-400" />
          <div className="w-full border-b border-dashed border-sky-400" />
          <div className="w-full border-b-2 border-sky-600" />
        </div>

        {/* Big Letter Tracing Demonstration */}
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative flex flex-col items-center">
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-700 to-indigo-900 tracking-tighter drop-shadow-sm font-sans">
              A
            </span>
            <span className="text-4xl font-extrabold text-indigo-500/80 -mt-2">a</span>
          </div>

          {/* Cute animated pencil and directional arrow */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 shadow-md flex items-center justify-center text-xl transform -rotate-12 hover:rotate-0 transition-transform">
              ✏️
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <span>1️⃣ ➔ 2️⃣ ➔ 3️⃣</span>
            </div>
          </div>
        </div>

        {/* Subtitle badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
          <span>MEB Dik Temel</span>
        </div>
      </div>
    )
  }

  // 3. Ritmik Sayma & Sayı Doğrusu Atölyesi
  if (text.includes('ritmik') || text.includes('sayma') || text.includes('sayı doğrusu') || text.includes('kurbağa')) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-100/50 flex flex-col items-center justify-center select-none ${className}`}>
        {/* Jumping Frog & Numbers trajectory */}
        <div className="relative z-10 w-full max-w-[280px] px-2 flex flex-col items-center">
          {/* Frog jumping on an arc */}
          <div className="w-full flex justify-around items-end mb-1">
            <div className="text-base opacity-40">2</div>
            <div className="text-2xl transform -translate-y-2 animate-bounce">
              🐸
            </div>
            <div className="text-base font-black text-emerald-700">6</div>
            <div className="text-base font-extrabold text-emerald-900">8</div>
          </div>

          {/* Jump Arcs SVG */}
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 240 30" fill="none">
            <path d="M 20 28 Q 50 2, 80 28" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 3" />
            <path d="M 80 28 Q 120 -5, 160 28" stroke="#059669" strokeWidth="3" />
            <path d="M 160 28 Q 195 2, 230 28" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 3" />
            {/* Number Line base */}
            <line x1="0" y1="28" x2="240" y2="28" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="28" r="4" fill="#047857" />
            <circle cx="80" cy="28" r="4" fill="#047857" />
            <circle cx="160" cy="28" r="5" fill="#10b981" />
            <circle cx="230" cy="28" r="4" fill="#047857" />
          </svg>

          {/* Lilypad numbers below */}
          <div className="w-full flex justify-between text-[11px] font-black text-emerald-800 mt-1 px-2">
            <span>2</span>
            <span>4</span>
            <span className="text-emerald-900 font-extrabold text-sm underline decoration-emerald-500">6</span>
            <span>8</span>
            <span>10</span>
          </div>
        </div>

        {/* Interactive Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <span>🎯 Zıplayan Sayılar</span>
        </div>
      </div>
    )
  }

  // 4. 1 Dk Okuma & Hızlı Okuma Atölyesi
  if (text.includes('hızlı okuma') || text.includes('1 dk') || text.includes('dakika okuma') || text.includes('kelime atölyesi')) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center select-none ${className}`}>
        {/* Radial Speed Dial Graphics */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Stopwatch / Gauge SVG */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#fed7aa" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" stroke="#f43f5e" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="65" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-rose-600">60</span>
              <span className="text-[9px] font-bold text-gray-500 -mt-1">saniye</span>
            </div>
          </div>

          {/* Drifting Reading Cards */}
          <div className="flex flex-col gap-1.5">
            <div className="px-3 py-1 bg-white/95 rounded-xl shadow-xs border border-rose-200 flex items-center gap-2 transform translate-x-1">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-bold text-slate-800">Akıcı Okuma</span>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl shadow-xs flex items-center gap-2 transform -translate-x-1">
              <span className="text-sm">🏆</span>
              <span className="text-xs font-bold">120+ Kelime</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
          ⏱️ Hız & Anlama
        </div>
      </div>
    )
  }

  // 5. Sınıf Çarkı & Geri Sayım Araçları
  if (text.includes('çark') || text.includes('çarkı') || text.includes('zamanlayıcı') || text.includes('geri sayım')) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-100 flex items-center justify-center select-none ${className}`}>
        {/* Spinning Colorful Wheel Graphic */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
            {/* Wheel segments */}
            <div className="absolute inset-0 bg-[conic-gradient(#f43f5e_0deg_60deg,#8b5cf6_60deg_120deg,#3b82f6_120deg_180deg,#10b981_180deg_240deg,#f59e0b_240deg_300deg,#ec4899_300deg_360deg)] animate-[spin_12s_linear_infinite]" />
            <div className="relative z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center font-black text-purple-700 text-xs">
              🎯
            </div>
          </div>

          {/* Pointer & Tags */}
          <div className="flex flex-col gap-1.5">
            <div className="px-3 py-1 bg-white/95 rounded-xl shadow-xs border border-purple-200 text-purple-900 flex items-center gap-2">
              <span className="text-sm">🎲</span>
              <span className="text-xs font-bold">Şanslı Öğrenci</span>
            </div>
            <div className="px-3 py-1 bg-purple-600 text-white rounded-xl shadow-xs flex items-center gap-2">
              <span className="text-sm">⏳</span>
              <span className="text-xs font-bold">Süre Sayacı</span>
            </div>
          </div>
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
          🎡 İnteraktif
        </div>
      </div>
    )
  }

  // 6. İngilizce Kelime & Görsel Macera Atölyesi
  if (text.includes('ingilizce') || text.includes('english') || text.includes('macera') || text.includes('vocabulary')) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-100 flex items-center justify-center select-none ${className}`}>
        {/* Vocabulary Flashcards Graphic */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-20 bg-white rounded-2xl shadow-md border-2 border-cyan-200 flex flex-col items-center justify-center p-1 transform -rotate-6 hover:rotate-0 transition-transform">
            <span className="text-2xl">🐱</span>
            <span className="text-[10px] font-black text-cyan-800 mt-1">CAT</span>
          </div>

          <div className="w-16 h-20 bg-gradient-to-b from-amber-400 to-amber-500 text-white rounded-2xl shadow-md border-2 border-amber-300 flex flex-col items-center justify-center p-1 transform rotate-6 hover:rotate-0 transition-transform">
            <span className="text-2xl">🍎</span>
            <span className="text-[10px] font-black text-white mt-1">APPLE</span>
          </div>

          <div className="w-16 h-20 bg-white rounded-2xl shadow-md border-2 border-indigo-200 flex flex-col items-center justify-center p-1 transform -rotate-3 hover:rotate-0 transition-transform">
            <span className="text-2xl">🚀</span>
            <span className="text-[10px] font-black text-indigo-800 mt-1">ROCKET</span>
          </div>
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <span>🇬🇧 A1 Vocabulary</span>
        </div>
      </div>
    )
  }

  // Generic Default Educational Card Cover
  return (
    <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-amber-50/40 flex flex-col items-center justify-center select-none ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center mb-1 text-indigo-600 border border-indigo-100">
        <span className="text-2xl">💡</span>
      </div>
      <span className="text-[11px] font-bold text-gray-500 tracking-tight">Etkileşimli Modül</span>
    </div>
  )
}
