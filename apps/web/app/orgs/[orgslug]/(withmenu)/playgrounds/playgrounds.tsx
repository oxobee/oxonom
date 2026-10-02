'use client'

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  X,
  Sparkles,
  Calculator,
  Languages,
  Microscope,
  Code2,
  Layers,
} from 'lucide-react'
import { Cube } from '@phosphor-icons/react'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import TypeOfContentTitle from '@components/Objects/StyledElements/Titles/TypeOfContentTitle'
import PlaygroundCard, { detectCategory } from '@components/Playground/PlaygroundCard'
import { Playground } from '@services/playgrounds/playgrounds'
import { useLHAnalytics } from '@services/analytics'
import FeatureGate from '@components/Dashboard/Shared/FeatureGate/FeatureGate'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { searchMatchesAny } from '@/lib/search/normalize'
import CatalogPagination, { useCatalogPagination } from '@components/Objects/Catalog/CatalogPagination'

interface PlaygroundsClientProps {
  orgslug: string
  org_id: number
  initialPlaygrounds: Playground[]
}

const CATEGORIES = [
  { id: 'all', labelTr: 'Tüm Modüller', labelEn: 'All Modules', icon: Layers },
  { id: 'grade1', labelTr: '1. Sınıf Temel Beceriler', labelEn: '1st Grade Essentials', icon: Sparkles },
  { id: 'math', labelTr: 'Matematik & Sayılar', labelEn: 'Math & Numbers', icon: Calculator },
  { id: 'turkish', labelTr: 'Türkçe & Okuma-Yazma', labelEn: 'Turkish & Reading', icon: Languages },
  { id: 'science', labelTr: 'Fen & Doğa', labelEn: 'Science & Nature', icon: Microscope },
  { id: 'coding', labelTr: 'Mantık & Kodlama', labelEn: 'Logic & Coding', icon: Code2 },
]

export default function PlaygroundsClient({
  orgslug,
  org_id,
  initialPlaygrounds,
}: PlaygroundsClientProps) {
  const { isAdmin: isUserAdmin, rights, canManageOrg } = useAdminStatus()
  const { track } = useLHAnalytics('learner')
  const { t, i18n } = useTranslation()
  const isTr = i18n.language?.startsWith('tr') !== false

  // Teachers/principals can activate/deactivate modules and assign to classes
  const canManageModule = Boolean(
    isUserAdmin ||
    canManageOrg ||
    rights?.dashboard?.action_access
  )

  const [playgrounds, setPlaygrounds] = useState<Playground[]>(initialPlaygrounds)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: playgrounds.length }
    playgrounds.forEach((pg) => {
      const cat = detectCategory(pg).key
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [playgrounds])

  // Filter playgrounds by search and category
  const filtered = useMemo(() => {
    return playgrounds.filter((pg) => {
      if (activeCategory !== 'all') {
        const cat = detectCategory(pg).key
        if (cat !== activeCategory) return false
      }

      if (searchQuery.trim()) {
        return searchMatchesAny([pg.name, pg.description], searchQuery)
      }

      return true
    })
  }, [playgrounds, searchQuery, activeCategory])

  const {
    paginatedItems: paginated,
    currentPage,
    totalPages,
    pageNumbers,
    goToPage,
  } = useCatalogPagination<Playground>(filtered, 12)

  return (
    <>
      <FeatureGate feature="playgrounds" orgslug={orgslug} context="public">
        <div className="w-full">
          <GeneralWrapperStyled>
            <div className="flex flex-col space-y-4 mb-4">
              
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <TypeOfContentTitle
                    title={isTr ? 'Etkileşimli Modüller' : t('common.playgrounds')}
                    type="pg"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {isTr
                      ? '1. sınıftan 12. sınıfa kadar tüm kademeler için interaktif ders ve beceri modülleri'
                      : 'Interactive learning and skill modules for all grade levels'}
                  </p>
                </div>
              </div>

              {/* Categorical Navigation Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isActive = activeCategory === cat.id
                  const count = categoryCounts[cat.id] || 0
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                      <span>{isTr ? cat.labelTr : cat.labelEn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Multilingual Search Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search playgrounds"
                    placeholder={
                      isTr
                        ? 'Modüllerde veya konularda ara... (örn: Sayma, Hece, 1. Sınıf)'
                        : t('playgrounds.search_placeholder', 'Search in modules or topics...')
                    }
                    className="w-full ps-10 pe-10 py-2 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-gray-200 transition-all placeholder:text-gray-400 font-medium"
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

                <div className="text-xs text-gray-500 font-medium px-2 shrink-0">
                  {filtered.length} {isTr ? 'modül listeleniyor' : 'modules listed'}
                </div>
              </div>

              {/* Grid of Modules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                {paginated.map((pg) => (
                  <PlaygroundCard
                    key={pg.playground_uuid}
                    playground={pg}
                    orgslug={orgslug}
                    canManage={canManageModule}
                  />
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full flex flex-col justify-center items-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/40 text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-3">
                      <Cube className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700 mb-1">
                      {searchQuery
                        ? isTr
                          ? `"${searchQuery}" ile eşleşen modül bulunamadı`
                          : `No modules found for "${searchQuery}"`
                        : isTr
                        ? 'Bu kategoride henüz modül bulunmuyor'
                        : 'No modules in this category yet'}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mb-4">
                      {isTr
                        ? 'Arama kriterinizi değiştirebilir veya tüm modülleri listeleyebilirsiniz.'
                        : 'Try adjusting your search criteria.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                onPageChange={goToPage}
                previousLabel={isTr ? 'Önceki' : 'Previous'}
                nextLabel={isTr ? 'Sonraki' : 'Next'}
                className="mt-8"
              />
            </div>
          </GeneralWrapperStyled>
        </div>
      </FeatureGate>
    </>
  )
}
