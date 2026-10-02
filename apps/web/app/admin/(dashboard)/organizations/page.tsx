import React from 'react'
import type { Metadata } from 'next'
import OrganizationList from '@components/Admin/OrganizationList'

export const metadata: Metadata = {
  title: 'Okullar & Kurumlar',
}

export default function AdminOrganizationsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Okullar & Kurumlar</h1>
        <p className="text-white/40 mt-1">
          Platformdaki tüm okulları, lisans planlarını ve kotalarını yönetin
        </p>
      </div>
      <OrganizationList />
    </div>
  )
}
