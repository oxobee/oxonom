import { Metadata } from 'next'
import React from 'react'
import PrincipalAnnouncementsView from '@/components/Principal/views/PrincipalAnnouncementsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Duyurular & Toplu SMS — Müdür Portalı | Oxonom EDU',
  description: 'Kurumsal okul duyuruları, veli ve öğretmen SMS gönderimleri, MEB şablonları ve pano yönetimi.',
}

export default function PrincipalAnnouncementsPage() {
  return <PrincipalAnnouncementsView />
}
