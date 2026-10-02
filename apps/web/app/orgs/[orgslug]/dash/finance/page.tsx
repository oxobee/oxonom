import React from 'react'
import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import FinanceClient from './client'

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
    title: `Finans, Masraflar & Faturalar — ${org?.name || 'Oxonom Edu'}`,
    description: 'Okul genel giderleri, elektrik/su/internet faturaları, kırtasiye ve operasyon masrafları takibi.',
  }
}

export default async function FinancePage(props: PageProps) {
  const { orgslug } = await props.params
  return <FinanceClient orgslug={orgslug} />
}
