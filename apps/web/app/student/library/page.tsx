import { Metadata } from 'next'
import React, { Suspense } from 'react'
import StudentLibraryView from '@components/Student/views/StudentLibraryView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kitaplık & E-Kitap Okuyucu — Öğrenci Portalı | Oxonom EDU',
  description: 'T.C. Millî Eğitim Bakanlığı onaylı müfredat ders kitapları, etkileşimli dijital e-kitaplar ve PDF okuyucu.',
}

interface StudentLibraryPageProps {
  searchParams?: Promise<{
    bookId?: string
    page?: string
    status?: string
  }>
}

export default async function StudentLibraryPage({ searchParams }: StudentLibraryPageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const initialBookId = resolvedParams.bookId ? parseInt(resolvedParams.bookId, 10) : undefined
  const initialPage = resolvedParams.page ? parseInt(resolvedParams.page, 10) : undefined

  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 flex items-center justify-center text-sm font-bold text-gray-400">
          Kitaplık yükleniyor...
        </div>
      }
    >
      <StudentLibraryView
        initialTab="all"
        initialBookId={initialBookId}
        initialPage={initialPage}
      />
    </Suspense>
  )
}
