'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { FeedbackModal } from '@components/Objects/Modals/FeedbackModal'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { getCollabUrl } from '@services/config/config'
import { getDemoBoardInitialContent } from '@services/demo/demoBoardContents'
import BoardToolbar from './BoardToolbar'
import BoardTopBar from './BoardTopBar'
import BoardTopRight from './BoardTopRight'
import BoardZoomControls from './BoardZoomControls'
import EphemeralChat from './EphemeralChat'
import BoardEffects from './BoardEffects'
import { BoardCardExtension } from './Extensions/BoardCard'
import { DrawingStrokeExtension } from './Extensions/DrawingStroke'
import { YouTubeBlockExtension } from './Extensions/YouTubeBlock'
import { PlaygroundBlockExtension } from './Extensions/PlaygroundBlock'
import { ActivityBlockExtension } from './Extensions/ActivityBlock'
import { EmbedBlockExtension } from './Extensions/EmbedBlock'
import { WebpageBlockExtension } from './Extensions/WebpageBlock'
import { StickerBlockExtension } from './Extensions/StickerBlock'
import { FrameBoxExtension } from './Extensions/FrameBox'
import { NoteBlockExtension } from './Extensions/NoteBlock'
import { TodoBlockExtension } from './Extensions/TodoBlock'
import { PodcastBlockExtension } from './Extensions/PodcastBlock'
import RemoteCursors from './RemoteCursors'
import {
  Square,
  YoutubeLogo,
  Sparkle,
  BookOpen,
  Code,
  Globe,
  Smiley,
  Note,
  FrameCorners,
  CheckSquare,
  Headphones,
  PencilSimple,
  Cube,
} from '@phosphor-icons/react'
import { Extension } from '@tiptap/core'
import { BoardYjsProvider } from './BoardYjsContext'
import { BoardSelectionProvider } from './BoardSelectionContext'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'


interface BoardCanvasProps {
  board: any
  accessToken: string
  orgslug: string
  username: string
  orgUuid?: string
}

const COLORS = [
  '#958DF1', '#F98181', '#FBBC88', '#FAF594',
  '#70CFF8', '#94FADB', '#B9F18D', '#C3A8F0',
]

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function pointsToSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const mx = (prev.x + curr.x) / 2
    const my = (prev.y + curr.y) / 2
    d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

/** Inner component — only mounted once ydoc & provider are ready */
function BoardEditorInner({
  board,
  orgslug,
  username,
  accessToken,
  orgUuid,
  ydoc,
  provider,
}: {
  board: any
  orgslug: string
  username: string
  accessToken: string
  orgUuid?: string
  ydoc: Y.Doc
  provider: HocuspocusProvider
}) {
  const { track } = useLHAnalytics('dashboard')
  const [toolMode, setToolMode] = useState<'select' | 'pan' | 'draw' | 'card' | 'youtube' | 'modules' | 'embed' | 'webpage' | 'sticker' | 'frame' | 'note' | 'todo' | 'podcast'>('select')
  const [zoom, setZoom] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.6 : 1
  )
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [drawColor, setDrawColor] = useState('#000000')
  const [drawWidth, setDrawWidth] = useState(2)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const isDrawingRef = useRef(false)
  const panRef = useRef(pan)
  panRef.current = pan
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const tapCandidateRef = useRef<{ clientX: number; clientY: number; time: number } | null>(null)
  const drawPointsRef = useRef<{ x: number; y: number }[]>([])
  const [drawingPath, setDrawingPath] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const panRafRef = useRef(0)
  const prevToolModeRef = useRef<typeof toolMode | null>(null)
  const toolModeRef = useRef(toolMode)
  useEffect(() => {
    toolModeRef.current = toolMode
  }, [toolMode])
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Multi-select state
  const [selectedPositions, setSelectedPositions] = useState<Set<number>>(new Set())
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null)
  const marqueeRef = useRef<typeof marquee>(null)

  // Placement tool indicator config
  const placementTools: Partial<Record<typeof toolMode, { icon: React.ComponentType<any>; label: string }>> = {
    draw: { icon: PencilSimple, label: 'Draw' },
    card: { icon: Square, label: 'Card' },
    youtube: { icon: YoutubeLogo, label: 'YouTube' },
    embed: { icon: Code, label: 'Embed' },
    webpage: { icon: Globe, label: 'Webpage' },
    note: { icon: Note, label: 'Note' },
    sticker: { icon: Smiley, label: 'Sticker' },
    frame: { icon: FrameCorners, label: 'Frame' },
    todo: { icon: CheckSquare, label: 'Todo' },
    podcast: { icon: Headphones, label: 'Podcast' },
    modules: { icon: Cube, label: 'Modüller' },
  }
  const activePlacement = placementTools[toolMode] ?? null

  // Clear stale mouse position when leaving a placement tool.
  // Resets a piece of UI state once when the placement mode turns off; it cannot
  // loop because the only dependency (activePlacement) does not derive from mousePos.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!activePlacement) setMousePos(null)
  }, [activePlacement])

  const userColor = useMemo(() => getRandomColor(), [])
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // Set user info on awareness (for RemoteCursors and PresenceAvatars)
  useEffect(() => {
    if (provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        name: username,
        color: userColor,
      })
    }
  }, [provider, username, userColor])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false, // Yjs handles undo/redo
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      Extension.create({
        name: 'boardContext',
        addStorage() {
          return {
            accessToken,
            boardUuid: board.board_uuid,
            boardName: board.name || 'Board',
            orgslug,
            orgUuid: orgUuid || '',
            username,
          }
        },
      }),
      BoardCardExtension,
      DrawingStrokeExtension,
      YouTubeBlockExtension,
      PlaygroundBlockExtension,
      ActivityBlockExtension,
      EmbedBlockExtension,
      WebpageBlockExtension,
      StickerBlockExtension,
      FrameBoxExtension,
      NoteBlockExtension,
      TodoBlockExtension,
      PodcastBlockExtension,
    ],
    immediatelyRender: false,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'board-editor outline-none min-h-[2000px] min-w-[3000px] relative',
        // The canvas coordinate space is dir="ltr" in every locale. Cards store
        // absolute left/top pixels in the Yjs doc, and those coordinates are
        // shared live between collaborators — mirroring the canvas for an RTL
        // client would put its cards somewhere else than everyone else sees.
        // Card *text* still follows its own direction via dir="auto".
        dir: 'ltr',
      },
      // Block free-floating text at the canvas root — typing must happen inside
      // a card or note. Without this, a click on empty canvas lets ProseMirror
      // insert text into the root paragraph, which renders "on the map".
      handleTextInput(view) {
        const { $from } = view.state.selection
        for (let d = $from.depth; d > 0; d--) {
          const name = $from.node(d).type.name
          if (name === 'boardCard' || name === 'noteBlock') return false
        }
        return true
      },
      handleKeyDown(view, event) {
        if (event.key !== 'Enter') return false
        const { $from } = view.state.selection
        for (let d = $from.depth; d > 0; d--) {
          const name = $from.node(d).type.name
          if (name === 'boardCard' || name === 'noteBlock') return false
        }
        event.preventDefault()
        return true
      },
    },
  })

  // Seed demo board content if document is empty
  useEffect(() => {
    if (!editor) return

    const timer = setTimeout(() => {
      const doc = editor.state.doc
      const isEmpty =
        doc.childCount === 0 ||
        (doc.childCount === 1 &&
          doc.firstChild?.type.name === 'paragraph' &&
          doc.firstChild?.content.size === 0)

      if (isEmpty) {
        const initial = getDemoBoardInitialContent(board)
        if (initial && initial.content && initial.content.length > 0) {
          editor.commands.setContent(initial)
        }
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [editor, board])

  // Persist local edits to localStorage for seamless offline & demo experience
  useEffect(() => {
    if (!ydoc || !board?.board_uuid) return
    const handler = () => {
      try {
        const update = Y.encodeStateAsUpdate(ydoc)
        let binary = ''
        const len = update.byteLength
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(update[i])
        }
        localStorage.setItem(`board_ydoc_${board.board_uuid}`, btoa(binary))
      } catch (_err) {
        // Ignore quota limits
      }
    }
    ydoc.on('update', handler)
    return () => {
      ydoc.off('update', handler)
    }
  }, [ydoc, board?.board_uuid])

  // Remap selected positions when the document changes
  useEffect(() => {
    if (!editor) return
    const handler = () => {
      // Get the last transaction from the editor state
      // We remap after every update to keep positions valid
      setSelectedPositions((prev) => {
        if (prev.size === 0) return prev
        const next = new Set<number>()
        const doc = editor.state.doc
        // Re-validate positions: check each still points to a top-level node
        for (const pos of prev) {
          if (pos >= 0 && pos < doc.content.size) {
            const node = doc.nodeAt(pos)
            if (node) next.add(pos)
          }
        }
        if (next.size === prev.size && [...next].every((p) => prev.has(p))) return prev
        return next
      })
    }
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor])

  // Keyboard handler: Delete/Backspace removes all selected nodes, Space to pan
  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to temporarily activate pan mode
      if (e.code === 'Space') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
        e.preventDefault()
        if (prevToolModeRef.current === null) {
          prevToolModeRef.current = toolMode
          setToolMode('pan')
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only handle if no text input is focused
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
        if (selectedPositions.size === 0) return
        e.preventDefault()
        // Delete in reverse order to preserve earlier positions
        const sorted = Array.from(selectedPositions).sort((a, b) => b - a)
        editor.chain()
          .command(({ tr }) => {
            for (const pos of sorted) {
              const node = tr.doc.nodeAt(pos)
              if (node) tr.delete(pos, pos + node.nodeSize)
            }
            return true
          })
          .run()
        setSelectedPositions(new Set())
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && prevToolModeRef.current !== null) {
        setToolMode(prevToolModeRef.current)
        prevToolModeRef.current = null
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [editor, selectedPositions, toolMode])

  // Pan/Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((z) => Math.min(Math.max(z + delta, 0.25), 3))
    } else {
      setPan((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }))
    }
  }, [])

  const insertBlockAtWorldPos = useCallback((mode: string, worldX: number, worldY: number) => {
    if (!editor) return
    toolModeRef.current = 'select'
    const pos = editor.state.doc.content.size
    const x = Math.round(worldX)
    const y = Math.round(worldY)

    switch (mode) {
      case 'card':
        editor.chain().insertContentAt(pos, {
          type: 'boardCard',
          attrs: { x, y, width: 300, height: 200 },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New card' }] }],
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'card' })
        break
      case 'youtube':
        editor.chain().insertContentAt(pos, {
          type: 'youtubeBlock',
          attrs: { x, y, width: 480, height: 270 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'youtube' })
        break
      case 'embed':
        editor.chain().insertContentAt(pos, {
          type: 'embedBlock',
          attrs: { x, y, width: 520, height: 360 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'embed' })
        break
      case 'webpage':
        editor.chain().insertContentAt(pos, {
          type: 'webpageBlock',
          attrs: { x, y, width: 520, height: 400 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'webpage' })
        break
      case 'note':
        editor.chain().insertContentAt(pos, {
          type: 'noteBlock',
          attrs: { x, y, width: 260, height: 200 },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New note' }] }],
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'note' })
        break
      case 'sticker':
        editor.chain().insertContentAt(pos, {
          type: 'stickerBlock',
          attrs: { x, y, emoji: '😀' },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'sticker' })
        break
      case 'todo':
        editor.chain().insertContentAt(pos, {
          type: 'todoBlock',
          attrs: { x, y, width: 260, height: 260 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'todo' })
        break
      case 'podcast':
        editor.chain().insertContentAt(pos, {
          type: 'podcastBlock',
          attrs: { x, y, width: 400, height: 280 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'podcast' })
        break
      case 'frame':
        editor.chain().insertContentAt(pos, {
          type: 'frameBox',
          attrs: { x, y, width: 400, height: 300, title: 'Frame' },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'frame' })
        break
      case 'modules':
        editor.chain().insertContentAt(pos, {
          type: 'playgroundBlock',
          attrs: {
            blockUuid: `pg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            x,
            y,
            width: 540,
            height: 480,
            htmlContent: null,
          },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'modules' })
        break
      default:
        return
    }
    setToolMode('select')
  }, [editor, track])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const mode = toolModeRef.current
    if (mode === 'pan' || e.button === 1 || (e.button === 0 && e.shiftKey && mode !== 'select')) {
      editor?.commands.blur()
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    } else if (mode === 'select' && e.button === 0) {
      const target = e.target as HTMLElement
      const isOnBlock = target.closest('[data-node-view-wrapper]')
      if (!isOnBlock) {
        editor?.commands.blur()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const sx = e.clientX - rect.left
          const sy = e.clientY - rect.top
          const m = { startX: sx, startY: sy, currentX: sx, currentY: sy }
          setMarquee(m)
          marqueeRef.current = m
        }
        if (!e.shiftKey) {
          setSelectedPositions(new Set())
        }
      }
    } else if (mode === 'draw' && e.button === 0) {
      editor?.commands.blur()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      e.preventDefault()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      drawPointsRef.current = [{ x, y }]
      setDrawingPath(`M ${x} ${y}`)
      isDrawingRef.current = true
      setIsDrawing(true)
    } else if (e.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      insertBlockAtWorldPos(mode, x, y)
    }
  }, [pan, zoom, editor, insertBlockAtWorldPos])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Track mouse position for placement ghost preview
    if (activePlacement) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }

    if (isPanning) {
      const newX = e.clientX - panStart.x
      const newY = e.clientY - panStart.y
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setPan({ x: newX, y: newY })
      })
    } else if (marqueeRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const m = { ...marqueeRef.current, currentX: e.clientX - rect.left, currentY: e.clientY - rect.top }
      marqueeRef.current = m
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setMarquee(m)
      })
    } else if (isDrawingRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      drawPointsRef.current.push({ x, y })
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setDrawingPath(pointsToSvgPath(drawPointsRef.current))
      })
    }
  }, [isPanning, panStart, pan, zoom, activePlacement])

  const commitDrawingStroke = useCallback(() => {
    isDrawingRef.current = false
    setIsDrawing(false)
    const points = drawPointsRef.current
    if (points.length === 0 || !editor) {
      setDrawingPath('')
      drawPointsRef.current = []
      return
    }

    if (points.length === 1) {
      points.push({ x: points[0].x + 0.5, y: points[0].y + 0.5 })
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    const padding = 10
    minX -= padding; minY -= padding; maxX += padding; maxY += padding
    const width = maxX - minX
    const height = maxY - minY

    // Normalize points relative to bounding box origin
    const normalized = points.map(p => ({ x: p.x - minX, y: p.y - minY }))
    const pathData = pointsToSvgPath(normalized)

    // Insert without focus() to avoid scroll jumps that break pan/zoom
    const endPos = editor.state.doc.content.size
    editor.chain().insertContentAt(endPos, {
      type: 'drawingStroke',
      attrs: {
        pathData,
        strokeColor: drawColor,
        strokeWidth: drawWidth,
        x: Math.round(minX),
        y: Math.round(minY),
        viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
      },
    }).run()

    setDrawingPath('')
    drawPointsRef.current = []
  }, [editor, drawColor, drawWidth])

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
    }
    if (marqueeRef.current && editor) {
      const m = marqueeRef.current
      // Convert screen-space marquee rect to world-space
      const left = Math.min(m.startX, m.currentX)
      const top = Math.min(m.startY, m.currentY)
      const right = Math.max(m.startX, m.currentX)
      const bottom = Math.max(m.startY, m.currentY)

      // Only count as marquee if dragged at least 5px
      if (right - left > 5 || bottom - top > 5) {
        // Convert to world coords
        const wLeft = (left - pan.x) / zoom
        const wTop = (top - pan.y) / zoom
        const wRight = (right - pan.x) / zoom
        const wBottom = (bottom - pan.y) / zoom

        const hits: number[] = []
        editor.state.doc.forEach((node: any, pos: number) => {
          const nx = node.attrs.x ?? 0
          const ny = node.attrs.y ?? 0

          // Resolve actual rendered size per node type
          let nw: number, nh: number
          const typeName = node.type.name
          if (typeName === 'stickerBlock') {
            nw = 80; nh = 80
          } else if (typeName === 'drawingStroke') {
            const vb = (node.attrs.viewBox || '0 0 100 100').split(' ').map(Number)
            nw = vb[2] || 100
            nh = vb[3] || 100
          } else {
            nw = node.attrs.width ?? 300
            nh = node.attrs.height ?? 200
          }

          // Check if block overlaps marquee rect
          if (nx + nw > wLeft && nx < wRight && ny + nh > wTop && ny < wBottom) {
            hits.push(pos)
          }
        })
        if (hits.length > 0) {
          setSelectedPositions(new Set(hits))
        }
      }

      marqueeRef.current = null
      setMarquee(null)
    }
    if (isDrawingRef.current && editor) {
      commitDrawingStroke()
    }
  }, [isPanning, editor, commitDrawingStroke, pan.x, pan.y, zoom, setSelectedPositions])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.25))
  const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleFocusContent = useCallback(() => {
    if (!editor || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const screenW = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1200)
    const screenH = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 800)

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let count = 0

    editor.state.doc.forEach((node: any) => {
      const x = node.attrs.x ?? 0
      const y = node.attrs.y ?? 0
      let w = node.attrs.width ?? 300
      let h = node.attrs.height ?? 200

      if (node.type.name === 'stickerBlock') {
        w = 80; h = 80
      } else if (node.type.name === 'drawingStroke') {
        const vb = (node.attrs.viewBox || '0 0 100 100').split(' ').map(Number)
        w = vb[2] || 100
        h = vb[3] || 100
      }

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x + w > maxX) maxX = x + w
      if (y + h > maxY) maxY = y + h
      count++
    })

    if (count === 0 || minX === Infinity) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }

    const padding = 80
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const contentW = Math.max(maxX - minX, 100)
    const contentH = Math.max(maxY - minY, 100)

    const scaleX = screenW / contentW
    const scaleY = screenH / contentH
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.25)

    const targetPanX = (screenW - contentW * targetZoom) / 2 - minX * targetZoom
    const targetPanY = (screenH - contentH * targetZoom) / 2 - minY * targetZoom

    setZoom(Number(targetZoom.toFixed(2)))
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) })
  }, [editor])

  // Touch: drawing on 1 finger when draw tool is active, pan (1 finger) and pinch-to-zoom (2 fingers)
  const touchRef = useRef<{
    startTouches: { x: number; y: number }[]
    startPan: { x: number; y: number }
    startZoom: number
    startDist: number
  } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const mode = toolModeRef.current
    const target = e.target as HTMLElement
    const isOnBlock = !!target.closest('[data-node-view-wrapper]')
    const touches = Array.from(e.touches)

    // Two or more fingers: ALWAYS pinch-to-zoom / 2-finger pan regardless of active tool
    if (touches.length >= 2) {
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        setIsDrawing(false)
        setDrawingPath('')
        drawPointsRef.current = []
      }
      tapCandidateRef.current = null
      const dist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)
      touchRef.current = {
        startTouches: touches.map(t => ({ x: t.clientX, y: t.clientY })),
        startPan: { ...panRef.current },
        startZoom: zoomRef.current,
        startDist: dist,
      }
      return
    }

    if (touches.length === 1) {
      const t = touches[0]

      // 1. Drawing mode: single touch starts stroke
      if (mode === 'draw') {
        editor?.commands.blur()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = (t.clientX - rect.left - panRef.current.x) / zoomRef.current
        const y = (t.clientY - rect.top - panRef.current.y) / zoomRef.current
        drawPointsRef.current = [{ x, y }]
        setDrawingPath(`M ${x} ${y}`)
        isDrawingRef.current = true
        setIsDrawing(true)
        return
      }

      // 2. Placement tool: record tap candidate (placed on release if not dragged)
      if (mode !== 'select' && mode !== 'pan') {
        tapCandidateRef.current = {
          clientX: t.clientX,
          clientY: t.clientY,
          time: Date.now(),
        }
        return
      }

      // 3. Block interaction in select/pan mode: let block handles touch
      if (isOnBlock) {
        return
      }

      // 4. Empty canvas in select/pan mode: 1-finger pan
      editor?.commands.blur()
      touchRef.current = {
        startTouches: [{ x: t.clientX, y: t.clientY }],
        startPan: { ...panRef.current },
        startZoom: zoomRef.current,
        startDist: 0,
      }
    }
  }, [editor])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = Array.from(e.touches)

    // 1. If currently drawing with 1 finger
    if (isDrawingRef.current && touches.length === 1) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (touches[0].clientX - rect.left - panRef.current.x) / zoomRef.current
      const y = (touches[0].clientY - rect.top - panRef.current.y) / zoomRef.current
      drawPointsRef.current.push({ x, y })
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setDrawingPath(pointsToSvgPath(drawPointsRef.current))
      })
      return
    }

    // 2. If we have a tap candidate for a placement tool, check if user dragged
    if (tapCandidateRef.current && touches.length === 1) {
      const dist = Math.hypot(
        touches[0].clientX - tapCandidateRef.current.clientX,
        touches[0].clientY - tapCandidateRef.current.clientY
      )
      if (dist > 12) {
        tapCandidateRef.current = null
      }
    }

    if (!touchRef.current) return

    // 3. Two-finger pinch to zoom + pan
    if (touches.length >= 2 && touchRef.current.startTouches.length >= 2) {
      const dist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)
      const scale = dist / (touchRef.current.startDist || 1)
      const newZoom = Math.min(Math.max(touchRef.current.startZoom * scale, 0.25), 3)

      const midX = (touches[0].clientX + touches[1].clientX) / 2
      const midY = (touches[0].clientY + touches[1].clientY) / 2
      const startMidX = (touchRef.current.startTouches[0].x + touchRef.current.startTouches[1].x) / 2
      const startMidY = (touchRef.current.startTouches[0].y + touchRef.current.startTouches[1].y) / 2

      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setZoom(newZoom)
        setPan({
          x: touchRef.current!.startPan.x + (midX - startMidX),
          y: touchRef.current!.startPan.y + (midY - startMidY),
        })
      })
    } else if (touches.length === 1 && touchRef.current.startTouches.length === 1 && !isDrawingRef.current) {
      // 4. One-finger canvas pan
      const dx = touches[0].clientX - touchRef.current.startTouches[0].x
      const dy = touches[0].clientY - touchRef.current.startTouches[0].y
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setPan({
          x: touchRef.current!.startPan.x + dx,
          y: touchRef.current!.startPan.y + dy,
        })
      })
    }
  }, [])

  const handleTouchEnd = useCallback((_e?: React.TouchEvent) => {
    // 1. Commit drawing if drawing
    if (isDrawingRef.current) {
      commitDrawingStroke()
    }

    // 2. Commit placement if tap candidate exists
    if (tapCandidateRef.current) {
      const { clientX, clientY } = tapCandidateRef.current
      tapCandidateRef.current = null
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (clientX - rect.left - panRef.current.x) / zoomRef.current
        const y = (clientY - rect.top - panRef.current.y) / zoomRef.current
        insertBlockAtWorldPos(toolModeRef.current, x, y)
      }
    }

    touchRef.current = null
  }, [commitDrawingStroke, insertBlockAtWorldPos])

  // Non-passive native touch listener prevents mobile browser gestures (swipe back, pull down refresh)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    const onNativeTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return
      }
      if (e.touches.length >= 2 || toolModeRef.current === 'draw' || toolModeRef.current !== 'select') {
        e.preventDefault()
      }
    }

    const onNativeTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return
      }
      e.preventDefault()
    }

    el.addEventListener('touchstart', onNativeTouchStart, { passive: false })
    el.addEventListener('touchmove', onNativeTouchMove, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onNativeTouchStart)
      el.removeEventListener('touchmove', onNativeTouchMove)
    }
  }, [])

  if (!editor) return null

  return (
    <BoardYjsProvider value={ydoc}>
    <BoardSelectionProvider editor={editor} selectedPositions={selectedPositions} setSelectedPositions={setSelectedPositions}>
    <div
      className="relative h-screen w-full overflow-hidden board-effect-shake-target"
      style={{
        backgroundColor: '#f8f8f8',
        backgroundImage: 'radial-gradient(circle, #d1d1d1 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Canvas viewport */}
      <div
        ref={canvasRef}
        className="h-full w-full relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          cursor: toolMode === 'pan' || isPanning ? 'grab' : toolMode === 'draw' || activePlacement ? 'crosshair' : 'default',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <EditorContent editor={editor} />
        </div>
        <RemoteCursors provider={provider} canvasRef={canvasRef} pan={pan} zoom={zoom} />

        {/* Marquee selection overlay */}
        {marquee && (
          <svg
            className="absolute inset-0 pointer-events-none z-30"
            style={{ width: '100%', height: '100%' }}
          >
            <rect
              x={Math.min(marquee.startX, marquee.currentX)}
              y={Math.min(marquee.startY, marquee.currentY)}
              width={Math.abs(marquee.currentX - marquee.startX)}
              height={Math.abs(marquee.currentY - marquee.startY)}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          </svg>
        )}

        {/* Placement cursor indicator */}
        {activePlacement && mousePos && (() => {
          const Icon = activePlacement.icon
          return (
            <div
              className="absolute pointer-events-none z-30"
              style={{
                left: mousePos.x + 16,
                top: mousePos.y + 16,
              }}
            >
              <div className="flex items-center gap-1.5 rounded-full bg-neutral-800 ps-1.5 pe-2.5 py-1 shadow-lg">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon size={11} weight="bold" className="text-white" />
                </div>
                <span className="text-[11px] font-medium text-white/90 select-none whitespace-nowrap">
                  {activePlacement.label}
                </span>
              </div>
            </div>
          )
        })()}

        {/* Live drawing overlay */}
        {isDrawing && drawingPath && (
          <svg
            className="absolute inset-0 pointer-events-none z-30"
            style={{ width: '100%', height: '100%' }}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <path
                d={drawingPath}
                stroke={drawColor}
                strokeWidth={drawWidth / zoom}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        )}
      </div>

      {/* Top bar: back + logo + title */}
      <div className="board-enter-top">
        <BoardTopBar
          boardName={board.name}
          orgslug={orgslug}
          board={board}
          accessToken={accessToken}
        />
      </div>

      {/* Top right: avatars + clock + timer + share */}
      <div className="board-enter-top">
        <BoardTopRight
          provider={provider}
          ydoc={ydoc}
          board={board}
          accessToken={accessToken}
        />
      </div>

      {/* Bottom toolbar: logo, tools, undo/redo */}
      <BoardToolbar
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        editor={editor}
        drawColor={drawColor}
        drawWidth={drawWidth}
        onDrawColorChange={setDrawColor}
        onDrawWidthChange={setDrawWidth}
      />

      {/* Bottom right stack: effects → chat → zoom */}
      <div className="absolute bottom-5 end-5 z-20 flex flex-col items-end gap-1.5 pointer-events-none board-enter-delayed board-social">
        {/* Ephemeral Chat */}
        {(board.features?.chat_enabled !== false || board.features?.reactions_enabled !== false) && (
          <EphemeralChat ydoc={ydoc} provider={provider} features={board.features} />
        )}

        {/* Live Effects */}
        {board.features?.effects_enabled !== false && (
          <BoardEffects ydoc={ydoc} provider={provider} />
        )}

        {/* Zoom controls */}
        <BoardZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFocusContent={handleFocusContent}
        />
      </div>

      {/* Floating Touch Drawing Bar — Quick colors, widths, undo & focus */}
      {toolMode === 'draw' && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-2 rounded-2xl nice-shadow pointer-events-auto border border-neutral-200/80 animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Colors */}
          <div className="flex items-center gap-1.5 pe-2 border-e border-neutral-200">
            {[
              { color: '#000000', label: 'Siyah' },
              { color: '#EF4444', label: 'Kırmızı' },
              { color: '#3B82F6', label: 'Mavi' },
              { color: '#22C55E', label: 'Yeşil' },
              { color: '#F97316', label: 'Turuncu' },
              { color: '#A855F7', label: 'Mor' },
            ].map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => setDrawColor(color)}
                title={label}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                  drawColor === color ? 'scale-125 ring-2 ring-offset-2 ring-neutral-800' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1 pe-2 border-e border-neutral-200">
            {[
              { width: 1, label: 'İnce' },
              { width: 3, label: 'Orta' },
              { width: 6, label: 'Kalın' },
            ].map(({ width, label }) => (
              <button
                key={width}
                type="button"
                onClick={() => setDrawWidth(width)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  drawWidth === width
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick Focus Button */}
          <button
            type="button"
            onClick={handleFocusContent}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            title="Tüm Çizimleri Ekrana Ortala"
          >
            <span>Odak</span>
          </button>
        </div>
      )}

      {/* Feedback button — bottom left */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="absolute bottom-5 start-5 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-700 nice-shadow transition-colors board-enter-delayed board-feedback"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <MessageCircle size={14} />
        Feedback
      </button>
      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        userName={username}
      />

    </div>
    </BoardSelectionProvider>
    </BoardYjsProvider>
  )
}

/** Outer component — handles Yjs lifecycle, only renders editor once ready */
export default function BoardCanvas({ board, accessToken, orgslug, username, orgUuid }: BoardCanvasProps) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null)
  const [connStatus, setConnStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [authFailed, setAuthFailed] = useState(false)

  const isDemo = Boolean(
    board?.is_demo ||
    board?.board_uuid?.startsWith('board_') ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && getCollabUrl().includes('localhost'))
  )

  useEffect(() => {
    const doc = new Y.Doc()

    // Restore saved board state from localStorage if available
    if (typeof window !== 'undefined' && board?.board_uuid) {
      try {
        const saved = localStorage.getItem(`board_ydoc_${board.board_uuid}`)
        if (saved) {
          const binary = atob(saved)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          Y.applyUpdate(doc, bytes)
        }
      } catch (err) {
        console.warn('[board] Could not restore from localStorage:', err)
      }
    }

    const prov = new HocuspocusProvider({
      url: getCollabUrl(),
      name: `board:${board.board_uuid}`,
      document: doc,
      token: accessToken,
      onStatus({ status }: { status: string }) {
        if (!isDemo) {
          setConnStatus(status as 'connecting' | 'connected' | 'disconnected')
        } else {
          setConnStatus('connected')
        }
      },
      onAuthenticationFailed({ reason }: { reason: string }) {
        console.error('[board] Authentication failed:', reason)
        if (!isDemo) {
          setAuthFailed(true)
          prov.disconnect()
        }
      },
    })

    // The Y.Doc / HocuspocusProvider are external systems created in this effect;
    // storing them in state once per board/token is the intended synchronization,
    // not a cascading render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYdoc(doc)
    setProvider(prov)
    setAuthFailed(false)
    setConnStatus(isDemo ? 'connected' : 'connecting')

    return () => {
      prov.destroy()
      doc.destroy()
    }
  }, [board.board_uuid, accessToken, isDemo])

  if (authFailed) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-2xl">🔒</div>
          <p className="text-sm font-medium text-neutral-700">Unable to connect to this board</p>
          <p className="text-xs text-neutral-400">You may not have access, or the session has expired.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!ydoc || !provider) return null

  return (
    <>
      <BoardEditorInner
        board={board}
        orgslug={orgslug}
        username={username}
        accessToken={accessToken}
        orgUuid={orgUuid}
        ydoc={ydoc}
        provider={provider}
      />
      {/* Connection status indicator (suppressed for demo/standalone boards to avoid false alarms) */}
      {connStatus === 'disconnected' && !isDemo && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span className="text-xs font-medium text-amber-700">Reconnecting...</span>
        </div>
      )}
    </>
  )
}
