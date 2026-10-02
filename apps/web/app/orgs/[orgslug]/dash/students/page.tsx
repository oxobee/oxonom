import React from 'react'
import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import StudentsClient from './client'

type PageProps = {
  params: Promise<{ orgslug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const org = await getOrganizationContextInfo(params.orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  return {
    title: `Öğrenci İşleri & Sınıf Dağılımı — ${org?.name || 'Oxonom Edu'}`,
    description: 'Sınıf bazlı öğrenci listesi, şube değişikliği, kayıt dondurma ve detaylı öğrenci bilgileri.',
  }
}

export default async function StudentsPage(props: PageProps) {
  const { orgslug } = await props.params
  return <StudentsClient orgslug={orgslug} />
}
