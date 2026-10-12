import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminClassesClient from '@components/Mobile/Admin/MAdminClassesClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sınıflar & Şubeler — Oxonom EDU',
  description: 'Sınıf listeleri, şube rehber öğretmenleri, sınıf kapasiteleri ve derslik atamaları.',
}

export default function PrincipalClassesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminClassesClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
