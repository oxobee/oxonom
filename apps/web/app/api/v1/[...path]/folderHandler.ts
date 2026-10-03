import { NextRequest, NextResponse } from 'next/server'
import {
  getOrgFoldersFromStore,
  getFolderFromStore,
  createFolderInStore,
  updateFolderInStore,
  deleteFolderFromStore,
  addFolderContentInStore,
  removeFolderContentFromStore,
  getRootItemsFromStore,
  addRootContentInStore,
  removeRootContentFromStore,
  searchLibraryInStore,
  createMediaInStore,
  getOrgMediaFromStore,
  getMediaFromStore,
  deleteMediaFromStore,
} from '@services/folders/folderStore'

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

export async function handleFolderApi(request: NextRequest, path: string): Promise<Response> {
  const method = request.method.toUpperCase()

  // ─────────────────────────────────────────────────────────────
  // 1. MEDIA ROUTES: /api/v1/media...
  // ─────────────────────────────────────────────────────────────
  if (path.startsWith('/api/v1/media')) {
    const subpath = path.replace(/^\/api\/v1\/media\/?/, '')

    // Media creation: POST /api/v1/media/ or /api/v1/media
    if ((subpath === '' || subpath === '/') && method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || ''
        let body: any = {}
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData()
          body.name = (formData.get('name') as string) || ''
          body.media_type = (formData.get('media_type') as string) || 'UPLOAD'
          body.description = (formData.get('description') as string) || ''
          body.url = (formData.get('url') as string) || ''
          body.public = formData.get('public') !== 'false'
          body.org_id = Number(formData.get('org_id')) || 2
          body.folder_uuid = (formData.get('folder_uuid') as string) || null

          const file = formData.get('file')
          if (file && typeof file === 'object' && 'name' in file) {
            body.file_name = (file as File).name
            body.file_data = await fileToDataUri(file)
          }
        } else {
          body = await request.json()
        }

        const created = createMediaInStore(body)
        return NextResponse.json({ success: true, data: created, ...created }, { status: 201 })
      } catch (err: any) {
        console.error('Error creating media:', err)
        return NextResponse.json({ error: err?.message || 'Failed to create media' }, { status: 400 })
      }
    }

    // Media by org: /api/v1/media/org/:org_id/page/:page/limit/:limit
    if (subpath.startsWith('org/')) {
      const parts = subpath.split('/')
      const orgId = Number(parts[1]) || 2
      const list = getOrgMediaFromStore(orgId)
      return NextResponse.json(list, { status: 200 })
    }

    // Media share-link: /api/v1/media/:uuid/share-link
    if (subpath.includes('/share-link')) {
      return NextResponse.json({ token: `token_${Date.now()}` }, { status: 200 })
    }

    // Media file download/preview: /api/v1/media/:uuid/file
    if (subpath.includes('/file')) {
      const parts = subpath.split('/')
      const mediaUuid = parts[0]
      const media = getMediaFromStore(mediaUuid)
      if (media?.file_data && media.file_data.startsWith('data:')) {
        // Return placeholder or redirect
        return NextResponse.redirect(new URL(media.url || '/', request.url))
      }
      return NextResponse.json({ success: true, message: 'File endpoint' }, { status: 200 })
    }

    // Single media: /api/v1/media/:uuid
    const mediaParts = subpath.split('/')
    const mediaUuid = mediaParts[0]

    if (method === 'GET') {
      const m = getMediaFromStore(mediaUuid)
      if (m) return NextResponse.json(m, { status: 200 })
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    if (method === 'DELETE') {
      const deleted = deleteMediaFromStore(mediaUuid)
      return NextResponse.json({ success: deleted }, { status: 200 })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. FOLDERS ROUTES: /api/v1/folders...
  // ─────────────────────────────────────────────────────────────
  const subpath = path.replace(/^\/api\/v1\/folders\/?/, '')

  // Create folder: POST /api/v1/folders or /api/v1/folders/
  if ((subpath === '' || subpath === '/') && method === 'POST') {
    try {
      const body = await request.json()
      const created = createFolderInStore(body)
      return NextResponse.json(created, { status: 201 })
    } catch (err: any) {
      console.error('Error creating folder:', err)
      return NextResponse.json({ error: err?.message || 'Failed to create folder' }, { status: 400 })
    }
  }

  // Folders for an org: /api/v1/folders/org/:org_id/...
  if (subpath.startsWith('org/')) {
    const parts = subpath.split('/')
    const orgId = Number(parts[1]) || 2
    const action = parts[2]

    // GET /api/v1/folders/org/:org_id/root
    if (action === 'root' && method === 'GET') {
      const items = getRootItemsFromStore(orgId)
      return NextResponse.json(items, { status: 200 })
    }

    // Content at org root: POST/DELETE /api/v1/folders/org/:org_id/content
    if (action === 'content') {
      const resourceUuid = request.nextUrl.searchParams.get('resource_uuid') || ''
      const position = Number(request.nextUrl.searchParams.get('position')) || 0

      if (method === 'POST') {
        addRootContentInStore(orgId, resourceUuid, position)
        return NextResponse.json({ success: true }, { status: 200 })
      }
      if (method === 'DELETE') {
        removeRootContentFromStore(orgId, resourceUuid)
        return NextResponse.json({ success: true }, { status: 200 })
      }
    }

    // Search library: GET /api/v1/folders/org/:org_id/search?q=...
    if (action === 'search' && method === 'GET') {
      const q = request.nextUrl.searchParams.get('q') || ''
      const results = searchLibraryInStore(orgId, q)
      return NextResponse.json(results, { status: 200 })
    }

    // Reorder folders: PUT /api/v1/folders/org/:org_id/order
    if (action === 'order' && method === 'PUT') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // List folders: GET /api/v1/folders/org/:org_id/page/:page/limit/:limit
    if (action === 'page' || method === 'GET') {
      const parentFolderUuid = request.nextUrl.searchParams.get('parent_folder_uuid')
      const folders = getOrgFoldersFromStore(orgId, parentFolderUuid)
      return NextResponse.json(folders, { status: 200 })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SINGLE FOLDER OPERATIONS: /api/v1/folders/:uuid...
  // ─────────────────────────────────────────────────────────────
  const parts = subpath.split('/')
  const folderUuid = parts[0]
  const subaction = parts[1]

  // Thumbnail upload: PUT /api/v1/folders/:uuid/thumbnail
  if (subaction === 'thumbnail' && (method === 'PUT' || method === 'POST')) {
    let thumbnailImage = ''
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const thumb = formData.get('thumbnail')
      thumbnailImage = await fileToDataUri(thumb)
    }
    if (thumbnailImage) {
      updateFolderInStore(folderUuid, { thumbnail_image: thumbnailImage })
    }
    return NextResponse.json({ success: true, message: 'Thumbnail updated' }, { status: 200 })
  }

  // Folder content: /api/v1/folders/:uuid/content
  if (subaction === 'content') {
    const nextSub = parts[2]
    if (nextSub === 'order' && method === 'PUT') {
      return NextResponse.json({ success: true }, { status: 200 })
    }
    if (nextSub === 'move' && method === 'POST') {
      const targetFolderUuid = request.nextUrl.searchParams.get('target_folder_uuid') || ''
      const resourceUuid = request.nextUrl.searchParams.get('resource_uuid') || ''
      removeFolderContentFromStore(folderUuid, resourceUuid)
      addFolderContentInStore(targetFolderUuid, resourceUuid, 0)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const resourceUuid = request.nextUrl.searchParams.get('resource_uuid') || ''
    const position = Number(request.nextUrl.searchParams.get('position')) || 0

    if (method === 'POST') {
      addFolderContentInStore(folderUuid, resourceUuid, position)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (method === 'DELETE') {
      removeFolderContentFromStore(folderUuid, resourceUuid)
      return NextResponse.json({ success: true }, { status: 200 })
    }
  }

  // Direct folder operations: GET, PUT, DELETE /api/v1/folders/:uuid
  if (method === 'GET') {
    const f = getFolderFromStore(folderUuid)
    if (f) return NextResponse.json(f, { status: 200 })
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
  }

  if (method === 'PUT' || method === 'PATCH') {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    const updated = updateFolderInStore(folderUuid, body)
    return NextResponse.json(updated, { status: 200 })
  }

  if (method === 'DELETE') {
    const deleted = deleteFolderFromStore(folderUuid)
    return NextResponse.json({ success: deleted, message: deleted ? 'Folder deleted' : 'Folder not found' }, { status: 200 })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
