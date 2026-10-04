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
  SYNCED_GAMES,
  getSyncedSuperadminOrgs,
  getSyncedSuperadminVisits,
  getSyncedSuperadminUsers,
} from '@services/demo/databaseSync'

let ADMIN_GAMES_STORE: any[] = [...SYNCED_GAMES]
let ORG_MENU_CONFIGS: Record<string, any> = {}
let SERVER_FALLBACK_BOARDS: any[] = []
let SERVER_CUSTOM_ASSIGNMENTS: any[] = []
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
  if (path.startsWith('/api/v1/tc/validate') || path.startsWith('/api/v1/tc/lookup') || path.startsWith('/api/v1/tc/mernis-sync')) {
    const tcParam = request.nextUrl.searchParams.get('tc') || ''
    const check = validateTcKimlik(tcParam)
    const record = lookupTcRecord(tcParam)
    return NextResponse.json({
      ...check,
      record: record ? {
        ...record,
        last_mernis_sync: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      } : null,
    }, { status: 200 })
  }

  // Superadmin Visits
  if (path.startsWith('/api/v1/ee/superadmin/organizations/visits')) {
    return NextResponse.json(getSyncedSuperadminVisits(), { status: 200 })
  }

  // Superadmin Global Analytics
  if (path.startsWith('/api/v1/ee/superadmin/analytics/global')) {
    return NextResponse.json({
      genel_aktivite_ozeti: {
        data: [
          {
            toplam_ziyaretci: 12450,
            aktif_ogrenci: 1820,
            aktif_ogretmen: 142,
            tamamlanan_dersler: 3640,
          },
        ],
      },
      akilli_tahta_ve_panolar: {
        data: [
          {
            olusturulan_panolar: 89,
            cizim_ve_notlar: 1450,
            etkilesimli_modul_kullanimi: 620,
          },
        ],
      },
      egitici_oyunlar: {
        data: [
          {
            oynanan_oyun_sayisi: 5420,
            ortalama_oyun_puani: 4.8,
            en_populer_oyun: 'Uzay Roketi Matematik Görevi',
          },
        ],
      },
      odev_ve_degerlendirme: {
        data: [
          {
            verilen_odevler: 38,
            ogrenci_teslimleri: 920,
            teslim_orani: '%94',
          },
        ],
      },
      veli_ve_topluluk: {
        data: [
          {
            topluluk_gruplari: 8,
            veli_forum_mesajlari: 430,
            podcast_dinleme_sayisi: 1150,
          },
        ],
      },
    }, { status: 200 })
  }

  // Superadmin Org Analytics
  if (path.includes('/ee/superadmin/organizations') && path.includes('/analytics')) {
    return NextResponse.json({
      data: [
        { date: '2026-09-28', views: 150 },
        { date: '2026-09-29', views: 240 },
        { date: '2026-09-30', views: 320 },
        { date: '2026-10-01', views: 390 },
        { date: '2026-10-02', views: 410 },
        { date: '2026-10-03', views: 360 },
      ],
      views_today: 360,
      total_views: 1870,
    }, { status: 200 })
  }

  // Superadmin Organization Detail by ID
  if (path.match(/\/api\/v1\/ee\/superadmin\/organizations\/\d+/)) {
    const parts = path.split('/')
    const orgId = Number(parts[parts.indexOf('organizations') + 1])
    const found: any = SYNCED_ORGANIZATIONS.find((o: any) => o.id === orgId) || SYNCED_ORGANIZATIONS[0]
    return NextResponse.json({
      ...found,
      user_count: found?.user_count ?? (found?.slug === 'neclagorer' ? 48 : 24),
      course_count: found?.course_count ?? (found?.slug === 'neclagorer' ? 14 : 8),
      plan: found?.plan || 'pro',
      active: true,
      custom_domains: [],
      admin_users: [
        {
          username: 'idare',
          email: 'idare@oxonom.com',
          avatar_image: null,
          user_uuid: 'usr_admin_1',
        },
      ],
    }, { status: 200 })
  }

  // Superadmin Organizations List
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

  // Superadmin Plans
  if (path.startsWith('/api/v1/ee/superadmin/plans')) {
    if (request.method === 'PUT') {
      return NextResponse.json({ success: true, message: 'Paket özellikleri başarıyla kaydedildi' }, { status: 200 })
    }
    const fullPlans = [
      {
        id: 'free',
        name: 'Ücretsiz Deneme',
        description: 'Temel özelliklerle platformu deneyimlemek isteyen okullar ve bireysel öğretmenler için.',
        price_monthly: 0,
        price_yearly: 0,
        courses_limit: 5,
        members_limit: 100,
        admin_limit: 2,
        ai_credits: 50,
        features: {
          ai: true,
          analytics: false,
          api: false,
          boards: true,
          collaboration: true,
          folders: true,
          communities: true,
          payments: false,
          podcasts: true,
          playgrounds: true,
        },
      },
      {
        id: 'standard',
        name: 'Standart Okul',
        description: 'Küçük ve orta ölçekli okullar, etüt merkezleri ve kolejler için tam donanımlı eğitim paketi.',
        price_monthly: 1490,
        price_yearly: 14900,
        courses_limit: 25,
        members_limit: 500,
        admin_limit: 5,
        ai_credits: 250,
        features: {
          ai: true,
          analytics: true,
          api: false,
          boards: true,
          collaboration: true,
          folders: true,
          communities: true,
          payments: true,
          podcasts: true,
          playgrounds: true,
        },
      },
      {
        id: 'pro',
        name: 'Pro Kampüs',
        description: 'Gelişmiş analitikler, sınırsız ders ve geniş öğrenci kotaları ile kapsamlı okul paketi.',
        price_monthly: 2990,
        price_yearly: 29900,
        courses_limit: 100,
        members_limit: 2500,
        admin_limit: 15,
        ai_credits: 1000,
        features: {
          ai: true,
          analytics: true,
          api: true,
          boards: true,
          collaboration: true,
          folders: true,
          communities: true,
          payments: true,
          podcasts: true,
          playgrounds: true,
        },
      },
      {
        id: 'enterprise',
        name: 'Kurumsal & MEB',
        description: 'İl/ilçe milli eğitim müdürlükleri, çoklu kampüslü özel okullar ve kolej zincirleri için özel çözüm.',
        price_monthly: 5990,
        price_yearly: 59900,
        courses_limit: 9999,
        members_limit: 99999,
        admin_limit: 999,
        ai_credits: 5000,
        features: {
          ai: true,
          analytics: true,
          api: true,
          boards: true,
          collaboration: true,
          folders: true,
          communities: true,
          payments: true,
          podcasts: true,
          playgrounds: true,
        },
      },
    ]
    return NextResponse.json({ plans: fullPlans }, { status: 200 })
  }

  // Superadmin System AI Settings
  if (path.startsWith('/api/v1/ee/superadmin/system/ai')) {
    if (request.method === 'PUT' || request.method === 'POST') {
      return NextResponse.json({ success: true, message: 'Yapay zeka ayarları kaydedildi' }, { status: 200 })
    }
    return NextResponse.json({
      is_ai_enabled: true,
      is_copilot_enabled: true,
      provider: 'openrouter',
      api_key_masked: 'sk-or-v1-••••••••••••••••••••••••••••••••••••••••••••••••',
      base_url: 'https://openrouter.ai/api/v1',
      model_fast: 'google/gemini-2.0-flash-001',
      model_standard: 'google/gemini-2.0-flash-001',
      model_pro: 'anthropic/claude-3.5-sonnet',
    }, { status: 200 })
  }

  // Superadmin System Branding Settings
  if (path.startsWith('/api/v1/ee/superadmin/system/branding')) {
    if (request.method === 'PUT' || request.method === 'POST') {
      return NextResponse.json({ success: true, message: 'Marka ayarları kaydedildi' }, { status: 200 })
    }
    return NextResponse.json({
      site_name: 'Oxonom Edu',
      site_logo: '/lrn-dash.svg',
      footer_text: '© 2026 Oxonom Education Technologies. Tüm hakları saklıdır.',
      footer_link_text: 'Oxonom',
      footer_link_url: 'https://learnhouze.vercel.app',
    }, { status: 200 })
  }

  // Superadmin Tokens
  if (path.startsWith('/api/v1/ee/superadmin/tokens')) {
    return NextResponse.json([], { status: 200 })
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
    if (request.method === 'POST') {
      let body: any = {}
      try {
        body = await request.clone().json()
      } catch {}
      const uniqueId = Date.now()
      const boardUuid = `board_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`
      const orgIdParam = Number(request.nextUrl.searchParams.get('org_id')) || 1
      const newBoard = {
        id: uniqueId,
        board_uuid: boardUuid,
        org_id: orgIdParam,
        usergroup_id: body.usergroup_id || null,
        name: body.name || 'Yeni Akıllı Tahta',
        description: body.description || '',
        thumbnail_image: body.thumbnail_image || null,
        slug: (body.name || 'tahta').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        published: true,
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        is_owner: true,
        is_member: true,
        member_count: 1,
        share_type: body.share_type || 'public',
        share_code: body.share_code || null,
        features: body.features || {
          effects_enabled: true,
          chat_enabled: true,
          reactions_enabled: true,
        },
        creator: {
          username: 'Öğretmen',
          avatar_image: null,
        },
      }
      SERVER_FALLBACK_BOARDS.unshift(newBoard)
      return NextResponse.json(newBoard, { status: 201 })
    }

    if (request.method === 'DELETE') {
      const parts = path.split('/')
      const bId = parts[parts.indexOf('boards') + 1] || ''
      const clean = bId.replace('board_', '')
      SERVER_FALLBACK_BOARDS = SERVER_FALLBACK_BOARDS.filter(
        (b) => b.board_uuid !== bId && b.board_uuid !== `board_${clean}` && String(b.id) !== bId
      )
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (path.includes('/classroom/')) {
      const parts = path.split('/')
      const classId = Number(parts[parts.indexOf('classroom') + 1])
      const cls = ALL_CLASSROOMS.find((c) => c.id === classId) || activeClassItem
      const classCustom = SERVER_FALLBACK_BOARDS.filter(
        (b) => !b.usergroup_id || Number(b.usergroup_id) === classId
      )
      const baseClassBoards = generateClassroomBoards(cls)
      return NextResponse.json([...classCustom, ...baseClassBoards], { status: 200 })
    }

    const parts = path.split('/')
    const bId = parts[parts.indexOf('boards') + 1] || ''
    if (bId && bId !== 'org' && !bId.startsWith('org')) {
      const clean = bId.replace('board_', '')
      const foundInServer = SERVER_FALLBACK_BOARDS.find(
        (b) => b.board_uuid === bId || b.board_uuid === `board_${clean}` || String(b.id) === bId
      )
      if (foundInServer) {
        if (path.includes('/public-info')) {
          return NextResponse.json({
            board_uuid: foundInServer.board_uuid,
            name: foundInServer.name,
            description: foundInServer.description,
            public: true,
            share_type: foundInServer.share_type || 'public',
            has_code: Boolean(foundInServer.share_code),
            share_code: foundInServer.share_code || null,
          }, { status: 200 })
        }
        return NextResponse.json(foundInServer, { status: 200 })
      }

      const allGenBoards = generateClassroomBoards(activeClassItem)
      const matched = allGenBoards.find((b) => b.board_uuid === bId || b.board_uuid === `board_${clean}` || String(b.id) === bId) ||
                      SYNCED_BOARDS.find((b: any) => b.board_uuid === bId || b.board_uuid === `board_${clean}` || String(b.id) === bId)
      if (matched) {
        if (path.includes('/public-info')) {
          return NextResponse.json({
            board_uuid: (matched as any).board_uuid,
            name: (matched as any).name,
            description: (matched as any).description,
            public: true,
            share_type: (matched as any).share_type || 'public',
            has_code: false,
            share_code: null,
          }, { status: 200 })
        }
        return NextResponse.json(matched, { status: 200 })
      }
    }

    const defaultBoards = [...SERVER_FALLBACK_BOARDS, ...generateClassroomBoards(activeClassItem)]
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
    // 1. POST - Create new assignment
    if (request.method === 'POST' && (path.includes('/org/') || path.endsWith('/school_assignments') || path.endsWith('/assignments'))) {
      const body = await request.json().catch(() => ({}))
      const uniqueId = Date.now()
      const asgUuid = `sch_asg_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`

      let boardUuid = body.board_uuid
      if (body.tool_type === 'WHITEBOARD' && (body.create_new_board || !boardUuid)) {
        const boardUniqueId = Date.now() + 1
        boardUuid = `board_${boardUniqueId}_${Math.random().toString(36).substring(2, 7)}`
        const newBoard = {
          id: boardUniqueId,
          board_uuid: boardUuid,
          org_id: body.org_id || 1,
          usergroup_id: body.usergroup_ids?.[0] || null,
          name: body.new_board_name || `${body.title || 'Yeni'} — Ödev Tahtası`,
          description: body.description || 'Ödev için hazırlanan akıllı tahta.',
          thumbnail_image: null,
          slug: (body.title || 'odev').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          published: true,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
          is_owner: true,
          is_member: true,
          member_count: 1,
          share_type: 'public',
          share_code: null,
          features: {
            effects_enabled: true,
            chat_enabled: true,
            reactions_enabled: true,
          },
          creator: {
            username: 'Öğretmen',
            avatar_image: null,
          },
        }
        SERVER_FALLBACK_BOARDS.unshift(newBoard)
      }

      const newAssignment = {
        id: uniqueId,
        assignment_uuid: asgUuid,
        title: body.title || 'Yeni Ödev',
        description: body.description || '',
        grade_level: body.grade_level || '1. Sınıf',
        grade_category: body.grade_category || 'İlkokul (1-4)',
        subject: body.subject || 'Genel',
        tool_type: body.tool_type || 'WHITEBOARD',
        tool_data: body.tool_data || {},
        board_uuid: boardUuid,
        usergroup_ids: body.usergroup_ids || [],
        classes: (body.usergroup_ids || []).map((id: number) => {
          const matchedClass = ALL_CLASSROOMS.find((c) => c.id === id)
          return matchedClass ? { id: matchedClass.id, name: matchedClass.name, code: matchedClass.code } : { id, name: `${id}. Sınıf` }
        }),
        due_date: body.due_date || undefined,
        max_score: Number(body.max_score) || 100,
        published: body.published ?? true,
        teacher_name: 'Öğretmen',
        creation_date: new Date().toISOString(),
        total_submissions: 0,
        graded_submissions: 0,
        average_score: null,
        submission: {
          id: null,
          status: 'PENDING',
        },
      }

      SERVER_CUSTOM_ASSIGNMENTS.unshift(newAssignment)
      return NextResponse.json(newAssignment, { status: 201 })
    }

    // 2. Submissions review
    if (path.includes('/submissions') || path.endsWith('/submissions')) {
      const parts = path.split('/')
      const asgUuid = parts[parts.indexOf('submissions') - 1] || 'asg_ritmik_sayma_01'
      const matchedAsg = SERVER_CUSTOM_ASSIGNMENTS.find((a) => a.assignment_uuid === asgUuid || String(a.id) === asgUuid) ||
                         DEFAULT_SCHOOL_ASSIGNMENTS.find((a) => a.assignment_uuid === asgUuid || String(a.id) === asgUuid) ||
                         DEFAULT_SCHOOL_ASSIGNMENTS[0]
      const subData = generateAssignmentSubmissionsData(asgUuid, activeClassItem, matchedAsg?.due_date)
      return NextResponse.json({
        assignment: matchedAsg,
        total_students: subData.total_students,
        submitted_count: subData.submitted_count,
        graded_count: subData.graded_count,
        students: subData.students,
      }, { status: 200 })
    }

    // 3. Submissions grade
    if (path.includes('/grade')) {
      return NextResponse.json({ success: true, message: 'Not ve değerlendirme başarıyla kaydedildi.' }, { status: 200 })
    }

    // 4. Student assignments list
    if (path.includes('/student/my_assignments')) {
      const classAssignments = generateClassroomAssignments(activeClassItem)
      return NextResponse.json([...SERVER_CUSTOM_ASSIGNMENTS, ...classAssignments], { status: 200 })
    }

    // 5. Single assignment detail or full list
    const classAssignments = generateClassroomAssignments(activeClassItem)
    const allAssignments = [...SERVER_CUSTOM_ASSIGNMENTS, ...classAssignments]
    const parts = path.split('/')
    const asgId = parts[parts.length - 1]
    if (asgId && asgId !== 'school_assignments' && asgId !== 'assignments' && asgId !== 'org') {
      const matched = allAssignments.find((a) => a.assignment_uuid === asgId || String(a.id) === asgId) ||
                      SYNCED_ASSIGNMENTS.find((a: any) => a.assignment_uuid === asgId || String(a.id) === asgId)
      if (matched) return NextResponse.json(matched, { status: 200 })
    }
    return NextResponse.json(allAssignments, { status: 200 })
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

  // Games Superadmin CRUD
  if (path.startsWith('/api/v1/games/admin/all')) {
    const catId = request.nextUrl.searchParams.get('category_id')
    const status = request.nextUrl.searchParams.get('status')
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase() || ''
    let list = [...ADMIN_GAMES_STORE]
    if (catId) list = list.filter((g: any) => g.category_id === Number(catId))
    if (status && status !== 'all') list = list.filter((g: any) => g.status === status)
    if (search) list = list.filter((g: any) => g.title?.toLowerCase().includes(search) || g.description?.toLowerCase().includes(search))
    return NextResponse.json(list, { status: 200 })
  }
  if (path.startsWith('/api/v1/games/admin/schools')) {
    const list = SCHOOL_LIST.map((s) => ({ id: s.id, name: s.name, slug: s.slug }))
    return NextResponse.json(list, { status: 200 })
  }
  if (path.startsWith('/api/v1/games/admin/reviews')) {
    return NextResponse.json([], { status: 200 })
  }
  if (path.startsWith('/api/v1/games/admin/create')) {
    try {
      const body = await request.json()
      const newGame = {
        id: Date.now(),
        game_uuid: `game_${Date.now()}`,
        title: body.title || 'Yeni Eğitici Oyun',
        description: body.description || '',
        status: body.status || 'published',
        category_id: body.category_id || 1,
        thumbnail_image: body.thumbnail_image || null,
        grade_levels: body.grade_levels || ['1. Sınıf', '2. Sınıf'],
        age_range: body.age_range || '7-12 Yaş',
        learning_objectives: body.learning_objectives || '',
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        ...body,
      }
      ADMIN_GAMES_STORE.unshift(newGame)
      return NextResponse.json(newGame, { status: 200 })
    } catch {
      const fallbackGame = {
        id: Date.now(),
        game_uuid: `game_${Date.now()}`,
        title: 'Yeni Eğitici Oyun',
        status: 'published',
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
      }
      ADMIN_GAMES_STORE.unshift(fallbackGame)
      return NextResponse.json(fallbackGame, { status: 200 })
    }
  }
  if (path.startsWith('/api/v1/games/admin/')) {
    const uuid = path.split('/api/v1/games/admin/')[1]?.split('/')[0]?.split('?')[0]
    if (request.method === 'DELETE') {
      ADMIN_GAMES_STORE = ADMIN_GAMES_STORE.filter(
        (g: any) => g.game_uuid !== uuid && String(g.id) !== uuid
      )
      return NextResponse.json({ success: true, message: 'Oyun başarıyla silindi' }, { status: 200 })
    }
    if (request.method === 'PUT') {
      try {
        const body = await request.json()
        const idx = ADMIN_GAMES_STORE.findIndex(
          (g: any) => g.game_uuid === uuid || String(g.id) === uuid
        )
        if (idx !== -1) {
          ADMIN_GAMES_STORE[idx] = {
            ...ADMIN_GAMES_STORE[idx],
            ...body,
            update_date: new Date().toISOString(),
          }
          return NextResponse.json(ADMIN_GAMES_STORE[idx], { status: 200 })
        }
        return NextResponse.json({ success: true, ...body }, { status: 200 })
      } catch {
        return NextResponse.json({ success: true, message: 'Oyun güncellendi' }, { status: 200 })
      }
    }
    return NextResponse.json({ success: true }, { status: 200 })
  }

  // Organization Menu Config
  if (path.includes('/config/menu')) {
    const parts = path.split('/')
    const orgId = parts[parts.indexOf('orgs') + 1] || 'default'
    if (request.method === 'PUT') {
      try {
        const body = await request.json()
        ORG_MENU_CONFIGS[orgId] = body
        return NextResponse.json({ success: true, ...body }, { status: 200 })
      } catch {
        return NextResponse.json({ success: true }, { status: 200 })
      }
    }
    return NextResponse.json(ORG_MENU_CONFIGS[orgId] || { items: [] }, { status: 200 })
  }

  // Organization Usage & Plan limits
  if (path.includes('/usage')) {
    return NextResponse.json({
      mode: 'saas',
      plan: 'pro',
      features: {
        courses: { usage: 14, limit: 50, remaining: 36 },
        members: { usage: 48, limit: 500, remaining: 452, plan_limit: 500, purchased: 0 },
        admin_seats: { usage: 4, limit: 15, remaining: 11 },
      },
    }, { status: 200 })
  }

  // Organization Packs
  if (path.includes('/packs')) {
    return NextResponse.json({
      active_packs: [],
      available_packs: [
        { id: 1, pack_id: 'ai_credits_10k', label: '10.000 AI Kredisi', quantity: 10000, price: 199 },
        { id: 2, pack_id: 'extra_members_100', label: '100 Ek Kullanıcı Kotası', quantity: 100, price: 299 },
      ],
    }, { status: 200 })
  }

  // Organization AI Credits
  if (path.includes('/ai-credits')) {
    return NextResponse.json({
      plan: 'pro',
      base_credits: 5000,
      purchased_credits: 0,
      total_credits: 5000,
      used_credits: 420,
      remaining_credits: 4580,
      mode: 'enabled',
    }, { status: 200 })
  }

  // Games Public
  if (path.startsWith('/api/v1/games/org/')) {
    const parts = path.split('/')
    const orgSlug = parts[parts.indexOf('org') + 1] || 'default'
    const catParam = request.nextUrl.searchParams.get('category_slug') || undefined
    return NextResponse.json(getFallbackGamesStore(orgSlug, catParam), { status: 200 })
  }
  if (path.startsWith('/api/v1/games/categories')) {
    if (request.method === 'POST') {
      return NextResponse.json({ id: Date.now(), name: 'Yeni Kategori', icon: '🎮' }, { status: 200 })
    }
    if (request.method === 'DELETE') {
      return NextResponse.json({ success: true }, { status: 200 })
    }
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

  // Fast-path for Superadmin & Games Admin (Full superadmin control with 0ms latency)
  if (
    path.startsWith('/api/v1/ee/superadmin') ||
    path.startsWith('/api/v1/games/admin') ||
    path.startsWith('/api/v1/monitoring/feedbacks') ||
    path.includes('/usage') ||
    path.includes('/packs') ||
    path.includes('/ai-credits') ||
    path.includes('/config/menu')
  ) {
    return handleFallback(request, path)
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

    if (backendResponse.status >= 400) {
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
