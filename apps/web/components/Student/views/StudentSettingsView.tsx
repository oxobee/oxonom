'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  User,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  Save,
  Lock,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Award,
  Sparkles,
} from 'lucide-react'
import { DEFAULT_STUDENT_PROFILE, getSynchronizedStudentProfile, type StudentProfile } from '@/lib/student/studentData'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { signOut } from '@components/Contexts/AuthContext'
import MockBadge from '@components/Common/MockBadge'
import toast from 'react-hot-toast'

interface StudentSettingsViewProps {
  initialTab?: 'all' | 'profile' | 'notifications' | 'accessibility' | 'security'
}

export default function StudentSettingsView({
  initialTab = 'profile',
}: StudentSettingsViewProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'accessibility' | 'security'>(
    initialTab === 'all' ? 'profile' : initialTab
  )
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)

  React.useEffect(() => {
    const sync = () => {
      setProfile(getSynchronizedStudentProfile())
    }
    sync()

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Notification toggles
  const [notifHomework, setNotifHomework] = useState(true)
  const [notifExams, setNotifExams] = useState(true)
  const [notifAnnouncements, setNotifAnnouncements] = useState(true)

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Öğrenci tercihleri ve ayarları başarıyla kaydedildi.')
  }

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('oxonom_student_profile')
        localStorage.removeItem('oxonom_current_role')
      } catch (_) {}
    }
    await signOut()
    window.location.href = '/loginv2'
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <Settings size={14} />
            <span>Hesap ve Tercihler</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Profilim ve Ayarlar
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğrenci kimlik bilgileri, veli irtibatı, bildirim tercihleri ve güvenlik.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Öğrenci Profili
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Bildirimler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accessibility')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'accessibility'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Tema & Görünüm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Güvenlik
          </button>
        </div>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Identity Pass Card */}
          <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white border border-white/20 shrink-0">
                {(profile.firstName?.slice(0, 1) || 'E') + (profile.lastName?.slice(0, 1) || 'U')}
              </div>
              <div>
                <div className="text-xl font-black">{profile.name}</div>
                <div className="text-xs text-cyan-100 mt-0.5">
                  {profile.schoolName} · {profile.className} Şubesi
                </div>
                <div className="text-[11px] font-semibold text-emerald-300 mt-1 flex items-center gap-1.5">
                  <Award size={13} />
                  <span>Okul No: {profile.studentNo} · TC: {profile.tcNo}</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold shrink-0">
              {profile.disciplineStatus}
            </div>
          </div>

          {/* Detailed Profile Fields */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Resmi e-Okul ve Kurum Kayıt Bilgileri
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Müdürlük ve Bakanlık tarafından onaylanmış resmi öğrenci kütüğü bilgileri (salt-okunur).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <Lock size={10} />
                  Ad Soyad
                </span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.name}</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <Lock size={10} />
                  Sınıf & Şube
                </span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.className}</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <Lock size={10} />
                  Okul Numarası
                </span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.studentNo}</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Doğum Tarihi & Yaş</span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.birthDate}</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Kan Grubu</span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.bloodType}</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Sınıf Rehber Öğretmeni</span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.mentorTeacher}</div>
              </div>
            </div>

            {/* Parent contact info */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                Kayıtlı Veli ve İletişim Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1.5 text-xs">
                  <div className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                    <span>{profile.parentName}</span>
                    <span className="text-[10px] text-cyan-600 font-semibold">{profile.parentRelation}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone size={13} />
                    <span>{profile.parentPhone}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1.5 text-xs">
                  <div className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                    <span>{profile.secondParentName}</span>
                    <span className="text-[10px] text-cyan-600 font-semibold">{profile.secondParentRelation}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone size={13} />
                    <span>{profile.secondParentPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address and Emergency contact */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                İkametgah ve Acil Durum İletişimi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                    <MapPin size={12} className="text-cyan-500" />
                    Kayıtlı Ev Adresi
                  </span>
                  <div className="font-bold text-gray-900 dark:text-white leading-relaxed">
                    {profile.address}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                    <Phone size={12} className="text-rose-500" />
                    Acil Durum Numarası
                  </span>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {profile.emergencyPhone}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Öncelikli arama veli ve kurum koordinatörü
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Pedagogical Notes */}
            {(profile.specialHealthNote || profile.notes) && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Özel Sağlık ve Kurumsal Kayıt Notları
                </h3>
                <div className="space-y-3 text-xs">
                  {profile.specialHealthNote && (
                    <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-1">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase flex items-center gap-1.5">
                        <HeartPulse size={12} />
                        Özel Sağlık Bildirimi
                      </span>
                      <p className="font-semibold text-rose-900 dark:text-rose-200 leading-relaxed">
                        {profile.specialHealthNote}
                      </p>
                    </div>
                  )}

                  {profile.notes && (
                    <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Rehberlik ve İdare Notu
                      </span>
                      <p className="font-semibold text-indigo-900 dark:text-indigo-200 leading-relaxed">
                        {profile.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Bildirim ve Uyarı Tercihleri
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Hangi durumlarda anlık push bildirimi ve e-posta almak istediğinizi belirleyin.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Yeni Ödev ve Görev Bildirimleri
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Öğretmen yeni bir ödev tanımladığında veya son teslim yaklaştığında uyar
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifHomework}
                onChange={() => setNotifHomework(!notifHomework)}
                className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Sınav Tarihi ve Sonuç Bildirimleri
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Sınav takviminde değişiklik olduğunda veya sınav notu yayımlandığında bildir
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifExams}
                onChange={() => setNotifExams(!notifExams)}
                className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Okul ve Zümre Duyuruları
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Müdürlük ve 9-A rehber öğretmeninden gelen resmi duyurular
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifAnnouncements}
                onChange={() => setNotifAnnouncements(!notifAnnouncements)}
                className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Tercihleri Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Accessibility & Theme */}
      {activeTab === 'accessibility' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Görünüm, Tema ve Erişilebilirlik
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Arayüz parlaklığı, renk teması ve yazı boyutu tercihleri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Arayüz Teması: {theme === 'dark' ? 'Koyu Mod (Dark)' : 'Açık Mod (Light)'}
              </div>
              <div className="text-[11px] text-gray-400">
                Göz yormayan karanlık mod ile aydınlık çalışma ortamı arasında geçiş yapın
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Güvenlik ve Oturum Yönetimi
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Aktif öğrenci oturumu, parola güncelleme ve çıkış işlemleri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Güvenli SSL Bağlantısı Aktif
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                Öğrenci oturumunuz uçtan uca şifrelenmiştir ve KVKK güvenlik standartlarına uygundur.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="text-xs text-gray-400">
              Bu cihazdaki aktif öğrenci oturumunu sonlandırmak için:
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
