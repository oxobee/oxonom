import { Metadata } from 'next'
import React from 'react'
import StudentAssessmentsView from '@components/Student/views/StudentAssessmentsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Quizler — Öğrenci Portalı | Oxonom EDU',
  description: 'Öğretmenler tarafından atanan mini quizler.',
}

export default function StudentQuizzesPage() {
  return <StudentAssessmentsView initialTab="quizzes" />
}
