import { Metadata } from 'next'
import React from 'react'
import StudentLearnView from '@components/Student/views/StudentLearnView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Eğitici Oyunlar — Öğrenci Portalı | Oxonom EDU',
}

export default function LearnGamesPage() {
  return <StudentLearnView initialTab="games" />
}
