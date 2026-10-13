import { Metadata } from 'next'
import React from 'react'
import StudentLearnView from '@components/Student/views/StudentLearnView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Konu Anlatımları — Öğrenci Portalı | Oxonom EDU',
}

export default function LearnTopicsPage() {
  return <StudentLearnView initialTab="topics" />
}
