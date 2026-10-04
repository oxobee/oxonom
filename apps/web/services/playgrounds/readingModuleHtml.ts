/**
 * MEB Uyumlu Akıcı & Hızlı Okuma Atölyesi
 * Gelişmiş Süre Seçimi, Bitiş Kelimesi İşaretleme, Harf/Kelime Analizi,
 * Oturum Kaydetme ve Geçmiş Analizleri Görüntüleme Modülü
 */

export const READING_MODULE_HTML = `<!DOCTYPE html>
<html lang="tr" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Akıcı & Hızlı Okuma Atölyesi</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%; margin: 0; padding: 0;
      overflow-x: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      touch-action: manipulation;
    }
    .font-meb {
      font-family: 'Comic Neue', cursive, sans-serif;
      letter-spacing: 0.04em;
    }
    .touch-btn {
      min-height: 42px; min-width: 42px;
    }
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 8px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 8px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }

    /* Word highlighting styles */
    .word-token {
      position: relative;
      display: inline-block;
      cursor: pointer;
      border-radius: 6px;
      padding: 2px 4px;
      margin: 2px 1px;
      transition: all 0.15s ease;
      user-select: none;
      -webkit-user-select: none;
    }
    .word-token:hover {
      background-color: #fef3c7;
      transform: translateY(-1px);
    }
    /* Read words (before or at last read point) */
    .word-read {
      background-color: #ecfdf5;
      color: #064e3b;
      font-weight: 600;
    }
    /* Unread words (after last read point) */
    .word-unread {
      color: #94a3b8;
      background-color: transparent;
      opacity: 0.65;
    }
    /* Last read target word */
    .word-last-read {
      background-color: #10b981 !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      transform: scale(1.05);
      z-index: 10;
    }
    .word-last-read::after {
      content: '📍';
      position: absolute;
      top: -14px;
      right: -8px;
      font-size: 14px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    /* Error marked word */
    .word-error {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
      text-decoration: line-through;
      font-weight: 700;
      border-bottom: 2px dashed #ef4444;
    }
  </style>
</head>
<body class="h-full w-full bg-slate-50 text-slate-800 flex flex-col overflow-y-auto md:overflow-hidden select-none">

  <!-- Header Bar -->
  <header class="bg-white border-b border-amber-200/70 p-3 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs shrink-0 z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
        ⏱️
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">Akıcı & Hızlı Okuma Atölyesi</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">MEB 1-4. Sınıf</span>
        </div>
        <p class="text-[11px] text-amber-700 font-semibold">Süre Ayarlı Okuma, Kelime/Harf Analizi & Gelişim Takip Modülü</p>
      </div>
    </div>

    <!-- Mode & Navigation Tabs -->
    <div class="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
      <!-- Tab Buttons -->
      <div class="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button id="navTabReading" onclick="switchNavTab('reading')" class="touch-btn px-3 py-1.5 rounded-xl bg-white text-amber-950 shadow-xs transition cursor-pointer flex items-center gap-1.5">
          <span>📖 Okuma & Sayaç</span>
        </button>
        <button id="navTabHistory" onclick="switchNavTab('history')" class="touch-btn px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5">
          <span>📊 Geçmiş Analizler</span>
          <span id="historyBadgeCount" class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold hidden">0</span>
        </button>
        <button id="navTabPyramid" onclick="switchNavTab('pyramid')" class="touch-btn px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5">
          <span>🔺 Piramit Çalışması</span>
        </button>
      </div>

      <!-- Font size controls -->
      <div class="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
        <button onclick="changeFontSize(-2)" title="Yazıyı Küçült" class="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-btn cursor-pointer">A-</button>
        <span id="fontSizeDisplay" class="text-[11px] font-bold text-slate-500 px-1">20px</span>
        <button onclick="changeFontSize(2)" title="Yazıyı Büyüt" class="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-btn cursor-pointer">A+</button>
      </div>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- 1. MAIN READING & TIMER VIEW               -->
  <!-- ========================================== -->
  <main id="viewReading" class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4">
    <!-- Left: Reading Canvas -->
    <div class="flex-1 bg-white rounded-3xl border border-amber-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between overflow-y-auto min-h-[380px]">
      <div>
        <!-- Top Toolbar: Story + Grade + Duration + Click Mode -->
        <div class="pb-3 mb-3 border-b border-slate-100 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-wrap">
            <!-- Story Dropdown -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Metin:</span>
              <select id="storySelect" onchange="loadSelectedStory(this.value)" class="text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer">
                <option value="0">1. Sınıf: Güneşli Bir Orman Gezisi</option>
                <option value="1">1. Sınıf: Sevimli Köpek Karabaş</option>
                <option value="2">1. Sınıf: Kırmızı Uçurtmanın Yolculuğu</option>
                <option value="3">2. Sınıf: Çiftlikteki Neşeli Ördekler</option>
                <option value="4">2. Sınıf: Kütüphanedeki Gizemli Kitap</option>
                <option value="5">3. Sınıf: Küçük Tohumun Büyük Rüyası</option>
                <option value="6">3. Sınıf: Uzay Gemisiyle Ay Macerası</option>
                <option value="7">4. Sınıf: Deniz Fenerinin Cesur Bekçisi</option>
                <option value="8">4. Sınıf: Keloğlan ile Bilge Dede Masalı</option>
                <option value="custom">✏️ Kendi Metnimi Yapıştır / Yaz</option>
              </select>
            </div>

            <!-- Grade Target Selector -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Kriter:</span>
              <select id="gradeSelect" onchange="updateGradeTarget(this.value)" class="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer">
                <option value="1">1. Sınıf (Hedef 45-65 WPM)</option>
                <option value="2">2. Sınıf (Hedef 65-90 WPM)</option>
                <option value="3">3. Sınıf (Hedef 80-110 WPM)</option>
                <option value="4">4. Sınıf (Hedef 100-130 WPM)</option>
              </select>
            </div>
          </div>

          <!-- Duration Picker Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-50">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">⏱️ Süre:</span>
              <div class="flex items-center gap-1 flex-wrap" id="durationPillsContainer">
                <button onclick="setDuration(30)" id="durBtn_30" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer">30 sn</button>
                <button onclick="setDuration(60)" id="durBtn_60" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs transition cursor-pointer">1 dk (60 sn)</button>
                <button onclick="setDuration(120)" id="durBtn_120" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer">2 dk</button>
                <button onclick="setDuration(180)" id="durBtn_180" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer">3 dk</button>
                <button onclick="setDuration(300)" id="durBtn_300" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer">5 dk</button>
                <button onclick="setDuration('free')" id="durBtn_free" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer">⏱️ Serbest</button>
                <button onclick="promptCustomDuration()" id="durBtn_custom" class="dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer">⚙️ Özel</button>
              </div>
            </div>

            <!-- Click Mode Switch (Mark Finish vs Mark Error) -->
            <div class="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span class="text-[11px] font-bold text-slate-500 ps-1">Dokunma:</span>
              <button id="modeBtnFinish" onclick="setClickMode('finish')" class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition cursor-pointer">
                📍 Bitiş Kelimesi
              </button>
              <button id="modeBtnError" onclick="setClickMode('error')" class="px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer">
                ❌ Hata
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Story Input Box (Only visible when "custom" story selected) -->
        <div id="customStoryBox" class="hidden mb-4 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
          <label class="block text-xs font-bold text-amber-900">Kendi Metnini Buraya Yapıştır veya Yaz:</label>
          <textarea id="customStoryInput" rows="4" class="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400" placeholder="Metninizi buraya yazın veya yapıştırın..."></textarea>
          <button onclick="applyCustomStory()" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer">
            Metni Yükle ve Başlat
          </button>
        </div>

        <!-- The Reading Text Container -->
        <div class="relative min-h-[160px] py-1">
          <div id="storyContainer" class="font-meb leading-relaxed text-slate-800 text-justify" style="font-size: 20px;">
            <!-- Words will be injected here as interactive tokens -->
          </div>
        </div>
      </div>

      <!-- Bottom Interactive Guidance Bar -->
      <div class="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span id="readingLiveHint" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
            <span>💡 İpucu:</span>
            <span>Okumayı tamamlayınca son okuduğunuz kelimeye dokunun.</span>
          </span>
          <span id="markedWordLabel" class="text-[11px] font-semibold text-slate-600">İşaretli Son Kelime: <em>Henüz seçilmedi</em></span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="clearAllMarks()" class="text-slate-400 hover:text-slate-700 font-bold underline cursor-pointer text-[11px]">
            İşaretleri Sıfırla
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Big Timer & Real-time Live Stats Column -->
    <div class="w-full md:w-80 flex flex-col gap-3 shrink-0">
      <!-- Animated Timer Card -->
      <div class="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg flex flex-col items-center text-center relative overflow-hidden">
        <span class="text-xs font-bold text-amber-100 uppercase tracking-widest mb-0.5" id="timerModeLabel">Geri Sayım Sayacı</span>
        
        <!-- Big Number Display -->
        <div class="text-5xl sm:text-6xl font-black tracking-tight my-2 flex items-baseline justify-center gap-1 drop-shadow-md">
          <span id="timerDisplay">60</span>
          <span class="text-2xl font-bold text-amber-100" id="timerUnit">sn</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-black/20 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-white/20">
          <div id="timerProgress" class="bg-white h-full rounded-full transition-all duration-300 shadow-inner" style="width: 100%;"></div>
        </div>

        <!-- Action Control Buttons -->
        <div class="grid grid-cols-2 gap-2 w-full">
          <button id="startBtn" onclick="toggleTimer()" class="touch-btn bg-white text-amber-950 hover:bg-amber-50 font-black rounded-2xl py-3 shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer">
            ▶️ Başlat
          </button>
          <button onclick="resetTimer()" class="touch-btn bg-amber-700/60 hover:bg-amber-700 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-1.5 transition cursor-pointer">
            🔄 Sıfırla
          </button>
        </div>
      </div>

      <!-- Real-Time Metrics & Live Evaluation -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span>
            <span>Canlı Okuma Analizi</span>
          </h3>
          <span id="liveAccuracyBadge" class="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            %100 Doğruluk
          </span>
        </div>

        <!-- 4-Grid Live Metrics -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Okunan Kelime</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statWordsRead" class="text-2xl font-black text-slate-900">0</span>
              <span id="statTotalWords" class="text-xs text-slate-400 font-semibold">/ 0</span>
            </div>
          </div>
          <div class="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Okunan Harf</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statLettersRead" class="text-2xl font-black text-indigo-950">0</span>
              <span class="text-xs text-indigo-400 font-semibold">harf</span>
            </div>
          </div>
          <div class="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Dakika Hızı (WPM)</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statWpm" class="text-2xl font-black text-emerald-700">0</span>
              <span class="text-xs text-emerald-600 font-semibold">kelime/dk</span>
            </div>
          </div>
          <div class="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Harf Hızı (CPM)</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="statCpm" class="text-2xl font-black text-amber-800">0</span>
              <span class="text-xs text-amber-600 font-semibold">harf/dk</span>
            </div>
          </div>
        </div>

        <!-- Errors Count Row -->
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span class="text-slate-600 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            Hatalı / Atlanan Kelime:
          </span>
          <span id="statErrorsCount" class="font-black text-red-600 text-sm">0</span>
        </div>

        <!-- Finish Session & Generate Report Button -->
        <button onclick="finishAndAnalyze()" class="touch-btn w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
          <span>🏁</span>
          <span>Okumayı Bitir & Karnemi Oluştur</span>
        </button>
      </div>
    </div>
  </main>

  <!-- ========================================== -->
  <!-- 2. HISTORY & ANALYTICS VIEW                -->
  <!-- ========================================== -->
  <section id="viewHistory" class="hidden flex-1 flex-col overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">
    <!-- Header of History -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
      <div>
        <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>📊</span>
          <span>Geçmiş Okuma Analizlerim & Gelişim Karnesi</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">Tamamladığınız tüm okuma seansları, kelime/harf hızlarınız ve başarı gelişiminiz.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchNavTab('reading')" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer">
          + Yeni Okuma Yap
        </button>
        <button onclick="clearHistoryConfirm()" class="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold rounded-xl transition cursor-pointer">
          Geçmişi Temizle
        </button>
      </div>
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ortalama Hız</span>
        <span id="histAvgWpm" class="text-xl font-black text-emerald-600 mt-1 block">0 WPM</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rekor Hız</span>
        <span id="histMaxWpm" class="text-xl font-black text-indigo-600 mt-1 block">0 WPM</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Kelime</span>
        <span id="histTotalWords" class="text-xl font-black text-slate-800 mt-1 block">0</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Harf</span>
        <span id="histTotalLetters" class="text-xl font-black text-slate-800 mt-1 block">0</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ort. Doğruluk</span>
        <span id="histAvgAcc" class="text-xl font-black text-amber-600 mt-1 block">%0</span>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Oturum</span>
        <span id="histTotalSessions" class="text-xl font-black text-slate-800 mt-1 block">0</span>
      </div>
    </div>

    <!-- History Cards Feed -->
    <div class="space-y-3" id="historyCardsContainer">
      <!-- History session cards rendered via JS -->
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 3. WORD & SYLLABLE PYRAMID VIEW            -->
  <!-- ========================================== -->
  <section id="viewPyramid" class="hidden flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full flex-col items-center justify-center space-y-4 font-meb text-center">
    <div class="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm w-full max-w-xl mx-auto space-y-4">
      <div class="text-center">
        <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">Göz Genişletme & Akıcılık Egzersizi</span>
        <h2 class="text-xl font-black text-slate-900 mt-1">Hece & Kelime Piramidi</h2>
        <p class="text-xs text-slate-500 mt-1">Gözlerinizi satırların ortasında tutarak tek bakışta tüm satırı okumaya çalışın.</p>
      </div>

      <div id="pyramidRows" class="space-y-3 py-4 flex flex-col items-center">
        <!-- Rows injected here -->
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button onclick="nextPyramidExercise()" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer transition">
          Sıradaki Piramidi Getir
        </button>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 4. DETAILED REPORT & SAVE MODAL            -->
  <!-- ========================================== -->
  <div id="reportModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center space-y-4 animate-scaleIn border border-slate-100">
      <div class="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
        🎉
      </div>

      <div>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 mb-1" id="repBadge">
          Üstün Akıcılık 🏆
        </div>
        <h3 class="text-xl font-black text-slate-900" id="repTitle">Okuma Raporun Hazırlandı!</h3>
        <p class="text-xs text-slate-500 mt-0.5" id="repSubtitle">İşaretlediğin kelimeye kadar yapılan detaylı analiz:</p>
      </div>

      <!-- 4-Box Metric Matrix -->
      <div class="grid grid-cols-2 gap-2.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Okunan Kelime</span>
          <span id="repWords" class="text-xl font-black text-slate-900">0</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-indigo-400 block uppercase">Okunan Harf</span>
          <span id="repLetters" class="text-xl font-black text-indigo-700">0</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-emerald-500 block uppercase">Dakika Hızı (WPM)</span>
          <span id="repWpm" class="text-xl font-black text-emerald-600">0</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-amber-500 block uppercase">Harf Hızı (CPM)</span>
          <span id="repCpm" class="text-xl font-black text-amber-700">0</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Geçen Süre</span>
          <span id="repElapsed" class="text-base font-bold text-slate-800">0 sn</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Doğruluk</span>
          <span id="repAccuracy" class="text-base font-bold text-emerald-600">%100</span>
        </div>
      </div>

      <!-- Pedagogical Feedback Card -->
      <div class="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-left">
        <span class="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">Pedagojik Değerlendirme & Tavsiye</span>
        <p class="text-xs text-amber-950 font-medium leading-relaxed" id="repFeedback">
          Tebrikler! Sınıf hedeflerine tam uygun ritmik bir okuma gerçekleştirdin.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 pt-1">
        <button id="saveAnalysisBtn" onclick="saveCurrentAnalysis()" class="touch-btn w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
          <span>💾</span>
          <span id="saveBtnText">Bu Analizi Geçmişime Kaydet</span>
        </button>
        <button onclick="closeReportModal()" class="touch-btn w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer">
          Kapat & Devam Et
        </button>
      </div>
    </div>
  </div>

  <script>
    // ==========================================
    // DATA & STORIES REPOSITORY
    // ==========================================
    const STORIES = [
      {
        title: "1. Sınıf: Güneşli Bir Orman Gezisi",
        grade: "1. Sınıf",
        text: "Ali ile Ayşe sabah erkenden uyandılar. Hava çok güzel ve güneşliydi. Anneleri onlara lezzetli sandviçler hazırladı. Birlikte büyük yeşil ormana doğru yürümeye başladılar. Ağaçların dallarında renkli kuşlar neşeyle şarkı söylüyordu. Ali küçük bir sincap gördü. Sincap bir meşe palamudunu hızla ağaca taşıyordu. Ayşe rengarenk kelebeklerin peşinden koştu. Çiçeklerin kokusu tüm ormanı sarmıştı. Öğlen olunca büyük bir çınar ağacının gölgesinde piknik yaptılar. Ormanı temiz bıraktılar ve eve mutlu bir şekilde döndüler."
      },
      {
        title: "1. Sınıf: Sevimli Köpek Karabaş",
        grade: "1. Sınıf",
        text: "Karabaş, çiftlikte yaşayan sevimli ve sadık bir köpektir. Beyaz tüyleri ve siyah kulakları vardır. Her sabah çocukları kapıda karşılar, kuyruğunu sallar. Bugün çiftliğe küçük bir kedi yavrusu geldi. Karabaş önce şaşırdı, sonra kediyle dost oldu. Birlikte çimenlerin üzerinde koştular, top oynadılar. Akşam olunca çiftliği güvenle bekledi. Karabaş herkesin en sevdiği dostuydu."
      },
      {
        title: "1. Sınıf: Kırmızı Uçurtmanın Yolculuğu",
        grade: "1. Sınıf",
        text: "Mert, babasıyla birlikte kırmızı renkli harika bir uçurtma yaptı. Uçurtmanın uzun ve rengarenk bir kuyruğu vardı. Rüzgarlı bir tepeye çıktılar. Mert ipi tuttu ve koşmaya başladı. Uçurtma yavaşça gökyüzüne yükseldi. Bulutların arasında bir kuş gibi dans etti. Gökyüzündeki diğer uçurtmalara el salladı. Rüzgar dinince yavaşça Mert'in kollarına geri döndü."
      },
      {
        title: "2. Sınıf: Çiftlikteki Neşeli Ördekler",
        grade: "2. Sınıf",
        text: "Göl kıyısında yaşayan beş küçük ördek vardı. Anneleri onlara her sabah yüzme dersi verirdi. Paytak adımlarla suya daldılar. Suyun içinde minik balıklarla saklambaç oynadılar. Güneş batarken göl altın gibi parıldıyordu. Hep birlikte neşeyle vakvaklayarak yuvalarına döndüler."
      },
      {
        title: "2. Sınıf: Kütüphanedeki Gizemli Kitap",
        grade: "2. Sınıf",
        text: "Zeynep okul kütüphanesini çok severdi. Rafların arasında gezinirken deri kaplı eski bir kitap buldu. Kitabı açtığında içinden yıldızlar ve gezegenler anlatılan sihirli sayfalar çıktı. Bilginin en büyük güç olduğunu anladı ve o günden sonra her gün bir kitap okumaya karar verdi."
      },
      {
        title: "3. Sınıf: Küçük Tohumun Büyük Rüyası",
        grade: "3. Sınıf",
        text: "Toprağın derinliklerinde uyuyan minik bir elma tohumu vardı. Yağmur yağdı, güneş toprağı ısıttı. Tohum uyanıp yavaşça filizlendi. Yıllar geçtikçe büyüdü, güçlü dalları ve tatlı elmaları olan kocaman bir ağaç oldu. Çocuklar gölgesinde oyunlar oynadı."
      },
      {
        title: "3. Sınıf: Uzay Gemisiyle Ay Macerası",
        grade: "3. Sınıf",
        text: "Astronot Can ve arkadaşları beyaz uzay kıyafetlerini giydiler. Geri sayım tamamlandığında roket büyük bir gürültüyle gökyüzüne doğru fırlatıldı. Yerçekimsiz ortamda meyve sularını havada yakalayarak içtiler. Ay'ın yüzeyine indiklerinde gri kraterler üzerinde zıplayarak Türk bayrağını diktiler."
      },
      {
        title: "4. Sınıf: Deniz Fenerinin Cesur Bekçisi",
        grade: "4. Sınıf",
        text: "Kocaman dalgaların vurduğu sarp kayalıkların üzerinde heybetli bir deniz feneri yükseliyordu. İhtiyar fenerci Hasan Amca, fırtınalı gecelerde devasa lambanın kristal camlarını özenle siler ve ışığı hiç söndürmezdi. Çünkü o ışık, gecenin zifiri karanlığında yolunu arayan yüzlerce geminin umuduydu."
      },
      {
        title: "4. Sınıf: Keloğlan ile Bilge Dede Masalı",
        grade: "4. Sınıf",
        text: "Bir varmış bir yokmuş. Günlerden bir gün saf kalpli Keloğlan heybesine biraz kuru ekmek koyup yola koyulmuş. Yolda ak sakallı yaşlı bir dedeye rastlamış. Ekmeğini onunla bölüşen Keloğlan'a bilge dede gizli bir bilmece vermiş. Sabır ve doğruluk ile her kapının açılacağını öğütlemiş."
      }
    ];

    const PYRAMIDS_LIST = [
      [["Oku"], ["Ali oku"], ["Ali kitap oku"], ["Ali güzel kitap oku"], ["Ali her gün güzel kitap oku"]],
      [["Bak"], ["Kuşa bak"], ["Uçan kuşa bak"], ["Mavi gökte uçan kuşa bak"], ["Mavi gökte neşeyle uçan kuşa bak"]],
      [["Koş"], ["Can koş"], ["Hızlıca Can koş"], ["Parkta neşeyle Can koş"], ["Güneşli parkta neşeyle Can koş"]]
    ];
    let currentPyramidIndex = 0;

    // ==========================================
    // STATE
    // ==========================================
    let currentStoryIndex = 0;
    let storyWords = [];
    let lastReadIndex = -1; // -1 means none marked yet
    let errorIndices = new Set();
    let clickMode = 'finish'; // 'finish' | 'error'
    let selectedGrade = 1;

    // Timer state
    let selectedDurationMode = 60; // 30, 60, 120, 180, 300, 'free', or custom number
    let currentTimerSecs = 60;
    let elapsedSeconds = 0;
    let isRunning = false;
    let timerInterval = null;

    let fontSize = 20;
    let lastGeneratedSession = null;

    // Web Audio synthesizer for tactile sound
    function playAudioTone(freq, dur = 0.08, type = 'sine') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
      loadSelectedStory(0);
      renderPyramid(0);
      loadHistoryFromStorage();
      updateDurationUI();
    }

    // ==========================================
    // NAVIGATION TABS
    // ==========================================
    function switchNavTab(tab) {
      document.getElementById('viewReading').classList.add('hidden');
      document.getElementById('viewHistory').classList.add('hidden');
      document.getElementById('viewPyramid').classList.add('hidden');

      ['navTabReading', 'navTabHistory', 'navTabPyramid'].forEach(id => {
        const btn = document.getElementById(id);
        btn.className = 'touch-btn px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5';
      });

      if (tab === 'reading') {
        document.getElementById('viewReading').classList.remove('hidden');
        document.getElementById('navTabReading').className = 'touch-btn px-3 py-1.5 rounded-xl bg-white text-amber-950 shadow-xs transition cursor-pointer flex items-center gap-1.5';
      } else if (tab === 'history') {
        document.getElementById('viewHistory').classList.remove('hidden');
        document.getElementById('navTabHistory').className = 'touch-btn px-3 py-1.5 rounded-xl bg-white text-amber-950 shadow-xs transition cursor-pointer flex items-center gap-1.5';
        renderHistoryFeed();
      } else if (tab === 'pyramid') {
        document.getElementById('viewPyramid').classList.remove('hidden');
        document.getElementById('navTabPyramid').className = 'touch-btn px-3 py-1.5 rounded-xl bg-white text-amber-950 shadow-xs transition cursor-pointer flex items-center gap-1.5';
      }
    }

    // ==========================================
    // STORY LOADING & RENDERING
    // ==========================================
    function loadSelectedStory(val) {
      if (val === 'custom') {
        document.getElementById('customStoryBox').classList.remove('hidden');
        document.getElementById('storyContainer').innerHTML = '<p class="text-slate-400 italic text-center py-6">Kendi metninizi yukarıdaki alana girip "Metni Yükle"ye tıklayın.</p>';
        return;
      }
      document.getElementById('customStoryBox').classList.add('hidden');
      currentStoryIndex = parseInt(val, 10);
      const s = STORIES[currentStoryIndex];
      storyWords = s.text.trim().split(/\\s+/);
      lastReadIndex = -1;
      errorIndices.clear();
      resetTimer();
      renderStoryTokens();
      updateLiveStats();
    }

    function applyCustomStory() {
      const text = document.getElementById('customStoryInput').value.trim();
      if (!text) {
        alert('Lütfen bir metin giriniz.');
        return;
      }
      storyWords = text.split(/\\s+/);
      lastReadIndex = -1;
      errorIndices.clear();
      resetTimer();
      renderStoryTokens();
      updateLiveStats();
    }

    function renderStoryTokens() {
      const container = document.getElementById('storyContainer');
      container.innerHTML = '';
      storyWords.forEach((word, idx) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'word-token';
        span.id = 'wordToken_' + idx;

        // Apply classes based on state
        if (lastReadIndex >= 0) {
          if (idx < lastReadIndex) {
            span.classList.add('word-read');
          } else if (idx === lastReadIndex) {
            span.classList.add('word-last-read');
          } else {
            span.classList.add('word-unread');
          }
        }
        if (errorIndices.has(idx)) {
          span.classList.add('word-error');
        }

        span.onclick = () => handleWordClick(idx);
        container.appendChild(span);
        // Add spacing node
        container.appendChild(document.createTextNode(' '));
      });

      // Update marked word indicator
      const markedLabel = document.getElementById('markedWordLabel');
      if (lastReadIndex >= 0 && lastReadIndex < storyWords.length) {
        const cleanWord = storyWords[lastReadIndex].replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '');
        markedLabel.innerHTML = 'İşaretli Son Kelime: <strong class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">' + (lastReadIndex + 1) + '. "' + cleanWord + '"</strong>';
      } else {
        markedLabel.innerHTML = 'İşaretli Son Kelime: <em>Henüz seçilmedi (tüm metin)</em>';
      }
    }

    // ==========================================
    // WORD CLICK & MARKING LOGIC
    // ==========================================
    function setClickMode(mode) {
      clickMode = mode;
      const bFin = document.getElementById('modeBtnFinish');
      const bErr = document.getElementById('modeBtnError');
      if (mode === 'finish') {
        bFin.className = 'px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition cursor-pointer';
        bErr.className = 'px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer';
      } else {
        bErr.className = 'px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-600 text-white shadow-xs transition cursor-pointer';
        bFin.className = 'px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-600 transition cursor-pointer';
      }
    }

    function handleWordClick(idx) {
      playAudioTone(clickMode === 'finish' ? 680 : 380, 0.05);

      if (clickMode === 'finish') {
        // Toggle or set finish marker
        if (lastReadIndex === idx) {
          lastReadIndex = -1; // unmark
        } else {
          lastReadIndex = idx;
        }
      } else {
        // Toggle error
        if (errorIndices.has(idx)) {
          errorIndices.delete(idx);
        } else {
          errorIndices.add(idx);
        }
      }

      renderStoryTokens();
      updateLiveStats();
    }

    function clearAllMarks() {
      lastReadIndex = -1;
      errorIndices.clear();
      renderStoryTokens();
      updateLiveStats();
    }

    // ==========================================
    // DURATION & TIMER ENGINE
    // ==========================================
    function setDuration(mode) {
      if (isRunning) pauseTimer();
      selectedDurationMode = mode;
      updateDurationUI();
      resetTimer();
    }

    function promptCustomDuration() {
      const input = prompt('Kaç saniyelik okuma yapmak istersiniz? (Örn: 45, 90, 150):', '45');
      if (input) {
        const secs = parseInt(input, 10);
        if (secs > 5 && secs <= 3600) {
          selectedDurationMode = secs;
          updateDurationUI();
          resetTimer();
        } else {
          alert('Lütfen 5 ile 3600 saniye arasında geçerli bir değer girin.');
        }
      }
    }

    function updateDurationUI() {
      document.querySelectorAll('.dur-pill').forEach(btn => {
        btn.className = 'dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 transition cursor-pointer';
      });
      const activeBtnId = 'durBtn_' + selectedDurationMode;
      const activeBtn = document.getElementById(activeBtnId);
      if (activeBtn) {
        activeBtn.className = 'dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs transition cursor-pointer';
      } else if (typeof selectedDurationMode === 'number') {
        const cBtn = document.getElementById('durBtn_custom');
        cBtn.className = 'dur-pill px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs transition cursor-pointer';
        cBtn.textContent = '⚙️ ' + selectedDurationMode + ' sn';
      }

      const modeLabel = document.getElementById('timerModeLabel');
      const unitLabel = document.getElementById('timerUnit');
      if (selectedDurationMode === 'free') {
        modeLabel.textContent = '⏱️ Serbest Kronometre';
        unitLabel.textContent = 'sn';
      } else {
        modeLabel.textContent = 'Geri Sayım Sayacı';
        unitLabel.textContent = 'sn';
      }
    }

    function toggleTimer() {
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }

    function startTimer() {
      isRunning = true;
      document.getElementById('startBtn').innerHTML = '⏸️ Duraklat';
      playAudioTone(880, 0.1);

      timerInterval = setInterval(() => {
        if (selectedDurationMode === 'free') {
          // Count up
          elapsedSeconds++;
          document.getElementById('timerDisplay').textContent = elapsedSeconds;
          document.getElementById('timerProgress').style.width = '100%';
        } else {
          // Count down
          currentTimerSecs--;
          elapsedSeconds = selectedDurationMode - currentTimerSecs;
          document.getElementById('timerDisplay').textContent = Math.max(0, currentTimerSecs);
          const pct = Math.max(0, (currentTimerSecs / selectedDurationMode) * 100);
          document.getElementById('timerProgress').style.width = pct + '%';

          if (currentTimerSecs <= 0) {
            pauseTimer();
            // Two-tone bell
            playAudioTone(600, 0.15);
            setTimeout(() => playAudioTone(950, 0.4, 'triangle'), 150);
            finishAndAnalyze(true);
          }
        }
        updateLiveStats();
      }, 1000);
    }

    function pauseTimer() {
      isRunning = false;
      clearInterval(timerInterval);
      document.getElementById('startBtn').innerHTML = '▶️ Başlat';
    }

    function resetTimer() {
      pauseTimer();
      if (selectedDurationMode === 'free') {
        currentTimerSecs = 0;
        elapsedSeconds = 0;
        document.getElementById('timerDisplay').textContent = '0';
        document.getElementById('timerProgress').style.width = '100%';
      } else {
        currentTimerSecs = selectedDurationMode;
        elapsedSeconds = 0;
        document.getElementById('timerDisplay').textContent = selectedDurationMode;
        document.getElementById('timerProgress').style.width = '100%';
      }
      updateLiveStats();
    }

    // ==========================================
    // CALCULATION & STATS LOGIC
    // ==========================================
    function calculateSessionMetrics() {
      const totalWordsInStory = storyWords.length;
      // If user marked a finish word, we consider words up to that index.
      // If none marked, we consider the entire story (or 0 if not read)
      const effectiveEndIdx = lastReadIndex >= 0 ? lastReadIndex : (totalWordsInStory - 1);
      const wordsRead = lastReadIndex >= 0 ? (lastReadIndex + 1) : totalWordsInStory;

      // Count letters (only alpha/numeric characters, excluding punctuation)
      let lettersRead = 0;
      for (let i = 0; i <= effectiveEndIdx && i < storyWords.length; i++) {
        const clean = storyWords[i].replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '');
        lettersRead += clean.length;
      }

      // Errors in the read span
      let errorsInRead = 0;
      errorIndices.forEach(idx => {
        if (idx <= effectiveEndIdx) errorsInRead++;
      });

      const effectiveSeconds = Math.max(1, elapsedSeconds > 0 ? elapsedSeconds : (selectedDurationMode === 'free' ? 60 : selectedDurationMode));
      const minutes = effectiveSeconds / 60;
      const netWords = Math.max(0, wordsRead - errorsInRead);

      const wpm = minutes > 0 ? Math.round(netWords / minutes) : netWords;
      const cpm = minutes > 0 ? Math.round(lettersRead / minutes) : lettersRead;
      const accuracy = wordsRead > 0 ? Math.round((netWords / wordsRead) * 100) : 100;

      // Pedagogical Evaluation based on Grade
      const evalResult = getPedagogicalEvaluation(wpm, selectedGrade);

      return {
        wordsRead,
        lettersRead,
        totalWordsInStory,
        errorsInRead,
        effectiveSeconds,
        wpm,
        cpm,
        accuracy,
        evalResult
      };
    }

    function getPedagogicalEvaluation(wpm, grade) {
      // Targets by grade (MEB Standartları)
      const thresholds = {
        1: { dev: 30, ok: 45, great: 65 },
        2: { dev: 45, ok: 65, great: 90 },
        3: { dev: 60, ok: 80, great: 110 },
        4: { dev: 75, ok: 100, great: 130 }
      }[grade] || { dev: 45, ok: 65, great: 90 };

      if (wpm >= thresholds.great) {
        return {
          badge: "Üstün Akıcılık 🏆",
          badgeColor: "bg-emerald-100 text-emerald-800",
          note: grade + ". sınıf seviyesinin üzerinde harika bir akıcılık, göz sıçraması ve kavrayış!"
        };
      } else if (wpm >= thresholds.ok) {
        return {
          badge: "Hedefe Tam Uygun 🌟",
          badgeColor: "bg-teal-100 text-teal-800",
          note: grade + ". sınıf müfredat kazanım hızına tam uygun, dengeli ve ritmik bir okuma temposu."
        };
      } else if (wpm >= thresholds.dev) {
        return {
          badge: "Gelişmekte Olan Okuyucu 📈",
          badgeColor: "bg-amber-100 text-amber-800",
          note: "İyi bir gayret! Kelimeleri hecelemeden gözle bütün olarak kavramaya çalışarak hızını artırabilirsin."
        };
      } else {
        return {
          badge: "Desteklenmeli 🌱",
          badgeColor: "bg-rose-100 text-rose-800",
          note: "Düzenli piramit ve hece egzersizleriyle kelime dağarcığını pekiştirip daha yüksek akıcılığa ulaşabilirsin."
        };
      }
    }

    function updateGradeTarget(g) {
      selectedGrade = parseInt(g, 10);
      updateLiveStats();
    }

    function updateLiveStats() {
      const m = calculateSessionMetrics();
      document.getElementById('statWordsRead').textContent = m.wordsRead;
      document.getElementById('statTotalWords').textContent = '/ ' + m.totalWordsInStory;
      document.getElementById('statLettersRead').textContent = m.lettersRead;
      document.getElementById('statWpm').textContent = m.wpm;
      document.getElementById('statCpm').textContent = m.cpm;
      document.getElementById('statErrorsCount').textContent = m.errorsInRead;
      document.getElementById('liveAccuracyBadge').textContent = '%' + m.accuracy + ' Doğruluk';
    }

    // ==========================================
    // FINISH & REPORT GENERATION
    // ==========================================
    function finishAndAnalyze(autoFromTimer = false) {
      pauseTimer();
      const m = calculateSessionMetrics();

      const storyObj = STORIES[currentStoryIndex] || { title: 'Özel Okuma Metni' };
      const lastWordClean = lastReadIndex >= 0 && lastReadIndex < storyWords.length
        ? storyWords[lastReadIndex].replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '')
        : 'Metin Sonu';

      const durLabel = selectedDurationMode === 'free'
        ? (m.effectiveSeconds + ' sn (Serbest)')
        : (selectedDurationMode + ' sn');

      // Populate Report Modal
      document.getElementById('repBadge').textContent = m.evalResult.badge;
      document.getElementById('repBadge').className = 'inline-block px-3 py-1 rounded-full text-xs font-black ' + m.evalResult.badgeColor + ' mb-1';
      document.getElementById('repWords').textContent = m.wordsRead + ' Kelime';
      document.getElementById('repLetters').textContent = m.lettersRead + ' Harf';
      document.getElementById('repWpm').textContent = m.wpm + ' WPM';
      document.getElementById('repCpm').textContent = m.cpm + ' CPM';
      document.getElementById('repElapsed').textContent = m.effectiveSeconds + ' saniye';
      document.getElementById('repAccuracy').textContent = '%' + m.accuracy;
      document.getElementById('repFeedback').textContent = m.evalResult.note;

      // Construct session record object
      const now = new Date();
      const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      lastGeneratedSession = {
        id: 'read_' + Date.now(),
        dateStr: dateStr,
        timestamp: Date.now(),
        storyTitle: storyObj.title,
        gradeLevel: selectedGrade + '. Sınıf',
        durationLabel: durLabel,
        elapsedSeconds: m.effectiveSeconds,
        wordsRead: m.wordsRead,
        lettersRead: m.lettersRead,
        totalWordsInStory: m.totalWordsInStory,
        errorsCount: m.errorsInRead,
        wpm: m.wpm,
        cpm: m.cpm,
        accuracy: m.accuracy,
        lastWord: lastWordClean,
        badge: m.evalResult.badge,
        feedback: m.evalResult.note
      };

      document.getElementById('saveBtnText').textContent = '💾 Bu Analizi Geçmişime Kaydet';
      document.getElementById('saveAnalysisBtn').disabled = false;
      document.getElementById('saveAnalysisBtn').className = 'touch-btn w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95';

      document.getElementById('reportModal').classList.remove('hidden');

      if (typeof confetti === 'function') {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
    }

    function closeReportModal() {
      document.getElementById('reportModal').classList.add('hidden');
    }

    // ==========================================
    // STORAGE & HISTORY PERSISTENCE
    // ==========================================
    const STORAGE_KEY = 'oxonom_reading_history_v2';
    let readingHistory = [];

    function loadHistoryFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          readingHistory = JSON.parse(raw);
        } else {
          // Default initial demonstration records so the student sees how progress tracks
          readingHistory = [
            {
              id: 'read_seed_1',
              dateStr: 'Dün, 16:30',
              timestamp: Date.now() - 86400000,
              storyTitle: '1. Sınıf: Güneşli Bir Orman Gezisi',
              gradeLevel: '1. Sınıf',
              durationLabel: '60 sn',
              elapsedSeconds: 60,
              wordsRead: 58,
              lettersRead: 312,
              totalWordsInStory: 95,
              errorsCount: 2,
              wpm: 56,
              cpm: 312,
              accuracy: 96,
              lastWord: 'piknik',
              badge: 'Hedefe Tam Uygun 🌟',
              feedback: '1. sınıf MEB standartlarına tam uygun, akıcı ve dengeli bir okuma temposu.'
            }
          ];
          saveHistoryToStorage();
        }
      } catch (err) {
        console.warn('Storage read failed:', err);
      }
      updateHistoryBadge();
    }

    function saveHistoryToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readingHistory));
      } catch (err) {
        console.warn('Storage save failed:', err);
      }
      updateHistoryBadge();
    }

    function updateHistoryBadge() {
      const count = readingHistory.length;
      const badge = document.getElementById('historyBadgeCount');
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function saveCurrentAnalysis() {
      if (!lastGeneratedSession) return;
      readingHistory.unshift(lastGeneratedSession);
      saveHistoryToStorage();

      // Notify parent frame if embedded
      try {
        window.parent.postMessage({
          type: 'OXONOM_READING_SAVED',
          payload: lastGeneratedSession
        }, '*');
      } catch (e) {}

      playAudioTone(1050, 0.2);
      document.getElementById('saveBtnText').textContent = '✅ Analiz Başarıyla Kaydedildi!';
      document.getElementById('saveAnalysisBtn').className = 'touch-btn w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-default';
      document.getElementById('saveAnalysisBtn').disabled = true;

      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }

      setTimeout(() => {
        closeReportModal();
        switchNavTab('history');
      }, 900);
    }

    function deleteHistoryItem(id) {
      if (!confirm('Bu okuma kaydını silmek istediğinize emin misiniz?')) return;
      readingHistory = readingHistory.filter(item => item.id !== id);
      saveHistoryToStorage();
      renderHistoryFeed();
    }

    function clearHistoryConfirm() {
      if (!confirm('Tüm geçmiş okuma analizlerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
      readingHistory = [];
      saveHistoryToStorage();
      renderHistoryFeed();
    }

    function renderHistoryFeed() {
      const container = document.getElementById('historyCardsContainer');
      container.innerHTML = '';

      if (readingHistory.length === 0) {
        container.innerHTML = 
          '<div class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">' +
            '<div class="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-3xl">📖</div>' +
            '<h3 class="text-base font-black text-slate-800">Henüz Kayıtlı Okuma Analiziniz Yok</h3>' +
            '<p class="text-xs text-slate-500 max-w-sm mx-auto">Bir okuma seansı başlatıp bitirdiğiniz kelimeyi işaretleyin ve "Analizi Kaydet" butonuna dokunun.</p>' +
            '<button onclick="switchNavTab(\\'reading\\')" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer">Hemen Okumaya Başla</button>' +
          '</div>';
        document.getElementById('histAvgWpm').textContent = '0 WPM';
        document.getElementById('histMaxWpm').textContent = '0 WPM';
        document.getElementById('histTotalWords').textContent = '0';
        document.getElementById('histTotalLetters').textContent = '0';
        document.getElementById('histAvgAcc').textContent = '%0';
        document.getElementById('histTotalSessions').textContent = '0';
        return;
      }

      // Calculate aggregated summary statistics
      let totalWords = 0;
      let totalLetters = 0;
      let totalWpm = 0;
      let maxWpm = 0;
      let totalAcc = 0;

      readingHistory.forEach(item => {
        totalWords += item.wordsRead || 0;
        totalLetters += item.lettersRead || 0;
        totalWpm += item.wpm || 0;
        if ((item.wpm || 0) > maxWpm) maxWpm = item.wpm;
        totalAcc += item.accuracy || 100;
      });

      const count = readingHistory.length;
      document.getElementById('histAvgWpm').textContent = Math.round(totalWpm / count) + ' WPM';
      document.getElementById('histMaxWpm').textContent = maxWpm + ' WPM';
      document.getElementById('histTotalWords').textContent = totalWords;
      document.getElementById('histTotalLetters').textContent = totalLetters;
      document.getElementById('histAvgAcc').textContent = '%' + Math.round(totalAcc / count);
      document.getElementById('histTotalSessions').textContent = count;

      // Render items list
      readingHistory.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3';
        card.innerHTML = 
          '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">' +
            '<div>' +
              '<div class="flex items-center gap-2">' +
                '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">' + (item.gradeLevel || '1. Sınıf') + '</span>' +
                '<h4 class="text-sm font-black text-slate-900">' + item.storyTitle + '</h4>' +
              '</div>' +
              '<span class="text-[11px] text-slate-400 font-medium">Tarih: ' + item.dateStr + ' • Süre: ' + item.durationLabel + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2 self-start sm:self-auto">' +
              '<span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">' + item.badge + '</span>' +
              '<button onclick="deleteHistoryItem(\\'' + item.id + '\\')" title="Bu kaydı sil" class="p-1.5 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">🗑️</button>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">' +
            '<div class="p-2 rounded-xl bg-slate-50 border border-slate-100"><span class="text-[10px] font-bold text-slate-400 block">Okunan Kelime</span><span class="text-base font-black text-slate-800">' + item.wordsRead + '</span></div>' +
            '<div class="p-2 rounded-xl bg-indigo-50/50 border border-indigo-100"><span class="text-[10px] font-bold text-indigo-500 block">Okunan Harf</span><span class="text-base font-black text-indigo-900">' + item.lettersRead + '</span></div>' +
            '<div class="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100"><span class="text-[10px] font-bold text-emerald-600 block">Kelime Hızı</span><span class="text-base font-black text-emerald-700">' + item.wpm + ' WPM</span></div>' +
            '<div class="p-2 rounded-xl bg-amber-50/50 border border-amber-100"><span class="text-[10px] font-bold text-amber-600 block">Harf Hızı</span><span class="text-base font-black text-amber-800">' + item.cpm + ' CPM</span></div>' +
            '<div class="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1"><span class="text-[10px] font-bold text-slate-400 block">Doğruluk</span><span class="text-base font-black text-slate-700">%' + item.accuracy + '</span></div>' +
          '</div>' +
          '<div class="flex items-center justify-between pt-1 text-[11px] text-slate-500">' +
            '<span>İşaretlenen Son Kelime: <strong class="text-slate-800 font-bold">\\"' + item.lastWord + '\\"</strong></span>' +
            '<span class="italic text-amber-800 font-medium truncate max-w-xs sm:max-w-md">' + item.feedback + '</span>' +
          '</div>';
        container.appendChild(card);
      });
    }

    // ==========================================
    // PYRAMID EXERCISES
    // ==========================================
    function renderPyramid(idx) {
      currentPyramidIndex = idx % PYRAMIDS_LIST.length;
      const p = PYRAMIDS_LIST[currentPyramidIndex];
      const container = document.getElementById('pyramidRows');
      container.innerHTML = '';
      p.forEach((row, i) => {
        const div = document.createElement('div');
        div.className = 'px-5 py-2.5 bg-amber-50 border border-amber-200/90 rounded-2xl font-bold text-amber-950 text-center shadow-xs transition hover:scale-105 cursor-pointer select-none';
        div.style.fontSize = (fontSize + i * 2) + 'px';
        div.textContent = row.join(' ');
        container.appendChild(div);
      });
    }

    function nextPyramidExercise() {
      playAudioTone(720, 0.05);
      renderPyramid(currentPyramidIndex + 1);
    }

    function changeFontSize(delta) {
      fontSize = Math.max(16, Math.min(32, fontSize + delta));
      document.getElementById('fontSizeDisplay').textContent = fontSize + 'px';
      document.getElementById('storyContainer').style.fontSize = fontSize + 'px';
      renderPyramid(currentPyramidIndex);
    }

    // Bootstrap
    window.onload = init;
  </script>
</body>
</html>
`;
