import React from 'react'
import type { Metadata } from 'next'
import UserList from '@components/Admin/UserList'

export const metadata: Metadata = {
  title: 'Kullanıcılar',
}

export default function AdminUsersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Kullanıcılar</h1>
        <p className="text-white/40 mt-1">
          Platform genelindeki tüm kullanıcıları yönetin
        </p>
      </div>
      <UserList />
    </div>
  )
}
