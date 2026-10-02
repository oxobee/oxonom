import React from 'react'
import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import ClassDetailClient from './client'

type PageProps = {
  params: Promise<{ orgslug: string; id: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const org = await getOrganizationContextInfo(params.orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  return {
    title: `Sınıf Yönetimi — ${org?.name || 'Oxonom Edu'}`,
    description: 'Sınıf tahtaları, kayıtlı öğrenciler, yoklama ve sınıf eşleşme kodu yönetimi.',
  }
}

export default async function ClassDetailPage(props: PageProps) {
  const { orgslug, id } = await props.params
  return <ClassDetailClient orgslug={orgslug} classroomId={parseInt(id, 10)} />
}
