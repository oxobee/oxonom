import { Metadata } from 'next'
import React from 'react'
import StudentAuthorization from '@components/Student/StudentAuthorization'
import StudentLayout from '@components/Student/StudentLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Oxonom EDU — Öğrenci Portalı',
  description: 'Dersler, ödevler, sınavlar, öğrenme modülleri ve öğrenci başarı takip merkezi.',
}

export default function StudentRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentAuthorization>
      <StudentLayout>{children}</StudentLayout>
    </StudentAuthorization>
  )
}
