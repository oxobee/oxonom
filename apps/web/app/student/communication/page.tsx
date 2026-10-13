import { Metadata } from 'next'
import React from 'react'
import StudentCommunicationView from '@components/Student/views/StudentCommunicationView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mesajlar ve Duyurular — Öğrenci Portalı | Oxonom EDU',
  description: 'Okul ve sınıf duyuruları, öğretmen bildirimleri ve mesajlar.',
}

export default function StudentCommunicationPage() {
  return <StudentCommunicationView initialTab="all" />
}
