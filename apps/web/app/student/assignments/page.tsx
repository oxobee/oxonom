import { Metadata } from 'next'
import React from 'react'
import StudentAssignmentsView from '@components/Student/views/StudentAssignmentsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ödevlerim — Öğrenci Portalı | Oxonom EDU',
  description: 'Öğretmenler tarafından verilen ödevler, teslim durumu ve notlar.',
}

export default function StudentAssignmentsPage() {
  return <StudentAssignmentsView />
}
