import { Metadata } from 'next'
import React from 'react'
import StudentSettingsView from '@components/Student/views/StudentSettingsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Öğrenci Profili — Öğrenci Portalı | Oxonom EDU',
}

export default function SettingsProfilePage() {
  return <StudentSettingsView initialTab="profile" />
}
