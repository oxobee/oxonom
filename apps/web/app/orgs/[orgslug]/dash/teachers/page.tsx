import React from 'react'
import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import TeachersClient from './client'

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
    title: `Öğretmenler & Sınıf Görevlendirmeleri — ${org?.name || 'Oxonom Edu'}`,
    description: 'Okul öğretmen kadrosu, branşlar ve sınıflara öğretmen atama yönetimi.',
  }
}

export default async function TeachersPage(props: PageProps) {
  const { orgslug } = await props.params
  return <TeachersClient orgslug={orgslug} />
}
