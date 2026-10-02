'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Volume2,
  CheckCircle2,
  Trash2,
  Headphones,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceRecordingStudioProps {
  onAudioReady: (data: {
    audio_url: string
    audio_name: string
    audio_duration: number
    audio_type: string
  }) => void
  onAudioClear: () => void
  initialAudioUrl?: string
  disabled?: boolean
}

export default function VoiceRecordingStudio({
  onAudioReady,
  onAudioClear,
  initialAudioUrl,
  disabled = false,
}: VoiceRecordingStudioProps) {
  const [mode, setMode] = useState<'record' | 'upload'>('record')
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle')
  const [duration, setDuration] = useState<number>(0)
  const [audioUrl, setAudioUrl] = useState<string>(initialAudioUrl || '')
  const [audioName, setAudioName] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackTime, setPlaybackTime] = useState<number>(0)
  const [audioTotalTime, setAudioTotalTime] = useState<number>(0)

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      stopTracks()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [])

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  // Draw real-time audio visualizer
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      const ctx = new AudioCtx()
      audioContextRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const canvas = canvasRef.current
      if (!canvas) return
      const canvasCtx = canvas.getContext('2d')
      if (!canvasCtx) return

      const draw = () => {
        if (!canvasRef.current) return
        animFrameRef.current = requestAnimationFrame(draw)

        analyser.getByteFrequencyData(dataArray)

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 1.5
        let barHeight: number
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.9

          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0)
          gradient.addColorStop(0, '#9333ea') // purple-600
          gradient.addColorStop(1, '#c084fc') // purple-400

          canvasCtx.fillStyle = gradient
          canvasCtx.beginPath()
          canvasCtx.roundRect(x, canvas.height - Math.max(barHeight, 4), barWidth - 2, Math.max(barHeight, 4), [4, 4, 0, 0])
          canvasCtx.fill()

          x += barWidth + 1
        }
      }

      draw()
    } catch (err) {
      console.warn('AudioContext visualizer not supported or failed:', err)
    }
  }

  const startRecording = async () => {
    if (disabled) return
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Tarayıcınız mikrofon erişimini desteklemiyor.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else {
          mimeType = ''
        }
      }

      const options = mimeType ? { mimeType } : undefined
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          setAudioUrl(base64Audio)
          const name = `Ses_Kaydı_${new Date().toLocaleTimeString('tr-TR').replace(/:/g, '-')}.webm`
          setAudioName(name)
          onAudioReady({
            audio_url: base64Audio,
            audio_name: name,
            audio_duration: duration,
            audio_type: mimeType || 'audio/webm',
          })
          toast.success('Ses kaydı başarıyla tamamlandı!')
        }

        stopTracks()
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      }

      mediaRecorder.start(250) // slice every 250ms
      setRecordingState('recording')
      setDuration(0)

      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      startVisualizer(stream)
    } catch (err: any) {
      console.error(err)
      toast.error('Mikrofona erişilemedi. Lütfen mikrofon izinlerinizi kontrol edin.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop()
      setRecordingState('stopped')
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }

  const resetRecording = () => {
    stopTracks()
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setRecordingState('idle')
    setDuration(0)
    setAudioUrl('')
    setAudioName('')
    setIsPlaying(false)
    setPlaybackTime(0)
    onAudioClear()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      toast.error('Lütfen geçerli bir ses dosyası (.mp3, .wav, .m4a vb.) seçiniz.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Ses dosyası 25 MB boyutunu aşamaz.')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      const base64Audio = reader.result as string
      setAudioUrl(base64Audio)
      setAudioName(file.name)
      setRecordingState('stopped')

      onAudioReady({
        audio_url: base64Audio,
        audio_name: file.name,
        audio_duration: 0,
        audio_type: file.type,
      })
      toast.success(`${file.name} başarıyla yüklendi!`)
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return
    if (isPlaying) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    } else {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="space-y-3 p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Mic size={16} />
          </div>
          <div>
            <h4 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
              Ses Kaydı & Okuma Stüdyosu
              <Sparkles size={12} className="text-purple-600" />
            </h4>
            <p className="text-[10px] text-purple-700/80">
              Mikrofonla canlı ses kaydı yapın veya cihazınızdan ses dosyası yükleyin.
            </p>
          </div>
        </div>

        {/* Mode switcher tabs */}
        {!disabled && !audioUrl && recordingState === 'idle' && (
          <div className="flex items-center p-0.5 bg-white border border-purple-200 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('record')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                mode === 'record'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              Canlı Kayıt
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                mode === 'upload'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              Dosya Yükle
            </button>
          </div>
        )}
      </div>

      {/* RECORD MODE */}
      {mode === 'record' && (
        <div className="space-y-3">
          {/* Active recording state or idle */}
          {recordingState === 'idle' && !audioUrl && (
            <div className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-purple-100 rounded-xl text-center space-y-3">
              <button
                type="button"
                disabled={disabled}
                onClick={startRecording}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Mic size={24} />
              </button>
              <div>
                <p className="font-bold text-gray-900 text-xs">Kayda Başlamak İçin Butona Basın</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Mikrofonunuzu açıp parçayı sesli ve anlaşılır şekilde okuyun.
                </p>
              </div>
            </div>
          )}

          {/* RECORDING OR PAUSED STATE */}
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <div className="p-4 bg-white border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      recordingState === 'recording'
                        ? 'bg-red-500 animate-ping'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-bold text-xs text-gray-800">
                    {recordingState === 'recording' ? 'Kayıt Alınıyor...' : 'Kayıt Duraklatıldı'}
                  </span>
                </div>

                {/* Digital Timer */}
                <div className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-sm font-mono font-black text-purple-900">
                  {formatTime(duration)}
                </div>
              </div>

              {/* Dynamic Waveform Visualizer Canvas */}
              <div className="w-full h-12 bg-purple-50/50 rounded-lg overflow-hidden border border-purple-100 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={48}
                  className="w-full h-full"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3 pt-1">
                {recordingState === 'recording' ? (
                  <button
                    type="button"
                    onClick={pauseRecording}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pause size={14} />
                    <span>Duraklat</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resumeRecording}
                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play size={14} />
                    <span>Devam Et</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Square size={14} />
                  <span>Kaydı Tamamla</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD MODE */}
      {mode === 'upload' && !audioUrl && (
        <div className="py-5 px-4 bg-white border border-purple-200 border-dashed rounded-xl text-center space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
            className="hidden"
            onChange={handleFileUpload}
            disabled={disabled}
          />
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
            <Upload size={18} />
          </div>
          <div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
            >
              Cihazınızdan ses dosyası seçin
            </button>
            <p className="text-[11px] text-gray-500 mt-0.5">
              MP3, WAV, M4A veya OGG formatı (Maks. 25 MB)
            </p>
          </div>
        </div>
      )}

      {/* AUDIO PLAYBACK PREVIEW & READY STATE */}
      {audioUrl && (
        <div className="p-3.5 bg-white border border-purple-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <div>
                <span className="font-bold text-gray-900 text-xs">
                  {audioName || 'Ses Kaydı Hazır'}
                </span>
                {duration > 0 && (
                  <span className="text-[10px] text-gray-500 ml-2 font-mono">
                    ({formatTime(duration)})
                  </span>
                )}
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={resetRecording}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Yeniden Kaydet</span>
              </button>
            )}
          </div>

          {/* HTML5 Audio Player */}
          <div className="flex items-center gap-3 p-2 bg-purple-50/60 rounded-xl border border-purple-100">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono mb-1">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(audioTotalTime || duration)}</span>
              </div>
              <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all"
                  style={{
                    width: `${
                      audioTotalTime > 0
                        ? (playbackTime / audioTotalTime) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setAudioTotalTime(e.currentTarget.duration)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  )
}
