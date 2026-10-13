import { Metadata } from 'next'
import React from 'react'
import StudentLearnView from '@components/Student/views/StudentLearnView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Öğren ve Keşfet — Öğrenci Portalı | Oxonom EDU',
  description: 'İnteraktif öğrenme etkinlikleri, bilimsel simülasyonlar ve eğitici oyunlar.',
}

export default function StudentLearnPage() {
  return <StudentLearnView />
}
