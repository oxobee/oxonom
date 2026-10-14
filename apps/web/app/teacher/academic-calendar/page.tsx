import { Metadata } from 'next'
import React from 'react'
import AcademicCalendarView from '@components/Common/AcademicCalendarView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Akademik Takvim & Yaklaşan Etkinlikler — Öğretmen Portalı | Oxonom EDU',
  description: 'MEB 2026-2027 resmi çalışma takvimi, ortak sınavlar, tatiller ve okul etkinlikleri.',
}

export default function TeacherAcademicCalendarPage() {
  return (
    <div className="space-y-6 pb-12">
      <AcademicCalendarView role="teacher" />
    </div>
  )
}
