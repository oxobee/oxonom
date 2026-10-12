'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  QrCode,
  Power,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MBoardsClient from '@components/Mobile/MBoardsClient'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

interface ActiveBoardSession {
  sessionId: string
  code: string
  status: string
  pairedAt?: string
  className?: string
  teacherName?: string
  boardName?: string
}

export default function TeacherSmartboardView() {
  const { theme } = useMobileTheme()
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [activeBoards, setActiveBoards] = useState<ActiveBoardSession[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch active pano sessions from server
  const fetchActiveBoards = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/pano/pair/active-boards')
      if (res.ok) {
        const data = await res.json()
        if (data.boards && Array.isArray(data.boards)) {
          setActiveBoards(data.boards)
          return
        }
      }
    } catch (err) {
      console.warn('Could not fetch active boards:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveBoards()
    const interval = setInterval(fetchActiveBoards, 6000)
    return () => clearInterval(interval)
  }, [])

  // Terminate a smartboard session remotely
  const handleTerminateBoardSession = async (sessionId: string, boardName: string) => {
    try {
      const res = await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, target: 'board_only' }),
      })
      if (res.ok) {
        toast.success(`🖥️ ${boardName} oturumu başarıyla kapatıldı!`)
        setActiveBoards((prev) => prev.filter((b) => b.sessionId !== sessionId))
      } else {
        toast.error('Oturum kapatılamadı.')
      }
    } catch (err) {
      toast.error('Bağlantı hatası oluştu.')
    }
  }

  // Fallback demo board representation for 9-A classroom
  const hasLiveSession = activeBoards.length > 0
  const primaryLiveBoard = activeBoards[0]

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Tv size={15} />
            <span>Sınıf Akıllı Tahta Yönetimi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Akıllı Tahtalarım ve Canlı Durum
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Bağlı akıllı tahtaların canlı açık/kapalı durumunu takip edin ve gerektiğinde oturumu sonlandırın
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchActiveBoards}
            className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Yenile"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-[#0A0D15] font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <QrCode size={17} strokeWidth={2.4} />
            <span>Tahtaya Bağlan (QR)</span>
          </button>
        </div>
      </div>

      {/* ── LIVE SMARTBOARDS STATUS LIST (AÇIK / KAPALI) ── */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>Sınıf Derslik Akıllı Tahtaları</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold">
              Canlı Senkronize
            </span>
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {hasLiveSession ? `${activeBoards.length} Tahta Aktif` : 'Tüm Tahtalar Beklemede'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 9-A Sınıfı Akıllı Tahtası */}
          <div className="p-5 rounded-2xl bg-gray-50/80 dark:bg-[#161D2E] border border-gray-200/70 dark:border-gray-800/70 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  hasLiveSession
                    ? 'bg-emerald-500 text-[#0A0D15] shadow-md shadow-emerald-500/20'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <Tv size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    9-A Şubesi Akıllı Tahtası
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Derslik 101 • Vestel 75" Etkileşimli Panel
                  </p>
                </div>
              </div>

              {/* Status Badge: AÇIK / KAPALI */}
              <div>
                {hasLiveSession ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>AÇIK</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-200/70 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>KAPALI</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Details & Logout Action */}
            <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between text-xs">
              <div className="text-gray-500 dark:text-gray-400 text-[11px]">
                {hasLiveSession ? (
                  <span>Oturum Sahibi: <strong className="text-gray-800 dark:text-gray-200">{primaryLiveBoard?.teacherName || 'Ebru TEKNECİ'}</strong></span>
                ) : (
                  <span>Son Kullanım: 12.10.2026</span>
                )}
              </div>

              {/* OTURUMU KAPAT BUTONU (Eğer Açıksa) */}
              {hasLiveSession && (
                <button
                  type="button"
                  onClick={() =>
                    handleTerminateBoardSession(
                      primaryLiveBoard.sessionId,
                      '9-A Şubesi Akıllı Tahtası'
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title="Tahtadaki oturumu sonlandır"
                >
                  <Power size={13} strokeWidth={2.4} />
                  <span>Oturumu Kapat</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: 9-B Şubesi Akıllı Tahtası (Kapalı) */}
          <div className="p-5 rounded-2xl bg-gray-50/80 dark:bg-[#161D2E] border border-gray-200/70 dark:border-gray-800/70 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold text-sm">
                  <Tv size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    9-B Şubesi Akıllı Tahtası
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Derslik 102 • Promethean 86" Akıllı Panel
                  </p>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-200/70 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>KAPALI</span>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between text-xs">
              <div className="text-gray-500 dark:text-gray-400 text-[11px]">
                <span>Bekleme Modunda</span>
              </div>
              <span className="text-[11px] text-gray-400 italic">
                Aktif oturum yok
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── EMBEDDED MBOARDSCLIENT (Ders Tahtalarım ve Çizimler) ── */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-xs">
        <MBoardsClient hideDock hideHeader />
      </div>

      <ConnectBoardModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        theme={theme}
      />
    </div>
  )
}
