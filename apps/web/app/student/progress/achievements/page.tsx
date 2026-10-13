import { Metadata } from 'next'
import React from 'react'
import StudentProgressView from '@components/Student/views/StudentProgressView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Başarı Rozetleri — Öğrenci Portalı | Oxonom EDU',
}

export default function ProgressAchievementsPage() {
  return <StudentProgressView initialTab="achievements" />
}
