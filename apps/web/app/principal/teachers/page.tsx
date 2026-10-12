import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminTeachersClient from '@components/Mobile/Admin/MAdminTeachersClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Öğretmenler & Kadro — Oxonom EDU',
  description: 'Öğretmen kadrosu, branş dağılımı, özlük dosyaları, nöbet ve ek ders yönetimi.',
}

export default function PrincipalTeachersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminTeachersClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
