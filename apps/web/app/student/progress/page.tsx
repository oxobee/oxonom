import { Metadata } from 'next'
import React from 'react'
import StudentProgressView from '@components/Student/views/StudentProgressView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gelişimim — Öğrenci Portalı | Oxonom EDU',
  description: 'Akademik not ortalaması, ders başarı grafikleri ve kazanım rozetleri.',
}

export default function StudentProgressPage() {
  return <StudentProgressView initialTab="all" />
}
