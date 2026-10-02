'use client'

import React, { useState } from 'react'
import {
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  File,
  Eye,
  CheckCircle,
} from 'lucide-react'

interface AssignmentFileViewerProps {
  fileUrl: string
  fileName?: string
  fileType?: string
  fileSize?: number
  title?: string
}

export default function AssignmentFileViewer({
  fileUrl,
  fileName = 'Çalışma Kağıdı',
  fileType = '',
  fileSize,
  title = 'Çalışma Kağıdı & Ekli Doküman',
}: AssignmentFileViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!fileUrl) return null

  const isPdf =
    fileType.includes('pdf') ||
    fileName.toLowerCase().endsWith('.pdf') ||
    fileUrl.startsWith('data:application/pdf') ||
    fileUrl.includes('.pdf')

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Non-PDF file view: themed download card
  if (!isPdf) {
    return (
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <File size={18} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-xs">{title}</h4>
              <p className="text-[11px] text-emerald-700 truncate max-w-xs">{fileName}</p>
            </div>
          </div>
          {fileSize && (
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {formatFileSize(fileSize)}
            </span>
          )}
        </div>

        <div className="pt-1">
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Download size={14} />
            <span>Dokümanı İndir ({fileName})</span>
          </a>
        </div>
      </div>
    )
  }

  // PDF Viewer
  return (
    <div
      className={`space-y-2 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 bg-white p-6 shadow-2xl flex flex-col' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold border border-red-200">
            <FileText size={16} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[9px] font-extrabold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                PDF
              </span>
            </h4>
            <p className="text-[10px] text-gray-500 truncate max-w-sm">
              {fileName} {fileSize ? `• ${formatFileSize(fileSize)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Küçült' : 'Tam Ekran'}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <a
            href={fileUrl}
            download={fileName}
            title="PDF İndir"
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
          >
            <Download size={15} />
            <span className="hidden sm:inline">İndir</span>
          </a>
        </div>
      </div>

      {/* Embedded PDF iframe / object */}
      <div
        className={`w-full rounded-xl overflow-hidden border border-gray-200 bg-white ${
          isFullscreen ? 'flex-1 h-full' : 'h-[360px] sm:h-[420px]'
        }`}
      >
        <object
          data={`${fileUrl}#toolbar=1&navpanes=0`}
          type="application/pdf"
          className="w-full h-full"
        >
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-none"
            title={fileName}
          >
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-gray-600">Tarayıcınız doğrudan PDF görüntülemeyi desteklemiyor.</p>
              <a
                href={fileUrl}
                download={fileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
              >
                <Download size={14} />
                PDF Dosyasını İndir
              </a>
            </div>
          </iframe>
        </object>
      </div>
    </div>
  )
}
