import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import {
  Books, FolderSimple, ChatsCircle, Headphones, Cube, ShoppingBag,
  ChalkboardSimple, Files, GameController, GraduationCap, Airplay
} from '@phosphor-icons/react'
import { menuIcon } from '@components/Objects/Menus/menuIcons'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getMenuColorClasses } from '@services/utils/ts/colorUtils'
import useAdminStatus from '@components/Hooks/useAdminStatus'

type Builtin = { feature: string; link: string; labelKey: string; Icon: any }

const BUILTIN: Record<string, Builtin> = {
  classrooms: { feature: 'classrooms', link: '/dash/classrooms', labelKey: 'common.classrooms', Icon: GraduationCap },
  yansit: { feature: 'boards', link: '/boards', labelKey: 'common.yansit', Icon: Airplay },
  boards: { feature: 'boards', link: '/boards', labelKey: 'boards.boards', Icon: ChalkboardSimple },
  games: { feature: 'games', link: '/games', labelKey: 'common.games', Icon: GameController },
  library: { feature: 'folders', link: '/library', labelKey: 'library.library', Icon: FolderSimple },
  podcasts: { feature: 'podcasts', link: '/podcasts', labelKey: 'podcasts.podcasts', Icon: Headphones },
  communities: { feature: 'communities', link: '/communities', labelKey: 'communities.title', Icon: ChatsCircle },
  playgrounds: { feature: 'playgrounds', link: '/playgrounds', labelKey: 'common.playgrounds', Icon: Cube },
  assignments: { feature: 'assignments', link: '/dash/assignments', labelKey: 'common.assignments', Icon: Files },
  courses: { feature: 'courses', link: '/courses', labelKey: 'courses.courses', Icon: Books },
  store: { feature: 'payments', link: '/store', labelKey: 'common.store', Icon: ShoppingBag },
}

// Default order for Oxonom Edu (classrooms, yansit, boards, games, library, communities, playgrounds, podcasts)
const DEFAULT_ORDER = ['classrooms', 'yansit', 'boards', 'games', 'library', 'communities', 'playgrounds', 'podcasts']

function MenuLinks(props: { orgslug: string; primaryColor?: string }) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const session = useLHSession() as any
  const isAuthenticated = session?.status === 'authenticated' && !!session?.data?.user
  const { isStudent } = useAdminStatus()
  const colors = getMenuColorClasses(props.primaryColor || '')

  const rf = org?.config?.config?.resolved_features
  const isEnabled = (feature: string) => {
    if (!rf) return true
    if (rf[feature] === undefined) return true
    return rf[feature]?.enabled !== false
  }

  const configItems: any[] | undefined =
    org?.config?.config?.customization?.menu?.items ?? org?.config?.config?.general?.menu?.items

  // Build the items to render (config-driven, else feature-driven defaults)
  const source =
    configItems && configItems.length
      ? [...configItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : DEFAULT_ORDER.map((type, i) => ({ type, enabled: true, order: i, label: '', url: '' }))

  const rendered = source
    .map((item: any) => {
      if (item.type === 'custom') {
        if (!item.enabled || !item.url) return null
        const external = /^https?:\/\//i.test(item.url)
        return {
          key: `custom-${item.url}`,
          label: item.label || item.url,
          Icon: menuIcon(item.icon),
          href: external ? item.url : getUriWithOrg(props.orgslug, item.url),
          external,
          isButton: false,
        }
      }
      if (item.type === 'courses' || item.type === 'store') return null
      if (item.type === 'classrooms') {
        if (!item.enabled) return null
        // Students should not have classrooms menu per policy
        if (isStudent) return null
        return {
          key: 'classrooms',
          label: item.label || t('common.classrooms', { defaultValue: 'Sınıflar' }),
          Icon: GraduationCap,
          href: getUriWithOrg(props.orgslug, '/dash/classrooms'),
          external: false,
          isButton: false,
        }
      }
      if (item.type === 'yansit') {
        if (!item.enabled) return null
        return {
          key: 'yansit',
          label: item.label || t('common.yansit', { defaultValue: 'Yansıt' }),
          Icon: Airplay,
          href: getUriWithOrg(props.orgslug, '/boards'),
          external: false,
          isButton: true,
        }
      }
      if (item.type === 'games') {
        if (!item.enabled) return null
        // Games is strictly auth-guarded like internal menus
        if (!isAuthenticated) return null
        const gamesDisabled = org?.config?.config?.features?.games?.enabled === false
        if (gamesDisabled) return null
        return {
          key: 'games',
          label: item.label || t('common.games', { defaultValue: 'Oyunlar' }),
          Icon: GameController,
          href: getUriWithOrg(props.orgslug, '/games'),
          external: false,
          isButton: false,
        }
      }
      const meta = BUILTIN[item.type]
      if (!meta) return null
      if (!item.enabled) return null
      if (!isEnabled(meta.feature)) return null // plan/feature gating
      return {
        key: item.type,
        label: item.label || t(meta.labelKey),
        Icon: meta.Icon,
        href: getUriWithOrg(props.orgslug, meta.link),
        external: false,
        isButton: false,
      }
    })
    .filter(Boolean) as any[]

  return (
    <div className="ps-1">
      <ul className="flex space-x-4 items-center">
        {rendered.map((it) => {
          const content = it.isButton ? (
            <li className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-xs hover:shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                <it.Icon size={16} weight="bold" className="animate-pulse" />
                <span>{it.label}</span>
              </span>
            </li>
          ) : (
            <li className={`flex space-x-2 items-center ${colors.text} font-semibold transition-colors hover:text-black`}>
              <it.Icon size={20} weight="fill" /> <span>{it.label}</span>
            </li>
          )
          return it.external ? (
            <a key={it.key} href={it.href} target="_blank" rel="noopener noreferrer">{content}</a>
          ) : (
            <Link key={it.key} href={it.href}>{content}</Link>
          )
        })}
      </ul>
    </div>
  )
}

export default MenuLinks
