import { Metadata } from 'next'
import React from 'react'
import StudentPlannerView from '@components/Student/views/StudentPlannerView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Çalışma Takvimi — Öğrenci Portalı | Oxonom EDU',
}

export default function PlannerCalendarPage() {
  return <StudentPlannerView initialTab="calendar" />
}
