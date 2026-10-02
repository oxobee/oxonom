import React from 'react'
import type { Metadata } from 'next'
import DevelopersTabs from '@components/Admin/Developers/DevelopersTabs'

export const metadata: Metadata = {
  title: 'Geliştiriciler',
}

export default function AdminDevelopersPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Geliştiriciler</h1>
        <p className="text-white/40 mt-1">
          API anahtarları, uç nokta referansları ve kurumlar arası otomasyon araçları.
        </p>
      </div>
      <DevelopersTabs />
    </div>
  )
}
