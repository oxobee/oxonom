import { Metadata } from 'next'
import React from 'react'
import StudentDashboardView from '@components/Student/views/StudentDashboardView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ana Sayfa — Öğrenci Portalı | Oxonom EDU',
  description: 'Bugünün ders programı, bekleyen ödevler ve sınavlar.',
}

export default function StudentDashboardPage() {
  return <StudentDashboardView />
}
