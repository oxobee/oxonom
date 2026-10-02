import React from 'react'
import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import FeedbacksClient from './client'

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
    title: `Geri Bildirimler — ${org?.name || 'Oxonom Edu'}`,
    description: 'Superadmin geri bildirim yönetimi.',
  }
}

export default async function FeedbacksPage(props: PageProps) {
  return <FeedbacksClient />
}
