'use client'

import React from 'react'
import GamesStoreClient from '@components/Games/GamesStoreClient'
import { OrgMenu } from '@components/Objects/Menus/OrgMenu'
import { GlobalEduFooter } from '@components/Footers/GlobalEduFooter'
import { useOrg } from '@components/Contexts/OrgContext'

export default function GamesPageClient() {
  const org = useOrg() as any
  const orgslug = org?.slug || 'demo'

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f8f8]">
      <OrgMenu orgslug={orgslug} />
      <div className="flex-1">
        <GamesStoreClient />
      </div>
      <GlobalEduFooter />
    </div>
  )
}
