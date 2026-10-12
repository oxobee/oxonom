import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminStudentsClient from '@components/Mobile/Admin/MAdminStudentsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Öğrenciler & Kayıt — Oxonom EDU',
  description: 'Öğrenci kütük kayıtları, şube dağılımları, veli irtibatları ve disiplin takibi.',
}

export default function PrincipalStudentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminStudentsClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
