import { Metadata } from 'next'
import React from 'react'
import StudentLibraryView from '@components/Student/views/StudentLibraryView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sesli İçerikler — Öğrenci Portalı | Oxonom EDU',
}

export default function LibraryAudioPage() {
  return <StudentLibraryView initialTab="audio" />
}
