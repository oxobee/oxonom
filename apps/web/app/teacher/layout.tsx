import { Metadata } from 'next'
import React from 'react'
import TeacherAuthorization from '@components/Teacher/TeacherAuthorization'
import TeacherLayout from '@components/Teacher/TeacherLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Oxonom EDU — Öğretmen Çalışma Merkezi',
  description: 'Kapsamlı ders, sınıf, akıllı tahta ve yapay zekâ öğretmen yönetim merkezi.',
}

export default function TeacherRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TeacherAuthorization>
      <TeacherLayout>{children}</TeacherLayout>
    </TeacherAuthorization>
  )
}
