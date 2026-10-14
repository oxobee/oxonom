import { Metadata } from 'next'
import React from 'react'
import AcademicCalendarView from '@components/Common/AcademicCalendarView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Akademik Takvim & Yaklaşan Etkinlikler — Öğrenci Portalı | Oxonom EDU',
  description: 'MEB 2026-2027 resmi çalışma takvimi, sınav haftaları, ara tatiller ve okul etkinlikleri.',
}

export default function StudentAcademicCalendarPage() {
  return (
    <div className="space-y-6 pb-12">
      <AcademicCalendarView role="student" />
    </div>
  )
}
