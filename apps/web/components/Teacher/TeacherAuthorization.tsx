'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import { ShieldAlert, ArrowLeft, LogOut, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@components/Contexts/AuthContext'

interface TeacherAuthorizationProps {
  children: React.ReactNode
}

export default function TeacherAuthorization({ children }: TeacherAuthorizationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const session = useLHSession() as any
  const { isAdmin, isTeacher, isStudent, loading } = useAdminStatus() as any

  const isAuthenticated = session?.status === 'authenticated'
  const isAuthorized = useMemo(() => {
    if (!isAuthenticated) return false
    // Teachers and school admins have full access to teacher workspace
    if (isAdmin || isTeacher) return true
    // Explicitly reject students and other non-teacher roles
    if (isStudent) return false
    // Fallback: check email / username
    const email = (session?.data?.user?.email || '').toLowerCase()
    if (email.includes('ogretmen') || email.includes('admin') || email.includes('mudur')) {
      return true
    }
    return false
  }, [isAuthenticated, isAdmin, isTeacher, isStudent, session])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/teacher/dashboard')
      router.push(`/m-login?next=${returnUrl}`)
    }
  }, [loading, isAuthenticated, pathname, router])

  if (loading || (!isAuthenticated && session?.status !== 'unauthenticated')) {
    return (
      <div className="min-h-screen w-full bg-[#0A0D15] flex flex-col items-center justify-center p-6 text-white font-jakarta">
        <PageLoading />
        <p className="text-xs text-gray-400 mt-4 tracking-wider uppercase font-semibold">
          Öğretmen Çalışma Alanı Doğrulanıyor...
        </p>
      </div>
    )
  }

  // Unauthorized access (e.g. Student trying to access /teacher routes)
  if (isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen w-full bg-[#0A0D15] flex flex-col items-center justify-center p-6 text-white font-jakarta">
        <div className="w-full max-w-md bg-[#121826] border border-gray-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Bu Alana Erişim Yetkiniz Yok</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Öğretmen Çalışma Merkezi yalnızca okul öğretmenleri ve yöneticileri içindir. Öğrenci hesabınızla kendi derslerinize ve ödevlerinize ana sayfadan erişebilirsiniz.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/home"
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <GraduationCap size={16} />
              <span>Öğrenci Paneline Git</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full h-11 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Farklı Hesapla Giriş Yap</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
