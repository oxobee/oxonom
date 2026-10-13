import { Metadata } from 'next'
import React from 'react'
import StudentAssignmentDetailView from '@components/Student/views/StudentAssignmentDetailView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ödev Detayı ve Teslim — Öğrenci Portalı | Oxonom EDU',
  description: 'Ödev talimatları, yanıt gönderme ve öğretmen değerlendirmesi.',
}

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const { assignmentId } = await params
  return <StudentAssignmentDetailView assignmentId={assignmentId} />
}
