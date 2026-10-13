import { Metadata } from 'next'
import React from 'react'
import StudentAssessmentsView from '@components/Student/views/StudentAssessmentsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Yazılı Sınavlar — Öğrenci Portalı | Oxonom EDU',
  description: 'Dönem içi yazılı sınav programı ve detayları.',
}

export default function StudentExamsPage() {
  return <StudentAssessmentsView initialTab="exams" />
}
