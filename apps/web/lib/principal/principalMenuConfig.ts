import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Users,
  Calendar,
  Tv,
  BookOpen,
  BarChart3,
  Megaphone,
  Settings,
  ShieldCheck,
  LucideIcon,
  Sparkles,
  Building2,
  FileCheck,
} from 'lucide-react'

export type FeatureStatus = 'active' | 'passive' | 'restricted'

export interface PrincipalSubMenuItem {
  id: string
  label: string
  path: string
  status: FeatureStatus
  description?: string
  missingDependency?: string
}

export interface PrincipalMenuItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  status: FeatureStatus
  sortOrder: number
  description: string
  badge?: string
  missingDependency?: string
  hidden?: boolean
  children?: PrincipalSubMenuItem[]
}

export const PRINCIPAL_MENU_CONFIG: PrincipalMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Genel Bakış & İdare',
    path: '/principal/dashboard',
    icon: LayoutDashboard,
    status: 'active',
    sortOrder: 1,
    description: 'Okul mevcudu, günlük devamsızlık durumu, açık tahtalar ve yönetici hızlı aksiyonları.',
  },
  {
    id: 'teachers',
    label: 'Öğretmenler & Kadro',
    path: '/principal/teachers',
    icon: Briefcase,
    status: 'active',
    sortOrder: 2,
    badge: '18 Aktif',
    description: 'Öğretmen kadrosu, branş dağılımı, özlük dosyaları, nöbet ve ek ders yönetimi.',
    children: [
      { id: 'teachers-list', label: 'Öğretmen Listesi', path: '/principal/teachers', status: 'active' },
      { id: 'teachers-assign', label: 'Ders Görevlendirme', path: '/principal/teachers?action=assign', status: 'active' },
      { id: 'teachers-duties', label: 'Nöbet Çizelgesi', path: '/principal/teachers?tab=nobet', status: 'active' },
    ],
  },
  {
    id: 'students',
    label: 'Öğrenciler & Kayıt',
    path: '/principal/students',
    icon: GraduationCap,
    status: 'active',
    sortOrder: 3,
    badge: '482 Öğrenci',
    description: 'Öğrenci kütük kayıtları, şube dağılımları, veli irtibatları ve disiplin takibi.',
  },
  {
    id: 'classes',
    label: 'Sınıflar & Şubeler',
    path: '/principal/classes',
    icon: Users,
    status: 'active',
    sortOrder: 4,
    description: 'Sınıf listeleri, şube rehber öğretmenleri, sınıf kapasiteleri ve derslik atamaları.',
  },
  {
    id: 'schedule',
    label: 'Haftalık Ders Dağılımı',
    path: '/principal/schedule',
    icon: Calendar,
    status: 'active',
    sortOrder: 5,
    description: 'Okul geneli haftalık ders programı, boş saatler, çakışma analizi ve yedek öğretmen atama.',
  },
  {
    id: 'smartboards',
    label: 'Akıllı Tahtalar & Pano',
    path: '/principal/smartboards',
    icon: Tv,
    status: 'active',
    sortOrder: 6,
    badge: 'Canlı',
    description: 'Sınıf akıllı tahtalarının anlık oturum durumu, uzaktan kapatma ve pano yönetimi.',
  },
  {
    id: 'curriculum',
    label: 'Müfredat & Zümreler',
    path: '/principal/curriculum',
    icon: BookOpen,
    status: 'active',
    sortOrder: 7,
    description: 'Bakanlık müfredatı, zümre toplantı tutanakları, yıllık plan onayları ve kazanımlar.',
  },
  {
    id: 'reports',
    label: 'İdari Raporlar & İstatistik',
    path: '/principal/reports',
    icon: BarChart3,
    status: 'active',
    sortOrder: 8,
    description: 'Okul geneli devamsızlık analizleri, akademik başarı grafikleri ve resmi e-Okul çıktıları.',
  },
  {
    id: 'settings',
    label: 'Kurum & Profil Ayarları',
    path: '/principal/settings',
    icon: Settings,
    status: 'active',
    sortOrder: 9,
    description: 'Okul kurumsal bilgileri, müdür kimliği, 2FA güvenlik ayarları ve sistem tercihleri.',
  },
]

export function getPrincipalMenuItemByPath(pathname: string): PrincipalMenuItem | undefined {
  const clean = pathname.split('?')[0]
  const exact = PRINCIPAL_MENU_CONFIG.find((m) => m.path === clean)
  if (exact) return exact
  return PRINCIPAL_MENU_CONFIG.find((m) => clean.startsWith(m.path))
}
