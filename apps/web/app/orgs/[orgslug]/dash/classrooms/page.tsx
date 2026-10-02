import React from 'react'
import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import ClassroomsClient from './client'

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
    title: `Sınıflar — ${org?.name || 'Oxonom Edu'}`,
    description: 'Okul sınıf yönetimi, katılım kodları ve şube mevcudu takibi.',
  }
}

export default async function ClassroomsPage(props: PageProps) {
  const { orgslug } = await props.params
  return <ClassroomsClient orgslug={orgslug} />
}
