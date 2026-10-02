import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from '@/lib/auth/server'
import { getPlayground } from '@services/playgrounds/playgrounds'
import { SYNCED_PLAYGROUNDS, SYNCED_PLAYGROUNDS_MAP } from '@services/demo/databaseSync'
import PlaygroundViewClient from './view'

type PageParams = Promise<{ orgslug: string; playgrounduuid: string }>

function resolveLocalPlayground(uuid: string) {
  const clean = uuid.replace('playground_', '')
  return (
    SYNCED_PLAYGROUNDS_MAP[uuid] ||
    SYNCED_PLAYGROUNDS_MAP[clean] ||
    SYNCED_PLAYGROUNDS.find(
      (p: any) =>
        p.playground_uuid === uuid ||
        p.playground_uuid === `playground_${clean}` ||
        p.playground_uuid === clean
    )
  )
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { playgrounduuid } = await params
  try {
    const pg = await getPlayground(playgrounduuid)
    return {
      title: `${pg.name} | Modüller`,
      description: pg.description || `Etkileşimli modül: ${pg.name}`,
    }
  } catch {
    const pg = resolveLocalPlayground(playgrounduuid)
    if (pg) {
      return {
        title: `${pg.name} | Modüller`,
        description: pg.description || `Etkileşimli modül: ${pg.name}`,
      }
    }
    return { title: 'Modüller' }
  }
}

export default async function PlaygroundViewPage({ params }: { params: PageParams }) {
  const { orgslug, playgrounduuid } = await params
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  let playground
  try {
    playground = await getPlayground(playgrounduuid, access_token ?? undefined)
  } catch {
    playground = resolveLocalPlayground(playgrounduuid)
  }

  if (!playground) {
    playground = resolveLocalPlayground(playgrounduuid)
  }

  if (!playground) {
    notFound()
  }

  return (
    <PlaygroundViewClient
      playground={playground}
      orgslug={orgslug}
      canEdit={!!access_token}
    />
  )
}
