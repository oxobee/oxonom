'use client'

import React from 'react'

interface BoardVisualCoverProps {
  board: {
    name: string
    description?: string
    board_uuid?: string
    features?: any
  }
  className?: string
}

export default function BoardVisualCover({ board, className = '' }: BoardVisualCoverProps) {
  const name = board.name || 'Akıllı Tahta'
  const text = `${name} ${board.description || ''}`.toLowerCase()

  // Theme variation based on board title or hash
  const isMath = text.includes('mat') || text.includes('geometri') || text.includes('fonksiyon') || text.includes('fizik')
  const isLanguage = text.includes('türkçe') || text.includes('ingilizce') || text.includes('edebiyat') || text.includes('dil')
  const isScience = text.includes('fen') || text.includes('biyoloji') || text.includes('kimya') || text.includes('deney')

  // Dark classroom chalkboard style vs sleek whiteboard style
  const isChalkboard = !text.includes('beyaz')

  if (isChalkboard) {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1b3022] via-[#14261b] to-[#0c1811] flex flex-col justify-between p-3 select-none text-emerald-100/90 ${className}`}>
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header on Chalkboard */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
            <span>📐 Akıllı Pano</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/60">LIVE CANVAS</span>
        </div>

        {/* Center Content Mockup */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          {isMath ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-mono text-amber-200/90 font-bold tracking-wider">
                f(x) = 2x² + 4
              </span>
              <div className="flex items-center gap-3 text-xs font-mono text-emerald-300/80">
                <span>∫₀¹ f(t)dt</span>
                <span>•</span>
                <span>lim x→∞</span>
              </div>
            </div>
          ) : isLanguage ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-base font-bold text-amber-100 tracking-wide text-center line-clamp-1">
                ✍️ {name}
              </span>
              <span className="text-xs text-emerald-300/80 italic">"Özne • Yüklem • Tümleç"</span>
            </div>
          ) : isScience ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-mono text-cyan-200 font-bold">
                ⚗️ H₂O + CO₂ ➔ Glucose
              </span>
              <span className="text-xs text-emerald-300/80">Hücre & Fotosentez Şeması</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 px-4 text-center">
              <span className="text-sm font-extrabold text-amber-100 line-clamp-2">
                📋 {name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-emerald-300/70 font-mono">
                <span>• Notlar</span>
                <span>• Çizimler</span>
                <span>• Etkileşim</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Chalk tray simulation */}
        <div className="relative z-10 flex items-center justify-between pt-1 border-t border-emerald-800/40 text-[9px] text-emerald-400/60 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
          </div>
          <span>Etkin Tuval</span>
        </div>
      </div>
    )
  }

  // Whiteboard theme
  return (
    <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 flex flex-col justify-between p-3 select-none text-slate-800 ${className}`}>
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
          Beyaz Tahta
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Etkileşimli</span>
      </div>

      <div className="relative z-10 my-auto text-center px-3">
        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1">
          {name}
        </h4>
        <p className="text-[10px] text-slate-500 line-clamp-1">
          {board.description || 'Ders çalışma alanı ve notlar'}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-1 border-t border-slate-200 text-[9px] text-slate-400">
        <span>Canlı Tahta</span>
        <span>Açmak için tıklayın</span>
      </div>
    </div>
  )
}
