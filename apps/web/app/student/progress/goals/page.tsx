import { Metadata } from 'next'
import React from 'react'
import StudentProgressView from '@components/Student/views/StudentProgressView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Akademik Hedefler — Öğrenci Portalı | Oxonom EDU',
}

export default function ProgressGoalsPage() {
  return <StudentProgressView initialTab="goals" />
}
