import { Metadata, Viewport } from 'next'
import React from 'react'
import PrincipalLayout from '@components/Principal/PrincipalLayout'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Oxonom EDU — Okul Yönetimi & Müdür Portalı',
  description: 'Müdür ve idare çalışma alanı: Kadro, öğrenci takibi, ders dağılımı ve akıllı tahta yönetimi.',
}

export default function PrincipalRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PrincipalLayout>{children}</PrincipalLayout>
}
