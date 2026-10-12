'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  User,
  Lock,
  Save,
  CheckCircle2,
  Key,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { signOut } from '@components/Contexts/AuthContext'

export default function PrincipalSettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Dr. Uğur UĞURLU',
    title: 'Okul Müdürü · Kurum Yetkilisi',
    email: 'mudur@oxonom.com',
    tcNo: '10000000146',
    phone: '+90 532 999 2200',
    schoolName: 'Necla Görer İlkokulu / Oxonom Okulları',
    twoFactorActive: true,
  })

  const [editName, setEditName] = useState(profile.name)
  const [editPhone, setEditPhone] = useState(profile.phone)
  const [editEmail, setEditEmail] = useState(profile.email)
  const [twoFactor, setTwoFactor] = useState(profile.twoFactorActive)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_active_admin_session')
        if (saved) {
          const parsed = JSON.parse(saved)
          const fullName = parsed.name || (parsed.first_name ? `${parsed.first_name} ${parsed.last_name || ''}`.trim() : 'Dr. Uğur UĞURLU')
          setProfile((prev) => ({
            ...prev,
            name: fullName,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
            schoolName: parsed.schoolName || prev.schoolName,
          }))
          setEditName(fullName)
          setEditPhone(parsed.phone || '+90 532 999 2200')
          setEditEmail(parsed.email || 'mudur@oxonom.com')
        }
      } catch (_) {}
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = {
      ...profile,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      twoFactorActive: twoFactor,
    }
    setProfile(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_active_admin_session', JSON.stringify(updated))
      } catch (_) {}
    }
    toast.success('Yönetici profil ve güvenlik bilgileri güncellendi!')
  }

  const handleAdminLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('oxonom_active_admin_session')
        localStorage.removeItem('oxonom_current_role')
      } catch (_) {}
    }
    toast.success('Yönetici oturumu kapatıldı.')
    await signOut()
    window.location.href = '/loginv2'
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Settings size={15} />
            <span>Kurumsal İdare & Güvenlik</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Kurum & Profil Ayarları
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Okul müdürü kimlik bilgileri, iki adımlı doğrulama (2FA) ve sistem tercihleri
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdminLogout}
          className="h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/40 self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Oturumu Kapat</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
            U
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{profile.title}</p>
            <p className="text-[11px] text-gray-400 mt-1">{profile.schoolName}</p>
          </div>

          <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-gray-500">
              <span>Yetki Düzeyi</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">1. Derece Baş Yönetici</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>T.C. Kimlik</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">10000000146</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Sistem Durumu</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Çevrimiçi
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Details & Security */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              <span>İletişim ve Yetkili Bilgileri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Müdür Adı Soyadı
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Resmi E-Posta
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Kurum Adı
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.schoolName}
                  className="w-full h-10 px-3.5 text-xs bg-gray-100 dark:bg-[#12192B] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Güvenlik ve 2FA (İki Adımlı Doğrulama)</span>
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  SMS / Authenticator ile İki Adımlı Giriş (2FA)
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Her yeni oturum açılışında kayıtlı telefonunuza tek kullanımlık onay kodu gönderilir.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  twoFactor ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 left-0.5"
                  animate={{ x: twoFactor ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Save size={15} />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
