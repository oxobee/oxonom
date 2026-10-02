import { NextRequest, NextResponse } from 'next/server'
import {
  getPodcasts,
  getPodcastCount,
  getPodcast,
  getPodcastMeta,
  getPodcastRights,
  createPodcastInStore,
  updatePodcastInStore,
  updatePodcastThumbnailInStore,
  deletePodcastFromStore,
  getEpisodesFromStore,
  getEpisodeFromStore,
  createEpisodeInStore,
  updateEpisodeInStore,
  deleteEpisodeFromStore,
  reorderEpisodesInStore,
} from '@services/podcasts/podcastStore'

async function fileToDataUri(file: any): Promise<string> {
  if (!file) return ''
  if (typeof file === 'string') return file
  if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function') {
    try {
      const buf = Buffer.from(await file.arrayBuffer())
      const mime = file.type || 'image/jpeg'
      return `data:${mime};base64,${buf.toString('base64')}`
    } catch {
      return ''
    }
  }
  return ''
}

export async function handlePodcastApi(request: NextRequest, path: string): Promise<Response> {
  const method = request.method.toUpperCase()
  // Remove leading /api/v1/podcasts
  const subpath = path.replace(/^\/api\/v1\/podcasts\/?/, '')

  // 1. Root /api/v1/podcasts or /api/v1/podcasts/
  if (!subpath || subpath === '') {
    if (method === 'GET') {
      const includeUnpublished = request.nextUrl.searchParams.get('include_unpublished') === 'true'
      const pods = getPodcasts(undefined, includeUnpublished)
      return NextResponse.json(pods, { status: 200 })
    }

    if (method === 'POST') {
      let body: any = {}
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        body.name = formData.get('name') as string
        body.description = formData.get('description') as string
        body.about = formData.get('about') as string
        body.tags = formData.get('tags') as string
        body.public = formData.get('public') === 'true'
        body.published = formData.get('published') !== 'false'
        const thumb = formData.get('thumbnail')
        const thumbUri = await fileToDataUri(thumb)
        if (thumbUri) body.thumbnail_image = thumbUri
      } else {
        try {
          body = await request.json()
        } catch {
          body = {}
        }
      }

      const orgId = request.nextUrl.searchParams.get('org_id') || body.org_id || 10
      const created = createPodcastInStore(orgId, body)
      return NextResponse.json({
        ...created,
        success: true,
        data: created,
      }, { status: 201 })
    }
  }

  // 2. Org slug routes:
  if (subpath.startsWith('org_slug/')) {
    const parts = subpath.replace('org_slug/', '').split('/')
    const slug = parts[0]
    const action = parts[1]

    if (action === 'count') {
      const count = getPodcastCount(slug)
      return NextResponse.json(count, { status: 200 })
    }

    if (action === 'page') {
      const includeUnpublished = request.nextUrl.searchParams.get('include_unpublished') === 'true'
      const pods = getPodcasts(slug, includeUnpublished)
      return NextResponse.json(pods, { status: 200 })
    }

    // Default for org_slug
    const pods = getPodcasts(slug, true)
    return NextResponse.json(pods, { status: 200 })
  }

  // 3. Episode direct routes:
  if (subpath.startsWith('episodes/')) {
    const parts = subpath.replace('episodes/', '').split('/')
    const episodeUuid = parts[0]
    const subaction = parts[1]

    if (subaction === 'audio' && (method === 'PUT' || method === 'POST')) {
      let audioFile = '/sample_podcast.mp3'
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const audio = formData.get('audio')
        if (audio && typeof audio === 'object' && 'name' in audio) {
          audioFile = (audio as File).name || '/sample_podcast.mp3'
        }
      }
      updateEpisodeInStore(episodeUuid, { audio_file: audioFile })
      return NextResponse.json({ success: true, message: 'Audio uploaded' }, { status: 200 })
    }

    if (subaction === 'thumbnail' && (method === 'PUT' || method === 'POST')) {
      let thumbnailImage = ''
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const thumb = formData.get('thumbnail')
        thumbnailImage = await fileToDataUri(thumb)
      }
      if (thumbnailImage) {
        updateEpisodeInStore(episodeUuid, { thumbnail_image: thumbnailImage })
      }
      return NextResponse.json({ success: true, message: 'Thumbnail uploaded' }, { status: 200 })
    }

    if (method === 'GET') {
      const ep = getEpisodeFromStore(episodeUuid)
      if (!ep) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
      }
      return NextResponse.json(ep, { status: 200 })
    }

    if (method === 'PUT' || method === 'PATCH') {
      let body: any = {}
      try {
        body = await request.json()
      } catch {
        body = {}
      }
      const updated = updateEpisodeInStore(episodeUuid, body)
      if (!updated) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: updated, ...updated }, { status: 200 })
    }

    if (method === 'DELETE') {
      const deleted = deleteEpisodeFromStore(episodeUuid)
      return NextResponse.json({
        success: deleted,
        message: deleted ? 'Episode deleted successfully' : 'Episode not found',
      }, { status: deleted ? 200 : 404 })
    }
  }

  // 4. Podcast UUID routes:
  const parts = subpath.split('/')
  const podcastUuid = parts[0]
  const subaction = parts[1]

  if (subaction === 'meta') {
    const meta = getPodcastMeta(podcastUuid)
    return NextResponse.json(meta, { status: 200 })
  }

  if (subaction === 'rights') {
    return NextResponse.json(getPodcastRights(podcastUuid), { status: 200 })
  }

  if (subaction === 'thumbnail' && (method === 'PUT' || method === 'POST')) {
    let thumbnailImage = ''
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const thumb = formData.get('thumbnail')
      thumbnailImage = await fileToDataUri(thumb)
    }
    if (!thumbnailImage) {
      thumbnailImage = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80'
    }
    updatePodcastThumbnailInStore(podcastUuid, thumbnailImage)
    return NextResponse.json({ success: true, message: 'Thumbnail updated successfully' }, { status: 200 })
  }

  if (subaction === 'episodes') {
    const episodeSubaction = parts[2]

    if (episodeSubaction === 'reorder' && (method === 'PUT' || method === 'POST')) {
      let orders: any[] = []
      try {
        orders = await request.json()
      } catch {
        orders = []
      }
      reorderEpisodesInStore(podcastUuid, orders)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (method === 'GET') {
      const includeUnpublished = request.nextUrl.searchParams.get('include_unpublished') === 'true'
      const eps = getEpisodesFromStore(podcastUuid, includeUnpublished)
      return NextResponse.json(eps, { status: 200 })
    }

    if (method === 'POST') {
      let body: any = {}
      const contentType = request.headers.get('content-type') || ''
      try {
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData()
          body.title = (formData.get('title') as string) || ''
          body.description = (formData.get('description') as string) || ''
          body.duration_seconds = Number(formData.get('duration_seconds')) || 180
          body.published = formData.get('published') !== 'false'
          const audio = formData.get('audio')
          if (audio && typeof audio === 'object' && 'name' in audio) {
            body.audio_file = (audio as File).name || '/sample_podcast.mp3'
          }
          const thumb = formData.get('thumbnail')
          const thumbUri = await fileToDataUri(thumb)
          if (thumbUri) {
            body.thumbnail_image = thumbUri
          }
        } else {
          body = await request.json()
        }
      } catch (err) {
        console.warn('Episode creation body parsing note:', err)
      }

      const created = createEpisodeInStore(podcastUuid, body)
      return NextResponse.json({
        ...created,
        success: true,
        data: created,
      }, { status: 201 })
    }
  }

  // Base podcast UUID (/api/v1/podcasts/:podcast_uuid)
  if (!subaction) {
    if (method === 'GET') {
      const pod = getPodcast(podcastUuid)
      return NextResponse.json(pod, { status: 200 })
    }

    if (method === 'PUT' || method === 'PATCH') {
      let body: any = {}
      try {
        body = await request.json()
      } catch {
        body = {}
      }
      const updated = updatePodcastInStore(podcastUuid, body)
      if (!updated) {
        return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: updated,
        ...updated,
      }, { status: 200 })
    }

    if (method === 'DELETE') {
      const deleted = deletePodcastFromStore(podcastUuid)
      return NextResponse.json({
        success: deleted,
        message: deleted ? 'Podcast deleted successfully' : 'Podcast not found',
      }, { status: deleted ? 200 : 404 })
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
