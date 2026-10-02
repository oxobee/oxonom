'use client'

import React from 'react'
import FeedbackList from '@components/Admin/FeedbackList'
import { MessageCircle } from 'lucide-react'

export default function FeedbacksClient() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0b] flex flex-col items-center">
      <div className="w-full max-w-7xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-indigo-400" />
              Geri Bildirimler
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Kullanıcılar tarafından gönderilen geri bildirimleri, cihaz ve okul detaylarıyla inceleyin.
            </p>
          </div>
        </div>

        <FeedbackList />
      </div>
    </div>
  )
}
