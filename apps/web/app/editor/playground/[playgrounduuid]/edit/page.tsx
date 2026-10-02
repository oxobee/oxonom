import { Metadata } from 'next'
import { getServerSession } from '@/lib/auth/server'
import { getPlayground } from '@services/playgrounds/playgrounds'
import { getOrgCourses } from '@services/courses/courses'
import { notFound, redirect } from 'next/navigation'
import PlaygroundEditor from '@components/Playground/PlaygroundEditor'

type PageParams = Promise<{ playgrounduuid: string }>

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { playgrounduuid } = await params
  try {
    const pg = await getPlayground(playgrounduuid)
    return { title: `Edit — ${pg.name}` }
  } catch {
    return { title: 'Edit Playground' }
  }
}

export default async function EditPlaygroundPage({ params }: { params: PageParams }) {
  const { playgrounduuid } = await params
  redirect('/playgrounds')
}
