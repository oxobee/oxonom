import { Metadata } from 'next'
import React from 'react'
import AcademicCalendarView from '@components/Common/AcademicCalendarView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Akademik Takvim & Yaklaşan Etkinlikler — Yönetici Portalı | Oxonom EDU',
  description: 'MEB 2026-2027 resmi çalışma takvimi, ortak sınav haftaları, tatiller ve etkinlik yönetimi.',
}

export default function PrincipalAcademicCalendarPage() {
  return (
    <div className="space-y-6 pb-12">
      <AcademicCalendarView role="principal" />
    </div>
  )
}
