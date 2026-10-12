import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminScheduleClient from '@components/Mobile/Admin/MAdminScheduleClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Haftalık Ders Dağılımı — Oxonom EDU',
  description: 'Okul geneli haftalık ders programı, boş saatler, çakışma analizi ve yedek öğretmen atama.',
}

export default function PrincipalSchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminScheduleClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
