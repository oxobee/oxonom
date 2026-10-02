'use client'

import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkle,
  CalendarBlank,
  Globe,
  Lock,
  Users,
} from '@phosphor-icons/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { Breadcrumbs } from '@components/Objects/Breadcrumbs/Breadcrumbs'
import { PlaygroundReactionButton } from '@components/Playground/PlaygroundReactionButton'
import { Playground } from '@services/playgrounds/playgrounds'
import { getPlaygroundThumbnailMediaDirectory } from '@services/media/media'
import { getUriWithOrg } from '@services/config/config'
import { useTrackView, AnalyticsEvent } from '@services/analytics'

dayjs.extend(relativeTime)

interface PlaygroundViewClientProps {
  playground: Playground
  orgslug: string
  canEdit: boolean
}

const ACCESS_BADGES = {
  public: { icon: Globe, label: 'Public', tr: 'Herkese Açık', className: 'bg-green-50 text-green-700' },
  authenticated: { icon: Users, label: 'Members', tr: 'Üyeler', className: 'bg-blue-50 text-blue-700' },
  restricted: { icon: Lock, label: 'Restricted', tr: 'Kısıtlı', className: 'bg-amber-50 text-amber-700' },
}

export default function PlaygroundViewClient({
  playground,
  orgslug,
  canEdit,
}: PlaygroundViewClientProps) {
  const { t, i18n } = useTranslation()
  const isTr = i18n?.language?.startsWith('tr') !== false
  const iframeContainerRef = useRef<HTMLDivElement>(null)

  useTrackView(
    AnalyticsEvent.PlaygroundViewed,
    { has_content: !!playground.html_content, is_author: canEdit },
    true,
    'learner',
  )

  const thumbnailUrl =
    playground.thumbnail_image && playground.org_uuid
      ? getPlaygroundThumbnailMediaDirectory(
          playground.org_uuid,
          playground.playground_uuid,
          playground.thumbnail_image
        )
      : null

  const accessBadge = ACCESS_BADGES[playground.access_type] ?? ACCESS_BADGES.authenticated
  const AccessIcon = accessBadge.icon
  const createdDate = dayjs(playground.creation_date).format('MMM D, YYYY')

  return (
    <GeneralWrapperStyled>
      {/* Breadcrumbs */}
      <div className="pb-4">
        <Breadcrumbs
          items={[
            { label: isTr ? 'Modüller' : 'Modules', href: getUriWithOrg(orgslug, '/playgrounds'), icon: <Sparkle size={14} /> },
            { label: playground.name },
          ]}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-5 pt-2">

        {/* ── Left Sidebar — 220px ── */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-3">

            {/* Thumbnail */}
            {thumbnailUrl && (
              <div className="bg-white nice-shadow rounded-lg overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt={playground.name}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

            {/* Info card */}
            <div className="bg-white nice-shadow rounded-lg overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {isTr ? 'Hakkında' : t('playgrounds.view.about')}
                </p>
                <h1 className="text-sm font-bold text-gray-900 leading-snug">
                  {playground.name}
                </h1>
                {playground.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-4">
                    {playground.description}
                  </p>
                )}
              </div>

              <div className="px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">{isTr ? 'Erişim' : t('playgrounds.view.access')}</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${accessBadge.className}`}>
                    <AccessIcon size={9} />
                    {isTr ? accessBadge.tr : accessBadge.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">{isTr ? 'Oluşturulma' : t('playgrounds.view.created')}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-700">
                    <CalendarBlank size={10} className="text-gray-400" />
                    {createdDate}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">{isTr ? 'Durum' : t('playgrounds.view.status')}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    playground.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {playground.published ? (isTr ? 'Yayında' : t('playgrounds.view.published')) : (isTr ? 'Taslak' : t('playgrounds.view.draft'))}
                  </span>
                </div>
              </div>
            </div>

            {/* Reactions card */}
            <div className="bg-white nice-shadow rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                {isTr ? 'Tepkiler' : t('playgrounds.view.reactions')}
              </p>
              <PlaygroundReactionButton playgroundUuid={playground.playground_uuid} />
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <div
            ref={iframeContainerRef}
            className="relative bg-white nice-shadow rounded-lg overflow-hidden"
            style={{ height: 'calc(100vh - 200px)', minHeight: 480 }}
          >
            {/* Iframe / empty state */}

            {/* Iframe / empty state */}
            {playground.html_content ? (
              <iframe
                srcDoc={playground.html_content}
                // srcDoc content runs on an opaque origin (no allow-same-origin)
                sandbox="allow-scripts allow-forms allow-popups"
                className="w-full h-full border-0"
                title={playground.name}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-white nice-shadow flex items-center justify-center mb-4">
                  <Sparkle size={24} weight="fill" className="text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-500">{t('common.no_content_yet')}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {t('playgrounds.view.check_back_later')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GeneralWrapperStyled>
  )
}
