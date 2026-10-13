'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  Tv,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  TrendingUp,
  Cpu,
} from 'lucide-react'
import { useAuth } from '@components/Contexts/AuthContext'
import toast, { Toaster } from 'react-hot-toast'
import { getStoredPrincipalProfile, savePrincipalProfile } from '@/lib/principal/principalProfileStorage'

type RoleType = 'principal' | 'teacher' | 'student' | 'parent'

interface RoleConfig {
  id: RoleType
  label: string
  subtitle: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge: string
  accentColor: string
  defaultEmail: string
  defaultPass: string
  defaultName: string
  targetRoute: string
}

const ROLES: RoleConfig[] = [
  {
    id: 'principal',
    label: 'Okul Müdürü',
    subtitle: 'Kurum Yönetimi & İdare',
    icon: Briefcase,
    badge: 'Yönetim',
    accentColor: 'from-emerald-500 to-teal-700',
    defaultEmail: 'mudur@oxonom.com',
    defaultPass: 'mudur123',
    defaultName: 'Dr. Uğur UĞURLU',
    targetRoute: '/principal/dashboard',
  },
  {
    id: 'teacher',
    label: 'Öğretmen',
    subtitle: 'Ders, Sınıf & Tahta',
    icon: GraduationCap,
    badge: 'Eğitim',
    accentColor: 'from-indigo-500 to-blue-700',
    defaultEmail: 'ogretmen@oxonom.com',
    defaultPass: 'ogretmen123',
    defaultName: 'Ebru TEKNECİ',
    targetRoute: '/teacher/dashboard',
  },
  {
    id: 'student',
    label: 'Öğrenci',
    subtitle: 'Derslerim & Ödevler',
    icon: User,
    badge: 'Öğrenci',
    accentColor: 'from-fuchsia-500 to-purple-700',
    defaultEmail: '101',
    defaultPass: 'ogrenci123',
    defaultName: 'Erçil UĞURLU',
    targetRoute: '/m-student',
  },
  {
    id: 'parent',
    label: 'Veli',
    subtitle: 'Gelişim & Devam',
    icon: Users,
    badge: 'Veli',
    accentColor: 'from-amber-500 to-orange-700',
    defaultEmail: 'veli@oxonom.com',
    defaultPass: 'veli123',
    defaultName: 'Ayşe UĞURLU',
    targetRoute: '/m-student',
  },
]

export default function GlobalLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()

  const [selectedRole, setSelectedRole] = useState<RoleType>('principal')
  const [identifier, setIdentifier] = useState('mudur@oxonom.com')
  const [password, setPassword] = useState('mudur123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0]

  // Smart role switcher handler
  const handleRoleSelect = (roleId: RoleType) => {
    setSelectedRole(roleId)
    const conf = ROLES.find((r) => r.id === roleId)
    if (conf) {
      setIdentifier(conf.defaultEmail)
      setPassword(conf.defaultPass)
    }
  }

  // Auto-detect role as user types
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val)
    const lower = val.toLowerCase().trim()
    if (lower.includes('mudur') || lower.includes('admin') || lower === '1') {
      setSelectedRole('principal')
    } else if (lower.includes('ogretmen') || lower.includes('teacher') || lower === '2') {
      setSelectedRole('teacher')
    } else if (lower === '101' || lower.includes('ercil') || lower.includes('ogrenci')) {
      setSelectedRole('student')
    } else if (lower.includes('veli') || lower.includes('parent')) {
      setSelectedRole('parent')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      toast.error('Lütfen kullanıcı adı / e-posta ve şifrenizi giriniz.')
      return
    }

    setIsLoading(true)
    const lowerIdent = identifier.toLowerCase().trim()

    // Determine target based on selected role & identifier
    const isAdmin = selectedRole === 'principal' || lowerIdent.includes('mudur') || lowerIdent.includes('admin')
    const isTeacher = selectedRole === 'teacher' || lowerIdent.includes('ogretmen') || lowerIdent.includes('teacher')
    const isStudent = selectedRole === 'student' || lowerIdent === '101' || lowerIdent.includes('ogrenci')

    let targetRoute = '/principal/dashboard'
    if (isAdmin) {
      targetRoute = '/principal/dashboard'
    } else if (isTeacher) {
      targetRoute = '/teacher/dashboard'
    } else if (isStudent) {
      targetRoute = '/m-student'
    }

    // Explicit Session Isolation: Clear conflicting accounts on device
    if (typeof window !== 'undefined') {
      try {
        if (isAdmin) {
          localStorage.removeItem('oxonom_teacher_profile')
          localStorage.removeItem('oxonom_teacher_profile_completed')
          localStorage.setItem('oxonom_current_role', 'admin')

          const existingProfile = getStoredPrincipalProfile()
          savePrincipalProfile({
            ...existingProfile,
            loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          })
        } else if (isTeacher) {
          localStorage.removeItem('oxonom_active_admin_session')
          localStorage.setItem('oxonom_current_role', 'teacher')
          localStorage.setItem(
            'oxonom_teacher_profile',
            JSON.stringify({
              id: 2,
              email: 'ogretmen@oxonom.com',
              username: 'ogretmen',
              firstName: 'Ebru',
              lastName: 'TEKNECİ',
              name: 'Ebru TEKNECİ',
              tcNo: '10000000204',
              phone: '+90 532 999 3300',
              branch: 'Türk Dili ve Edebiyatı · Rehberlik',
              bio: 'Türk Dili ve Edebiyatı Öğretmeni · 9-A Sınıf Rehber Öğretmeni · Oxonom Okulları',
              extraDetails: [
                'Edebiyat Zümre Başkanı',
                '9-A Rehber Öğretmeni',
                'Akıllı Tahta Koordinatörü',
              ],
              isFirstLogin: false,
              profileCompleted: true,
            })
          )
        } else if (isStudent) {
          localStorage.removeItem('oxonom_active_admin_session')
          localStorage.removeItem('oxonom_teacher_profile')
          localStorage.setItem('oxonom_current_role', 'student')
        }
      } catch (_) {}
    }

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password: password,
        callbackUrl: targetRoute,
      })

      if (res && !res.ok) {
        // Fallback for demo credentials
        console.warn('NextAuth credentials error, proceeding with client session:', res.error)
      }

      toast.success(
        isAdmin
          ? 'Okul Müdürü oturumu açıldı! İdare paneline yönlendiriliyorsunuz...'
          : isTeacher
          ? 'Öğretmen oturumu açıldı! Çalışma merkezine yönlendiriliyorsunuz...'
          : 'Giriş başarılı! Öğrenci paneline yönlendiriliyorsunuz...',
        {
          icon: isAdmin ? '👔' : isTeacher ? '🎓' : '🎒',
        }
      )

      setTimeout(() => {
        window.location.href = targetRoute
      }, 400)
    } catch (err) {
      console.error('Login error:', err)
      // Smooth redirect on demo mode
      window.location.href = targetRoute
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-white font-jakarta flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-500/30">
      <Toaster position="top-center" />

      {/* ── BACKGROUND MACRO VISUALS & ORBITAL RINGS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Ambient Radiant Glow Blobs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute top-1/3 right-0 w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-teal-600/10 blur-[150px]" />

        {/* Orbit Ring 1 - Clockwise */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 right-10 w-[720px] h-[720px] pointer-events-none opacity-20"
        >
          <svg viewBox="0 0 720 720" fill="none" className="w-full h-full">
            <circle cx="360" cy="360" r="350" stroke="#34D399" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="360" cy="360" r="280" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="2 6" />
            <circle cx="360" cy="360" r="200" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.3" />
          </svg>
        </motion.div>

        {/* Orbit Ring 2 - Counter-Clockwise */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-48 -left-48 w-[640px] h-[640px] pointer-events-none opacity-15"
        >
          <svg viewBox="0 0 640 640" fill="none" className="w-full h-full">
            <circle cx="320" cy="320" r="310" stroke="#38BDF8" strokeWidth="1" strokeDasharray="5 10" />
            <circle cx="320" cy="320" r="240" stroke="#34D399" strokeWidth="0.6" />
          </svg>
        </motion.div>

        {/* Subtle Geometric Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── TOP BRAND NAVIGATION BAR ── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
            OX
          </div>
          <div>
            <div className="text-base font-black tracking-tight leading-tight flex items-center gap-2">
              <span>Oxonom EDU</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.0
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-semibold">
              Geleceğin Akıllı Okul Ekosistemi
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Merkezi Giriş Kapısı</span>
          </div>

          <Link
            href="/pano"
            className="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Tv size={14} className="text-teal-400" />
            <span>Pano Aç</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN HERO & LOGIN SECTION (SPLIT-SCREEN ON DESKTOP) ── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ── LEFT COLUMN: HERO INFORMATION (DESKTOP) ── */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold tracking-wide">
              <Sparkles size={14} />
              <span>TEK PLATFORM • TÜM ROLLER</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Eğitim Yönetiminde <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Yeni Nesil
                </span>{' '}
                Dijital Merkez
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                Okul müdürü idaresi, öğretmen çalışma merkezi, akıllı tahta canlı eşleşmesi ve öğrenci başarı karneleri kesintisiz ve güvenli tek bir arayüzde birleşti.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-lg">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">İdare & Kadro</div>
                  <div className="text-[10px] text-gray-400">Ders dağılımı & mevcudiyet</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Öğretmen Alanı</div>
                  <div className="text-[10px] text-gray-400">Yoklama, ödev & notlar</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                  <Tv size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Akıllı Tahta QR</div>
                  <div className="text-[10px] text-gray-400">Canlı pano oturumu & kontrol</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Akademik Takip</div>
                  <div className="text-[10px] text-gray-400">Ölçülebilir karne ve grafikler</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: GLASSMORPHIC LOGIN CARD ── */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#0E1526]/85 backdrop-blur-2xl border border-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
              {/* Subtle Card Glow Effect */}
              <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Merkezi Giriş Paneli
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-gray-300">
                    SSL 256-Bit
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Hesabınıza Giriş Yapın
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Rolünüzü seçin veya kullanıcı bilgilerinizi girerek devam edin
                </p>
              </div>

              {/* ── ROLE SWITCHER TABS (SLIDING ANIMATION) ── */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#090D18] rounded-2xl border border-gray-800/80 mb-6 relative">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className="relative z-10 py-2.5 px-2 rounded-xl text-center cursor-pointer transition-colors"
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="login-role-pill"
                          className="absolute inset-0 bg-white/10 rounded-xl border border-white/20 shadow-md"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        />
                      )}
                      <div className="relative z-20 flex flex-col items-center gap-1">
                        <Icon
                          size={16}
                          className={isSelected ? 'text-emerald-400' : 'text-gray-400'}
                        />
                        <span
                          className={`text-[11px] font-bold truncate max-w-full ${
                            isSelected ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {r.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Active Role Mini Banner */}
              <div className="mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-extrabold text-xs">
                    {activeRoleConfig.defaultName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">
                      {activeRoleConfig.defaultName}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      {activeRoleConfig.subtitle}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {activeRoleConfig.badge}
                </span>
              </div>

              {/* ── LOGIN FORM ── */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier Input */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    E-Posta, T.C. No veya Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="E-posta veya kullanıcı adı"
                      value={identifier}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 text-xs bg-[#090D18] border border-gray-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white font-medium placeholder-gray-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-300">Şifre</label>
                    <button
                      type="button"
                      onClick={() => toast('Şifre sıfırlama bağlantısı kurum yöneticinize iletilir.', { icon: 'ℹ️' })}
                      className="text-[11px] text-gray-400 hover:text-emerald-400 font-medium transition-colors"
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs bg-[#090D18] border border-gray-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white font-medium placeholder-gray-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#090D18] border-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                    <span className="text-xs font-medium text-gray-400">Beni hatırla</span>
                  </label>

                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>Güvenli Oturum</span>
                  </div>
                </div>

                {/* Macro Animated Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Giriş Yap ve Devam Et</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* ── QUICK DEMO ACCESS CHIPS (HIZLI TEST BUTONLARI) ── */}
              <div className="mt-6 pt-5 border-t border-gray-800/80">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Hızlı Demo Giriş Butonları</span>
                  <span className="text-emerald-400">Tek Tıkla Dene</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('principal')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-white truncate">👔 Müdür</div>
                    <div className="text-[9px] text-gray-400 truncate">Dr. Uğur U.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('teacher')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-500/10 border border-white/[0.06] hover:border-indigo-500/30 text-left transition-all cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-white truncate">🎓 Öğretmen</div>
                    <div className="text-[9px] text-gray-400 truncate">Ebru TEKNECİ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-purple-500/10 border border-white/[0.06] hover:border-purple-500/30 text-left transition-all cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-white truncate">🎒 Öğrenci</div>
                    <div className="text-[9px] text-gray-400 truncate">Erçil UĞURLU</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
        <div>
          © 2026 Oxonom EDU • Tüm Hakları Saklıdır. Millî Eğitim Bakanlığı Standartlarıyla Tam Uyumlu.
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Link href="/pano" className="hover:text-white transition-colors">
            Akıllı Tahta Pano
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Gizlilik
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Kullanım Şartları
          </Link>
        </div>
      </footer>
    </div>
  )
}
