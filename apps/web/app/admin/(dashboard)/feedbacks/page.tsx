import React from 'react'
import type { Metadata } from 'next'
import FeedbackList from '@components/Admin/FeedbackList'

export const metadata: Metadata = {
  title: 'Geri Bildirimler',
}

export default function AdminFeedbacksPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Geri Bildirimler</h1>
        <p className="text-white/40 text-sm mt-1">
          Kullanıcılar tarafından gönderilen görüşler, hata bildirimleri ve öneriler
        </p>
      </div>
      <FeedbackList />
    </div>
  )
}
