import { useOrg } from '@components/Contexts/OrgContext'
import { getUriWithOrg } from '@services/config/config'
import { Books, FolderSimple, ChatsCircle, Headphones, Cube, ShoppingBag, ChalkboardSimple, Files, GameController } from '@phosphor-icons/react'
import { menuIcon } from '@components/Objects/Menus/menuIcons'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getMenuColorClasses } from '@services/utils/ts/colorUtils'

type Builtin = { feature: string; link: string; labelKey: string; Icon: any }

const BUILTIN: Record<string, Builtin> = {
  courses: { feature: 'courses', link: '/courses', labelKey: 'courses.courses', Icon: Books },
  library: { feature: 'folders', link: '/library', labelKey: 'library.library', Icon: FolderSimple },
  boards: { feature: 'boards', link: '/boards', labelKey: 'boards.boards', Icon: ChalkboardSimple },
  podcasts: { feature: 'podcasts', link: '/podcasts', labelKey: 'podcasts.podcasts', Icon: Headphones },
  communities: { feature: 'communities', link: '/communities', labelKey: 'communities.title', Icon: ChatsCircle },
  playgrounds: { feature: 'playgrounds', link: '/playgrounds', labelKey: 'common.playgrounds', Icon: Cube },
  games: { feature: 'games', link: '/games', labelKey: 'common.games', Icon: GameController },
  assignments: { feature: 'assignments', link: '/assignments', labelKey: 'common.assignments', Icon: Files },
  store: { feature: 'payments', link: '/store', labelKey: 'common.store', Icon: ShoppingBag },
}

// Default order for Oxonom Edu (courses and store hidden)
const DEFAULT_ORDER = ['library', 'boards', 'communities', 'playgrounds', 'podcasts', 'games']

function MenuLinks(props: { orgslug: string; primaryColor?: string }) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const colors = getMenuColorClasses(props.primaryColor || '')

  const rf = org?.config?.config?.resolved_features
  const isEnabled = (feature: string) => rf?.[feature]?.enabled === true

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
        }
      }
      if (item.type === 'courses' || item.type === 'store') return null
      if (item.type === 'games') {
        const gamesDisabled = org?.config?.config?.features?.games?.enabled === false
        if (gamesDisabled) return null
        return {
          key: 'games',
          label: item.label || t('common.games') || 'Oyunlar',
          Icon: GameController,
          href: getUriWithOrg(props.orgslug, '/games'),
          external: false,
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
      }
    })
    .filter(Boolean) as any[]

  const gamesItem = rendered.find((it) => it.key === 'games')
  const finalRendered = gamesItem
    ? [...rendered.filter((it) => it.key !== 'games'), gamesItem]
    : rendered

  return (
    <div className="ps-1">
      <ul className="flex space-x-4 items-center">
        {finalRendered.map((it) => {
          const isGames = it.key === 'games'
          const content = isGames ? (
            <li className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-400/50 text-amber-900 font-bold hover:shadow-xs transition-all hover:scale-105 cursor-pointer">
              <span className="text-base">🎮</span>
              <span>{it.label}</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full shadow-xs">
                YENİ
              </span>
            </li>
          ) : (
            <li className={`flex space-x-2 items-center ${colors.text} font-semibold transition-colors`}>
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
