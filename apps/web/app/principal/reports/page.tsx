import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminReportsClient from '@components/Mobile/Admin/MAdminReportsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'İdari Raporlar & İstatistik — Oxonom EDU',
  description: 'Okul geneli devamsızlık analizleri, akademik başarı grafikleri ve resmi e-Okul çıktıları.',
}

export default function PrincipalReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminReportsClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
