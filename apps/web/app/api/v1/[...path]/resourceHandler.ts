import { NextRequest, NextResponse } from 'next/server'
import {
  DEFAULT_RESOURCE_FOLDERS,
  DEFAULT_RESOURCE_ITEMS,
  ResourceFolder,
  ResourceItem,
} from '@services/educational_resources/educational_resources'

let foldersStore: ResourceFolder[] = [...DEFAULT_RESOURCE_FOLDERS]
let itemsStore: ResourceItem[] = [...DEFAULT_RESOURCE_ITEMS]

export async function handleResourceApi(request: NextRequest, path: string): Promise<Response> {
  const method = request.method.toUpperCase()

  // 1. Folders: /api/v1/resources/folders
  if (path === '/api/v1/resources/folders' || path === '/api/v1/resources/folders/') {
    if (method === 'GET') {
      const parentIdParam = request.nextUrl.searchParams.get('parent_id')
      let list = [...foldersStore]
      if (parentIdParam !== null && parentIdParam !== undefined && parentIdParam !== '') {
        const pId = Number(parentIdParam)
        list = list.filter((f) => f.parent_id === pId)
      }
      return NextResponse.json(list, { status: 200 })
    }

    if (method === 'POST') {
      try {
        const body = await request.json()
        const newFolder: ResourceFolder = {
          id: Date.now(),
          folder_uuid: `folder_${Date.now()}`,
          org_id: body.org_id || 10,
          name: body.name || 'Yeni Klasör',
          description: body.description || '',
          color: body.color || '#4F46E5',
          icon: body.icon || 'FolderSimple',
          parent_id: body.parent_id !== undefined ? body.parent_id : null,
          created_by: 1,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
          items_count: 0,
        }
        foldersStore.push(newFolder)
        return NextResponse.json(newFolder, { status: 201 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to create folder' }, { status: 400 })
      }
    }
  }

  // Folder single operations: /api/v1/resources/folders/:uuid
  if (path.startsWith('/api/v1/resources/folders/')) {
    const parts = path.split('/')
    const fUuid = parts[parts.indexOf('folders') + 1] || ''
    const fIndex = foldersStore.findIndex(
      (f) => f.folder_uuid === fUuid || String(f.id) === fUuid
    )

    if (method === 'GET') {
      const found = fIndex !== -1 ? foldersStore[fIndex] : foldersStore[0]
      return NextResponse.json(found, { status: 200 })
    }

    if (method === 'PUT') {
      try {
        const body = await request.json()
        if (fIndex !== -1) {
          foldersStore[fIndex] = {
            ...foldersStore[fIndex],
            ...body,
            updated_at: new Date().toISOString(),
          }
          return NextResponse.json(foldersStore[fIndex], { status: 200 })
        }
        return NextResponse.json(body, { status: 200 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to update folder' }, { status: 400 })
      }
    }

    if (method === 'DELETE') {
      if (fIndex !== -1) {
        foldersStore.splice(fIndex, 1)
      }
      return NextResponse.json({ success: true, message: 'Klasör silindi' }, { status: 200 })
    }
  }

  // 2. Resource Items: /api/v1/resources/items
  if (path === '/api/v1/resources/items' || path === '/api/v1/resources/items/') {
    if (method === 'GET') {
      const folderId = request.nextUrl.searchParams.get('folder_id')
      const subject = request.nextUrl.searchParams.get('subject')
      const resourceType = request.nextUrl.searchParams.get('resource_type')
      const search = request.nextUrl.searchParams.get('search')

      let list = [...itemsStore]
      if (folderId !== null && folderId !== undefined && folderId !== '') {
        const fId = Number(folderId)
        list = list.filter((r) => r.folder_id === fId)
      }
      if (subject && subject !== 'all') {
        list = list.filter((r) => r.subject === subject)
      }
      if (resourceType && resourceType !== 'all') {
        list = list.filter((r) => r.resource_type === resourceType)
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase()
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q))
        )
      }
      return NextResponse.json(list, { status: 200 })
    }

    if (method === 'POST') {
      try {
        const body = await request.json()
        const newItem: ResourceItem = {
          id: Date.now(),
          resource_uuid: `res_${Date.now()}`,
          org_id: body.org_id || 10,
          folder_id: body.folder_id !== undefined ? body.folder_id : null,
          title: body.title || 'Yeni Kaynak',
          description: body.description || '',
          resource_type: body.resource_type || 'pdf',
          file_url: body.file_url || '/sample_podcast.mp3',
          file_name: body.file_name || 'belge.pdf',
          file_size: body.file_size || 1024 * 1024,
          mime_type: body.mime_type || 'application/pdf',
          external_url: body.external_url || null,
          subject: body.subject || 'Genel',
          grade_level: body.grade_level || '1. Sınıf',
          is_downloadable: body.is_downloadable !== undefined ? body.is_downloadable : true,
          is_locked: body.is_locked !== undefined ? body.is_locked : false,
          pin: body.pin || body.pin_code || null,
          target_type: 'all',
          views_count: 0,
          downloads_count: 0,
          created_by: 1,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
        }
        itemsStore.unshift(newItem)
        return NextResponse.json(newItem, { status: 201 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to create resource' }, { status: 400 })
      }
    }
  }

  // 3. Resource Item track: /api/v1/resources/items/:uuid/track
  if (path.includes('/resources/items/') && path.endsWith('/track')) {
    const parts = path.split('/')
    const resUuid = parts[parts.indexOf('items') + 1] || ''
    const item = itemsStore.find((r) => r.resource_uuid === resUuid || String(r.id) === resUuid)
    if (item) {
      try {
        const body = await request.json().catch(() => ({}))
        if (body.action === 'download') {
          item.downloads_count = (item.downloads_count || 0) + 1
        } else {
          item.views_count = (item.views_count || 0) + 1
        }
      } catch {
        item.views_count = (item.views_count || 0) + 1
      }
      return NextResponse.json(
        { status: 'ok', views: item.views_count, downloads: item.downloads_count },
        { status: 200 }
      )
    }
    return NextResponse.json({ status: 'ok', views: 1, downloads: 1 }, { status: 200 })
  }

  // 4. Resource Item single operations: /api/v1/resources/items/:uuid
  if (path.startsWith('/api/v1/resources/items/')) {
    const parts = path.split('/')
    const resUuid = parts[parts.indexOf('items') + 1] || ''
    const rIndex = itemsStore.findIndex(
      (r) => r.resource_uuid === resUuid || String(r.id) === resUuid
    )

    if (method === 'GET') {
      const found = rIndex !== -1 ? itemsStore[rIndex] : itemsStore[0]
      return NextResponse.json(found, { status: 200 })
    }

    if (method === 'PUT') {
      try {
        const body = await request.json()
        if (rIndex !== -1) {
          itemsStore[rIndex] = {
            ...itemsStore[rIndex],
            ...body,
            updated_at: new Date().toISOString(),
          }
          return NextResponse.json(itemsStore[rIndex], { status: 200 })
        }
        return NextResponse.json(body, { status: 200 })
      } catch (err) {
        return NextResponse.json({ error: 'Failed to update resource' }, { status: 400 })
      }
    }

    if (method === 'DELETE') {
      if (rIndex !== -1) {
        itemsStore.splice(rIndex, 1)
      }
      return NextResponse.json({ success: true, message: 'Kaynak silindi' }, { status: 200 })
    }
  }

  // 5. Upload: /api/v1/resources/upload
  if (path === '/api/v1/resources/upload') {
    return NextResponse.json(
      {
        file_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
        file_name: 'yuklenen_kaynak_belgesi.pdf',
        file_size: 2048576,
        resource_type: 'pdf',
      },
      { status: 200 }
    )
  }

  return NextResponse.json(itemsStore, { status: 200 })
}
