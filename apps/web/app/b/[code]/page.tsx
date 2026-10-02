import { redirect } from 'next/navigation'
import { getBoardByShortCode } from '@services/boards/boards'
import Link from 'next/link'

type Props = {
  params: Promise<{ code: string }>
}

export default async function ShortLinkPage({ params }: Props) {
  const { code } = await params

  let targetBoardUuid: string | null = null

  if (code) {
    try {
      const boardInfo = await getBoardByShortCode(code)
      if (boardInfo && boardInfo.board_uuid) {
        targetBoardUuid = boardInfo.board_uuid.replace('board_', '')
      }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err
      }
    }
  }

  if (targetBoardUuid) {
    redirect(`/board/${targetBoardUuid}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-white p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-[#141416] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold text-white">Akıllı Tahta Bulunamadı</h1>
        <p className="text-sm text-white/60">
          Girdiğiniz <code className="bg-white/10 px-2 py-0.5 rounded text-amber-400 font-mono">{code}</code> koduna ait aktif bir tahta bulunamadı veya paylaşım bağlantısı geçersiz olabilir.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
