import { Metadata } from 'next'
import React from 'react'
import StudentAssessmentsView from '@components/Student/views/StudentAssessmentsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Değerlendirme Detayı — Öğrenci Portalı | Oxonom EDU',
  description: 'Sınav bilgileri ve sonuç değerlendirmesi.',
}

export default async function StudentAssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>
}) {
  await params
  return <StudentAssessmentsView initialTab="all" />
}
