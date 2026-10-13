import { Metadata } from 'next'
import React from 'react'
import StudentLearnView from '@components/Student/views/StudentLearnView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Etkinlikler ve Simülasyonlar — Öğrenci Portalı | Oxonom EDU',
}

export default function LearnActivitiesPage() {
  return <StudentLearnView initialTab="activities" />
}
