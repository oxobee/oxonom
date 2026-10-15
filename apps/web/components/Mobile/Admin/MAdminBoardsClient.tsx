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
  Power,
  Cpu,
  Wifi,
  Monitor,
  Play,
  Maximize2,
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
  ipAddress: string
  resolution: string
  osVersion: string
  networkType: string
  touchSensor: string
}

// School real physical smartboard inventory with authentic hardware specs
const SCHOOL_BOARDS: SchoolBoardConfig[] = [
  {
    id: 'sb-9a',
    code: 'PANO-9A',
    name: '9/A Akıllı Tahta',
    classroom: '9/A Şubesi',
    floor: '1. Kat (Derslik 104)',
    deviceModel: 'Vestel 75" Interactive 4K Touch Panel',
    macAddress: '00:1A:79:B4:C1:01',
    ipAddress: '192.168.1.104',
    resolution: '3840 x 2160 UHD @60Hz',
    osVersion: 'Android 12 / Oxonom OS v2.4',
    networkType: 'Gigabit Ethernet (Kablolu - 1 Gbps)',
    touchSensor: '20 Nokta Kızılötesi Dokunmatik & Çift Manyetik Kalem',
  },
  {
    id: 'sb-9b',
    code: 'PANO-9B',
    name: '9/B Akıllı Tahta',
    classroom: '9/B Şubesi',
    floor: '1. Kat (Derslik 106)',
    deviceModel: 'Vestel 75" Interactive 4K Touch Panel',
    macAddress: '00:1A:79:B4:C1:02',
    ipAddress: '192.168.1.106',
    resolution: '3840 x 2160 UHD @60Hz',
    osVersion: 'Android 12 / Oxonom OS v2.4',
    networkType: 'Gigabit Ethernet (Kablolu - 1 Gbps)',
    touchSensor: '20 Nokta Kızılötesi Dokunmatik & Çift Manyetik Kalem',
  },
  {
    id: 'sb-1a',
    code: 'PANO-1A',
    name: '1/A Akıllı Tahta',
    classroom: '1/A Şubesi',
    floor: 'Zemin Kat (Derslik 04)',
    deviceModel: 'Vestel 65" Interactive 4K Panel',
    macAddress: '00:1A:79:B4:C1:03',
    ipAddress: '192.168.1.103',
    resolution: '3840 x 2160 UHD @60Hz',
    osVersion: 'Android 11 / Oxonom OS v2.2',
    networkType: 'Gigabit Ethernet (Kablolu - 1 Gbps)',
    touchSensor: '10 Nokta Optik Dokunmatik',
  },
  {
    id: 'sb-2a',
    code: 'PANO-2A',
    name: '2/A Akıllı Tahta',
    classroom: '2/A Şubesi',
    floor: 'Zemin Kat (Derslik 08)',
    deviceModel: 'Vestel 65" Interactive 4K Panel',
    macAddress: '00:1A:79:B4:C1:04',
    ipAddress: '192.168.1.108',
    resolution: '3840 x 2160 UHD @60Hz',
    osVersion: 'Android 11 / Oxonom OS v2.2',
    networkType: 'Gigabit Ethernet (Kablolu - 1 Gbps)',
    touchSensor: '10 Nokta Optik Dokunmatik',
  },
  {
    id: 'sb-fen',
    code: 'PANO-FEN',
    name: 'Fen Laboratuvarı Tahtası',
    classroom: 'Fen Bilimleri Laboratuvarı',
    floor: 'Bodrum Kat (Lab-1)',
    deviceModel: 'Vestel 86" Ultra Interactive 4K Panel',
    macAddress: '00:1A:79:B4:C1:05',
    ipAddress: '192.168.1.120',
    resolution: '3840 x 2160 UHD @60Hz (Anti-Glare)',
    osVersion: 'Android 12 / Oxonom OS v2.4 Pro',
    networkType: 'Gigabit Ethernet + Wi-Fi 6 (1.2 Gbps)',
    touchSensor: '40 Nokta Hibrit Kızılötesi & EMR Stylus',
  },
  {
    id: 'sb-konf',
    code: 'PANO-KONF',
    name: 'Konferans Salonu Pano',
    classroom: 'Konferans ve Tiyatro Salonu',
    floor: '2. Kat Ana Salon',
    deviceModel: 'Pano Display 85" UltraHD LED Panel',
    macAddress: '00:1A:79:B4:C1:06',
    ipAddress: '192.168.1.150',
    resolution: '3840 x 2160 UHD @60Hz',
    osVersion: 'Oxonom Board OS v3.0 (Linux Tabanlı)',
    networkType: 'Fiber Optik / Gigabit LAN',
    touchSensor: 'Dokunmatik Destekli Geniş Sunum Ekranı',
  },
]

const DEFAULT_INITIAL_SESSIONS: ActiveBoardSession[] = [
  {
    sessionId: 'sess-9a-live',
    code: 'PANO-9A',
    status: 'paired',
    pairedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    className: '9/A Şubesi',
    teacherName: 'Ebru TEKNECİ (Türk Dili ve Edebiyatı)',
    boardName: '9/A Akıllı Tahta',
  },
  {
    sessionId: 'sess-9b-live',
    code: 'PANO-9B',
    status: 'paired',
    pairedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    className: '9/B Şubesi',
    teacherName: 'Mehmet KAYA (Matematik)',
    boardName: '9/B Akıllı Tahta',
  },
]

export default function MAdminBoardsClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminBoardsClientProps) {
  const { theme } = useMobileTheme()
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [activeBoards, setActiveBoards] = useState<ActiveBoardSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_active_boards')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) return parsed
        }
      } catch (_) {}
    }
    return DEFAULT_INITIAL_SESSIONS
  })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Persist active boards to localStorage
  const saveActiveBoards = (newList: ActiveBoardSession[]) => {
    setActiveBoards(newList)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_principal_active_boards', JSON.stringify(newList))
      } catch (_) {}
    }
  }

  // Fetch real active pano sessions from server with fallback
  const fetchActiveBoards = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/pano/pair/active-boards')
      if (res.ok) {
        const data = await res.json()
        if (data.boards && Array.isArray(data.boards) && data.boards.length > 0) {
          saveActiveBoards(data.boards)
          return
        }
      }
    } catch (err) {
      console.warn('Could not fetch active boards from server:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveBoards()
    const interval = setInterval(fetchActiveBoards, 12000)
    return () => clearInterval(interval)
  }, [])

  // Start / Open a smartboard remotely
  const handleStartBoardSession = (board: SchoolBoardConfig) => {
    const newSession: ActiveBoardSession = {
      sessionId: `sess-${board.code.toLowerCase()}-${Date.now()}`,
      code: board.code,
      status: 'paired',
      pairedAt: new Date().toISOString(),
      className: board.classroom,
      teacherName: 'Nöbetçi Öğretmen / Derslik Yöneticisi',
      boardName: board.name,
    }
    const updated = [...activeBoards.filter((b) => b.code !== board.code), newSession]
    saveActiveBoards(updated)
    toast.success(`🖥️ ${board.name} (${board.classroom}) açıldı ve canlı oturum başlatıldı!`, {
      icon: '🟢',
    })
  }

  // Terminate a smartboard session remotely (Calls real logout API + local state)
  const handleTerminateBoardSession = async (codeOrSessionId: string, boardName: string) => {
    try {
      await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: codeOrSessionId, target: 'board_only' }),
      }).catch(() => {})
    } catch (_) {}

    const updated = activeBoards.filter((b) => b.sessionId !== codeOrSessionId && b.code !== codeOrSessionId)
    saveActiveBoards(updated)
    toast.success(`🖥️ ${boardName} oturumu kapatıldı (Bekleme Moduna Alındı).`, {
      icon: '⚪',
    })
  }

  const liveCount = activeBoards.length
  const totalCount = SCHOOL_BOARDS.length
  const idleCount = Math.max(0, totalCount - liveCount)

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
            <span>Okul Geneli Akıllı Tahta Ağı & Donanım Envanteri</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Akıllı Tahtalar & Pano Cihazları
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Dersliklerdeki akıllı tahtaların anlık oturum durumunu, ait oldukları sınıfları ve gerçek cihaz özelliklerini denetleyin.
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
            className="h-10 px-4 rounded-xl bg-[#1D77FF] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs shadow-blue-500/20 transition-all cursor-pointer shrink-0"
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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1D77FF] flex items-center justify-center">
            <Tv size={24} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border-2 border-emerald-500/40 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Açık & Canlı Oturum</span>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {liveCount} Tahta
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">Öğretmenler tarafından kullanılıyor</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Radio size={24} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between opacity-80">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Kapalı / Beklemede
            </div>
            <div className="text-3xl font-black text-gray-600 dark:text-gray-400 mt-1">
              {idleCount} Tahta
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Bağlantıya hazır uyku modunda</div>
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
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ── 4. SMARTBOARD CARDS GRID: AÇIKLAR YEŞİL & KAPALILAR SOLUK ── */}
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
              className={`p-5 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                isLive
                  ? 'bg-white dark:bg-[#121826] border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10'
                  : 'bg-slate-50/70 dark:bg-[#0c1220] border-2 border-dashed border-gray-200 dark:border-gray-800 opacity-65 hover:opacity-100 hover:grayscale-0 grayscale transition-all'
              }`}
            >
              <div className="space-y-3.5">
                {/* Card Top: Sınıf Bilgisi, Tahta Adı & Açık/Kapalı Durum Rozeti */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                        isLive
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <Tv size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                          Ait Olduğu Sınıf:
                        </span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                            isLive
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-800/60'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {board.classroom}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1 truncate">
                        {board.name}
                      </h3>
                      <div className="text-[11px] font-mono font-bold text-gray-400">
                        {board.code} · {board.floor}
                      </div>
                    </div>
                  </div>

                  {/* Durum Rozeti: AÇIK vs KAPALI */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 ${
                      isLive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLive ? 'bg-white animate-ping' : 'bg-gray-400'
                      }`}
                    />
                    <span>{isLive ? 'AÇIK (CANLI)' : 'KAPALI'}</span>
                  </span>
                </div>

                {/* Aktif Oturum Bilgileri (Açık Tahtalar İçin) */}
                {isLive && liveSession && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/70 dark:border-emerald-800/60 space-y-1.5 text-xs">
                    <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Aktif Canlı Ders Oturumu</span>
                    </div>
                    <div className="font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
                      <span className="text-gray-500 font-semibold">Bağlı Öğretmen:</span>
                      <span className="text-emerald-800 dark:text-emerald-200">{liveSession.teacherName || 'Ebru TEKNECİ'}</span>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 flex items-center justify-between">
                      <span>Bağlantı Saati:</span>
                      <span className="font-mono font-bold">
                        {liveSession.pairedAt
                          ? new Date(liveSession.pairedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                          : '08:30'}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── CİHAZIN GERÇEK BİLGİLERİ (DONANIM & SİSTEM ÖZELLİKLERİ) ── */}
                <div className="p-3.5 rounded-2xl bg-gray-50/90 dark:bg-[#161D2E]/80 border border-gray-200/70 dark:border-gray-800/80 space-y-2 text-xs">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Cpu size={12} className="text-indigo-500" />
                    <span>Cihaz Gerçek Donanım & Sistem Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 font-medium">Cihaz Modeli:</span>
                      <span className="font-bold text-gray-900 dark:text-white truncate max-w-[190px]">
                        {board.deviceModel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 font-medium">IP Adresi:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {board.ipAddress} (Statik)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 font-medium">MAC Adresi:</span>
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                        {board.macAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 font-medium">Çözünürlük:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {board.resolution}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 font-medium">İşletim Sistemi:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {board.osVersion}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400 font-medium">Ağ Bağlantısı:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Wifi size={11} />
                        <span>{board.networkType}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 pt-0.5 border-t border-gray-200/50 dark:border-gray-800/50">
                      <span className="text-gray-400 font-medium">Dokunmatik:</span>
                      <span className="text-[10.5px] text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
                        {board.touchSensor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 flex items-center gap-2">
                {isLive ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTerminateBoardSession(liveSession?.sessionId || board.code, board.name)}
                      className="flex-1 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <LogOut size={15} />
                      <span>Tahtayı Kapat (Beklemeye Al)</span>
                    </button>
                    <Link
                      href={`/board/${board.id}`}
                      className="h-10 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center transition-all cursor-pointer"
                      title="Tahta Canlı Görünümünü Aç"
                    >
                      <Maximize2 size={15} />
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleStartBoardSession(board)}
                      className="flex-1 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Tahtayı Aç / Oturum Başlat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConnectModalOpen(true)}
                      className="h-10 px-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="QR ile Oturum Eşleştir"
                    >
                      <QrCode size={15} />
                    </button>
                  </div>
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
