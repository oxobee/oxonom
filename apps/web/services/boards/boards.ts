import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
} from '@services/utils/ts/requests'
import { SYNCED_BOARDS } from '@services/demo/databaseSync'
import { ALL_CLASSROOM_BOARDS } from '@services/demo/schoolDirectory'

export async function createBoard(
  orgId: number,
  data: {
    name: string
    description?: string
    thumbnail_image?: string
    usergroup_id?: number
    features?: any
    share_type?: string
    share_code?: string | null
  },
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/?org_id=${orgId}`,
    RequestBodyWithAuthHeader('POST', data, null, access_token)
  )
  return errorHandling(result)
}

export async function getClassroomBoards(usergroupId: number, access_token: string) {
  try {
    const result = await fetch(
      `${getAPIUrl()}boards/classroom/${usergroupId}`,
      RequestBodyWithAuthHeader('GET', null, null, access_token)
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const match = ALL_CLASSROOM_BOARDS.filter((b) => b.usergroup_id === usergroupId)
  return match.length > 0 ? match : ALL_CLASSROOM_BOARDS.slice(0, 4)
}

export async function getBoards(orgId: number, access_token: string) {
  try {
    const result = await fetch(
      `${getAPIUrl()}boards/org/${orgId}`,
      RequestBodyWithAuthHeader('GET', null, null, access_token)
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const schoolBoards = ALL_CLASSROOM_BOARDS.filter((b) => b.org_id === orgId)
  if (schoolBoards.length > 0) {
    return [...schoolBoards, ...SYNCED_BOARDS]
  }
  return [...ALL_CLASSROOM_BOARDS, ...SYNCED_BOARDS]
}

export async function getBoard(boardUuid: string, access_token: string) {
  try {
    const result = await fetch(
      `${getAPIUrl()}boards/${boardUuid}`,
      RequestBodyWithAuthHeader('GET', null, null, access_token)
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const clean = boardUuid.replace('board_', '')
  const b =
    ALL_CLASSROOM_BOARDS.find((x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`) ||
    SYNCED_BOARDS.find((x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`)
  return b || ALL_CLASSROOM_BOARDS[0] || SYNCED_BOARDS[0]
}

export async function updateBoard(
  boardUuid: string,
  data: {
    name?: string
    description?: string
    thumbnail_image?: string
    public?: boolean
    features?: any
    share_type?: string
    share_code?: string | null
  },
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}`,
    RequestBodyWithAuthHeader('PUT', data, null, access_token)
  )
  return errorHandling(result)
}

export async function duplicateBoard(boardUuid: string, access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/duplicate`,
    RequestBodyWithAuthHeader('POST', null, null, access_token)
  )
  return errorHandling(result)
}

export async function deleteBoard(boardUuid: string, access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  return errorHandling(result)
}

export async function addBoardMember(
  boardUuid: string,
  data: { user_id: number; role?: string },
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members`,
    RequestBodyWithAuthHeader('POST', data, null, access_token)
  )
  return errorHandling(result)
}

export async function addBoardMembersBatch(
  boardUuid: string,
  members: { user_id: number; role: string }[],
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members/batch`,
    RequestBodyWithAuthHeader('POST', { members }, null, access_token)
  )
  return errorHandling(result)
}

export async function removeBoardMember(
  boardUuid: string,
  userId: number,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members/${userId}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  return errorHandling(result)
}

export async function getBoardMembers(
  boardUuid: string,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return errorHandling(result)
}

export async function updateBoardThumbnail(
  boardUuid: string,
  file: File,
  access_token: string
) {
  const formData = new FormData()
  formData.append('thumbnail', file)
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/thumbnail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    }
  )
  return errorHandling(result)
}

export async function getBoardPublicInfo(boardUuid: string) {
  const cleanUuid = boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`
  try {
    const result = await fetch(`${getAPIUrl()}boards/${cleanUuid}/public-info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const clean = boardUuid.replace('board_', '')
  const b =
    ALL_CLASSROOM_BOARDS.find((x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`) ||
    SYNCED_BOARDS.find((x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`)

  return {
    board_uuid: boardUuid,
    name: b?.name || 'Akıllı Tahta',
    description: b?.description || '',
    public: true,
    share_type: 'public',
    has_code: false,
    share_code: null,
  }
}

export async function getBoardByShortCode(shortCode: string) {
  try {
    const result = await fetch(`${getAPIUrl()}boards/by-short/${shortCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const b = SYNCED_BOARDS.find((x: any) => x.short_code === shortCode)
  return b || null
}

export async function updateBoardShareSettings(
  boardUuid: string,
  shareType: 'public' | 'code',
  shareCode: string | null,
  access_token: string
) {
  const cleanUuid = boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`
  const result = await fetch(
    `${getAPIUrl()}boards/${cleanUuid}/share-settings`,
    RequestBodyWithAuthHeader(
      'PUT',
      JSON.stringify({
        share_type: shareType,
        share_code: shareCode,
      }),
      'application/json',
      access_token
    )
  )
  return errorHandling(result)
}

export async function getBoardGuestAccess(boardUuid: string, code?: string) {
  const cleanUuid = boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`
  try {
    const result = await fetch(`${getAPIUrl()}boards/${cleanUuid}/guest-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code || null }),
    })
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  return {
    access_token: 'demo_guest_token_' + Date.now(),
    username: 'Misafir Katılımcı',
    role: 'guest',
  }
}
