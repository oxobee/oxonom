import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@services/config/config'
import { DEFAULT_FALLBACK_ORG } from '@services/organizations/orgs'
import { getFallbackGamesStore, FALLBACK_GAME_CATEGORIES, getFallbackGamePlay } from '@services/games/fallbackData'
import { ACCESS_TOKEN_COOKIE } from '@services/auth/cookies'
import {
  findDemoUser,
  getDemoSession,
  createDemoJwt,
  DEMO_USERS,
} from '@services/auth/demoAuth'
import {
  SYNCED_ORGANIZATIONS,
  SYNCED_ASSIGNMENTS,
  SYNCED_DISCUSSIONS,
  SYNCED_COURSES,
  SYNCED_COURSE_METAS,
  SYNCED_ACTIVITIES,
  SYNCED_PLAYGROUNDS,
  SYNCED_PLAYGROUNDS_MAP,
  SYNCED_BOARDS,
  SYNCED_USERGROUPS,
  SYNCED_PODCASTS,
  SYNCED_EPISODES,
  SYNCED_USERS,
  getSyncedSuperadminOrgs,
  getSyncedSuperadminVisits,
  getSyncedSuperadminUsers,
} from '@services/demo/databaseSync'
import {
  SCHOOL_ORGS,
  DEFAULT_SCHOOL_ALIAS_MAP,
  ALL_CLASSROOMS,
  TEACHER_RAW_LIST,
  DEMO_STUDENT,
  generateClassStudents,
  generateClassroomBoards,
  generateClassroomAssignments,
  validateTcKimlik,
  lookupTcRecord,
  getOrgTeachers,
  generateAssignmentSubmissionsData,
} from '@services/demo/schoolDirectory'
import { DEFAULT_SCHOOL_ASSIGNMENTS } from '@services/school_assignments/school_assignments'
import {
  TURKISH_COMMUNITIES,
  TURKISH_FOLDERS,
  TURKISH_COURSES,
} from '@services/demo/turkishSchoolData'
import { handlePodcastApi } from './podcastHandler'
import { handleCommunityApi } from './communityHandler'
import { handleResourceApi } from './resourceHandler'
import { handleFolderApi } from './folderHandler'

export const maxDuration = 300
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'keep-alive', 'transfer-encoding'])
const SKIP_RESPONSE_HEADERS = new Set(['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'])

const SCHOOL_LIST = [
  {
    ...DEFAULT_FALLBACK_ORG,
    id: 10,
    org_uuid: 'org_necla_gorer_ilkokulu',
    name: 'Necla Görer İlkokulu',
    slug: 'neclagorer',
    logo_image: '/meb_logo.svg',
    description: '1, 2, 3 ve 4. Sınıflar — MEB Temel Eğitim & Akıllı İlkokul Portalı',
    about: 'Necla Görer İlkokulu resmi dijital eğitim kampüsü. 1. sınıftan 4. sınıfa kadar tüm şubeler, sınıf öğretmenleri, akıllı tahtalar ve ödev takip sistemi.',
    grades: '1 - 4. Sınıflar (İlkokul)',
    is_demo: false,
  },
  {
    ...DEFAULT_FALLBACK_ORG,
    id: 20,
    org_uuid: 'org_sfg_ortaokulu',
    name: 'Şair Fevzi Kutlu Kalkancı Ortaokulu',
    slug: 'fevzikalkanci',
    logo_image: '/meb_logo.svg',
    description: '5, 6, 7 ve 8. Sınıflar — LGS Hazırlık & Akıllı Ortaokul Portalı',
    about: 'Şair Fevzi Kutlu Kalkancı Ortaokulu resmi dijital eğitim kampüsü. 5. sınıftan 8. sınıfa kadar branş dersleri, LGS hazırlık denemeleri, akıllı tahtalar ve ödev platformu.',
    grades: '5 - 8. Sınıflar (Ortaokul)',
    is_demo: false,
  },
]

async function handleFallback(request: NextRequest, path: string): Promise<Response> {
  // Instance info
  if (path === '/api/v1/instance/info' || path.startsWith('/api/v1/instance/info')) {
    return NextResponse.json({
      tenancy: 'single',
      default_org_slug: 'neclagorer',
      frontend_domain: 'learnhouze.vercel.app',
      top_domain: 'learnhouze.vercel.app',
      mode: 'saas',
      multi_org_enabled: false,
    }, { status: 200 })
  }

  // Active class resolution from cookie or header (Defaults to 1-A)
  const activeClassCode = request.cookies.get('oxonom_demo_student_active_class')?.value ||
                          request.headers.get('x-active-class') ||
                          '1-A'
  const activeClassItem = ALL_CLASSROOMS.find((c) => c.code === activeClassCode || c.name.startsWith(activeClassCode)) || ALL_CLASSROOMS[0]

  // TC Kimlik No Verification & Lookup Endpoint
  if (path.startsWith('/api/v1/tc/validate') || path.startsWith('/api/v1/tc/lookup')) {
    const tcParam = request.nextUrl.searchParams.get('tc') || ''
    const check = validateTcKimlik(tcParam)
    const record = lookupTcRecord(tcParam)
    return NextResponse.json({
      ...check,
      record: record || null,
    }, { status: 200 })
  }

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

  // Organizations: User Orgs (ALWAYS returns Array for /orgs/user)
  if (path.startsWith('/api/v1/orgs/user')) {
    return NextResponse.json(SCHOOL_LIST, { status: 200 })
  }

  if (path.startsWith('/api/v1/orgs/slug/')) {
    const slug = path.replace('/api/v1/orgs/slug/', '').split('/')[0]
    const matched = SCHOOL_LIST.find((o) => o.slug === slug) ||
                    SCHOOL_ORGS.find((o) => o.slug === slug) ||
                    DEFAULT_SCHOOL_ALIAS_MAP[slug] ||
                    SCHOOL_LIST[0]
    return NextResponse.json(matched, { status: 200 })
  }

  if (path === '/api/v1/orgs' || path === '/api/v1/orgs/' || path.startsWith('/api/v1/orgs/page/')) {
    return NextResponse.json(SCHOOL_LIST, { status: 200 })
  }

  if (path.startsWith('/api/v1/orgs/')) {
    const parts = path.split('/')
    const orgId = parts[parts.indexOf('orgs') + 1] || ''
    if (orgId === 'user') return NextResponse.json(SCHOOL_LIST, { status: 200 })
    const matched = SCHOOL_LIST.find((o) => String(o.id) === orgId || o.slug === orgId || o.org_uuid === orgId) ||
                    SCHOOL_ORGS.find((o) => String(o.id) === orgId || o.slug === orgId || o.org_uuid === orgId) ||
                    SCHOOL_LIST[0]
    return NextResponse.json(matched, { status: 200 })
  }

  // Usergroups (Classrooms)
  if (path.startsWith('/api/v1/usergroups')) {
    // 1. My classes
    if (path.includes('/my-classes')) {
      const authHeader = request.headers.get('authorization') || ''
      const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || ''
      const token = authHeader.replace(/^Bearer\s+/i, '') || cookieToken
      const demoUser = findDemoUser(token)

      if (demoUser?.username === 'ogretmen') {
        const myTeacherCls = ALL_CLASSROOMS.filter((c) => c.teacher_name === 'Özlem ZOR' || c.code === '1-A')
        return NextResponse.json(myTeacherCls.length ? myTeacherCls : [ALL_CLASSROOMS[0]], { status: 200 })
      }
      if (demoUser?.is_superadmin) {
        return NextResponse.json(ALL_CLASSROOMS, { status: 200 })
      }
      // Demo student gets active class
      return NextResponse.json([activeClassItem], { status: 200 })
    }

    // 2. Class students: /api/v1/usergroups/:id/users
    if (path.includes('/users')) {
      const parts = path.split('/')
      const ugIdx = parts.indexOf('usergroups')
      const targetId = Number(parts[ugIdx + 1])
      const cls = ALL_CLASSROOMS.find((c) => c.id === targetId) || activeClassItem
      return NextResponse.json(generateClassStudents(cls), { status: 200 })
    }

    // 3. Class by join code
    if (path.includes('join-by-code')) {
      return NextResponse.json({ success: true, classroom: activeClassItem }, { status: 200 })
    }

    // 4. By Org: /api/v1/usergroups/org/:id
    if (path.includes('/org/')) {
      const parts = path.split('/')
      const orgParam = parts[parts.indexOf('org') + 1] || ''
      const orgNum = Number(orgParam)
      if (orgNum === 10 || orgParam === 'neclagorer') {
        return NextResponse.json(ALL_CLASSROOMS.filter((c) => c.org_id === 10), { status: 200 })
      }
      if (orgNum === 20 || orgParam === 'fevzikalkanci') {
        return NextResponse.json(ALL_CLASSROOMS.filter((c) => c.org_id === 20), { status: 200 })
      }
      return NextResponse.json(ALL_CLASSROOMS, { status: 200 })
    }

    // 5. Single classroom: /api/v1/usergroups/:id
    const parts = path.split('/')
    const ugId = parts[parts.indexOf('usergroups') + 1] || ''
    if (ugId && ugId !== 'org' && !ugId.startsWith('org')) {
      const matched = ALL_CLASSROOMS.find((u) => String(u.id) === ugId || u.code.toLowerCase() === ugId.toLowerCase() || u.usergroup_uuid?.includes(ugId))
      if (matched) return NextResponse.json(matched, { status: 200 })
    }

    return NextResponse.json(ALL_CLASSROOMS, { status: 200 })
  }

  // Teachers List in Dashboard: /api/v1/teachers or /api/v1/users/org/:id/teachers
  if (path.includes('/teachers')) {
    const isMiddle = path.includes('fevzikalkanci') || path.includes('/20/')
    const targetOrgId = isMiddle ? 20 : 10
    return NextResponse.json(getOrgTeachers(targetOrgId), { status: 200 })
  }

  // Students List in Dashboard: /api/v1/students or /api/v1/users/org/:id/students
  if (path.includes('/students')) {
    const classParam = request.nextUrl.searchParams.get('classroom_id') ||
                       request.nextUrl.searchParams.get('class') ||
                       request.nextUrl.searchParams.get('code')
    let targetClass = activeClassItem
    if (classParam) {
      const found = ALL_CLASSROOMS.find((c) => String(c.id) === classParam || c.code.toLowerCase() === classParam.toLowerCase())
      if (found) targetClass = found
    }
    return NextResponse.json(generateClassStudents(targetClass), { status: 200 })
  }

  // Boards
  if (path.startsWith('/api/v1/boards')) {
    if (path.includes('/classroom/')) {
      const parts = path.split('/')
      const classId = Number(parts[parts.indexOf('classroom') + 1])
      const cls = ALL_CLASSROOMS.find((c) => c.id === classId) || activeClassItem
      return NextResponse.json(generateClassroomBoards(cls), { status: 200 })
    }
    const parts = path.split('/')
    const bId = parts[parts.indexOf('boards') + 1] || ''
    if (bId && bId !== 'org' && !bId.startsWith('org')) {
      const allGenBoards = generateClassroomBoards(activeClassItem)
      const matched = allGenBoards.find((b) => b.board_uuid === bId || String(b.id) === bId) ||
                      SYNCED_BOARDS.find((b: any) => b.board_uuid === bId || String(b.id) === bId)
      if (matched) return NextResponse.json(matched, { status: 200 })
    }
    const defaultBoards = generateClassroomBoards(activeClassItem)
    const authHeader = request.headers.get('authorization') || ''
    const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || ''
    const token = authHeader.replace(/^Bearer\s+/i, '') || cookieToken
    const demoUser = findDemoUser(token)
    if (demoUser?.is_superadmin) {
      return NextResponse.json((defaultBoards as any[]).concat(SYNCED_BOARDS.slice(0, 4) as any[]), { status: 200 })
    }
    return NextResponse.json(defaultBoards, { status: 200 })
  }

  // School Assignments & Homework
  if (path.startsWith('/api/v1/school_assignments') || path.startsWith('/api/v1/assignments')) {
    if (path.includes('/submissions') || path.endsWith('/submissions')) {
      const parts = path.split('/')
      const asgUuid = parts[parts.indexOf('submissions') - 1] || 'asg_ritmik_sayma_01'
      const matchedAsg = DEFAULT_SCHOOL_ASSIGNMENTS.find((a) => a.assignment_uuid === asgUuid || String(a.id) === asgUuid) || DEFAULT_SCHOOL_ASSIGNMENTS[0]
      const subData = generateAssignmentSubmissionsData(asgUuid, activeClassItem)
      return NextResponse.json({
        assignment: matchedAsg,
        total_students: subData.total_students,
        submitted_count: subData.submitted_count,
        graded_count: subData.graded_count,
        students: subData.students,
      }, { status: 200 })
    }

    if (path.includes('/grade')) {
      return NextResponse.json({ success: true, message: 'Not ve değerlendirme başarıyla kaydedildi.' }, { status: 200 })
    }

    const classAssignments = generateClassroomAssignments(activeClassItem)
    const parts = path.split('/')
    const asgId = parts[parts.length - 1]
    if (asgId && asgId !== 'school_assignments' && asgId !== 'assignments' && asgId !== 'org') {
      const matched = classAssignments.find((a) => a.assignment_uuid === asgId || String(a.id) === asgId) ||
                      SYNCED_ASSIGNMENTS.find((a: any) => a.assignment_uuid === asgId || String(a.id) === asgId)
      if (matched) return NextResponse.json(matched, { status: 200 })
    }
    return NextResponse.json(classAssignments, { status: 200 })
  }

  // Communities & Discussions (Full in-memory Turkish parent forums)
  if (path.startsWith('/api/v1/communities') || path.startsWith('/api/v1/discussions')) {
    return handleCommunityApi(request, path)
  }

  // Educational Resources & Folders (Full library CRUD)
  if (path.startsWith('/api/v1/resources')) {
    return handleResourceApi(request, path)
  }

  // Folders & Media (Full CRUD)
  if (path.startsWith('/api/v1/folders') || path.startsWith('/api/v1/media')) {
    return handleFolderApi(request, path)
  }

  // Courses
  if (path.includes('/meta') && path.includes('/courses/')) {
    const parts = path.split('/')
    const uuidWithPrefix = parts[parts.indexOf('courses') + 1] || ''
    const cleanUuid = uuidWithPrefix.replace('course_', '').replace('/meta', '')
    const matched = SYNCED_COURSE_METAS[uuidWithPrefix] || SYNCED_COURSE_METAS[cleanUuid] || TURKISH_COURSES[0]
    return NextResponse.json(matched, { status: 200 })
  }
  if (path.startsWith('/api/v1/courses/org_slug/')) {
    return NextResponse.json(TURKISH_COURSES, { status: 200 })
  }
  if (path.startsWith('/api/v1/courses/')) {
    const parts = path.split('/')
    const uuidWithPrefix = parts[parts.indexOf('courses') + 1] || ''
    const cleanUuid = uuidWithPrefix.replace('course_', '')
    const matched = TURKISH_COURSES.find((c) => c.course_uuid === uuidWithPrefix || c.course_uuid?.includes(cleanUuid)) || TURKISH_COURSES[0]
    return NextResponse.json(matched, { status: 200 })
  }

  // Activities
  if (path.startsWith('/api/v1/activities/')) {
    const parts = path.split('/')
    const actId = parts[parts.indexOf('activities') + 1] || ''
    const cleanActId = actId.replace('activity_', '').replace('id/', '')
    const matched = SYNCED_ACTIVITIES[actId] || SYNCED_ACTIVITIES[cleanActId] || Object.values(SYNCED_ACTIVITIES)[0]
    return NextResponse.json(matched, { status: 200 })
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

  // Playgrounds
  if (path.startsWith('/api/v1/playgrounds/')) {
    if (path.includes('/reactions')) {
      if (request.method === 'POST') {
        return NextResponse.json({ action: 'added', emoji: '❤️' }, { status: 200 })
      }
      return NextResponse.json([], { status: 200 })
    }
    const parts = path.split('/')
    const pgId = parts[parts.indexOf('playgrounds') + 1] || ''
    if (pgId && pgId !== 'org' && !pgId.startsWith('org')) {
      const cleanPgId = pgId.replace('playground_', '')
      const matched = SYNCED_PLAYGROUNDS_MAP[pgId] || SYNCED_PLAYGROUNDS_MAP[cleanPgId] || SYNCED_PLAYGROUNDS.find((p: any) => p.playground_uuid?.includes(cleanPgId))
      if (matched) {
        return NextResponse.json(matched, { status: 200 })
      }
    }
    return NextResponse.json(SYNCED_PLAYGROUNDS, { status: 200 })
  }
  if (path === '/api/v1/playgrounds') {
    return NextResponse.json(SYNCED_PLAYGROUNDS, { status: 200 })
  }

  if (path.startsWith('/api/v1/userorganizations') || path.startsWith('/api/v1/users/organizations')) {
    return NextResponse.json(SCHOOL_LIST, { status: 200 })
  }

  // Podcasts
  if (path.startsWith('/api/v1/podcasts')) {
    return handlePodcastApi(request, path)
  }

  // Auth / Login
  if (path.startsWith('/api/v1/users/login') || path.startsWith('/api/v1/auth/login')) {
    const demoUser = DEMO_USERS['idare@oxonom.com']
    const token = createDemoJwt(demoUser)
    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: demoUser,
    }, { status: 200 })
  }

  // Sessions
  if (path.startsWith('/api/v1/users/session') || path.startsWith('/api/v1/users/me')) {
    const authHeader = request.headers.get('authorization') || ''
    const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || ''
    const token = authHeader.replace(/^Bearer\s+/i, '') || cookieToken
    const demoUser = findDemoUser(token) || DEMO_USERS['idare@oxonom.com']
    if (demoUser) {
      return NextResponse.json(getDemoSession(demoUser), { status: 200 })
    }
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
  }

  return NextResponse.json(SCHOOL_LIST[0], { status: 200 })
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

  // Fast-path for TC validation / lookup
  if (path.startsWith('/api/v1/tc/validate') || path.startsWith('/api/v1/tc/lookup')) {
    return handleFallback(request, path)
  }

  // Fast-path for podcasts (Full CRUD handled directly with 0ms latency)
  if (path.startsWith('/api/v1/podcasts')) {
    return handlePodcastApi(request, path)
  }

  // Fast-path for communities & discussions (Full CRUD handled directly with 0ms latency)
  if (path.startsWith('/api/v1/communities') || path.startsWith('/api/v1/discussions')) {
    return handleCommunityApi(request, path)
  }

  // Fast-path for educational resources & folders (Full library CRUD handled directly with 0ms latency)
  if (path.startsWith('/api/v1/resources')) {
    return handleResourceApi(request, path)
  }

  // Fast-path for folders & media (Full library CRUD handled directly with 0ms latency)
  if (path.startsWith('/api/v1/folders') || path.startsWith('/api/v1/media')) {
    return handleFolderApi(request, path)
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

  // Forward request body as-is
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
      // @ts-ignore
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

    if (backendResponse.status >= 400 && request.method === 'GET') {
      return handleFallback(request, path)
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
