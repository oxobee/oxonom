'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { getBoard, getBoardPublicInfo, getBoardGuestAccess } from '@services/boards/boards'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import BoardCanvas from '@components/Dashboard/Boards/BoardCanvas'
import { useTrackView, AnalyticsEvent } from '@services/analytics'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface BoardCanvasClientProps {
  boardUuid: string
  accessToken?: string
  orgslug: string
  username: string
  isGuest?: boolean
}

export default function BoardCanvasClient({
  boardUuid,
  accessToken,
  orgslug,
  username,
  isGuest = false,
}: BoardCanvasClientProps) {
  const session = useLHSession() as any
  const sessionToken = accessToken || session?.data?.tokens?.access_token

  // Guest token & user state when accessing without login
  const [guestToken, setGuestToken] = useState<string | null>(null)
  const [guestName, setGuestName] = useState<string>('')
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [submittingPin, setSubmittingPin] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinVerified, setPinVerified] = useState(false)
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const token: string | undefined = sessionToken || guestToken || undefined
  const displayName =
    username || session?.data?.user?.username || session?.data?.user?.email || guestName || 'Misafir'

  // Fetch board public info unconditionally to detect PIN requirement & ownership
  const { data: publicInfo, isLoading: publicInfoLoading } = useQuery({
    queryKey: ['board-public-info', boardUuid],
    queryFn: () => getBoardPublicInfo(boardUuid),
    staleTime: 30_000,
  })

  const requiresPin = Boolean(publicInfo && (publicInfo.share_type === 'code' || publicInfo.has_code))
  const isOwner = Boolean(
    session?.data?.user?.is_superadmin ||
    (session?.data?.user?.id && publicInfo?.created_by && session.data.user.id === publicInfo.created_by)
  )

  // Strict check: if PIN is required and current user is not the owner/superadmin and has not verified PIN yet
  const mustEnterPin = requiresPin && !isOwner && !pinVerified

  // Auto-connect guest for public boards without PIN
  useEffect(() => {
    if (sessionToken || guestToken || !publicInfo) return

    if (!requiresPin) {
      getBoardGuestAccess(boardUuid)
        .then((res: any) => {
          if (res?.access_token) {
            setGuestToken(res.access_token)
            setGuestName(res.username || 'Misafir')
          }
        })
        .catch((err) => {
          console.error('Failed to get public guest access:', err)
        })
    }
  }, [publicInfo, requiresPin, sessionToken, guestToken, boardUuid])

  const handlePinChange = (index: number, val: string) => {
    setPinError(null)
    const cleaned = val.replace(/[^0-9]/g, '')
    const newDigits = [...pinDigits]
    newDigits[index] = cleaned.slice(-1)
    setPinDigits(newDigits)

    if (cleaned && index < 3) {
      pinInputRefs[index + 1].current?.focus()
    }

    // Auto submit if all 4 filled
    if (index === 3 && cleaned) {
      const fullPin = newDigits.join('')
      if (fullPin.length === 4) {
        submitPin(fullPin)
      }
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus()
    }
  }

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4)
    if (!pasted) return
    const newDigits = ['', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setPinDigits(newDigits)
    if (pasted.length === 4) {
      submitPin(pasted)
    } else {
      pinInputRefs[Math.min(pasted.length, 3)].current?.focus()
    }
  }

  const submitPin = async (pin?: string) => {
    const code = pin || pinDigits.join('')
    if (code.length < 4) {
      setPinError('Lütfen 4 haneli PIN kodunu eksiksiz girin.')
      return
    }

    setSubmittingPin(true)
    setPinError(null)
    try {
      const res = await getBoardGuestAccess(boardUuid, code)
      if (res?.access_token) {
        if (!sessionToken) {
          setGuestToken(res.access_token)
          setGuestName(res.username || 'Misafir')
        }
        setPinVerified(true)
        toast.success('Giriş başarılı! Tahta yükleniyor...')
      } else {
        throw new Error('Geçersiz erişim kodu')
      }
    } catch (err: any) {
      setPinError('Hatalı 4 haneli kod! Lütfen öğretmenden aldığınız kodu kontrol edin.')
      toast.error('Geçersiz kod!')
      setPinDigits(['', '', '', ''])
      pinInputRefs[0].current?.focus()
    } finally {
      setSubmittingPin(false)
    }
  }

  const canFetchBoard = !mustEnterPin && !publicInfoLoading && (Boolean(sessionToken) || Boolean(guestToken))
  const { data: board, isLoading: isBoardLoading, error: boardError } = useQuery({
    queryKey: queryKeys.boards.detail(boardUuid),
    queryFn: () => getBoard(boardUuid, token as string),
    enabled: canFetchBoard,
    staleTime: 60_000,
  })

  const { data: orgData } = useQuery({
    queryKey: queryKeys.org.detail(orgslug),
    queryFn: () => getOrganizationContextInfo(orgslug, null, token),
    enabled: !!orgslug && canFetchBoard,
    staleTime: 60_000,
  })

  useTrackView(
    AnalyticsEvent.BoardViewed,
    { is_public: board?.public ?? false },
    !isBoardLoading && !!board,
    'learner',
  )

  // PIN challenge screen for code-protected boards: STRICT BLOCK
  if (mustEnterPin && publicInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#121215] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            {publicInfo.name || 'Akıllı Tahta'}
          </h1>
          <p className="text-sm text-white/50 mb-6">
            Bu akıllı tahta 4 haneli PIN kodu ile korunmaktadır. Katılmak için öğretmeninizin paylaştığı kodu girin:
          </p>

          {/* 4-digit inputs */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePinPaste}>
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={pinInputRefs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(idx, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(idx, e)}
                className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border bg-black/40 text-white outline-none transition-all ${
                  pinError
                    ? 'border-red-500 ring-2 ring-red-500/30'
                    : digit
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-white/15 focus:border-white focus:ring-2 focus:ring-white/20'
                }`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-xs text-red-400 mb-4 font-medium animate-shake">
              {pinError}
            </p>
          )}

          <button
            onClick={() => submitPin()}
            disabled={submittingPin || pinDigits.some((d) => !d)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {submittingPin ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Tahtaya Katıl</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="mt-5 text-[11px] text-white/30 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
            <span>Kayıt veya şifre gerekmez, doğrudan katılabilirsiniz.</span>
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!token || isBoardLoading || publicInfoLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#f8f8f8] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        <span className="text-xs text-neutral-400 font-medium">Akıllı tahta yükleniyor...</span>
      </div>
    )
  }

  // Error state
  if (boardError || !board) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f8f8]">
        <p className="text-gray-500">Pano bulunamadı veya erişim reddedildi.</p>
      </div>
    )
  }

  return (
    <BoardCanvas
      board={board}
      accessToken={token}
      orgslug={orgslug}
      username={displayName}
      orgUuid={orgData?.org_uuid || ''}
    />
  )
}
