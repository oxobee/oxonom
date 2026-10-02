import React, { useState } from 'react'
import { updateBoard } from '@services/boards/boards'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { queryKeys } from '@/lib/query/keys'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'

interface BoardFeaturesTabProps {
  board: any
  boardUuid: string
}

export default function BoardFeaturesTab({ board, boardUuid }: BoardFeaturesTabProps) {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  const [effectsEnabled, setEffectsEnabled] = useState(board.features?.effects_enabled !== false)
  const [chatEnabled, setChatEnabled] = useState(board.features?.chat_enabled !== false)
  const [reactionsEnabled, setReactionsEnabled] = useState(board.features?.reactions_enabled !== false)

  const mutation = useMutation({
    mutationFn: (data: any) => updateBoard(boardUuid, data, access_token),
    onSuccess: () => {
      toast.success(t('boards.settings_saved', 'Settings saved successfully'))
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardUuid) })
    },
    onError: () => {
      toast.error(t('boards.settings_error', 'Failed to save settings'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      features: {
        effects_enabled: effectsEnabled,
        chat_enabled: chatEnabled,
        reactions_enabled: reactionsEnabled,
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-10">
      <div className="bg-white rounded-xl nice-shadow p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Özellikler (Features)</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={effectsEnabled}
                onChange={(e) => setEffectsEnabled(e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-700">🎭 Canlı Efektler (Yangın, Kar, Matrix vb.)</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={chatEnabled}
                onChange={(e) => setChatEnabled(e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-700">💬 Anlık Mesajlaşma (Chat)</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={reactionsEnabled}
                onChange={(e) => setReactionsEnabled(e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-700">😊 Emoji Tepkileri (Reactions)</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
              <Save size={16} />
              {mutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
