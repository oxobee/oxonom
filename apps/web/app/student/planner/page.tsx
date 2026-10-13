import { Metadata } from 'next'
import React from 'react'
import StudentPlannerView from '@components/Student/views/StudentPlannerView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Defterim ve Planlayıcım — Öğrenci Portalı | Oxonom EDU',
  description: 'Kişisel çalışma ajandası, ders notları ve görevler.',
}

export default function StudentPlannerPage() {
  return <StudentPlannerView initialTab="all" />
}
