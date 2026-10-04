'use client'

import React, { useState, useMemo } from 'react'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import TypeOfContentTitle from '@components/Objects/StyledElements/Titles/TypeOfContentTitle'
import { useOrg } from '@components/Contexts/OrgContext'
import { getBoardThumbnailMediaDirectory } from '@services/media/media'
import Link from 'next/link'
import { Search, X, Users, Star, Plus, Settings2, Save, Lock } from 'lucide-react'
import { ChalkboardSimple } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import FeatureGate from '@components/Dashboard/Shared/FeatureGate/FeatureGate'
import { searchMatchesAny } from '@/lib/search/normalize'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import CatalogPagination, { useCatalogPagination } from '@components/Objects/Catalog/CatalogPagination'
import { useFavoriteBoards } from '@/hooks/useFavoriteBoards'
import { flyStarToAcademicTrail } from '@/lib/animations/flyToTrail'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { createBoard, updateBoard, updateBoardShareSettings, getStoredCustomBoards } from '@services/boards/boards'
import BoardVisualCover from '@components/Boards/BoardVisualCover'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import toast from 'react-hot-toast'

interface BoardsPublicClientProps {
  orgslug: string
  org_id: number
  initialBoards: any[]
}

export default function BoardsPublicClient({
  orgslug,
  org_id,
  initialBoards,
}: BoardsPublicClientProps) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const router = useRouter()
  const { isAdmin } = useAdminStatus()
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const [boardsList, setBoardsList] = useState<any[]>(initialBoards || [])

  // Filter out private boards for public view
  const allBoards = useMemo(() => {
    return (boardsList || []).filter((board: any) => board.public !== false)
  }, [boardsList])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return allBoards
    return allBoards.filter((board: any) =>
      searchMatchesAny([board.name, board.description], searchQuery)
    )
  }, [allBoards, searchQuery])

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBoards,
    pageNumbers,
    goToPage,
    resetPage,
  } = useCatalogPagination(filteredBoards)

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, resetPage])

  React.useEffect(() => {
    const custom = getStoredCustomBoards(org_id || org?.id)
    if (custom.length > 0) {
      setBoardsList((prev) => {
        const uuids = new Set(prev.map((b) => b.board_uuid))
        const uniqueCustom = custom.filter((b) => !uuids.has(b.board_uuid))
        return [...uniqueCustom, ...prev]
      })
    }
    const handleUpdate = () => {
      const updated = getStoredCustomBoards(org_id || org?.id)
      setBoardsList((prev) => {
        const uuids = new Set(updated.map((b) => b.board_uuid))
        const base = prev.filter((b) => !uuids.has(b.board_uuid))
        return [...updated, ...base]
      })
    }
    window.addEventListener('oxonom_boards_updated', handleUpdate)
    return () => window.removeEventListener('oxonom_boards_updated', handleUpdate)
  }, [org_id, org?.id])

  // Create board modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createEffects, setCreateEffects] = useState(true)
  const [createChat, setCreateChat] = useState(true)
  const [createReactions, setCreateReactions] = useState(true)
  const [createRequiresPin, setCreateRequiresPin] = useState(false)
  const [createPin, setCreatePin] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit board features modal state
  const [editingBoard, setEditingBoard] = useState<any | null>(null)
  const [editEffects, setEditEffects] = useState(true)
  const [editChat, setEditChat] = useState(true)
  const [editReactions, setEditReactions] = useState(true)
  const [editRequiresPin, setEditRequiresPin] = useState(false)
  const [editPin, setEditPin] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const handleOpenEdit = (board: any) => {
    setEditingBoard(board)
    setEditEffects(board?.features?.effects_enabled !== false)
    setEditChat(board?.features?.chat_enabled !== false)
    setEditReactions(board?.features?.reactions_enabled !== false)
    const hasPin = Boolean(
      board?.share_type === 'code' ||
      board?.has_code ||
      board?.share_code ||
      board?.features?.requires_pin
    )
    setEditRequiresPin(hasPin)
    setEditPin(board?.share_code || board?.features?.pin || '')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBoard || !accessToken) return
    setSavingEdit(true)
    try {
      const cleanUuid = editingBoard.board_uuid.startsWith('board_')
        ? editingBoard.board_uuid
        : `board_${editingBoard.board_uuid}`
      const updatedFeatures = {
        effects_enabled: editEffects,
        chat_enabled: editChat,
        reactions_enabled: editReactions,
        requires_pin: editRequiresPin,
        pin: editRequiresPin && editPin.trim() ? editPin.trim() : null,
      }
      const shareType = editRequiresPin ? 'code' : 'public'
      const shareCode = editRequiresPin && editPin.trim() ? editPin.trim() : null

      await updateBoard(
        cleanUuid,
        {
          features: updatedFeatures,
          share_type: shareType,
        },
        accessToken
      )
      await updateBoardShareSettings(cleanUuid, shareType, shareCode, accessToken).catch(() => {})

      setBoardsList((prev) =>
        prev.map((b) =>
          b.board_uuid === editingBoard.board_uuid
            ? {
                ...b,
                features: updatedFeatures,
                share_type: shareType,
                share_code: shareCode,
                has_code: editRequiresPin,
              }
            : b
        )
      )
      toast.success('Pano ayarları ve şifre güncellendi!')
      setEditingBoard(null)
    } catch {
      toast.error('Ayarlar kaydedilirken hata oluştu.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return
    setCreating(true)
    try {
      const shareType = createRequiresPin ? 'code' : 'public'
      const shareCode = createRequiresPin && createPin.trim() ? createPin.trim() : null

      const res = await createBoard(
        org_id || org?.id || 1,
        {
          name: createName.trim(),
          description: createDesc.trim() || undefined,
          share_type: shareType,
          share_code: shareCode,
          features: {
            effects_enabled: createEffects,
            chat_enabled: createChat,
            reactions_enabled: createReactions,
            requires_pin: createRequiresPin,
            pin: shareCode,
          },
        },
        accessToken || ''
      )
      toast.success('Akıllı tahta başarıyla oluşturuldu!')
      setBoardsList((prev) => [res, ...prev.filter((b) => b.board_uuid !== res.board_uuid)])
      setCreateModalOpen(false)
      setCreateName('')
      setCreateDesc('')
      setCreateRequiresPin(false)
      setCreatePin('')
      const cleanUuid = (res?.board_uuid || '').replace('board_', '')
      if (cleanUuid) {
        router.push(`/board/${cleanUuid}`)
      }
    } catch {
      toast.error('Pano oluşturulurken bir hata meydana geldi.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <FeatureGate feature="boards" orgslug={orgslug} context="public">
      <div className="w-full">
        <GeneralWrapperStyled>
          <div className="flex flex-col space-y-2 mb-2">
            <div className="flex items-center justify-between">
              <TypeOfContentTitle title={t('common.boards')} type="board" />

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Yeni Akıllı Tahta</span>
                </button>
              )}
            </div>

            {/* Search */}
            {allBoards.length > 0 && (
              <div className="relative w-full sm:w-80 mb-4">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={t('boards.search_placeholder', 'Search boards...')}
                  placeholder={t('boards.search_placeholder', 'Search boards...')}
                  className="w-full ps-10 pe-10 py-2.5 bg-white nice-shadow rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 border-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-2 text-sm text-gray-500">
                {filteredBoards.length} {t('common.results', 'result')}
                {filteredBoards.length !== 1 ? 's' : ''} {t('common.for', 'for')} &quot;{searchQuery}&quot;
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedBoards.map((board: any) => (
                <PublicBoardCard
                  key={board.board_uuid}
                  board={board}
                  orgUuid={org?.org_uuid}
                  fromSearch={!!searchQuery.trim()}
                  isAdmin={isAdmin}
                  onEditFeatures={handleOpenEdit}
                />
              ))}

              {/* No search results */}
              {filteredBoards.length === 0 && searchQuery && (
                <div className="col-span-full flex flex-col justify-center items-center py-12 px-4">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">
                    {t('boards.no_search_results', 'No boards found')}
                  </h2>
                  <p className="text-gray-400">
                    {t('boards.try_different_search', 'Try a different search term')}
                  </p>
                </div>
              )}

              {/* Empty state */}
              {allBoards.length === 0 && !searchQuery && (
                <div className="col-span-full flex flex-col justify-center items-center py-12 px-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <div className="p-4 bg-white rounded-full nice-shadow mb-4">
                    <ChalkboardSimple size={32} className="text-gray-300" weight="fill" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-600 mb-2">
                    {t('boards.no_boards', 'No boards yet')}
                  </h1>
                  <p className="text-md text-gray-400 mb-6 text-center max-w-xs">
                    {t('boards.no_boards_description', 'There are no boards available in this organization yet.')}
                  </p>
                </div>
              )}
            </div>

            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={goToPage}
              previousLabel={t('pagination.previous')}
              nextLabel={t('pagination.next')}
              className="mt-8"
            />

            {totalPages > 1 && (
              <div className="mt-2 text-center text-sm text-gray-500">
                {t('pagination.showing_page', { current: currentPage, total: totalPages })}
              </div>
            )}
          </div>
        </GeneralWrapperStyled>
      </div>

      {/* Create Board Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[460px] bg-white border-neutral-200 text-neutral-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ChalkboardSimple size={22} weight="fill" className="text-indigo-600" />
              <span>Yeni Akıllı Tahta Oluştur</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Dersiniz veya etkinliğiniz için yeni bir etkileşimli akıllı tahta panosu başlatın.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBoard} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Tahta Adı *
              </label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Örn: 10-A Matematik: Fonksiyon Grafikleri"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Ders konusu, yönergeler veya hedefler..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Öğrenci & Etkileşim İzinleri
              </span>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={createEffects}
                  onChange={(e) => setCreateEffects(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800">🎭 Canlı Görsel Efektler</div>
                  <p className="text-[10px] text-neutral-500">Yangın, kar, matrix ve kutlama efektleri.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={createChat}
                  onChange={(e) => setCreateChat(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800">💬 Anlık Mesajlaşma (Chat)</div>
                  <p className="text-[10px] text-neutral-500">Öğrencilerin tahta içi anlık sohbet edebilmesi.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={createReactions}
                  onChange={(e) => setCreateReactions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800">😊 Emoji Tepkileri</div>
                  <p className="text-[10px] text-neutral-500">Ekranda canlı emoji tepkisi gönderme.</p>
                </div>
              </label>

              {/* PIN / Password protection */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createRequiresPin}
                    onChange={(e) => setCreateRequiresPin(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Lock size={12} className="text-amber-600" />
                      <span>Şifre / PIN Koruması Ekle</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Öğrenciler panoya katılmak için bu şifreyi girer.</p>
                  </div>
                </label>

                {createRequiresPin && (
                  <div className="mt-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Pano Katılım Şifresi (PIN) *
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={createPin}
                      onChange={(e) => setCreatePin(e.target.value)}
                      placeholder="Örn: 1234"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required={createRequiresPin}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creating || !createName.trim() || (createRequiresPin && !createPin.trim())}
                className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {creating ? 'Oluşturuluyor...' : 'Oluştur ve Panoyu Başlat'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Board Features Modal */}
      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-[440px] bg-white border-neutral-200 text-neutral-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              <span>Pano Özellikleri & Ayarları</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">{editingBoard?.name}</span> için öğrenci etkileşim ve şifre ayarları.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={editEffects}
                  onChange={(e) => setEditEffects(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800">🎭 Canlı Görsel Efektler</div>
                  <p className="text-[10px] text-neutral-500">Yangın, kar, matrix ve kutlama efektleri.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={editChat}
                  onChange={(e) => setEditChat(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800">💬 Anlık Mesajlaşma (Chat)</div>
                  <p className="text-[10px] text-neutral-500">Öğrencilerin tahta içi anlık mesajlaşması.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={editReactions}
                  onChange={(e) => setEditReactions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-neutral-800">😊 Emoji Tepkileri</div>
                  <p className="text-[10px] text-neutral-500">Ekranda canlı emoji tepkisi gönderme.</p>
                </div>
              </label>

              {/* Edit PIN Protection */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editRequiresPin}
                    onChange={(e) => setEditRequiresPin(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Lock size={12} className="text-amber-600" />
                      <span>Şifre / PIN Koruması</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Öğrenciler panoya katılmak için şifre girer.</p>
                  </div>
                </label>

                {editRequiresPin && (
                  <div className="mt-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Pano Katılım Şifresi (PIN)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value)}
                      placeholder="Örn: 1234"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required={editRequiresPin}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setEditingBoard(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingEdit ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FeatureGate>
  )
}

function PublicBoardCard({
  board,
  orgUuid,
  fromSearch,
  isAdmin,
  onEditFeatures,
}: {
  board: any
  orgUuid: string
  fromSearch: boolean
  isAdmin: boolean | null
  onEditFeatures: (_board: any) => void
}) {
  const { track } = useLHAnalytics('learner')
  const org = useOrg() as any
  const { isFavorite, toggleFavorite } = useFavoriteBoards(org?.id)
  const favorited = isFavorite(board.board_uuid)
  const hasCustomThumbnail = Boolean(board.thumbnail_image && board.thumbnail_image !== '/empty_thumbnail.png')
  const thumbnailImage = hasCustomThumbnail
    ? getBoardThumbnailMediaDirectory(orgUuid, board.board_uuid, board.thumbnail_image)
    : null
  const isLocked = Boolean(
    board.share_type === 'code' ||
    board.has_code ||
    board.share_code ||
    board.features?.requires_pin
  )

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const targetBtn = e.currentTarget
    const added = toggleFavorite(board)
    if (added) {
      flyStarToAcademicTrail(targetBtn)
      toast.success('Ders favorilerinize eklendi ⭐')
    } else {
      toast('Ders favorilerden çıkarıldı', { icon: '🗑️' })
    }
  }

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onEditFeatures(board)
  }

  return (
    <Link
      href={`/board/${board.board_uuid.replace('board_', '')}`}
      onClick={() => track(AnalyticsEvent.BoardOpened, { member_count: board.member_count, from_search: fromSearch })}
      className="group relative flex flex-col bg-white rounded-xl nice-shadow overflow-hidden w-full transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="block relative aspect-video overflow-hidden bg-gray-50">
        {hasCustomThumbnail && thumbnailImage ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${thumbnailImage})` }}
          />
        ) : (
          <BoardVisualCover
            board={board}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

        {/* Lock badge if board requires PIN */}
        {isLocked && (
          <div className="absolute bottom-2 start-2 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/95 text-white shadow-xs backdrop-blur-md flex items-center gap-1 border border-amber-400">
              <Lock size={10} /> PIN Korumalı
            </span>
          </div>
        )}

        {/* Action buttons on thumbnail */}
        <div className="absolute top-2 end-2 z-10 flex items-center gap-1.5">
          {isAdmin && (
            <button
              type="button"
              onClick={handleEditClick}
              aria-label="Pano Özellikleri"
              title="Pano Özellikleri (Efekt, Chat, Emoji)"
              className="p-1.5 rounded-full bg-white/90 text-neutral-600 hover:text-black hover:bg-white backdrop-blur-md transition-all shadow-xs cursor-pointer"
            >
              <Settings2 size={14} />
            </button>
          )}

          {/* Favorite Star Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorited ? 'Favorilerden Çıkar' : 'Favoriye Ekle'}
            title={favorited ? 'Favorilerden Çıkar' : 'Favoriye Ekle'}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer ${
              favorited
                ? 'bg-amber-400 text-white shadow-amber-500/30 ring-2 ring-white/50'
                : 'bg-white/80 text-gray-400 hover:text-amber-500 hover:bg-white'
            }`}
          >
            <Star size={14} className={favorited ? 'fill-white text-white' : ''} />
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col space-y-1.5">
        <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-1">
          {board.name}
        </h3>

        {board.description && (
          <p className="text-[11px] text-gray-500 line-clamp-2 min-h-[1.5rem]">
            {board.description}
          </p>
        )}

        <div className="pt-1.5 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            <Users size={12} />
            <span>{board.member_count} {board.member_count === 1 ? 'üye' : 'üye'}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-wider">
            Panoyu Aç
          </span>
        </div>
      </div>
    </Link>
  )
}
