import { Metadata } from 'next'
import React from 'react'
import StudentSettingsView from '@components/Student/views/StudentSettingsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profilim ve Ayarlar — Öğrenci Portalı | Oxonom EDU',
  description: 'Öğrenci kimlik bilgileri, veli irtibatı ve arayüz ayarları.',
}

export default function StudentSettingsPage() {
  return <StudentSettingsView initialTab="profile" />
}
