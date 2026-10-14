'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Tv, Copy, Check } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import { getUriWithOrg } from '@services/config/config'
import toast from 'react-hot-toast'

interface BoardTopBarProps {
  boardName: string
  orgslug: string
  board?: any
  accessToken?: string
}

export default function BoardTopBar({
  boardName,
  orgslug,
  board,
  accessToken,
}: BoardTopBarProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [isInIframe, setIsInIframe] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setIsInIframe(true)
      }
    } catch (_) {
      setIsInIframe(true)
    }

    if (typeof window !== 'undefined') {
      const check = () => {
        setIsMobile(
          window.innerWidth <= 1024 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(navigator.userAgent)
        )
      }
      check()
      window.addEventListener('resize', check)
      return () => window.removeEventListener('resize', check)
    }
  }, [])

  const [copiedId, setCopiedId] = useState(false)

  // Determine distinct Board ID
  const boardId =
    board?.code ||
    (board?.board_uuid?.includes('9a') || board?.board_uuid?.includes('demo') ? 'PANO-9A' : null) ||
    (board?.board_uuid?.includes('9b') ? 'PANO-9B' : null) ||
    (board?.board_uuid ? `TAHTA-${board.board_uuid.replace('board_', '').slice(0, 6).toUpperCase()}` : 'TAHTA-901')

  useEffect(() => {
    if (typeof window !== 'undefined' && boardId) {
      try {
        const raw = localStorage.getItem('oxonom_active_boards')
        const current = raw ? JSON.parse(raw) : []
        const filtered = current.filter((b: any) => b.id !== boardId)
        filtered.unshift({
          id: boardId,
          name: boardName || 'Akıllı Tahta',
          classroom: board?.classroom || '9/A Şubesi',
          activeAt: Date.now(),
        })
        localStorage.setItem('oxonom_active_boards', JSON.stringify(filtered.slice(0, 10)))
      } catch (_) {}
    }
  }, [boardId, boardName, board])

  const handleCopyBoardId = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(boardId)
      setCopiedId(true)
      toast.success(`🖥️ Tahta ID (${boardId}) panoya kopyalandı!`)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const isPanoWindow =
    searchParams?.get('chrome') === 'none' ||
    searchParams?.get('isPano') === '1' ||
    isInIframe

  // If opened inside Pano window, hide the top bar pill as requested
  if (isPanoWindow) {
    return null
  }

  const backHref = isMobile ? '/m-boards' : getUriWithOrg(orgslug, '/boards')

  return (
    <>
      <div className="absolute top-4 start-4 z-20 pointer-events-none board-backbar">
        {/* Left group: back + logo + title + settings */}
        <div
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 nice-shadow pointer-events-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <ToolTip content={t('boards.back_to_boards')}>
            <Link href={backHref}>
              <div className="editor-tool-btn">
                <ArrowLeft size={15} />
              </div>
            </Link>
          </ToolTip>

          <Link href={backHref}>
            <div className="bg-black rounded-md w-[25px] h-[25px] flex items-center justify-center hover:opacity-80 transition-opacity">
              <Image
                src="/lrn.svg"
                alt="LearnHouse"
                width={14}
                height={14}
                className="invert"
              />
            </div>
          </Link>

          <span className="text-sm font-bold text-neutral-800 truncate max-w-[120px] sm:max-w-[260px] md:max-w-[460px]">
            {boardName}
          </span>

          {/* Board ID Badge for pairing and content dispatch */}
          <div
            onClick={handleCopyBoardId}
            title="Akıllı Tahta ID Numarası. Tıklayarak kopyalayabilir, öğretmen panelinden içerik gönderebilirsiniz."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/90 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-black tracking-wide cursor-pointer hover:bg-teal-100 transition-colors shadow-xs"
          >
            <Tv size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-extrabold">Tahta ID:</span>
            <span className="text-teal-900 dark:text-teal-200 underline decoration-teal-400 underline-offset-2">{boardId}</span>
            <span className="text-teal-500 hover:text-teal-700 ml-0.5">
              {copiedId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </span>
          </div>

          {(board?.is_demo || board?.board_uuid?.startsWith('board_')) && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              MEB Demo
            </span>
          )}

        </div>
      </div>
    </>
  )
}
