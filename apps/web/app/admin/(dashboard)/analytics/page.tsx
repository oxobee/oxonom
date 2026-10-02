import React from 'react'
import type { Metadata } from 'next'
import GlobalAnalytics from '@components/Admin/GlobalAnalytics'

export const metadata: Metadata = {
  title: 'Analitikler',
}

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Genel Analitikler</h1>
        <p className="text-white/40 mt-1">
          Tüm okullar ve kurumlar genelindeki analitik verileri
        </p>
      </div>
      <GlobalAnalytics days={30} />
    </div>
  )
}
