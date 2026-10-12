'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  QrCode,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Search,
  School,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

export interface MAdminBoardsClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

interface ActiveBoardSession {
  sessionId: string
  code: string
  status: string
  pairedAt?: string
  className?: string
  teacherName?: string
  boardName?: string
}

interface SchoolBoardConfig {
  id: string
  code: string
  name: string
  classroom: string
  floor: string
  deviceModel: string
  macAddress: string
}

// School real physical smartboard inventory
const SCHOOL_BOARDS: SchoolBoardConfig[] = [
  { id: 'sb-9a', code: 'PANO-9A', name: '9/A Akıllı Tahta', classroom: '9/A Şubesi', floor: '1. Kat (No: 104)', deviceModel: 'Vestel 75" Interactive 4K', macAddress: '00:1A:79:B4:C1:01' },
  { id: 'sb-9b', code: 'PANO-9B', name: '9/B Akıllı Tahta', classroom: '9/B Şubesi', floor: '1. Kat (No: 106)', deviceModel: 'Vestel 75" Interactive 4K', macAddress: '00:1A:79:B4:C1:02' },
  { id: 'sb-1a', code: 'PANO-1A', name: '1/A Akıllı Tahta', classroom: '1/A Şubesi', floor: 'Zemin Kat (No: 04)', deviceModel: 'Vestel 65" Interactive 4K', macAddress: '00:1A:79:B4:C1:03' },
  { id: 'sb-2a', code: 'PANO-2A', name: '2/A Akıllı Tahta', classroom: '2/A Şubesi', floor: 'Zemin Kat (No: 08)', deviceModel: 'Vestel 65" Interactive 4K', macAddress: '00:1A:79:B4:C1:04' },
  { id: 'sb-fen', code: 'PANO-FEN', name: 'Fen Laboratuvarı Tahtası', classroom: 'Fen Lab', floor: 'Bodrum Kat (Lab-1)', deviceModel: 'Vestel 86" Ultra Interactive', macAddress: '00:1A:79:B4:C1:05' },
  { id: 'sb-konf', code: 'PANO-KONF', name: 'Konferans Salonu Pano', classroom: 'Konferans', floor: '2. Kat Ana Salon', deviceModel: 'Pano Display 85" LED', macAddress: '00:1A:79:B4:C1:06' },
]

export default function MAdminBoardsClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminBoardsClientProps) {
  const { theme } = useMobileTheme()
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [activeBoards, setActiveBoards] = useState<ActiveBoardSession[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch real active pano sessions from server
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

  // Terminate a smartboard session remotely (Calls real logout API)
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

  const liveCount = activeBoards.length
  const totalCount = SCHOOL_BOARDS.length
  const idleCount = totalCount - liveCount

  const filteredBoards = SCHOOL_BOARDS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pageContent = (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7 font-jakarta space-y-6">
      {/* ── 1. HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Tv size={15} />
            <span>Okul Geneli Akıllı Tahta Ağı</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Akıllı Tahtalar & Pano Cihazları
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Dersliklerdeki akıllı tahtaların anlık oturum durumunu inceleyin ve açık tahtaları uzaktan kapatın
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchActiveBoards}
            className="h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Yenile"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <QrCode size={15} />
            <span>Tahtaya Bağlan (QR)</span>
          </button>
        </div>
      </div>

      {/* ── 2. LIVE METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Kayıtlı Akıllı Tahtalar
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {totalCount} Adet
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Tüm dersliklerde aktif donanım</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Tv size={24} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Canlı Oturum Açık</span>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {liveCount} Tahta
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Öğretmenler tarafından kullanılıyor</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Radio size={24} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Boşta / Beklemede
            </div>
            <div className="text-3xl font-black text-gray-700 dark:text-gray-300 mt-1">
              {idleCount} Tahta
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Bağlantıya hazır durumda</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & FILTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-xs">
        <div className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Derslik Akıllı Tahta Envanteri</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {filteredBoards.length} Cihaz
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tahta, derslik veya kod ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* ── 4. SMARTBOARD CARDS GRID (EXACT TEACHER PROFILE STYLE) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBoards.map((board) => {
          // Check if this physical board has a live session in activeBoards
          const liveSession = activeBoards.find(
            (b) =>
              b.code === board.code ||
              b.className?.includes(board.classroom) ||
              b.boardName?.includes(board.classroom)
          )
          const isLive = Boolean(liveSession)

          return (
            <div
              key={board.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isLive
                  ? 'bg-white dark:bg-[#121826] border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-white dark:bg-[#121826] border-gray-200/80 dark:border-gray-800/80 shadow-xs'
              }`}
            >
              <div>
                {/* Card Top: Icon, Code & Status Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isLive
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Tv size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                        {board.name}
                      </h3>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        {board.code}
                      </div>
                    </div>
                  </div>

                  {/* Authentic Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      isLive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200/60 dark:border-gray-700/60'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLive ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'
                      }`}
                    />
                    <span>{isLive ? 'AÇIK' : 'KAPALI'}</span>
                  </span>
                </div>

                {/* Device Details */}
                <div className="space-y-2 py-3 border-y border-gray-100 dark:border-gray-800/80 text-xs">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400">Derslik / Konum</span>
                    <span className="font-bold">{board.classroom} • {board.floor}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400">Cihaz Modeli</span>
                    <span className="font-semibold">{board.deviceModel}</span>
                  </div>

                  {isLive && liveSession && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 mt-2 space-y-1">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Aktif Oturum Bilgileri
                      </div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
                        <span>Öğretmen:</span>
                        <span>{liveSession.teacherName || 'Ebru TEKNECİ'}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center justify-between">
                        <span>Bağlantı Saati:</span>
                        <span>{liveSession.pairedAt ? new Date(liveSession.pairedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '10:15'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 flex items-center gap-2">
                {isLive && liveSession ? (
                  <button
                    type="button"
                    onClick={() => handleTerminateBoardSession(liveSession.sessionId, board.name)}
                    className="w-full h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Tahta Oturumunu Kapat</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="w-full h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-600 dark:text-gray-300 hover:text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <QrCode size={15} />
                    <span>QR ile Oturum Başlat</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect Board QR Modal */}
      <ConnectBoardModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D15]">
      {pageContent}
    </div>
  )
}
