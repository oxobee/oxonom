import { Metadata } from 'next'
import React from 'react'
import StudentAssessmentsView from '@components/Student/views/StudentAssessmentsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sınav Sonuçları — Öğrenci Portalı | Oxonom EDU',
  description: 'Yayımlanan resmi sınav notları ve öğretmen geri bildirimleri.',
}

export default function StudentResultsPage() {
  return <StudentAssessmentsView initialTab="results" />
}
