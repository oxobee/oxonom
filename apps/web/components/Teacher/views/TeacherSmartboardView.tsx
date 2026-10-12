'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Tv,
  QrCode,
  Smartphone,
  Plus,
  Monitor,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react'
import MBoardsClient from '@components/Mobile/MBoardsClient'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

export default function TeacherSmartboardView() {
  const { theme } = useMobileTheme()
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Quick Launch Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: QR Connect */}
        <div
          onClick={() => setIsConnectModalOpen(true)}
          className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-[#0A0D15] shadow-lg shadow-emerald-500/20 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center mb-3">
              <QrCode size={20} strokeWidth={2.4} />
            </div>
            <h2 className="text-base font-black">Tahtaya Bağlan (QR)</h2>
            <p className="text-xs font-semibold opacity-90 mt-0.5">
              Akıllı tahtadaki kodu okut ve anında kontrol et
            </p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-black/15">
            Bağlan
          </span>
        </div>

        {/* Card 2: Phone Remote Controller */}
        <Link
          href="/remote"
          className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Smartphone size={20} />
            </div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Telefon Kumandası
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Kalem, sayfa geçişi, kronometre ve araçlar
            </p>
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </Link>

        {/* Card 3: Direct Pano Screen */}
        <Link
          href="/pano"
          target="_blank"
          className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center mb-3">
              <Monitor size={20} />
            </div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Pano Ekranını Aç
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Akıllı tahta bekleme ve QR eşleştirme ekranı
            </p>
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </Link>
      </div>

      {/* Embedded MBoardsClient (Classes Whiteboard Canvas) */}
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
