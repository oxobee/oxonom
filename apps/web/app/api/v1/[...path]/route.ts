import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@services/config/config'
import { DEFAULT_FALLBACK_ORG } from '@services/organizations/orgs'
import { getFallbackGamesStore, FALLBACK_GAME_CATEGORIES, getFallbackGamePlay } from '@services/games/fallbackData'
import { ACCESS_TOKEN_COOKIE } from '@services/auth/cookies'
import {
  findDemoUser,
  getDemoSession,
  FALLBACK_PLAYGROUNDS,
  FALLBACK_BOARDS,
  FALLBACK_USERGROUPS,
} from '@services/auth/demoAuth'
import {
  SYNCED_ORGANIZATIONS,
  SYNCED_ASSIGNMENTS,
  SYNCED_DISCUSSIONS,
  getSyncedSuperadminOrgs,
  getSyncedSuperadminVisits,
  getSyncedSuperadminUsers,
} from '@services/demo/databaseSync'

export const maxDuration = 300
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'keep-alive', 'transfer-encoding'])
const SKIP_RESPONSE_HEADERS = new Set(['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'])

async function handleFallback(request: NextRequest, path: string): Promise<Response> {
  // Superadmin Visits
  if (path.startsWith('/api/v1/ee/superadmin/organizations/visits')) {
    return NextResponse.json(getSyncedSuperadminVisits(), { status: 200 })
  }

  // Superadmin Organizations
  if (path.startsWith('/api/v1/ee/superadmin/organizations')) {
    const page = Number(request.nextUrl.searchParams.get('page')) || 1
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 20
    const searchParam = request.nextUrl.searchParams.get('search') || ''
    const planParam = request.nextUrl.searchParams.get('plan') || ''
    return NextResponse.json(getSyncedSuperadminOrgs(page, limit, searchParam, planParam), { status: 200 })
  }

  // Superadmin Users
  if (path.startsWith('/api/v1/ee/superadmin/users')) {
    const page = Number(request.nextUrl.searchParams.get('page')) || 1
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 20
    const searchParam = request.nextUrl.searchParams.get('search') || ''
    const superadminParam = request.nextUrl.searchParams.get('superadmin') || ''
    return NextResponse.json(getSyncedSuperadminUsers(page, limit, searchParam, superadminParam), { status: 200 })
  }

  // Superadmin Plans & Status
  if (path.startsWith('/api/v1/ee/superadmin/plans')) {
    return NextResponse.json({ plans: ['free', 'standard', 'pro', 'enterprise'] }, { status: 200 })
  }
  if (path.startsWith('/api/v1/ee/superadmin/status')) {
    return NextResponse.json({ is_superadmin: true }, { status: 200 })
  }
  if (path.startsWith('/api/v1/monitoring/feedbacks')) {
    return NextResponse.json([], { status: 200 })
  }

  // Organizations
  if (path.startsWith('/api/v1/orgs/slug/')) {
    const slug = path.replace('/api/v1/orgs/slug/', '').split('/')[0]
    const matched = SYNCED_ORGANIZATIONS.find((o: any) => o.slug === slug)
    return NextResponse.json(matched || DEFAULT_FALLBACK_ORG, { status: 200 })
  }

  // Games
  if (path.startsWith('/api/v1/games/org/')) {
    const parts = path.split('/')
    const orgSlug = parts[parts.indexOf('org') + 1] || 'default'
    const catParam = request.nextUrl.searchParams.get('category_slug') || undefined
    return NextResponse.json(getFallbackGamesStore(orgSlug, catParam), { status: 200 })
  }
  if (path.startsWith('/api/v1/games/categories')) {
    return NextResponse.json(FALLBACK_GAME_CATEGORIES, { status: 200 })
  }
  if (path.endsWith('/play') || path.includes('/play/')) {
    const parts = path.split('/')
    const uuidIndex = parts.indexOf('games') + 1
    const uuid = parts[uuidIndex] || ''
    return NextResponse.json(getFallbackGamePlay(uuid), { status: 200 })
  }

  // Playgrounds, Boards, Usergroups
  if (path.startsWith('/api/v1/playgrounds')) {
    return NextResponse.json(FALLBACK_PLAYGROUNDS, { status: 200 })
  }
  if (path.startsWith('/api/v1/boards')) {
    return NextResponse.json(FALLBACK_BOARDS, { status: 200 })
  }
  if (path.startsWith('/api/v1/usergroups')) {
    return NextResponse.json(FALLBACK_USERGROUPS, { status: 200 })
  }

  // School Assignments & Discussions
  if (path.startsWith('/api/v1/school_assignments') || path.startsWith('/api/v1/assignments')) {
    return NextResponse.json(SYNCED_ASSIGNMENTS, { status: 200 })
  }
  if (path.startsWith('/api/v1/discussions')) {
    return NextResponse.json(SYNCED_DISCUSSIONS, { status: 200 })
  }
  if (path.startsWith('/api/v1/userorganizations') || path.startsWith('/api/v1/users/organizations')) {
    return NextResponse.json(SYNCED_ORGANIZATIONS, { status: 200 })
  }

  // Sessions
  if (path.startsWith('/api/v1/users/session') || path.startsWith('/api/v1/users/me')) {
    const authHeader = request.headers.get('authorization') || ''
    const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || ''
    const token = authHeader.replace(/^Bearer\s+/i, '') || cookieToken
    const demoUser = findDemoUser(token)
    if (demoUser) {
      return NextResponse.json(getDemoSession(demoUser), { status: 200 })
    }
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
  }

  return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
}

async function proxyToBackend(request: NextRequest): Promise<Response> {
  const path = request.nextUrl.pathname
  const search = request.nextUrl.search
  const backendBase = getBackendUrl().replace(/\/+$/, '')
  const backendUrl = `${backendBase}${path}${search}`

  // Fast-path for demo user session check (0ms response)
  if (path.startsWith('/api/v1/users/session') || path.startsWith('/api/v1/users/me')) {
    const authHeader = request.headers.get('authorization') || ''
    const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || ''
    const token = authHeader.replace(/^Bearer\s+/i, '') || cookieToken
    const demoUser = findDemoUser(token)
    if (demoUser) {
      return NextResponse.json(getDemoSession(demoUser), { status: 200 })
    }
  }

  // On Vercel / serverless when no remote backend URL is provided (defaults to localhost),
  // immediately serve synced database responses with 0ms latency.
  const isVercelServerless = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV)
  const isLocalBackend = backendBase.startsWith('http://localhost') || backendBase.startsWith('http://127.0.0.1')
  if (isVercelServerless && isLocalBackend) {
    return handleFallback(request, path)
  }

  // Forward all request headers except hop-by-hop ones
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!SKIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  // Forward request body as-is (no parsing/re-serializing)
  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? request.body
    : undefined

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 290_000)

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
      // @ts-ignore — needed for streaming request bodies in Node.js
      duplex: 'half',
      signal: controller.signal,
    } as RequestInit)
    clearTimeout(timeoutId)

    const wasCompressed = backendResponse.headers.has('content-encoding')
    const responseHeaders = new Headers()
    backendResponse.headers.forEach((value, key) => {
      const lkey = key.toLowerCase()
      if (SKIP_RESPONSE_HEADERS.has(lkey)) return
      if (lkey === 'content-length' && wasCompressed) return
      if (lkey === 'set-cookie') return
      responseHeaders.append(key, value)
    })
    for (const cookie of backendResponse.headers.getSetCookie?.() ?? []) {
      responseHeaders.append('set-cookie', cookie)
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
    }
    console.error(`Failed to proxy ${backendUrl}:`, error.message || error)

    return handleFallback(request, path)
  }
}

export async function GET(request: NextRequest) {
  return proxyToBackend(request)
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request)
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request)
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request)
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request)
}
