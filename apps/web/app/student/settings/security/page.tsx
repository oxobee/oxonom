import { Metadata } from 'next'
import React from 'react'
import StudentSettingsView from '@components/Student/views/StudentSettingsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Güvenlik ve Oturum — Öğrenci Portalı | Oxonom EDU',
}

export default function SettingsSecurityPage() {
  return <StudentSettingsView initialTab="security" />
}
