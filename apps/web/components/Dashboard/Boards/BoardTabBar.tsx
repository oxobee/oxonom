'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, Edit3, Layout, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BoardTab {
  id: string
  title: string
  createdAt?: number
}

interface BoardTabBarProps {
  tabs: BoardTab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: (title: string) => void
  onRenameTab: (id: string, newTitle: string) => void
  onDeleteTab: (id: string) => void
  readOnly?: boolean
}

export default function BoardTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onRenameTab,
  onDeleteTab,
  readOnly,
}: BoardTabBarProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTabName, setNewTabName] = useState('')
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus()
    }
  }, [isAdding])

  useEffect(() => {
    if (editingTabId) {
      editInputRef.current?.focus()
    }
  }, [editingTabId])

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newTabName.trim()
    if (trimmed) {
      onAddTab(trimmed)
      setNewTabName('')
      setIsAdding(false)
    }
  }

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault()
    const trimmed = editName.trim()
    if (trimmed) {
      onRenameTab(id, trimmed)
    }
    setEditingTabId(null)
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-2xl nice-shadow pointer-events-auto border border-gray-200/80 max-w-full overflow-x-auto no-scrollbar"
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-1 shrink-0 text-gray-400 ps-1 pe-1.5">
        <Layout size={13} className="text-indigo-600" />
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
          Sayfalar
        </span>
      </div>

      <div className="h-4 w-px bg-gray-200 shrink-0" />

      {/* Tab Pills */}
      <div className="flex items-center gap-1 shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isEditing = editingTabId === tab.id

          if (isEditing) {
            return (
              <form
                key={tab.id}
                onSubmit={(e) => handleRenameSubmit(e, tab.id)}
                className="flex items-center shrink-0"
              >
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={(e) => handleRenameSubmit(e, tab.id)}
                  className="px-2.5 py-1 text-xs font-bold rounded-xl border border-indigo-500 bg-white text-gray-900 outline-none w-28 shadow-xs"
                />
              </form>
            )
          }

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onDoubleClick={() => {
                setEditingTabId(tab.id)
                setEditName(tab.title)
              }}
              className={cn(
                'group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0',
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-100/90 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
              )}
            >
              <span className="truncate max-w-[120px]">{tab.title}</span>

              {/* Actions on hover */}
              {!readOnly && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTabId(tab.id)
                      setEditName(tab.title)
                    }}
                    className="p-0.5 hover:text-amber-300 rounded"
                    title="Sayfa Adını Değiştir"
                  >
                    <Edit3 size={10} />
                  </button>

                  {tabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`"${tab.title}" sayfasını silmek istediğinize emin misiniz?`)) {
                          onDeleteTab(tab.id)
                        }
                      }}
                      className="p-0.5 hover:text-rose-400 rounded"
                      title="Sayfayı Sil"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Tab (+) Button / Form */}
      {!readOnly && (
        isAdding ? (
          <form onSubmit={handleCreateSubmit} className="flex items-center gap-1 shrink-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="Sayfa adı..."
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-xl border border-indigo-400 bg-white text-gray-900 outline-none w-28 shadow-xs"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewTabName('')
              }}
              className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={12} />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true)
              setNewTabName(`Sayfa ${tabs.length + 1}`)
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Yeni Sayfa Ekle"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Yeni Sayfa</span>
          </button>
        )
      )}
    </div>
  )
}
