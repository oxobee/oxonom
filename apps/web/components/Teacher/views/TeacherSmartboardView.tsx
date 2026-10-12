'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Tv,
  QrCode,
  Plus,
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
      {/* Header Banner with QR Connect Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Tv size={15} />
            <span>Akıllı Tahta Yönetimi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Ders Tahtalarım
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sınıflarınız için oluşturulmuş akıllı tahta çalışmalarını görüntüleyin ve yeni ders tahtası başlatın
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConnectModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-[#0A0D15] font-black text-xs flex items-center gap-2.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <QrCode size={18} strokeWidth={2.4} />
          <span>Tahtaya Bağlan (QR)</span>
        </button>
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
