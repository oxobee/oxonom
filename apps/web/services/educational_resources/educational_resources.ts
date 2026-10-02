import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
} from '@services/utils/ts/requests'

export interface ResourceFolder {
  id: number
  folder_uuid: string
  org_id: number
  parent_id?: number | null
  name: string
  description?: string | null
  icon: string
  color: string
  is_locked: boolean
  pin?: string | null
  target_type: 'all' | 'classrooms' | 'students'
  target_ids?: {
    classroom_ids?: number[]
    student_ids?: number[]
  } | null
  created_by: number
  creation_date: string
  update_date: string
}

export interface ResourceItem {
  id: number
  resource_uuid: string
  org_id: number
  folder_id?: number | null
  title: string
  description?: string | null
  resource_type: 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'audio' | 'link' | 'youtube'
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  external_url?: string | null
  subject?: string | null
  is_downloadable: boolean
  is_locked: boolean
  pin?: string | null
  target_type: 'all' | 'classrooms' | 'students'
  target_ids?: {
    classroom_ids?: number[]
    student_ids?: number[]
  } | null
  created_by: number
  uploader_name?: string | null
  uploader_role?: string | null
  views_count: number
  downloads_count: number
  creation_date: string
  update_date: string
}

export interface ResourceAccessLog {
  id: number
  resource_id: number
  org_id: number
  user_id: number
  user_name: string
  user_role: string
  action: 'view' | 'download'
  timestamp: string
}

// --- Folders API ---
export async function getFolders(
  orgId: number,
  parentId?: number | null,
  accessToken?: string
): Promise<ResourceFolder[]> {
  const url = new URL(`${getAPIUrl()}resources/folders`)
  url.searchParams.set('org_id', String(orgId))
  if (parentId !== undefined && parentId !== null) {
    url.searchParams.set('parent_id', String(parentId))
  }
  const result = await fetch(
    url.toString(),
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function createFolder(
  data: Partial<ResourceFolder> & { org_id: number; name: string },
  accessToken: string
): Promise<ResourceFolder> {
  const result = await fetch(
    `${getAPIUrl()}resources/folders`,
    RequestBodyWithAuthHeader('POST', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function updateFolder(
  folderUuid: string,
  data: Partial<ResourceFolder>,
  accessToken: string
): Promise<ResourceFolder> {
  const result = await fetch(
    `${getAPIUrl()}resources/folders/${folderUuid}`,
    RequestBodyWithAuthHeader('PUT', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function deleteFolder(
  folderUuid: string,
  accessToken: string
): Promise<any> {
  const result = await fetch(
    `${getAPIUrl()}resources/folders/${folderUuid}`,
    RequestBodyWithAuthHeader('DELETE', null, null, accessToken)
  )
  return errorHandling(result)
}

// --- Resources API ---
export async function getResources(
  orgId: number,
  params?: {
    folderId?: number | null
    subject?: string
    resourceType?: string
    search?: string
  },
  accessToken?: string
): Promise<ResourceItem[]> {
  const url = new URL(`${getAPIUrl()}resources/items`)
  url.searchParams.set('org_id', String(orgId))
  if (params?.folderId !== undefined && params?.folderId !== null) {
    url.searchParams.set('folder_id', String(params.folderId))
  }
  if (params?.subject && params.subject !== 'all') {
    url.searchParams.set('subject', params.subject)
  }
  if (params?.resourceType && params.resourceType !== 'all') {
    url.searchParams.set('resource_type', params.resourceType)
  }
  if (params?.search && params.search.trim()) {
    url.searchParams.set('search', params.search.trim())
  }

  const result = await fetch(
    url.toString(),
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function createResource(
  data: Partial<ResourceItem> & { org_id: number; title: string },
  accessToken: string
): Promise<ResourceItem> {
  const result = await fetch(
    `${getAPIUrl()}resources/items`,
    RequestBodyWithAuthHeader('POST', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function updateResource(
  resourceUuid: string,
  data: Partial<ResourceItem>,
  accessToken: string
): Promise<ResourceItem> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}`,
    RequestBodyWithAuthHeader('PUT', data, null, accessToken)
  )
  return errorHandling(result)
}

export async function deleteResource(
  resourceUuid: string,
  accessToken: string
): Promise<any> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}`,
    RequestBodyWithAuthHeader('DELETE', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function trackResourceAccess(
  resourceUuid: string,
  action: 'view' | 'download',
  accessToken: string
): Promise<{ status: string; views: number; downloads: number }> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}/track`,
    RequestBodyWithAuthHeader('POST', { action }, null, accessToken)
  )
  return errorHandling(result)
}

export async function getResourceLogs(
  resourceUuid: string,
  accessToken: string
): Promise<{
  resource_uuid: string
  title: string
  views_count: number
  downloads_count: number
  logs: ResourceAccessLog[]
}> {
  const result = await fetch(
    `${getAPIUrl()}resources/items/${resourceUuid}/logs`,
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function uploadResourceFile(
  file: File,
  orgId: number,
  accessToken: string
): Promise<{
  file_url: string
  file_name: string
  file_size: number
  resource_type: string
}> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('org_id', String(orgId))

  const result = await fetch(`${getAPIUrl()}resources/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })
  return errorHandling(result)
}
