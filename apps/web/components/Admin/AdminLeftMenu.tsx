'use client'
import {
  Buildings,
  ChartBar,
  Key,
  SignOut,
  User,
  Users,
  CreditCard,
  GearSix,
  ChatCircleDots,
  GameController,
} from '@phosphor-icons/react'
import { signOut } from '@components/Contexts/AuthContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUserAvatarMediaDirectory } from '@services/media/media'
import { getAPIUrl } from '@services/config/config'
import { apiFetch } from '@services/utils/ts/requests'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React from 'react'

function AdminTopMenu() {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const { data: branding } = useQuery({
    queryKey: ['superadmin', 'system', 'branding'],
    queryFn: () => apiFetch(`${getAPIUrl()}ee/superadmin/system/branding`, accessToken),
    enabled: !!accessToken,
    staleTime: 60_000,
  })

  const siteName = branding?.site_name || 'Oxonom Edu'
  const siteLogo = branding?.site_logo || '/lrn-dash.svg'

  async function logOutUI() {
    await signOut({ redirect: true, callbackUrl: '/admin/login' })
  }

  if (!session) return null

  const user = session?.data?.user
  const avatarUrl = user?.avatar_image
    ? user.avatar_image.startsWith('http')
      ? user.avatar_image
      : getUserAvatarMediaDirectory(user.user_uuid, user.avatar_image)
    : null

  return (
    <>
      {/* Spacer to push content below the fixed menu */}
      <div className="h-14" />
      {/* Fixed menu bar */}
      <div
        className="fixed top-0 start-0 end-0 h-14 bg-black border-b border-white/[0.08] flex items-center text-white px-4 gap-6"
        style={{ zIndex: 'var(--z-overlay)' }}
      >
        {/* Logo */}
        <Link className="flex items-center gap-2.5 transition-opacity hover:opacity-70 shrink-0" href="/admin">
          <img
            src={siteLogo}
            alt={siteName}
            className="h-7 w-7 object-contain rounded"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/lrn-dash.svg'
            }}
          />
          <span className="font-semibold text-sm text-white">{siteName}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
            Süper Admin
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink
            href="/admin/organizations"
            icon={<Buildings size={16} weight="fill" />}
            label="Okullar & Kurumlar"
          />
          <NavLink
            href="/admin/users"
            icon={<Users size={16} weight="fill" />}
            label="Kullanıcılar"
          />
          <NavLink
            href="/admin/plans"
            icon={<CreditCard size={16} weight="fill" />}
            label="Paketler & Planlar"
          />
          <NavLink
            href="/admin/analytics"
            icon={<ChartBar size={16} weight="fill" />}
            label="Analitikler"
          />
          <NavLink
            href="/admin/developers"
            icon={<Key size={16} weight="fill" />}
            label="Geliştiriciler"
          />
          <NavLink
            href="/admin/settings"
            icon={<GearSix size={16} weight="fill" />}
            label="Sistem & AI"
          />
          <NavLink
            href="/admin/feedbacks"
            icon={<ChatCircleDots size={16} weight="fill" />}
            label="Geri Bildirimler"
          />
          <NavLink
            href="/admin/games"
            icon={<GameController size={16} weight="fill" />}
            label="Oyunlar"
          />
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover bg-gray-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <User size={14} weight="fill" className="text-white/50" />
              </div>
            )}
            <span className="text-sm text-white/60 hidden sm:inline">
              {user?.username}
            </span>
          </div>
          <button
            onClick={logOutUI}
            className="flex items-center gap-1.5 rounded-lg text-red-500 hover:text-red-400 hover:bg-white/[0.08] transition-all px-2 py-1.5"
            title="Çıkış Yap"
          >
            <SignOut size={16} weight="fill" data-dir-flip />
            <span className="text-xs font-medium hidden sm:inline">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  )
}

const NavLink = ({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) => {
  return (
    <Link aria-label={label} href={href}>
      <div className="flex items-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all px-3 py-1.5 gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  )
}

export default AdminTopMenu
