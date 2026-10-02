'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Cursor,
  Hand,
  PencilSimple,
  Square,
  YoutubeLogo,
  Code,
  Globe,
  Smiley,
  Note,
  FrameCorners,
  ArrowCounterClockwise,
  ArrowClockwise,
  CheckSquare,
  Headphones,
  Cube,
  DotsThreeCircle,
  X,
  Palette,
} from '@phosphor-icons/react'
import { DividerVerticalIcon } from '@radix-ui/react-icons'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/core'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'

type ToolMode = 'select' | 'pan' | 'draw' | 'card' | 'youtube' | 'modules' | 'embed' | 'webpage' | 'sticker' | 'frame' | 'note' | 'todo' | 'podcast'

interface BoardToolbarProps {
  toolMode: ToolMode
  onToolModeChange: (mode: ToolMode) => void
  editor: Editor
  drawColor: string
  drawWidth: number
  onDrawColorChange: (color: string) => void
  onDrawWidthChange: (width: number) => void
}

const DRAW_COLORS = [
  '#000000', '#EF4444', '#3B82F6', '#22C55E',
  '#F97316', '#A855F7', '#EC4899', '#9CA3AF',
]

const DRAW_WIDTHS = [
  { label: 'boards.toolbar.thin', value: 1 },
  { label: 'boards.toolbar.medium', value: 3 },
  { label: 'boards.toolbar.thick', value: 6 },
]

const tools = [
  { mode: 'select' as const, icon: Cursor, label: 'boards.toolbar.select', colorClass: '', category: 'basic' },
  { mode: 'pan' as const, icon: Hand, label: 'boards.toolbar.pan', colorClass: '', category: 'basic' },
  { mode: 'draw' as const, icon: PencilSimple, label: 'boards.toolbar.draw', colorClass: 'editor-tool-btn-interactive', category: 'basic' },
  { mode: 'card' as const, icon: Square, label: 'boards.toolbar.add_card', colorClass: 'editor-tool-btn-info', category: 'content' },
  { mode: 'note' as const, icon: Note, label: 'boards.toolbar.note', colorClass: 'editor-tool-btn-warning', category: 'content' },
  { mode: 'frame' as const, icon: FrameCorners, label: 'boards.toolbar.frame', colorClass: 'editor-tool-btn-info', category: 'content' },
  { mode: 'todo' as const, icon: CheckSquare, label: 'boards.toolbar.todo', colorClass: 'editor-tool-btn-info', category: 'content' },
  { mode: 'modules' as const, icon: Cube, label: 'boards.toolbar.modules', colorClass: 'editor-tool-btn-tip', category: 'interactive' },
  { mode: 'sticker' as const, icon: Smiley, label: 'boards.toolbar.sticker', colorClass: 'editor-tool-btn-warning', category: 'interactive' },
  { mode: 'youtube' as const, icon: YoutubeLogo, label: 'boards.toolbar.youtube', colorClass: 'editor-tool-btn-interactive', category: 'interactive' },
  { mode: 'webpage' as const, icon: Globe, label: 'boards.toolbar.webpage', colorClass: 'editor-tool-btn-info', category: 'interactive' },
  { mode: 'embed' as const, icon: Code, label: 'boards.toolbar.embed', colorClass: 'editor-tool-btn-interactive', category: 'interactive' },
  { mode: 'podcast' as const, icon: Headphones, label: 'boards.toolbar.podcast', colorClass: 'editor-tool-btn-tip', category: 'interactive' },
]

export default function BoardToolbar({
  toolMode,
  onToolModeChange,
  editor,
  drawColor,
  drawWidth,
  onDrawColorChange,
  onDrawWidthChange,
}: BoardToolbarProps) {
  const { t } = useTranslation()
  const [drawPopoverOpen, setDrawPopoverOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [toolbarScale, setToolbarScale] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('board-toolbar-scale') || '1')
    }
    return 1
  })

  const handleScaleChange = (scale: number) => {
    setToolbarScale(scale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('board-toolbar-scale', scale.toString())
    }
  }

  const activeToolObj = tools.find((t) => t.mode === toolMode) || tools[0]
  const ActiveIcon = activeToolObj.icon

  return (
    <>
      {/* ─── DESKTOP TOOLBAR ────────────────────────────────────────────── */}
      <div
        className="hidden md:flex absolute bottom-5 left-1/2 z-20 items-center gap-[7px] rounded-[15px] px-3 py-2.5 nice-shadow board-enter-toolbar"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          ['--toolbar-scale' as any]: toolbarScale,
          transform: `translateX(-50%) scale(${toolbarScale})`,
          transformOrigin: 'bottom center',
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {/* Logo */}
        <Link href="/dash/boards">
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

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.5' }} />

        {/* Tool modes */}
        {tools.map(({ mode, icon: Icon, label, colorClass }) => {
          if (mode === 'draw') {
            return (
              <Popover.Root
                key={mode}
                open={drawPopoverOpen}
                onOpenChange={setDrawPopoverOpen}
              >
                <ToolTip content={t(label)}>
                  <Popover.Trigger asChild>
                    <div
                      onClick={() => {
                        onToolModeChange('draw')
                        setDrawPopoverOpen(true)
                      }}
                      className={cn(
                        'editor-tool-btn',
                        toolMode === 'draw' ? 'is-active' : colorClass
                      )}
                    >
                      <Icon size={15} weight="duotone" />
                    </div>
                  </Popover.Trigger>
                </ToolTip>

                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    sideOffset={12}
                    className="rounded-xl px-3 py-2.5 nice-shadow z-50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.97)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    {/* Color palette */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {DRAW_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => onDrawColorChange(color)}
                          className={cn(
                            'w-5 h-5 rounded-full border-2 transition-all hover:scale-110',
                            drawColor === color
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-neutral-200'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {/* Stroke width */}
                    <div className="flex items-center gap-1.5">
                      {DRAW_WIDTHS.map(({ label: wLabel, value }) => (
                        <button
                          key={value}
                          onClick={() => onDrawWidthChange(value)}
                          className={cn(
                            'flex items-center justify-center h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors',
                            drawWidth === value
                              ? 'bg-neutral-800 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          )}
                        >
                          <svg width="18" height="12" viewBox="0 0 18 12" className="me-1">
                            <line
                              x1="0" y1="6"
                              x2="18"
                              y2="6"
                              stroke="currentColor"
                              strokeWidth={value}
                              strokeLinecap="round"
                            />
                          </svg>
                          {t(wLabel)}
                        </button>
                      ))}
                    </div>
                    <Popover.Arrow
                      className="fill-white"
                      width={10}
                      height={5}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            )
          }

          return (
            <ToolTip key={mode} content={t(label)}>
              <div
                onClick={() => onToolModeChange(mode)}
                className={cn(
                  'editor-tool-btn',
                  toolMode === mode ? 'is-active' : colorClass
                )}
              >
                <Icon size={15} weight="duotone" />
              </div>
            </ToolTip>
          )
        })}

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.5' }} />

        {/* Undo/Redo */}
        <ToolTip content={t('boards.toolbar.undo')}>
          <div
            onClick={() => editor.chain().focus().undo().run()}
            className={cn('editor-tool-btn', !editor.can().undo() && 'opacity-30 pointer-events-none')}
          >
            <ArrowCounterClockwise size={15} weight="duotone" />
          </div>
        </ToolTip>
        <ToolTip content={t('boards.toolbar.redo')}>
          <div
            onClick={() => editor.chain().focus().redo().run()}
            className={cn('editor-tool-btn', !editor.can().redo() && 'opacity-30 pointer-events-none')}
          >
            <ArrowClockwise size={15} weight="duotone" />
          </div>
        </ToolTip>

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.5' }} />

        {/* Size controls */}
        <div className="flex items-center gap-1 bg-neutral-100/70 rounded-lg p-0.5">
          {[
            { label: 'S', value: 0.85 },
            { label: 'M', value: 1.0 },
            { label: 'L', value: 1.15 }
          ].map((size) => (
            <button
              key={size.label}
              type="button"
              onClick={() => handleScaleChange(size.value)}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer',
                Math.abs(toolbarScale - size.value) < 0.05
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MOBILE DOCK (COMPACT & ANIMATED) ────────────────────────────── */}
      <div className="flex md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-neutral-200/80 max-w-[95vw]">
        {/* Active Tool Badge */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold shrink-0"
        >
          <ActiveIcon size={16} weight="duotone" className="text-amber-400" />
          <span className="capitalize">{activeToolObj.mode}</span>
        </button>

        {/* Quick Shortcut: Draw */}
        <button
          type="button"
          onClick={() => onToolModeChange('draw')}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0',
            toolMode === 'draw' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500' : 'text-neutral-600 hover:bg-neutral-100'
          )}
        >
          <PencilSimple size={18} weight="duotone" />
        </button>

        {/* Quick Shortcut: Note */}
        <button
          type="button"
          onClick={() => onToolModeChange('note')}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0',
            toolMode === 'note' ? 'bg-amber-50 text-amber-600 ring-2 ring-amber-500' : 'text-neutral-600 hover:bg-neutral-100'
          )}
        >
          <Note size={18} weight="duotone" />
        </button>

        {/* Quick Shortcut: Modules */}
        <button
          type="button"
          onClick={() => onToolModeChange('modules')}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0',
            toolMode === 'modules' ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500' : 'text-neutral-600 hover:bg-neutral-100'
          )}
        >
          <Cube size={18} weight="duotone" />
        </button>

        <div className="w-px h-6 bg-neutral-200 shrink-0" />

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-600 disabled:opacity-30 shrink-0"
        >
          <ArrowCounterClockwise size={16} weight="duotone" />
        </button>

        {/* Expand Drawer Button */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors shrink-0"
        >
          <DotsThreeCircle size={18} weight="fill" />
          <span>Araçlar</span>
        </button>
      </div>

      {/* ─── MOBILE DRAWER (ANIMATED FULL TOOL PALETTE) ───────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full bg-white rounded-t-3xl p-5 shadow-2xl border-t border-neutral-200 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Cube size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 leading-tight">Akıllı Tahta Araçları</h3>
                  <p className="text-[11px] text-neutral-400">Kullanmak istediğiniz aracı seçin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Drawing Color & Size Bar (if Draw is active or selected) */}
            {toolMode === 'draw' && (
              <div className="my-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette size={14} />
                  <span>Çizim Rengi ve Kalınlığı</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {DRAW_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onDrawColorChange(c)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform shrink-0',
                        drawColor === c ? 'scale-110 ring-2 ring-blue-500' : ''
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200/60">
                  {DRAW_WIDTHS.map(({ label: wLabel, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onDrawWidthChange(value)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        drawWidth === value ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'
                      )}
                    >
                      {t(wLabel)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorized Tools Grid */}
            <div className="space-y-4 py-2">
              {/* Category 1: Temel */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Temel Çizim & Hareket
                </span>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {tools.filter(t => t.category === 'basic').map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        onToolModeChange(mode)
                        setMobileDrawerOpen(false)
                      }}
                      className={cn(
                        'min-h-[50px] p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                        toolMode === mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <Icon size={20} weight={toolMode === mode ? 'fill' : 'duotone'} />
                      <span className="text-[11px] leading-tight line-clamp-1">{t(label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 2: İçerik */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Kartlar & Notlar
                </span>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {tools.filter(t => t.category === 'content').map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        onToolModeChange(mode)
                        setMobileDrawerOpen(false)
                      }}
                      className={cn(
                        'min-h-[50px] p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                        toolMode === mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <Icon size={20} weight={toolMode === mode ? 'fill' : 'duotone'} />
                      <span className="text-[11px] leading-tight line-clamp-1">{t(label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 3: Etkileşim & Medya */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Etkileşimli Modüller & Medya
                </span>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {tools.filter(t => t.category === 'interactive').map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        onToolModeChange(mode)
                        setMobileDrawerOpen(false)
                      }}
                      className={cn(
                        'min-h-[52px] p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                        toolMode === mode
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <Icon size={22} weight={toolMode === mode ? 'fill' : 'duotone'} className={mode === 'modules' ? 'text-emerald-600' : ''} />
                      <span className="text-[11px] leading-tight line-clamp-1">{t(label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">Boyut:</span>
                {[
                  { label: 'S', value: 0.85 },
                  { label: 'M', value: 1.0 },
                  { label: 'L', value: 1.15 }
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleScaleChange(s.value)}
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-bold transition-all',
                      Math.abs(toolbarScale - s.value) < 0.05
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold disabled:opacity-30"
                >
                  Geri Al
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold disabled:opacity-30"
                >
                  Yinele
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
