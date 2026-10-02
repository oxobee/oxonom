'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Headphones,
  CheckCircle,
} from 'lucide-react'

interface AudioReviewPlayerProps {
  audioUrl: string
  audioName?: string
  studentName?: string
}

export default function AudioReviewPlayer({
  audioUrl,
  audioName = 'Öğrenci Ses Kaydı',
  studentName,
}: AudioReviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0]
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
    setPlaybackRate(speeds[nextIdx])
  }

  if (!audioUrl) return null

  return (
    <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Headphones size={16} />
          </div>
          <div>
            <h4 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
              <span>{studentName ? `${studentName} — Ses Kaydı` : audioName}</span>
              <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                SESLİ GÖREV
              </span>
            </h4>
            <p className="text-[10px] text-purple-700/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Speed button */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-1 bg-white border border-purple-200 hover:border-purple-300 text-purple-800 font-mono font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
            title="Oynatma Hızı"
          >
            {playbackRate}x
          </button>

          {/* Download button */}
          <a
            href={audioUrl}
            download={audioName || 'ogrenci_ses_kaydi.webm'}
            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
            title="Ses Kaydını İndir"
          >
            <Download size={15} />
          </a>
        </div>
      </div>

      {/* Player controls */}
      <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-purple-100">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors shadow-xs"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 accent-purple-600 cursor-pointer h-1.5 bg-purple-100 rounded-lg"
        />

        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !isMuted
              setIsMuted(!isMuted)
            }
          }}
          className="text-purple-700 hover:text-purple-900 cursor-pointer p-1"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  )
}
