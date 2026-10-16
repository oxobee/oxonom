import React from 'react'
import { Metadata } from 'next'
import TeacherCoursesManagementView from '@/components/Teacher/views/TeacherCoursesManagementView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Öğrenci Ders Yönetimi — Oxonom EDU',
  description: 'Müfredat kitapları görünürlüğü, ders materyalleri yükleme, sınav ve değerlendirme notu yönetimi.',
}

export default function TeacherCoursesPage() {
  return <TeacherCoursesManagementView />
}
