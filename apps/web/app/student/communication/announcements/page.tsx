import { Metadata } from 'next'
import React from 'react'
import StudentCommunicationView from '@components/Student/views/StudentCommunicationView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Duyurular — Öğrenci Portalı | Oxonom EDU',
}

export default function CommunicationAnnouncementsPage() {
  return <StudentCommunicationView initialTab="announcements" />
}
