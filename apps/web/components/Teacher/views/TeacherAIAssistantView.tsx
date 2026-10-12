'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  Copy,
  Check,
  RotateCw,
  Send,
  Save,
  MessageSquare,
  Award,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PassiveModuleNotice from '../PassiveModuleNotice'

export default function TeacherAIAssistantView() {
  const [activeTool, setActiveTool] = useState<'planner' | 'quiz' | 'worksheet' | 'passive'>('planner')

  // Form states
  const [subject, setSubject] = useState('Türk Dili ve Edebiyatı')
  const [grade, setGrade] = useState('9. Sınıf')
  const [topic, setTopic] = useState('Paragrafta Anlam ve Anlatım Biçimleri')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error('Lütfen bir konu veya kazanım girin.')
      return
    }

    setIsGenerating(true)
    setGeneratedResult(null)

    setTimeout(() => {
      setIsGenerating(false)
      if (activeTool === 'planner') {
        setGeneratedResult(`### 📚 ${grade} ${subject} — Günlük Ders Planı
**Konu / Kazanım:** ${topic}
**Süre:** 40 + 40 Dakika (2 Ders Saati)

#### 1. DERSİN HEDEFLERİ VE KAZANIMLARI
- Öğrenciler ${topic} temel kavramlarını tanımlar.
- Metin içerisindeki anlatım yollarını analiz eder ve örnekler üzerinden sınıflandırır.
- Kendi düşüncelerini ilgili anlatım tekniğine uygun olarak yazılı ifade eder.

#### 2. DERS ÖNCESİ HAZIRLIK & MATERYALLER
- Akıllı tahta sunumu ve örnek paragraf metinleri.
- 5 soruluk etkileşimli kavram tarama testi.

#### 3. DERSİN İŞLENİŞİ (40 dk)
- **Giriş (10 dk):** Günlük hayattan bir örnek verilerek öğrencilerin dikkati çekilir. Beyin fırtınası yapılır.
- **Gelişme (20 dk):** Konu akıllı tahta üzerinden örnek metinlerle açıklanır. Önemli anahtar kelimeler vurgulanır.
- **Uygulama (10 dk):** Öğrencilere kısa bir çalışma metni verilip tespit yapmaları istenir.

#### 4. ÖLÇME VE DEĞERLENDİRME
- Ders sonu 3 soruluk hızlı geri bildirim ve ev çalışma etkinliği.`)
      } else if (activeTool === 'quiz') {
        setGeneratedResult(`### 📝 ${grade} ${subject} — Soru Taslağı
**Konu:** ${topic}

**Soru 1 (Çoktan Seçmeli):**
Aşağıdaki cümlelerin hangisinde nesnel bir anlatım söz konusudur?
A) Yazarın son romanı okuyucuyu derinden etkileyen muhteşem bir eserdir.
B) Türkiye'nin yüz ölçümü en büyük gölü Van Gölü'dür.
C) Şiirdeki hüzünlü hava insanı uzak diyarlara götürüyor.
D) Filmdeki müzikler sahnelere harika bir dinamizm katmış.
*Doğru Cevap: B*
*Çözüm Açıklaması: B şıkkındaki yargı kişiden kişiye değişmeyen, kanıtlanabilir bilimsel bir bilgidir.*

**Soru 2 (Açık Uçlu):**
${topic} konusunu dikkate alarak "tartışmacı anlatım" ile "açıklayıcı anlatım" arasındaki temel amacı ve farkı ikişer cümle ile yazınız.`)
      } else if (activeTool === 'worksheet') {
        setGeneratedResult(`### 📄 ${grade} ${subject} — Öğrenci Çalışma Kâğıdı
**Ünite:** ${topic}
**Öğrenci Adı Soyadı:** ...................................... **Numara:** .........

**Etkinlik 1: Doğru / Yanlış (D/Y)**
( ) 1. Betimleyici anlatımda okuyucunun gözünde bir manzara veya kişi canlandırılmaya çalışılır.
( ) 2. Öyküleyici anlatımda olay, kişi, yer ve zaman unsurları bulunmaz.
( ) 3. Açıklayıcı anlatımın temel amacı okuyucuya bir konu hakkında bilgi vermektir.

**Etkinlik 2: Eşleştirme**
Aşağıda verilen terimleri ilgili açıklamalarıyla eşleştiriniz:
[A] Örnekleme  -  ( ) Soyut bir fikri somut bir örnekle görünür kılma
[B] Karşılaştırma -  ( ) İki durum arasındaki benzerlik veya zıtlıkları ortaya koyma`)
      }
      toast.success('Yapay zekâ taslağı başarıyla oluşturuldu!')
    }, 1200)
  }

  const handleCopy = () => {
    if (!generatedResult) return
    navigator.clipboard.writeText(generatedResult)
    setCopied(true)
    toast.success('Metin panoya kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles size={15} />
            <span>MEB Müfredat Uyumlu Öğretmen Asistanı</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Yapay Zekâ Öğretmen Asistanı
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders planı, soru üretimi, çalışma kâğıtları ve içerik uyarlama
          </p>
        </div>

        {/* Tool Category Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 shrink-0 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTool('planner')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'planner'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ders Planı
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'quiz'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Soru & Quiz
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('worksheet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'worksheet'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Çalışma Kâğıdı
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('passive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'passive'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ses / Video (Geliştirme)
          </button>
        </div>
      </div>

      {/* Main Generator Form */}
      {activeTool !== 'passive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Inputs */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>İçerik Parametreleri</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-500 block mb-1">Ders / Branş</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
                  <option value="Türkçe">Türkçe</option>
                  <option value="Matematik">Matematik</option>
                  <option value="Fen Bilimleri">Fen Bilimleri</option>
                  <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Sınıf Seviyesi</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="9. Sınıf">9. Sınıf</option>
                  <option value="5. Sınıf">5. Sınıf</option>
                  <option value="1. Sınıf">1. Sınıf</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-500 block mb-1">Konu / Müfredat Kazanımı</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Paragrafta Ana Fikir ve Anlatım Yolları"
                  className="w-full h-10 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw size={15} className="animate-spin" />
                      <span>Yapay Zekâ Hazırlıyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Taslağı Üret</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800">
              * Üretilen tüm çıktılar öğretmen onayı ve düzenlemesine açık taslak metinlerdir.
            </p>
          </div>

          {/* Right Preview Card */}
          <div className="lg:col-span-7 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  Üretilen Taslak İçerik
                </span>
                {generatedResult && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-8 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                )}
              </div>

              {generatedResult ? (
                <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-mono p-3 bg-gray-50 dark:bg-[#161D2E] rounded-2xl border border-gray-100 dark:border-gray-800 max-h-[460px] overflow-y-auto custom-scrollbar">
                  {generatedResult}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 p-6 space-y-2">
                  <Sparkles size={28} className="text-gray-300 dark:text-gray-700" />
                  <p className="text-xs font-medium">
                    Parametreleri seçip &quot;Taslağı Üret&quot; butonuna basarak yapay zekâ çıktısını burada görüntüleyebilirsiniz.
                  </p>
                </div>
              )}
            </div>

            {generatedResult && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toast.success('Taslak kişisel ders notlarına kaydedildi.')}
                  className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save size={14} />
                  <span>Derslerime Kaydet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Passive Tool Notice */}
      {activeTool === 'passive' && (
        <PassiveModuleNotice
          moduleName="Yapay Zekâ Seslendirme & Eğitsel Video Üretimi"
          description="Ders metinlerinin otomatik seslendirilmesi ve yapay zekâ ile etkileşimli eğitim videolarının oluşturulması modülü."
          missingDependency="GPU Video Rendering Sunucusu & TTS (Text-to-Speech) Ses Sentezi Altyapısı"
          plannedFeatures={[
            'Metinden eğitsel podcast oluşturma',
            'Otomatik sesli ders anlatımı (Türkçe ses modelleri)',
            'Yapay zekâ destekli video animasyon taslakları',
          ]}
          relatedActivePath="/teacher/ai-assistant"
          relatedActiveLabel="Ders Planı Aracına Dön"
        />
      )}
    </div>
  )
}
