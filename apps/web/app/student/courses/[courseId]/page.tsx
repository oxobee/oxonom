import { Metadata } from 'next'
import React from 'react'
import StudentCourseDetailView from '@components/Student/views/StudentCourseDetailView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ders Detayı — Öğrenci Portalı | Oxonom EDU',
  description: 'Ders müfredatı, kazanımlar ve paylaşılan ders materyalleri.',
}

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <StudentCourseDetailView courseId={courseId} />
}
