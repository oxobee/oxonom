import { Metadata } from 'next'
import React from 'react'
import StudentLibraryView from '@components/Student/views/StudentLibraryView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Eğitim Kütüphanesi — Öğrenci Portalı | Oxonom EDU',
  description: 'Ders notları, özet PDF kaynakları, sunumlar ve ders videoları.',
}

export default function StudentLibraryPage() {
  return <StudentLibraryView initialTab="all" />
}
