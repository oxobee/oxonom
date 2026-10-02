import { DEFAULT_FALLBACK_ORG } from '@services/organizations/orgs'

export interface DemoUser {
  id: number
  user_uuid: string
  username: string
  email: string
  first_name: string
  last_name: string
  email_verified: boolean
  is_superadmin: boolean
  is_demo: boolean
  avatar_image: string
  role: {
    id: number
    role_uuid: string
    name: string
    rights: Record<string, any>
  }
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'idare@oxonom.com': {
    id: 50,
    user_uuid: 'user_64e03f9b-6734-414a-9775-f87f52dae15d',
    username: 'idare',
    email: 'idare@oxonom.com',
    first_name: 'Okul',
    last_name: 'Müdürü',
    email_verified: true,
    is_superadmin: true,
    is_demo: true,
    avatar_image: '',
    role: {
      id: 1,
      role_uuid: 'role_admin',
      name: 'Admin',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: true, action_delete_own: true },
        users: { action_create: true, action_read: true, action_update: true, action_delete: true },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: true },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: true, action_read: true, action_update: true, action_delete: true },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: true, action_read: true, action_update: true, action_delete: true },
        dashboard: { action_access: true },
      },
    },
  },
  'ogretmen@oxonom.com': {
    id: 2,
    user_uuid: 'user_6f129354-53fb-40c0-be52-0cc8dc07cce1',
    username: 'ogretmen',
    email: 'ogretmen@oxonom.com',
    first_name: 'Ahmet',
    last_name: 'Öğretmen',
    email_verified: true,
    is_superadmin: false,
    is_demo: true,
    avatar_image: '',
    role: {
      id: 3,
      role_uuid: 'role_teacher',
      name: 'Teacher',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: false, action_delete_own: true },
        users: { action_create: false, action_read: true, action_update: false, action_delete: false },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: false },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: false, action_read: true, action_update: false, action_delete: false },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: false, action_read: true, action_update: false, action_delete: false },
        dashboard: { action_access: true },
      },
    },
  },
  'ogrenci@oxonom.com': {
    id: 51,
    user_uuid: 'user_28721dd2-df5b-4c84-8f2d-6ad97e3e6cbb',
    username: 'ogrenci',
    email: 'ogrenci@oxonom.com',
    first_name: 'Ali',
    last_name: 'Öğrenci',
    email_verified: true,
    is_superadmin: false,
    is_demo: true,
    avatar_image: '',
    role: {
      id: 4,
      role_uuid: 'role_student',
      name: 'Student',
      rights: {
        courses: { action_create: false, action_read: true, action_read_own: false, action_update: false, action_update_own: false, action_delete: false, action_delete_own: false },
        users: { action_create: false, action_read: false, action_update: false, action_delete: false },
        usergroups: { action_create: false, action_read: true, action_update: false, action_delete: false },
        folders: { action_create: false, action_read: true, action_update: false, action_delete: false },
        media: { action_create: false, action_read: true, action_update: false, action_delete: false },
        organizations: { action_create: false, action_read: true, action_update: false, action_delete: false },
        coursechapters: { action_create: false, action_read: true, action_update: false, action_delete: false },
        activities: { action_create: false, action_read: true, action_update: false, action_delete: false },
        roles: { action_create: false, action_read: false, action_update: false, action_delete: false },
        dashboard: { action_access: false },
      },
    },
  },
  'admin@oxonom.com': {
    id: 1,
    user_uuid: 'user_da7162b6-2ad4-4061-bbb4-37157ddb6462',
    username: 'admin',
    email: 'admin@oxonom.com',
    first_name: 'Sistem',
    last_name: 'Yöneticisi',
    email_verified: true,
    is_superadmin: true,
    is_demo: true,
    avatar_image: '',
    role: {
      id: 1,
      role_uuid: 'role_superadmin',
      name: 'Admin',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: true, action_delete_own: true },
        users: { action_create: true, action_read: true, action_update: true, action_delete: true },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: true },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: true, action_read: true, action_update: true, action_delete: true },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: true, action_read: true, action_update: true, action_delete: true },
        dashboard: { action_access: true },
      },
    },
  },
}

export function createDemoJwt(user: DemoUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      sub: String(user.id),
      user_uuid: user.user_uuid,
      email: user.email,
      username: user.username,
      is_superadmin: user.is_superadmin,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      iat: Math.floor(Date.now() / 1000),
      type: 'access',
    })
  ).toString('base64url')
  return `${header}.${payload}.demotoken`
}

export function findDemoUser(identifier: string): DemoUser | null {
  const normalized = identifier.toLowerCase().trim()
  if (DEMO_USERS[normalized]) return DEMO_USERS[normalized]

  // Check username match or sub match
  for (const user of Object.values(DEMO_USERS)) {
    if (user.username.toLowerCase() === normalized || user.user_uuid === identifier || String(user.id) === identifier) {
      return user
    }
  }

  // Check token
  if (identifier.includes('.')) {
    try {
      const parts = identifier.split('.')
      if (parts.length >= 2) {
        const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = Buffer.from(padded, 'base64').toString('utf-8')
        const data = JSON.parse(json)
        if (data.email && DEMO_USERS[data.email.toLowerCase()]) {
          return DEMO_USERS[data.email.toLowerCase()]
        }
      }
    } catch {
      // not a jwt
    }
  }

  return null
}

export function getDemoSession(demoUser: DemoUser) {
  return {
    user: {
      id: demoUser.id,
      user_uuid: demoUser.user_uuid,
      username: demoUser.username,
      first_name: demoUser.first_name,
      last_name: demoUser.last_name,
      email: demoUser.email,
      email_verified: demoUser.email_verified,
      is_superadmin: demoUser.is_superadmin,
      avatar_image: demoUser.avatar_image,
      is_demo: true,
    },
    roles: [
      {
        role: {
          id: demoUser.role.id,
          role_uuid: demoUser.role.role_uuid,
          name: demoUser.role.name,
          rights: demoUser.role.rights,
        },
        org: DEFAULT_FALLBACK_ORG,
      },
    ],
  }
}

export const FALLBACK_PLAYGROUNDS = [
  {
    id: 21,
    playground_uuid: 'playground_1-dk-okuma',
    name: '1 Dk Okuma & Hızlı Okuma Atölyesi',
    description: 'Öğrencinin okuma hızını, dakikadaki kelime sayısını ve okuma akıcılığını canlı sayaçla ölçün.',
    access_type: 'public',
    published: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 22,
    playground_uuid: 'playground_harf-cizgi-atolyesi',
    name: 'Harf Çizgi & Yazılış Yönü Atölyesi',
    description: 'MEB dik temel harf standartlarına uygun, numaralandırılmış oklar ve adım adım harf çizim animasyonu.',
    access_type: 'public',
    published: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 23,
    playground_uuid: 'playground_ritmik-sayma-atolyesi',
    name: 'Ritmik Sayma & Sayı Doğrusu Atölyesi',
    description: 'Elastik zıplayan sevimli maskot ve parabolik yay mekaniği ile 1’er, 2’şer, 5’er ve 10’ar ritmik sayma.',
    access_type: 'public',
    published: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 24,
    playground_uuid: 'playground_gunes-sistemi-atolyesi',
    name: 'Güneş Sistemi & Gezegenler Keşif Atölyesi',
    description: 'Gezegenlerin yörüngelerini ve özelliklerini 3 boyutlu uzay ortamında etkileşimli olarak keşfedin.',
    access_type: 'public',
    published: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 19,
    playground_uuid: 'playground_sinif-carki-zamanlayici',
    name: 'Sınıf Çarkı & Geri Sayım Araçları',
    description: 'Öğrenci seçme çarkı, ders içi geri sayım sayacı ve interaktif sınıf içi motivasyon araçları.',
    access_type: 'public',
    published: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 20,
    playground_uuid: 'playground_ingilizce-kelime-atolyesi',
    name: 'İngilizce Kelime & Görsel Macera Atölyesi',
    description: 'Temel İngilizce kelimeleri görsel hafıza kartları ve sesli telaffuz ile eğlenceli öğrenme.',
    access_type: 'public',
    published: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
]

export const FALLBACK_BOARDS = [
  {
    id: 41,
    board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
    name: '10-A Matematik: Fonksiyon Grafikleri & Parabol Çizimleri',
    description: 'Fonksiyonların analitik incelenmesi ve parabol çizim tahtası',
    public: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 42,
    board_uuid: 'board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e',
    name: 'Fizik Laboratuvarı: Elektrik Devreleri & Eşdeğer Direnç',
    description: 'Ohm kanunu, seri-paralel bağlama ve eşdeğer direnç hesaplama',
    public: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 44,
    board_uuid: 'board_93a22f1c-4071-4fbc-b42a-82411a2a9faf',
    name: '10-A Haftalık Ders Programı, Nöbetçi Listesi ve Duyuru Panosu',
    description: 'Sınıf içi haftalık organizasyon ve duyuru panosu',
    public: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 43,
    board_uuid: 'board_2ec16e01-3744-4a40-93dc-228016b8a937',
    name: 'Kimya: Periyodik Tablo ve Lewis Yapıları Çizim Tahtası',
    description: 'Elementlerin elektron dizilimi ve Lewis yapıları',
    public: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 46,
    board_uuid: 'board_c8716f40-46da-4460-879d-ea8fc8e03d45',
    name: 'Biyoloji: Mitoz ve Mayoz Evreleri Karşılaştırma Şeması',
    description: 'Hücre bölünmesi evreleri ve kromozom dağılımı',
    public: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 45,
    board_uuid: 'board_93baf363-1e5e-4fcc-af31-7006e07815d3',
    name: 'Edebiyat: Divan Edebiyatı Nazım Şekilleri & Kavram Haritası',
    description: 'Gazel, kaside, mesnevi karşılaştırmalı kavram haritası',
    public: true,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
]

export const FALLBACK_USERGROUPS = [
  {
    id: 1,
    usergroup_uuid: 'group_10a_sayisal',
    name: '10-A Sınıfı',
    description: '10. Sınıf A Şubesi (Sayısal)',
    join_code: 'OX10A1',
    user_count: 28,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
  },
  {
    id: 2,
    usergroup_uuid: 'group_10b_esit',
    name: '10-B Sınıfı',
    description: '10. Sınıf B Şubesi (Eşit Ağırlık)',
    join_code: 'OX10B2',
    user_count: 26,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
  },
  {
    id: 3,
    usergroup_uuid: 'group_09a_genel',
    name: '9-A Sınıfı',
    description: '9. Sınıf A Şubesi (Genel)',
    join_code: 'OX09A1',
    user_count: 30,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
  },
  {
    id: 4,
    usergroup_uuid: 'group_11fen_ileri',
    name: '11-FEN Şubesi',
    description: '11. Sınıf İleri Düzey Fen Bilimleri',
    join_code: 'OX11FN',
    user_count: 24,
    org_id: 1,
    creation_date: '2026-10-01T00:00:00Z',
  },
]
