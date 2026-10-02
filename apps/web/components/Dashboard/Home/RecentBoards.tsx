'use client'
import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/lib/format'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getBoardThumbnailMediaDirectory } from '@services/media/media'
import { getBoards } from '@services/boards/boards'
import { SafeImage } from '@components/Objects/SafeImage'
import { Chalkboard, PlusCircle, Clock, Users } from '@phosphor-icons/react'

export default function RecentBoards() {
  const { t, i18n } = useTranslation()
  const org = useOrg() as any
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const orgId = org?.id

  const { data: boardsData, isLoading } = useQuery({
    queryKey: [...queryKeys.boards.list(orgId), 'recent', 8],
    queryFn: () => getBoards(orgId, token),
    enabled: !!token && !!orgId,
    staleTime: 60_000,
  })

  const boards: any[] = boardsData ?? []

  return (
    <div className="bg-white rounded-xl nice-shadow overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {t('boards.recent_boards', 'Son Panolar')}
          </h3>
          {boards.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                {boards.length} {t('boards.boards', 'Pano')}
              </span>
            </div>
          )}
        </div>
        <Link
          href="/dash/boards"
          className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t('dashboard.home.view_all', 'Tümünü Gör')} &rarr;
        </Link>
      </div>

      {isLoading ? (
        <div className="px-5 pb-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded w-40 mb-1.5" />
                <div className="h-2 bg-gray-50 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="px-5 pb-5">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-gray-100 mb-3">
              <Chalkboard
                size={20}
                weight="duotone"
                className="text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mb-3">{t('boards.no_boards', 'Henüz pano bulunmuyor')}</p>
            <Link
              href="/dash/boards?new=true"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700"
            >
              <PlusCircle size={14} weight="bold" />
              {t('boards.create_first_board', 'İlk panoyu oluşturun')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {boards.slice(0, 8).map((board: any) => {
            const thumbnail = board.thumbnail_image
              ? getBoardThumbnailMediaDirectory(
                  org.org_uuid,
                  board.board_uuid,
                  board.thumbnail_image
                )
              : null
            const updatedAt = board.update_date
              ? formatDate(board.update_date, i18n.language, {
                  dateStyle: undefined,
                  month: 'short',
                  day: 'numeric',
                })
              : null

            return (
              <Link
                key={board.board_uuid}
                prefetch={false}
                href={`/dash/boards/${board.board_uuid}/view`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-50 overflow-hidden shrink-0 flex items-center justify-center text-rose-500">
                  {thumbnail ? (
                    <SafeImage
                      src={thumbnail}
                      alt={board.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Chalkboard
                      size={18}
                      weight="duotone"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                    {board.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {updatedAt && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={10} />
                        {updatedAt}
                      </span>
                    )}
                    {board.member_count !== undefined && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Users size={10} />
                        {board.member_count} {t('dashboard.home.participants', 'katılımcı')}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    board.public !== false
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {board.public !== false ? t('dashboard.home.public', 'Genel') : 'Özel'}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
