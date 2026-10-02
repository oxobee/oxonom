import React from 'react'
import GamesAdminClient from '@components/Admin/Games/GamesAdminClient'

export const metadata = {
  title: 'Oyun Yönetimi | Süper Admin',
  description: 'Eğitici HTML5 oyunları ve kategorileri yönetin',
}

export default function AdminGamesPage() {
  return <GamesAdminClient />
}
