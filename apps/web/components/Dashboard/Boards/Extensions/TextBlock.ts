import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TextBlockComponent from './TextBlockComponent'

export const TextBlockExtension = Node.create({
  name: 'textBlock',
  group: 'block',
  content: 'block+',
  draggable: true,
  defining: true,

  addAttributes() {
    return {
      x: { default: 100 },
      y: { default: 100 },
      width: { default: 280 },
      height: { default: 80 },
      fontSize: { default: 18 },
      color: { default: '#111827' },
      zIndex: { default: 2 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="text-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'text-block' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextBlockComponent)
  },
})
