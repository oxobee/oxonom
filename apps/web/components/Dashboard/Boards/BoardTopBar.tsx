'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Settings2, Save } from 'lucide-react'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import { getUriWithOrg } from '@services/config/config'
import { updateBoard } from '@services/boards/boards'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import useAdminStatus from '@components/Hooks/useAdminStatus'

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
  const queryClient = useQueryClient()
  const { isStudent, canManageOrg, isTeacher, isAdmin } = useAdminStatus()
  const canEditBoard = !isStudent && (canManageOrg || isTeacher || isAdmin)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [effectsEnabled, setEffectsEnabled] = useState(
    board?.features?.effects_enabled !== false
  )
  const [chatEnabled, setChatEnabled] = useState(
    board?.features?.chat_enabled !== false
  )
  const [reactionsEnabled, setReactionsEnabled] = useState(
    board?.features?.reactions_enabled !== false
  )
  const [saving, setSaving] = useState(false)

  const handleOpenSettings = () => {
    if (board?.features) {
      setEffectsEnabled(board.features.effects_enabled !== false)
      setChatEnabled(board.features.chat_enabled !== false)
      setReactionsEnabled(board.features.reactions_enabled !== false)
    }
    setSettingsOpen(true)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!board?.board_uuid || !accessToken) {
      toast.error('Yetkilendirme hatası veya pano bulunamadı')
      return
    }

    setSaving(true)
    try {
      const updatedFeatures = {
        effects_enabled: effectsEnabled,
        chat_enabled: chatEnabled,
        reactions_enabled: reactionsEnabled,
      }
      await updateBoard(
        board.board_uuid,
        { features: updatedFeatures },
        accessToken
      )

      if (board.features) {
        board.features.effects_enabled = effectsEnabled
        board.features.chat_enabled = chatEnabled
        board.features.reactions_enabled = reactionsEnabled
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.detail(board.board_uuid),
      })
      toast.success('Pano özellikleri güncellendi!')
      setSettingsOpen(false)
    } catch (err) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

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
            <Link href={getUriWithOrg(orgslug, '/boards')}>
              <div className="editor-tool-btn">
                <ArrowLeft size={15} />
              </div>
            </Link>
          </ToolTip>

          <Link href={getUriWithOrg(orgslug, '/boards')}>
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

          <span className="text-sm font-bold text-neutral-800 truncate max-w-[220px] sm:max-w-[340px] md:max-w-[460px]">
            {boardName}
          </span>

          {(board?.is_demo || board?.board_uuid?.startsWith('board_')) && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              MEB Demo
            </span>
          )}

          {accessToken && canEditBoard && (
            <ToolTip content="Pano Ayarları (Efekt, Chat, Emoji)">
              <button
                type="button"
                onClick={handleOpenSettings}
                className="editor-tool-btn text-neutral-600 hover:text-black ms-1 cursor-pointer"
                title="Pano Ayarları"
              >
                <Settings2 size={15} />
              </button>
            </ToolTip>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white border-neutral-200 text-neutral-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-neutral-900">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              <span>Akıllı Tahta Özellikleri</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Bu panoda öğrencilerin ve katılımcıların kullanabileceği canlı etkileşim özelliklerini yönetin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSettings} className="space-y-4 py-3">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200/80 hover:bg-neutral-50/80 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={effectsEnabled}
                  onChange={(e) => setEffectsEnabled(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <span>🎭 Canlı Görsel Efektler</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Yangın, kar, matrix, konfeti gibi tam ekran parti ve kutlama efektleri.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200/80 hover:bg-neutral-50/80 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={chatEnabled}
                  onChange={(e) => setChatEnabled(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <span>💬 Canlı Mesajlaşma (Chat)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Katılımcıların tahta üzerinde anlık uçucu mesajlar gönderebilmesi.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200/80 hover:bg-neutral-50/80 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={reactionsEnabled}
                  onChange={(e) => setReactionsEnabled(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <span>😊 Emoji Tepkileri (Reactions)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Ekranda uçuşan emoji tepkileri gönderebilme.
                  </p>
                </div>
              </label>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save size={13} />
                <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
