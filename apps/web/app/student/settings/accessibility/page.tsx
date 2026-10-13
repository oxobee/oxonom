import { Metadata } from 'next'
import React from 'react'
import StudentSettingsView from '@components/Student/views/StudentSettingsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tema ve Görünüm — Öğrenci Portalı | Oxonom EDU',
}

export default function SettingsAccessibilityPage() {
  return <StudentSettingsView initialTab="accessibility" />
}
