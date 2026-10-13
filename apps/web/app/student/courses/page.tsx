import { Metadata } from 'next'
import React from 'react'
import StudentCoursesView from '@components/Student/views/StudentCoursesView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Derslerim — Öğrenci Portalı | Oxonom EDU',
  description: 'Kayıtlı olunan dersler, haftalık ders saatleri ve öğretmenler.',
}

export default function StudentCoursesPage() {
  return <StudentCoursesView />
}
