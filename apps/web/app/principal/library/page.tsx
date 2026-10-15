import { Metadata } from 'next'
import React from 'react'
import PrincipalLibraryManagementView from '@/components/Principal/views/PrincipalLibraryManagementView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kitaplık ve Ders Kitapları Yönetimi — Müdür Portalı | Oxonom EDU',
  description: 'Öğrencilere gösterilecek ve gizlenecek MEB müfredat ders kitaplarının idari yönetimi.',
}

export default function PrincipalLibraryPage() {
  return <PrincipalLibraryManagementView />
}
