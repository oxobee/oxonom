'use client'

import React from 'react'
import { NodeViewContent } from '@tiptap/react'
import { TextT } from '@phosphor-icons/react'
import BoardBlockWrapper from './BoardBlockWrapper'
import DragHandle from './DragHandle'
import ResizeHandle from './ResizeHandle'
import { useDragResize } from './useDragResize'

export default function TextBlockComponent({
  node,
  updateAttributes,
  selected,
  deleteNode,
  editor,
  getPos,
}: any) {
  const { x, y, width, height, color, fontSize = 20, zIndex } = node.attrs

  const { handleDragStart, handleResizeStart } = useDragResize({
    x,
    y,
    width,
    height,
    minWidth: 100,
    minHeight: 40,
    updateAttributes,
    editor,
    getPos,
  })

  return (
    <BoardBlockWrapper
      selected={selected}
      deleteNode={deleteNode}
      editor={editor}
      getPos={getPos}
      x={x}
      y={y}
      width={width}
      zIndex={zIndex}
      styled={false}
      className={`rounded-xl transition-shadow ${
        selected ? 'ring-2 ring-indigo-500/80 bg-white/90 shadow-md' : 'hover:bg-white/40'
      }`}
      style={{
        minHeight: height,
      }}
    >
      <DragHandle onMouseDown={handleDragStart} onTouchStart={handleDragStart} />

      {/* Subtle indicator only when selected */}
      {selected && (
        <div className="flex items-center px-2 pt-1 pb-0 select-none opacity-60">
          <TextT size={12} weight="bold" className="text-indigo-600 me-1" />
          <span className="text-[10px] font-bold text-gray-500">Metin</span>
        </div>
      )}

      {/* Editable Computer Text Content */}
      <div className="p-2">
        <NodeViewContent
          className="board-text-content outline-none font-sans font-medium text-gray-900 leading-normal"
          style={{
            fontSize: `${fontSize}px`,
            color: color || '#111827',
          }}
        />
      </div>

      <ResizeHandle
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        selected={selected}
      />
    </BoardBlockWrapper>
  )
}
