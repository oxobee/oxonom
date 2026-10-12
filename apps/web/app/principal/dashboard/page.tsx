import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminClient from '@components/Mobile/Admin/MAdminClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Genel Bakış & İdare — Oxonom EDU',
  description: 'Okul mevcudu, günlük devamsızlık durumu, açık tahtalar ve yönetici hızlı aksiyonları.',
}

export default function PrincipalDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
