import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminBoardsClient from '@components/Mobile/Admin/MAdminBoardsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Akıllı Tahtalar & Pano — Oxonom EDU',
  description: 'Sınıf akıllı tahtalarının anlık oturum durumu, uzaktan kapatma ve pano yönetimi.',
}

export default function PrincipalSmartboardsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminBoardsClient hideHeader={true} hideDock={true} />
      </div>
    </Suspense>
  )
}
