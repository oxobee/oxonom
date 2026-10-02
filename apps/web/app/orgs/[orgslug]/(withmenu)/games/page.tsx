import React from 'react'
import GamesStoreClient from '@components/Games/GamesStoreClient'

export const metadata = {
  title: 'Eğitici Oyunlar | AgenaPOS',
  description: 'Öğrenciler için eğitici HTML5 zeka, matematik, fen ve dil oyunları.',
}

export default function GamesPage() {
  return <GamesStoreClient />
}
