import { Metadata } from 'next'
import React from 'react'
import StudentLibraryView from '@components/Student/views/StudentLibraryView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Video Dersler — Öğrenci Portalı | Oxonom EDU',
}

export default function LibraryVideosPage() {
  return <StudentLibraryView initialTab="videos" />
}
