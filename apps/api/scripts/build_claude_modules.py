"""
Script to build the 6 authentic Claude educational modules from oxonom edu,
save them to engagement.json, and sync them into the PostgreSQL database
for both Org 1 (primary) and Org 2 (demo).

Features:
- 100% Mobile Responsive layouts (no overflows, no overlaps, flex-wrap headers).
- Module 2: Removed 'Seslendir' button, added authentic MEB letter stroke order animation engine with numbered steps and direction arrows.
- Module 3: Adım Adım Zıplayan Sayı Doğrusu with cute hopping mascot (Frog/Rabbit) and real elastic parabolic arc jump physics.
- Module 4: Authentic 3D WebGL Solar System simulation using Three.js with realistic planets, Saturn rings, glowing Sun, and touch 360° controls.
- Module 5 & 6: Fully touch-optimized classroom tools.
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timezone

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# HTML template helper
def build_html_wrapper(title: str, body_content: str, custom_head: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="tr" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>{title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * {{
      box-sizing: border-box;
    }}
    html, body {{
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }}
    body {{
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }}
    .font-meb {{
      font-family: 'Comic Neue', cursive, sans-serif;
      letter-spacing: 0.05em;
    }}
    .touch-btn {{
      min-height: 44px;
      min-width: 44px;
    }}
    /* Custom scrollbar */
    ::-webkit-scrollbar {{ width: 6px; height: 6px; }}
    ::-webkit-scrollbar-track {{ background: rgba(0,0,0,0.03); border-radius: 8px; }}
    ::-webkit-scrollbar-thumb {{ background: rgba(0,0,0,0.15); border-radius: 8px; }}
    ::-webkit-scrollbar-thumb:hover {{ background: rgba(0,0,0,0.25); }}
  </style>
  {custom_head}
</head>
<body class="h-full w-full bg-slate-50 text-slate-800 flex flex-col overflow-y-auto md:overflow-hidden">
{body_content}
</body>
</html>"""


# ==============================================================================
# MODULE 1: 1 Dk Okuma & Hızlı Okuma Atölyesi
# ==============================================================================
MODULE_1_HTML = build_html_wrapper(
    "1 Dk Okuma & Hızlı Okuma Atölyesi",
    """
  <!-- Header Bar -->
  <header class="bg-white border-b border-amber-100 p-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
        ⏱️
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">1 Dk Okuma & Hızlı Okuma Atölyesi</h1>
        <p class="text-[10px] sm:text-[11px] text-amber-600 font-semibold">MEB 1-4. Sınıf Akıcı Okuma ve Kelime Takip Aracı</p>
      </div>
    </div>
    
    <!-- Controls (Responsive wrap) -->
    <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
      <!-- Font size buttons -->
      <div class="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
        <button onclick="changeFontSize(-2)" class="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-btn">A-</button>
        <span id="fontSizeDisplay" class="text-[11px] font-bold text-slate-400 px-1">20px</span>
        <button onclick="changeFontSize(2)" class="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-btn">A+</button>
      </div>

      <!-- Mode selector -->
      <select id="modeSelect" onchange="switchMode(this.value)" class="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer">
        <option value="story">Akıcı Okuma (60 sn)</option>
        <option value="pyramid">Hece & Kelime Piramidi</option>
      </select>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4">
    <!-- Left Column: Reading Screen -->
    <div class="flex-1 bg-white rounded-3xl border border-amber-200/80 shadow-md p-4 sm:p-5 flex flex-col justify-between overflow-y-auto min-h-[350px]">
      <div>
        <!-- Text Selection bar -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Okuma Parçası:</span>
            <select id="storySelect" onchange="loadStory(this.value)" class="text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer max-w-full">
              <option value="0">1. Sınıf: Güneşli Bir Orman Gezisi</option>
              <option value="1">1. Sınıf: Sevimli Köpek Karabaş</option>
              <option value="2">1. Sınıf: Kırmızı Uçurtmanın Yolculuğu</option>
              <option value="3">2. Sınıf: Çiftlikteki Neşeli Ördekler</option>
              <option value="4">2. Sınıf: Kütüphanedeki Gizemli Kitap</option>
              <option value="5">3. Sınıf: Küçük Tohumun Büyük Rüyası</option>
            </select>
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Hatalı okunan kelimeye dokunun
          </span>
        </div>

        <!-- The Reading Text (Click words to mark error) -->
        <div id="storyContainer" class="font-meb leading-relaxed text-slate-800 select-none py-2 text-justify" style="font-size: 20px;">
          <!-- Words will be injected here -->
        </div>

        <!-- Pyramid Container (Hidden by default) -->
        <div id="pyramidContainer" class="hidden flex-col items-center justify-center py-6 space-y-3 font-meb">
          <!-- Pyramid rows injected here -->
        </div>
      </div>

      <!-- Bottom Hint -->
      <div class="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <span id="wordStats">Toplam: 0 kelime | Hatalı: 0</span>
        <button onclick="resetErrors()" class="text-amber-600 hover:text-amber-800 font-bold text-xs underline cursor-pointer">
          Hataları Temizle
        </button>
      </div>
    </div>

    <!-- Right Column: Control & Stats Dock -->
    <div class="w-full md:w-80 flex flex-col gap-3 shrink-0">
      <!-- 60-Second Timer Card -->
      <div class="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-5 shadow-lg flex flex-col items-center text-center">
        <span class="text-xs font-bold text-amber-100 uppercase tracking-widest mb-1">Geri Sayım Sayacı</span>
        
        <!-- Big LCD-style Number -->
        <div class="text-5xl sm:text-6xl font-black tracking-tight my-2 flex items-baseline gap-1 drop-shadow-md">
          <span id="timerDisplay">60</span>
          <span class="text-2xl font-bold text-amber-200">sn</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-black/20 rounded-full h-2.5 mb-4 overflow-hidden">
          <div id="timerProgress" class="bg-white h-full rounded-full transition-all duration-300" style="width: 100%;"></div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 w-full">
          <button id="startBtn" onclick="toggleTimer()" class="touch-btn bg-white text-amber-900 hover:bg-amber-50 font-black rounded-2xl py-3 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer">
            ▶️ Başlat
          </button>
          <button onclick="resetTimer()" class="touch-btn bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-1.5 transition cursor-pointer">
            🔄 Sıfırla
          </button>
        </div>
      </div>

      <!-- Live Score Board -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">🎯 Canlı Skor ve Başarı</h3>
        
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 block">Okunan</span>
            <span id="readCount" class="text-lg sm:text-xl font-black text-slate-800">0</span>
          </div>
          <div class="p-2.5 rounded-2xl bg-red-50 border border-red-100">
            <span class="text-[10px] font-bold text-red-500 block">Hata</span>
            <span id="errorCount" class="text-lg sm:text-xl font-black text-red-600">0</span>
          </div>
          <div class="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span class="text-[10px] font-bold text-emerald-600 block">Net WPM</span>
            <span id="wpmCount" class="text-lg sm:text-xl font-black text-emerald-700">0</span>
          </div>
        </div>

        <button onclick="finishSession()" class="touch-btn w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer">
          🏁 Okumayı Tamamla & Karneni Gör
        </button>
      </div>
    </div>
  </main>

  <!-- Report Modal -->
  <div id="reportModal" class="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
      <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl">
        🎉
      </div>
      <div>
        <h3 class="text-lg font-black text-slate-900">Harika Bir Okuma!</h3>
        <p class="text-xs text-slate-500 mt-1">1 dakikalık okuma sonucun hazırlandı.</p>
      </div>

      <div class="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">Toplam Kelime</span>
          <span id="repTotal" class="text-2xl font-black text-slate-800">0</span>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">Net Hız (WPM)</span>
          <span id="repWpm" class="text-2xl font-black text-emerald-600">0</span>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">Hatalı Okuma</span>
          <span id="repErrors" class="text-2xl font-black text-red-500">0</span>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 block">Doğruluk Oranı</span>
          <span id="repAcc" class="text-2xl font-black text-indigo-600">%100</span>
        </div>
      </div>

      <button onclick="closeReport()" class="touch-btn w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
        Devam Et
      </button>
    </div>
  </div>

  <script>
    const STORIES = [
      {
        title: "1. Sınıf: Güneşli Bir Orman Gezisi",
        text: "Ali ile Ayşe sabah erkenden uyandılar. Hava çok güzel ve güneşliydi. Anneleri onlara lezzetli sandviçler hazırladı. Birlikte büyük yeşil ormana doğru yürümeye başladılar. Ağaçların dallarında renkli kuşlar neşeyle şarkı söylüyordu. Ali küçük bir sincap gördü. Sincap bir meşe palamudunu hızla ağaca taşıyordu. Ayşe rengarenk kelebeklerin peşinden koştu. Çiçeklerin kokusu tüm ormanı sarmıştı. Öğlen olunca büyük bir çınar ağacının gölgesinde piknik yaptılar. Ormanı temiz bıraktılar ve eve mutlu bir şekilde döndüler."
      },
      {
        title: "1. Sınıf: Sevimli Köpek Karabaş",
        text: "Karabaş, çiftlikte yaşayan sevimli ve sadık bir köpektir. Beyaz tüyleri ve siyah kulakları vardır. Her sabah çocukları kapıda karşılar, kuyruğunu sallar. Bugün çiftliğe küçük bir kedi yavrusu geldi. Karabaş önce şaşırdı, sonra kediyle dost oldu. Birlikte çimenlerin üzerinde koştular, top oynadılar. Akşam olunca çiftliği güvenle bekledi. Karabaş herkesin en sevdiği dostuydu."
      },
      {
        title: "1. Sınıf: Kırmızı Uçurtmanın Yolculuğu",
        text: "Mert, babasıyla birlikte kırmızı renkli harika bir uçurtma yaptı. Uçurtmanın uzun ve rengarenk bir kuyruğu vardı. Rüzgarlı bir tepeye çıktılar. Mert ipi tuttu ve koşmaya başladı. Uçurtma yavaşça gökyüzüne yükseldi. Bulutların arasında bir kuş gibi dans etti. Gökyüzündeki diğer uçurtmalara el salladı. Rüzgar dinince yavaşça Mert'in kollarına geri döndü."
      },
      {
        title: "2. Sınıf: Çiftlikteki Neşeli Ördekler",
        text: "Göl kıyısında yaşayan beş küçük ördek vardı. Anneleri onlara her sabah yüzme dersi verirdi. Paytak adımlarla suya daldılar. Suyun içinde minik balıklarla saklambaç oynadılar. Güneş batarken göl altın gibi parıldıyordu. Hep birlikte neşeyle vakvaklayarak yuvalarına döndüler."
      },
      {
        title: "2. Sınıf: Kütüphanedeki Gizemli Kitap",
        text: "Zeynep okul kütüphanesini çok severdi. Rafların arasında gezinirken deri kaplı eski bir kitap buldu. Kitabı açtığında içinden yıldızlar ve gezegenler anlatılan sihirli sayfalar çıktı. Bilginin en büyük güç olduğunu anladı ve o günden sonra her gün bir kitap okumaya karar verdi."
      },
      {
        title: "3. Sınıf: Küçük Tohumun Büyük Rüyası",
        text: "Toprağın derinliklerinde uyuyan minik bir elma tohumu vardı. Yağmur yağdı, güneş toprağı ısıttı. Tohum uyanıp yavaşça filizlendi. Yıllar geçtikçe büyüdü, güçlü dalları ve tatlı elmaları olan kocaman bir ağaç oldu. Çocuklar gölgesinde oyunlar oynadı."
      }
    ];

    const PYRAMID_WORDS = [
      ["Oku"],
      ["Ali oku"],
      ["Ali kitap oku"],
      ["Ali güzel kitap oku"],
      ["Ali her gün güzel kitap oku"]
    ];

    let currentStory = 0;
    let words = [];
    let errorIndices = new Set();
    let readCount = 0;
    let timer = 60;
    let timerInterval = null;
    let isRunning = false;
    let fontSize = 20;
    let currentMode = 'story';

    function init() {
      loadStory(0);
    }

    function switchMode(mode) {
      currentMode = mode;
      const sCont = document.getElementById('storyContainer');
      const pCont = document.getElementById('pyramidContainer');
      if (mode === 'pyramid') {
        sCont.classList.add('hidden');
        pCont.classList.remove('hidden');
        pCont.classList.add('flex');
        renderPyramid();
      } else {
        pCont.classList.add('hidden');
        pCont.classList.remove('flex');
        sCont.classList.remove('hidden');
        loadStory(currentStory);
      }
    }

    function renderPyramid() {
      const container = document.getElementById('pyramidContainer');
      container.innerHTML = '';
      PYRAMID_WORDS.forEach((row, i) => {
        const div = document.createElement('div');
        div.className = 'px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl font-bold text-amber-950 text-center shadow-xs transition hover:scale-105 cursor-pointer';
        div.style.fontSize = (fontSize + i * 2) + 'px';
        div.textContent = row.join(' ');
        container.appendChild(div);
      });
    }

    function loadStory(idx) {
      currentStory = idx;
      const story = STORIES[idx];
      words = story.text.split(' ');
      errorIndices.clear();
      readCount = 0;
      resetTimer();
      renderStory();
    }

    function renderStory() {
      const container = document.getElementById('storyContainer');
      container.innerHTML = '';
      words.forEach((word, idx) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.className = 'cursor-pointer hover:bg-amber-100 rounded px-1 transition inline-block select-none';
        if (errorIndices.has(idx)) {
          span.className += ' bg-red-100 text-red-600 line-through font-bold';
        }
        span.onclick = () => toggleError(idx);
        container.appendChild(span);
      });
      updateStats();
    }

    function toggleError(idx) {
      if (errorIndices.has(idx)) {
        errorIndices.delete(idx);
      } else {
        errorIndices.add(idx);
      }
      renderStory();
    }

    function resetErrors() {
      errorIndices.clear();
      renderStory();
    }

    function changeFontSize(delta) {
      fontSize = Math.max(16, Math.min(32, fontSize + delta));
      document.getElementById('fontSizeDisplay').textContent = fontSize + 'px';
      document.getElementById('storyContainer').style.fontSize = fontSize + 'px';
      if (currentMode === 'pyramid') renderPyramid();
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
      timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timerDisplay').textContent = timer;
        const pct = (timer / 60) * 100;
        document.getElementById('timerProgress').style.width = pct + '%';

        if (timer <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          finishSession();
        }
      }, 1000);
    }

    function pauseTimer() {
      isRunning = false;
      clearInterval(timerInterval);
      document.getElementById('startBtn').innerHTML = '▶️ Devam Et';
    }

    function resetTimer() {
      pauseTimer();
      timer = 60;
      document.getElementById('timerDisplay').textContent = '60';
      document.getElementById('timerProgress').style.width = '100%';
      document.getElementById('startBtn').innerHTML = '▶️ Başlat';
    }

    function updateStats() {
      const errCount = errorIndices.size;
      const totalWords = words.length;
      document.getElementById('wordStats').textContent = `Toplam: ${totalWords} kelime | Hatalı: ${errCount}`;
      document.getElementById('readCount').textContent = totalWords;
      document.getElementById('errorCount').textContent = errCount;
      const net = Math.max(0, totalWords - errCount);
      document.getElementById('wpmCount').textContent = net;
    }

    function finishSession() {
      pauseTimer();
      const total = words.length;
      const errors = errorIndices.size;
      const net = Math.max(0, total - errors);
      const acc = total > 0 ? Math.round((net / total) * 100) : 100;

      document.getElementById('repTotal').textContent = total;
      document.getElementById('repWpm').textContent = net;
      document.getElementById('repErrors').textContent = errors;
      document.getElementById('repAcc').textContent = '%' + acc;

      document.getElementById('reportModal').classList.remove('hidden');

      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }

    function closeReport() {
      document.getElementById('reportModal').classList.add('hidden');
    }

    window.onload = init;
  </script>
    """
)


# ==============================================================================
# MODULE 2: Harf Çizgi & Yazılış Yönü Atölyesi
# (Authentic MEB Letter Stroke Order Animation & Matching Faint Tracing Guide)
# ==============================================================================
MODULE_2_HTML = build_html_wrapper(
    "Harf Çizgi & Yazılış Yönü Atölyesi",
    """
  <!-- Header Bar -->
  <header class="bg-white border-b border-indigo-100 p-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
        ✍️
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Harf Çizgi & Yazılış Yönü Atölyesi</h1>
        <p class="text-[10px] sm:text-[11px] text-indigo-600 font-semibold">MEB Dik Temel Abece Kılavuz Çizgileri ve Adımlı Yazılış Yönü Animasyonu</p>
      </div>
    </div>
    
    <!-- Case toggle & Group switcher -->
    <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
      <!-- Upper / Lower Case Toggle -->
      <div class="flex items-center bg-indigo-100/70 p-0.5 rounded-xl border border-indigo-200/50">
        <button id="caseUpperBtn" onclick="setLetterCase('upper')" class="px-2.5 py-1 text-xs font-black rounded-lg transition bg-white text-indigo-900 shadow-xs cursor-pointer">BÜYÜK</button>
        <button id="caseLowerBtn" onclick="setLetterCase('lower')" class="px-2.5 py-1 text-xs font-black rounded-lg transition text-indigo-700 hover:text-indigo-950 cursor-pointer">küçük</button>
      </div>

      <select id="groupSelect" onchange="changeGroup(this.value)" class="text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer">
        <option value="strokes">✏️ Çizgi Çalışmaları (Dik, Yatay, Eğik, Daire, Dalgalı...)</option>
        <option value="1" selected>1. Grup (E - L - A - K - İ - N)</option>
        <option value="2">2. Grup (O - M - U - T - Ü - Y)</option>
        <option value="3">3. Grup (Ö - R - I - D - S - B)</option>
        <option value="4">4. Grup (Z - Ç - G - Ş - C - P)</option>
        <option value="5">5. Grup (H - V - Ğ - F - J)</option>
        <option value="numbers">Rakamlar (1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 0)</option>
      </select>
    </div>
  </header>

  <!-- Main Content Workspace -->
  <main class="flex-1 flex flex-col p-3 md:p-5 gap-3 overflow-hidden">
    <!-- Horizontal Character Selector Strip -->
    <div id="charList" class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
      <!-- Character buttons injected by JS -->
    </div>

    <!-- Active Character Stage & Canvas -->
    <div class="flex-1 bg-white rounded-3xl border border-indigo-100 shadow-md p-3 sm:p-5 flex flex-col justify-between overflow-hidden relative">
      <!-- Top Character Info Banner -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2 shrink-0">
        <div class="flex items-center gap-2.5">
          <span id="activeCharBadge" class="font-meb text-2xl font-black text-indigo-600 bg-indigo-50 w-10 h-10 rounded-2xl flex items-center justify-center border border-indigo-100">
            E
          </span>
          <div>
            <span id="charWord" class="text-xs sm:text-sm font-extrabold text-slate-800">Elma 🍎</span>
            <span id="charDesc" class="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Büyük E (4 hamle: dikey in, üst, orta, alt çizgi)</span>
          </div>
        </div>

        <!-- Action Button: Nasıl Yazılır? -->
        <div class="flex items-center gap-2">
          <button id="guideBtn" onclick="playMebStrokeAnimation()" class="touch-btn px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer">
            ✨ Nasıl Yazılır?
          </button>
        </div>
      </div>

      <!-- 4-Line Guide Ruling & Canvas Area -->
      <div class="flex-1 relative my-2 bg-indigo-50/20 rounded-2xl border border-indigo-100 flex items-center justify-center overflow-hidden min-h-[280px]" id="canvasWrapper">
        <!-- Background Canvas: 4 MEB lines + Faint Tracing Guide (Silik Kılavuz Harf) -->
        <canvas id="bgCanvas" class="absolute inset-0 w-full h-full pointer-events-none select-none"></canvas>

        <!-- User Drawing Canvas: Freehand finger/pen drawing -->
        <canvas id="paintCanvas" class="absolute inset-0 w-full h-full cursor-crosshair touch-none"></canvas>

        <!-- Animation Layer Canvas: For MEB "Nasıl Yazılır" step animation, pencil stylus, and glowing arrows -->
        <canvas id="animCanvas" class="absolute inset-0 w-full h-full pointer-events-none z-10"></canvas>

        <!-- Floating Animated Stylus Cursor (Never stamps on canvas) -->
        <div id="stylusCursor" class="hidden absolute pointer-events-none z-30 transition-none text-2xl select-none" style="left: 0px; top: 0px; transform: translate(-4px, -24px);">
          ✏️
        </div>

        <!-- Guidance Banner (Shows active stroke) -->
        <div id="strokeBanner" class="hidden absolute top-3 bg-indigo-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full z-20 shadow-md flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span id="strokeText">1. Hamle Çiziliyor...</span>
        </div>
      </div>

      <!-- Bottom Palette & Controls -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <!-- Color Dots -->
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-bold text-slate-400 mr-1">Renk:</span>
          <button onclick="setPenColor('#4f46e5')" class="w-7 h-7 rounded-full bg-indigo-600 ring-2 ring-indigo-600/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#ef4444')" class="w-7 h-7 rounded-full bg-red-500 ring-2 ring-red-500/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#10b981')" class="w-7 h-7 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#f59e0b')" class="w-7 h-7 rounded-full bg-amber-500 ring-2 ring-amber-500/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#0f172a')" class="w-7 h-7 rounded-full bg-slate-900 ring-2 ring-slate-900/30 hover:scale-110 transition cursor-pointer"></button>
        </div>

        <!-- Brush & Clear -->
        <div class="flex items-center gap-2">
          <button onclick="clearCanvas()" class="touch-btn px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer">
            🗑️ Temizle
          </button>
          <button onclick="celebrateSuccess()" class="touch-btn px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-1 transition cursor-pointer">
            ⭐ Tamamladım!
          </button>
        </div>
      </div>
    </div>
  </main>

  <script>
    let currentCase = 'upper'; // 'upper' or 'lower'
    let activeGroup = '1';
    let activeItem = null;
    let activeChar = 'E';
    let currentColor = '#4f46e5';
    let isDrawing = false;
    let isAnimatingGuide = false;
    let animFrameId = null;

    let bgCanvas, bgCtx, paintCanvas, paintCtx, animCanvas, animCtx;

    const GROUPS = {
      strokes: [
        { char: '|', lower: '|', word: 'Dik Çizgi 📏', desc: 'Yukarıdan aşağıya dik temel çizgi' },
        { char: '—', lower: '—', word: 'Yatay Çizgi ➖', desc: 'Soldan sağa düz yatay çizgi' },
        { char: '/', lower: '/', word: 'Sağa Eğik Çizgi 📐', desc: 'Tepeden sağa eğik çizgi' },
        { char: '\\\\', lower: '\\\\', word: 'Sola Eğik Çizgi 📐', desc: 'Tepeden sola eğik çizgi' },
        { char: '○', lower: '○', word: 'Dairesel Çizgi ⚪', desc: 'Saat tersi yönünde tam yuvarlak' },
        { char: '~', lower: '~', word: 'Dalgalı Çizgi 🌊', desc: 'Kıvrımlı dalga çizgi hareketi' },
        { char: 'Z', lower: 'z', word: 'Zikzak Çizgi ⚡', desc: 'İnişli çıkışlı zikzak hareketi' },
        { char: 'C', lower: 'c', word: 'Hilal & Kavis 🌙', desc: 'Açık yarım çember yay çizgisi' }
      ],
      1: [
        { char: 'E', lower: 'e', word: 'Elma 🍎', desc: 'Büyük E (4 hamle) / Küçük e (2 hamle)' },
        { char: 'L', lower: 'l', word: 'Limon 🍋', desc: 'Büyük L (2 hamle) / Küçük l (1 hamle)' },
        { char: 'A', lower: 'a', word: 'Araba 🚗', desc: 'Büyük A (3 hamle) / Küçük a (2 hamle)' },
        { char: 'K', lower: 'k', word: 'Kedi 🐱', desc: 'Büyük K (3 hamle) / Küçük k (3 hamle)' },
        { char: 'İ', lower: 'i', word: 'İncir 🍇', desc: 'Büyük İ (2 hamle) / Küçük i (2 hamle)' },
        { char: 'N', lower: 'n', word: 'Nar 🫐', desc: 'Büyük N (3 hamle) / Küçük n (2 hamle)' }
      ],
      2: [
        { char: 'O', lower: 'o', word: 'Otobüs 🚌', desc: 'Büyük O (1 hamle) / Küçük o (1 hamle)' },
        { char: 'M', lower: 'm', word: 'Masa 🪑', desc: 'Büyük M (4 hamle) / Küçük m (3 hamle)' },
        { char: 'U', lower: 'u', word: 'Uçak ✈️', desc: 'Büyük U (1 hamle) / Küçük u (2 hamle)' },
        { char: 'T', lower: 't', word: 'Top ⚽', desc: 'Büyük T (2 hamle) / Küçük t (2 hamle)' },
        { char: 'Ü', lower: 'ü', word: 'Üzüm 🍇', desc: 'Büyük Ü (3 hamle) / Küçük ü (4 hamle)' },
        { char: 'Y', lower: 'y', word: 'Yıldız ⭐', desc: 'Büyük Y (3 hamle) / Küçük y (2 hamle)' }
      ],
      3: [
        { char: 'Ö', lower: 'ö', word: 'Ördek 🦆', desc: 'Büyük Ö (3 hamle) / Küçük ö (3 hamle)' },
        { char: 'R', lower: 'r', word: 'Roket 🚀', desc: 'Büyük R (3 hamle) / Küçük r (2 hamle)' },
        { char: 'I', lower: 'ı', word: 'Işık 💡', desc: 'Büyük I (1 hamle) / Küçük ı (1 hamle)' },
        { char: 'D', lower: 'd', word: 'Davul 🥁', desc: 'Büyük D (2 hamle) / Küçük d (2 hamle)' },
        { char: 'S', lower: 's', word: 'Saat ⏰', desc: 'Büyük S (1 hamle) / Küçük s (1 hamle)' },
        { char: 'B', lower: 'b', word: 'Balık 🐟', desc: 'Büyük B (3 hamle) / Küçük b (2 hamle)' }
      ],
      4: [
        { char: 'Z', lower: 'z', word: 'Zebra 🦓', desc: 'Büyük Z (3 hamle) / Küçük z (3 hamle)' },
        { char: 'Ç', lower: 'ç', word: 'Çiçek 🌸', desc: 'Büyük Ç (2 hamle) / Küçük ç (2 hamle)' },
        { char: 'G', lower: 'g', word: 'Gemi 🚢', desc: 'Büyük G (2 hamle) / Küçük g (2 hamle)' },
        { char: 'Ş', lower: 'ş', word: 'Şemsiye ☂️', desc: 'Büyük Ş (2 hamle) / Küçük ş (2 hamle)' },
        { char: 'C', lower: 'c', word: 'Ceviz 🌰', desc: 'Büyük C (1 hamle) / Küçük c (1 hamle)' },
        { char: 'P', lower: 'p', word: 'Papatya 🌼', desc: 'Büyük P (2 hamle) / Küçük p (2 hamle)' }
      ],
      5: [
        { char: 'H', lower: 'h', word: 'Havuç 🥕', desc: 'Büyük H (3 hamle) / Küçük h (2 hamle)' },
        { char: 'V', lower: 'v', word: 'Vazo 🏺', desc: 'Büyük V (2 hamle) / Küçük v (2 hamle)' },
        { char: 'Ğ', lower: 'ğ', word: 'Ağaç 🌳', desc: 'Büyük Ğ (3 hamle) / Küçük ğ (3 hamle)' },
        { char: 'F', lower: 'f', word: 'Fil 🐘', desc: 'Büyük F (3 hamle) / Küçük f (2 hamle)' },
        { char: 'J', lower: 'j', word: 'Jelibon 🍬', desc: 'Büyük J (1 hamle) / Küçük j (2 hamle)' }
      ],
      numbers: [
        { char: '1', lower: '1', word: 'Bir 1️⃣', desc: 'Rakam 1: eğik yukarı çıkış, dik aşağı iniş' },
        { char: '2', lower: '2', word: 'İki 2️⃣', desc: 'Rakam 2: üst kavis, çapraz iniş, taban yatay' },
        { char: '3', lower: '3', word: 'Üç 3️⃣', desc: 'Rakam 3: üst kavis, orta dönüş, alt kavis' },
        { char: '4', lower: '4', word: 'Dört 4️⃣', desc: 'Rakam 4: sol eğik in, yatay git, dikey kes' },
        { char: '5', lower: '5', word: 'Beş 5️⃣', desc: 'Rakam 5: sol dik in, alt göbek, üst yatay çizgi' },
        { char: '6', lower: '6', word: 'Altı 6️⃣', desc: 'Rakam 6: tepeden eğik in, alt tam daire göbek' },
        { char: '7', lower: '7', word: 'Yedi 7️⃣', desc: 'Rakam 7: üst yatay, çapraz iniş, orta çizgi' },
        { char: '8', lower: '8', word: 'Sekiz 8️⃣', desc: 'Rakam 8: üst halka, alt halka kıvrımlı tek hamle' },
        { char: '9', lower: '9', word: 'Dokuz 9️⃣', desc: 'Rakam 9: üst tam daire göbek, dik iniş ve alt çengel' },
        { char: '0', lower: '0', word: 'Sıfır 0️⃣', desc: 'Rakam 0: tepeden saat tersine tam elips' }
      ]
    };

    // Normalized Stroke Points for MEB Dik Temel Standard (y: 0.15 = Tepe, 0.50 = Orta, 0.85 = Taban)
    const MEB_STROKES = {
      // Basic Strokes
      '|': [[{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.85 }]],
      '—': [[{ x: 0.25, y: 0.50 }, { x: 0.75, y: 0.50 }]],
      '/': [[{ x: 0.65, y: 0.15 }, { x: 0.35, y: 0.85 }]],
      '\\\\': [[{ x: 0.35, y: 0.15 }, { x: 0.65, y: 0.85 }]],
      '○': [[{ x: 0.50, y: 0.15 }, { x: 0.30, y: 0.50 }, { x: 0.50, y: 0.85 }, { x: 0.70, y: 0.50 }, { x: 0.50, y: 0.15 }]],
      '~': [[{ x: 0.20, y: 0.55 }, { x: 0.35, y: 0.32 }, { x: 0.50, y: 0.55 }, { x: 0.65, y: 0.78 }, { x: 0.80, y: 0.55 }]],
      'Z': [
        [{ x: 0.30, y: 0.15 }, { x: 0.70, y: 0.15 }],
        [{ x: 0.70, y: 0.15 }, { x: 0.30, y: 0.85 }],
        [{ x: 0.30, y: 0.85 }, { x: 0.70, y: 0.85 }]
      ],
      'C': [[{ x: 0.65, y: 0.22 }, { x: 0.50, y: 0.15 }, { x: 0.32, y: 0.50 }, { x: 0.50, y: 0.85 }, { x: 0.65, y: 0.78 }]],

      // Uppercase Letters
      'E': [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.35, y: 0.15 }, { x: 0.68, y: 0.15 }],
        [{ x: 0.35, y: 0.50 }, { x: 0.62, y: 0.50 }],
        [{ x: 0.35, y: 0.85 }, { x: 0.68, y: 0.85 }]
      ],
      'L': [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.35, y: 0.85 }, { x: 0.68, y: 0.85 }]
      ],
      'A': [
        [{ x: 0.50, y: 0.15 }, { x: 0.28, y: 0.85 }],
        [{ x: 0.50, y: 0.15 }, { x: 0.72, y: 0.85 }],
        [{ x: 0.36, y: 0.56 }, { x: 0.64, y: 0.56 }]
      ],
      'K': [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.66, y: 0.22 }, { x: 0.36, y: 0.50 }],
        [{ x: 0.36, y: 0.50 }, { x: 0.68, y: 0.85 }]
      ],
      'İ': [
        [{ x: 0.50, y: 0.28 }, { x: 0.50, y: 0.85 }],
        [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.18 }]
      ],
      'I': [
        [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.85 }]
      ],
      'N': [
        [{ x: 0.32, y: 0.85 }, { x: 0.32, y: 0.15 }],
        [{ x: 0.32, y: 0.15 }, { x: 0.68, y: 0.85 }],
        [{ x: 0.68, y: 0.85 }, { x: 0.68, y: 0.15 }]
      ],
      'O': [
        [{ x: 0.50, y: 0.15 }, { x: 0.30, y: 0.50 }, { x: 0.50, y: 0.85 }, { x: 0.70, y: 0.50 }, { x: 0.50, y: 0.15 }]
      ],
      'M': [
        [{ x: 0.30, y: 0.85 }, { x: 0.30, y: 0.15 }],
        [{ x: 0.30, y: 0.15 }, { x: 0.50, y: 0.62 }],
        [{ x: 0.50, y: 0.62 }, { x: 0.70, y: 0.15 }],
        [{ x: 0.70, y: 0.15 }, { x: 0.70, y: 0.85 }]
      ],
      'U': [
        [{ x: 0.32, y: 0.15 }, { x: 0.32, y: 0.68 }, { x: 0.50, y: 0.85 }, { x: 0.68, y: 0.68 }, { x: 0.68, y: 0.15 }]
      ],
      'T': [
        [{ x: 0.28, y: 0.15 }, { x: 0.72, y: 0.15 }],
        [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.85 }]
      ],
      'Ü': [
        [{ x: 0.32, y: 0.28 }, { x: 0.32, y: 0.68 }, { x: 0.50, y: 0.85 }, { x: 0.68, y: 0.68 }, { x: 0.68, y: 0.28 }],
        [{ x: 0.40, y: 0.15 }, { x: 0.40, y: 0.18 }],
        [{ x: 0.60, y: 0.15 }, { x: 0.60, y: 0.18 }]
      ],
      'Y': [
        [{ x: 0.30, y: 0.15 }, { x: 0.50, y: 0.50 }],
        [{ x: 0.70, y: 0.15 }, { x: 0.50, y: 0.50 }],
        [{ x: 0.50, y: 0.50 }, { x: 0.50, y: 0.85 }]
      ],
      'Ö': [
        [{ x: 0.50, y: 0.28 }, { x: 0.30, y: 0.55 }, { x: 0.50, y: 0.85 }, { x: 0.70, y: 0.55 }, { x: 0.50, y: 0.28 }],
        [{ x: 0.40, y: 0.15 }, { x: 0.40, y: 0.18 }],
        [{ x: 0.60, y: 0.15 }, { x: 0.60, y: 0.18 }]
      ],
      'R': [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.35, y: 0.15 }, { x: 0.58, y: 0.15 }, { x: 0.68, y: 0.32 }, { x: 0.58, y: 0.50 }, { x: 0.35, y: 0.50 }],
        [{ x: 0.50, y: 0.50 }, { x: 0.68, y: 0.85 }]
      ],
      'D': [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.35, y: 0.15 }, { x: 0.55, y: 0.15 }, { x: 0.70, y: 0.50 }, { x: 0.55, y: 0.85 }, { x: 0.35, y: 0.85 }]
      ],
      'S': [
        [{ x: 0.65, y: 0.25 }, { x: 0.50, y: 0.15 }, { x: 0.35, y: 0.32 }, { x: 0.65, y: 0.65 }, { x: 0.50, y: 0.85 }, { x: 0.35, y: 0.75 }]
      ],
      'B': [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.35, y: 0.15 }, { x: 0.58, y: 0.15 }, { x: 0.66, y: 0.32 }, { x: 0.58, y: 0.50 }, { x: 0.35, y: 0.50 }],
        [{ x: 0.35, y: 0.50 }, { x: 0.60, y: 0.50 }, { x: 0.70, y: 0.68 }, { x: 0.60, y: 0.85 }, { x: 0.35, y: 0.85 }]
      ],

      // Lowercase Letters
      'e': [
        [{ x: 0.35, y: 0.68 }, { x: 0.65, y: 0.68 }],
        [{ x: 0.65, y: 0.68 }, { x: 0.65, y: 0.52 }, { x: 0.50, y: 0.50 }, { x: 0.35, y: 0.62 }, { x: 0.38, y: 0.82 }, { x: 0.50, y: 0.85 }, { x: 0.65, y: 0.82 }]
      ],
      'l': [
        [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.82 }, { x: 0.60, y: 0.85 }]
      ],
      'a': [
        [{ x: 0.62, y: 0.58 }, { x: 0.50, y: 0.50 }, { x: 0.38, y: 0.62 }, { x: 0.38, y: 0.75 }, { x: 0.50, y: 0.85 }, { x: 0.62, y: 0.75 }],
        [{ x: 0.62, y: 0.50 }, { x: 0.62, y: 0.85 }]
      ],
      'k': [
        [{ x: 0.38, y: 0.15 }, { x: 0.38, y: 0.85 }],
        [{ x: 0.62, y: 0.55 }, { x: 0.38, y: 0.70 }],
        [{ x: 0.45, y: 0.65 }, { x: 0.62, y: 0.85 }]
      ],
      'i': [
        [{ x: 0.50, y: 0.50 }, { x: 0.50, y: 0.85 }],
        [{ x: 0.50, y: 0.38 }, { x: 0.50, y: 0.41 }]
      ],
      'ı': [
        [{ x: 0.50, y: 0.50 }, { x: 0.50, y: 0.85 }]
      ],
      'n': [
        [{ x: 0.38, y: 0.50 }, { x: 0.38, y: 0.85 }],
        [{ x: 0.38, y: 0.62 }, { x: 0.48, y: 0.50 }, { x: 0.62, y: 0.60 }, { x: 0.62, y: 0.85 }]
      ],
      'o': [
        [{ x: 0.50, y: 0.50 }, { x: 0.35, y: 0.68 }, { x: 0.50, y: 0.85 }, { x: 0.65, y: 0.68 }, { x: 0.50, y: 0.50 }]
      ],
      'm': [
        [{ x: 0.30, y: 0.50 }, { x: 0.30, y: 0.85 }],
        [{ x: 0.30, y: 0.62 }, { x: 0.42, y: 0.50 }, { x: 0.50, y: 0.62 }, { x: 0.50, y: 0.85 }],
        [{ x: 0.50, y: 0.62 }, { x: 0.62, y: 0.50 }, { x: 0.70, y: 0.62 }, { x: 0.70, y: 0.85 }]
      ],
      'u': [
        [{ x: 0.35, y: 0.50 }, { x: 0.35, y: 0.75 }, { x: 0.50, y: 0.85 }, { x: 0.65, y: 0.75 }, { x: 0.65, y: 0.50 }],
        [{ x: 0.65, y: 0.50 }, { x: 0.65, y: 0.85 }]
      ],
      't': [
        [{ x: 0.50, y: 0.25 }, { x: 0.50, y: 0.82 }, { x: 0.60, y: 0.85 }],
        [{ x: 0.38, y: 0.45 }, { x: 0.62, y: 0.45 }]
      ],

      // Numbers
      '1': [
        [{ x: 0.38, y: 0.32 }, { x: 0.50, y: 0.15 }],
        [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.85 }]
      ],
      '2': [
        [{ x: 0.35, y: 0.30 }, { x: 0.50, y: 0.15 }, { x: 0.65, y: 0.30 }, { x: 0.35, y: 0.85 }, { x: 0.68, y: 0.85 }]
      ],
      '3': [
        [{ x: 0.35, y: 0.20 }, { x: 0.65, y: 0.20 }, { x: 0.48, y: 0.48 }, { x: 0.65, y: 0.65 }, { x: 0.50, y: 0.85 }, { x: 0.35, y: 0.75 }]
      ],
      '4': [
        [{ x: 0.58, y: 0.15 }, { x: 0.32, y: 0.62 }, { x: 0.68, y: 0.62 }],
        [{ x: 0.58, y: 0.15 }, { x: 0.58, y: 0.85 }]
      ],
      '5': [
        [{ x: 0.62, y: 0.15 }, { x: 0.38, y: 0.15 }, { x: 0.35, y: 0.45 }, { x: 0.65, y: 0.52 }, { x: 0.62, y: 0.85 }, { x: 0.35, y: 0.80 }]
      ],
      '6': [
        [{ x: 0.60, y: 0.20 }, { x: 0.35, y: 0.55 }, { x: 0.45, y: 0.85 }, { x: 0.65, y: 0.70 }, { x: 0.40, y: 0.55 }]
      ],
      '7': [
        [{ x: 0.32, y: 0.15 }, { x: 0.68, y: 0.15 }, { x: 0.42, y: 0.85 }],
        [{ x: 0.42, y: 0.48 }, { x: 0.58, y: 0.48 }]
      ],
      '8': [
        [{ x: 0.50, y: 0.48 }, { x: 0.35, y: 0.32 }, { x: 0.50, y: 0.15 }, { x: 0.65, y: 0.32 }, { x: 0.50, y: 0.48 }, { x: 0.32, y: 0.68 }, { x: 0.50, y: 0.85 }, { x: 0.68, y: 0.68 }, { x: 0.50, y: 0.48 }]
      ],
      '9': [
        [{ x: 0.65, y: 0.45 }, { x: 0.50, y: 0.15 }, { x: 0.35, y: 0.35 }, { x: 0.50, y: 0.52 }, { x: 0.65, y: 0.45 }, { x: 0.65, y: 0.75 }, { x: 0.45, y: 0.85 }]
      ],
      '0': [
        [{ x: 0.50, y: 0.15 }, { x: 0.32, y: 0.50 }, { x: 0.50, y: 0.85 }, { x: 0.68, y: 0.50 }, { x: 0.50, y: 0.15 }]
      ]
    };

    function getRulingMetrics() {
      const w = bgCanvas.width;
      const h = bgCanvas.height;
      const topY = h * 0.18;
      const midY = h * 0.45;
      const baseY = h * 0.72;
      const botY = h * 0.90;
      const letterH = baseY - topY;
      return { w, h, topY, midY, baseY, botY, letterH };
    }

    function toCanvasPos(pt) {
      const { w, topY, baseY, letterH } = getRulingMetrics();
      const cx = w * pt.x;
      const cy = topY + ((pt.y - 0.15) / (0.85 - 0.15)) * letterH;
      return { x: cx, y: cy };
    }

    function init() {
      bgCanvas = document.getElementById('bgCanvas');
      bgCtx = bgCanvas.getContext('2d');
      paintCanvas = document.getElementById('paintCanvas');
      paintCtx = paintCanvas.getContext('2d');
      animCanvas = document.getElementById('animCanvas');
      animCtx = animCanvas.getContext('2d');

      resizeCanvases();
      window.addEventListener('resize', () => {
        resizeCanvases();
        drawMebGuideAndChar(getDisplayedChar());
      });

      setupDrawing();
      changeGroup('1');
    }

    function resizeCanvases() {
      const wrapper = document.getElementById('canvasWrapper');
      if (!wrapper) return;
      const w = wrapper.clientWidth || 600;
      const h = wrapper.clientHeight || 340;
      bgCanvas.width = w;
      bgCanvas.height = h;
      paintCanvas.width = w;
      paintCanvas.height = h;
      animCanvas.width = w;
      animCanvas.height = h;
    }

    function setLetterCase(caseMode) {
      currentCase = caseMode;
      const upBtn = document.getElementById('caseUpperBtn');
      const lowBtn = document.getElementById('caseLowerBtn');
      if (caseMode === 'upper') {
        upBtn.className = 'px-2.5 py-1 text-xs font-black rounded-lg transition bg-white text-indigo-900 shadow-xs cursor-pointer';
        lowBtn.className = 'px-2.5 py-1 text-xs font-black rounded-lg transition text-indigo-700 hover:text-indigo-950 cursor-pointer';
      } else {
        lowBtn.className = 'px-2.5 py-1 text-xs font-black rounded-lg transition bg-white text-indigo-900 shadow-xs cursor-pointer';
        upBtn.className = 'px-2.5 py-1 text-xs font-black rounded-lg transition text-indigo-700 hover:text-indigo-950 cursor-pointer';
      }
      changeGroup(activeGroup);
    }

    function getDisplayedChar() {
      if (!activeItem) return activeChar;
      if (activeGroup === 'strokes' || activeGroup === 'numbers') {
        return activeItem.char;
      }
      return currentCase === 'upper' ? activeItem.char : activeItem.lower;
    }

    function changeGroup(groupId) {
      activeGroup = groupId;
      const list = GROUPS[groupId] || [];
      const container = document.getElementById('charList');
      container.innerHTML = '';

      list.forEach((item, idx) => {
        const charToShow = (groupId === 'strokes' || groupId === 'numbers')
          ? item.char
          : (currentCase === 'upper' ? item.char : item.lower);

        const btn = document.createElement('button');
        btn.className = `touch-btn p-2 rounded-2xl font-black text-sm transition flex md:flex-row items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
          idx === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 border border-slate-100'
        }`;
        btn.innerHTML = `<span class="font-meb text-base">${charToShow}</span>`;
        btn.onclick = () => selectChar(item, btn);
        container.appendChild(btn);
      });

      if (list.length > 0) {
        selectChar(list[0], container.firstChild);
      }
    }

    function selectChar(item, btnElement) {
      activeItem = item;
      const charToShow = getDisplayedChar();
      activeChar = charToShow;

      document.querySelectorAll('#charList button').forEach(b => {
        b.className = b.className.replace('bg-indigo-600 text-white shadow-sm', 'bg-slate-50 text-slate-700 hover:bg-indigo-50 border border-slate-100');
      });
      if (btnElement) {
        btnElement.className = 'touch-btn p-2 rounded-2xl font-black text-sm transition flex md:flex-row items-center justify-center gap-1.5 shrink-0 cursor-pointer bg-indigo-600 text-white shadow-sm';
      }

      document.getElementById('activeCharBadge').textContent = charToShow;
      document.getElementById('charWord').textContent = item.word;
      document.getElementById('charDesc').textContent = item.desc;
      clearCanvas();
      drawMebGuideAndChar(charToShow);
    }

    function drawMebGuideAndChar(char) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      const { w, topY, midY, baseY, botY, letterH } = getRulingMetrics();

      // 1. Draw 4 MEB Guidelines
      bgCtx.save();
      // Tepe Çizgisi (Üst)
      bgCtx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
      bgCtx.lineWidth = 2;
      bgCtx.beginPath();
      bgCtx.moveTo(20, topY);
      bgCtx.lineTo(w - 20, topY);
      bgCtx.stroke();

      // Orta Gövde (Kesikli)
      bgCtx.strokeStyle = 'rgba(96, 165, 250, 0.75)';
      bgCtx.lineWidth = 1.5;
      bgCtx.setLineDash([6, 6]);
      bgCtx.beginPath();
      bgCtx.moveTo(20, midY);
      bgCtx.lineTo(w - 20, midY);
      bgCtx.stroke();
      bgCtx.setLineDash([]);

      // Taban Çizgisi (Kırmızı Ana Çizgi)
      bgCtx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      bgCtx.lineWidth = 2.5;
      bgCtx.beginPath();
      bgCtx.moveTo(20, baseY);
      bgCtx.lineTo(w - 20, baseY);
      bgCtx.stroke();

      // Alt Kuyruk Çizgisi
      bgCtx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      bgCtx.lineWidth = 1.5;
      bgCtx.beginPath();
      bgCtx.moveTo(20, botY);
      bgCtx.lineTo(w - 20, botY);
      bgCtx.stroke();

      // Text Labels
      bgCtx.fillStyle = '#3b82f6';
      bgCtx.font = 'bold 9px system-ui, sans-serif';
      bgCtx.fillText('Tepe Çizgisi', 22, topY - 5);
      bgCtx.fillStyle = '#60a5fa';
      bgCtx.fillText('Orta Gövde', 22, midY - 5);
      bgCtx.fillStyle = '#ef4444';
      bgCtx.fillText('Taban Çizgisi', 22, baseY - 5);
      bgCtx.fillStyle = '#3b82f6';
      bgCtx.fillText('Alt Kuyruk Çizgisi', 22, botY - 5);
      bgCtx.restore();

      // 2. Draw Faint Tracing Guide (Üstünden geçilmesi gereken silik harf/çizgi)
      const strokes = MEB_STROKES[char] || MEB_STROKES[char.toUpperCase()];
      if (strokes && strokes.length > 0) {
        bgCtx.save();
        bgCtx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
        bgCtx.lineWidth = 26;
        bgCtx.lineCap = 'round';
        bgCtx.lineJoin = 'round';

        strokes.forEach(stroke => {
          if (stroke.length < 2) return;
          bgCtx.beginPath();
          const start = toCanvasPos(stroke[0]);
          bgCtx.moveTo(start.x, start.y);
          for (let i = 1; i < stroke.length; i++) {
            const p = toCanvasPos(stroke[i]);
            bgCtx.lineTo(p.x, p.y);
          }
          bgCtx.stroke();
        });

        // Dashed midline
        bgCtx.strokeStyle = 'rgba(79, 70, 229, 0.45)';
        bgCtx.lineWidth = 2.5;
        bgCtx.setLineDash([5, 6]);
        strokes.forEach(stroke => {
          if (stroke.length < 2) return;
          bgCtx.beginPath();
          const start = toCanvasPos(stroke[0]);
          bgCtx.moveTo(start.x, start.y);
          for (let i = 1; i < stroke.length; i++) {
            const p = toCanvasPos(stroke[i]);
            bgCtx.lineTo(p.x, p.y);
          }
          bgCtx.stroke();
        });
        bgCtx.setLineDash([]);

        // Numbered start badges
        strokes.forEach((stroke, idx) => {
          const start = toCanvasPos(stroke[0]);
          bgCtx.beginPath();
          bgCtx.arc(start.x, start.y, 11, 0, Math.PI * 2);
          bgCtx.fillStyle = '#4f46e5';
          bgCtx.fill();
          bgCtx.fillStyle = '#ffffff';
          bgCtx.font = 'bold 11px system-ui, sans-serif';
          bgCtx.textAlign = 'center';
          bgCtx.textBaseline = 'middle';
          bgCtx.fillText(String(idx + 1), start.x, start.y + 0.5);
        });
        bgCtx.restore();
      } else {
        // Fallback for non-mapped glyphs
        bgCtx.save();
        bgCtx.fillStyle = 'rgba(79, 70, 229, 0.16)';
        const fontSize = (char === char.toLowerCase() && char !== char.toUpperCase())
          ? Math.round(letterH * 0.65)
          : Math.round(letterH * 0.95);
        bgCtx.font = `bold ${fontSize}px 'Comic Neue', cursive, sans-serif`;
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'alphabetic';
        bgCtx.fillText(char, w / 2, baseY);
        bgCtx.restore();
      }
    }

    function setupDrawing() {
      const getPos = (e) => {
        const rect = paintCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      };

      const start = (e) => {
        if (isAnimatingGuide) return;
        isDrawing = true;
        const pos = getPos(e);
        paintCtx.beginPath();
        paintCtx.moveTo(pos.x, pos.y);
      };

      const move = (e) => {
        if (!isDrawing || isAnimatingGuide) return;
        const pos = getPos(e);
        paintCtx.lineTo(pos.x, pos.y);
        paintCtx.strokeStyle = currentColor;
        paintCtx.lineWidth = 14;
        paintCtx.lineCap = 'round';
        paintCtx.lineJoin = 'round';
        paintCtx.stroke();
      };

      const stop = () => {
        isDrawing = false;
      };

      paintCanvas.addEventListener('mousedown', start);
      paintCanvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', stop);

      paintCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
      paintCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, { passive: false });
      window.addEventListener('touchend', stop);
    }

    function setPenColor(c) {
      currentColor = c;
    }

    // Fully working Clear Button: Clears drawing, anim layer, hides stylus and resets guide
    function clearCanvas() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      isAnimatingGuide = false;
      paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
      animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);

      const stylus = document.getElementById('stylusCursor');
      if (stylus) stylus.classList.add('hidden');

      const banner = document.getElementById('strokeBanner');
      if (banner) banner.classList.add('hidden');

      drawMebGuideAndChar(getDisplayedChar());
    }

    function clearAnim() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);
      const stylus = document.getElementById('stylusCursor');
      if (stylus) stylus.classList.add('hidden');
      document.getElementById('strokeBanner').classList.add('hidden');
    }

    // MEB Authentic Stroke Order Animation
    function playMebStrokeAnimation() {
      if (isAnimatingGuide) return;
      isAnimatingGuide = true;

      // Clear layers
      paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
      clearAnim();

      const banner = document.getElementById('strokeBanner');
      const bannerText = document.getElementById('strokeText');
      const stylus = document.getElementById('stylusCursor');
      banner.classList.remove('hidden');

      const charToAnimate = getDisplayedChar();
      const strokes = MEB_STROKES[charToAnimate] || MEB_STROKES[charToAnimate.toUpperCase()] || [
        [{ x: 0.35, y: 0.15 }, { x: 0.35, y: 0.85 }],
        [{ x: 0.35, y: 0.15 }, { x: 0.65, y: 0.15 }],
        [{ x: 0.35, y: 0.85 }, { x: 0.65, y: 0.85 }]
      ];

      let currentStrokeIdx = 0;

      function animateStroke(strokeIdx) {
        if (strokeIdx >= strokes.length) {
          bannerText.textContent = '✨ Tebrikler! Şimdi sırayla sen çiz.';
          if (stylus) stylus.classList.add('hidden');
          setTimeout(() => {
            isAnimatingGuide = false;
            banner.classList.add('hidden');
          }, 1800);
          celebrateSuccess();
          return;
        }

        const pts = strokes[strokeIdx];
        bannerText.textContent = `${strokeIdx + 1}. Hamle: Başlangıçtan yöne doğru çiziniz`;

        let ptIndex = 0;
        let progress = 0;
        const speed = 0.045;

        function step() {
          if (ptIndex >= pts.length - 1) {
            setTimeout(() => animateStroke(strokeIdx + 1), 220);
            return;
          }

          progress += speed;
          if (progress > 1) {
            progress = 1;
          }

          const p0 = toCanvasPos(pts[ptIndex]);
          const p1 = toCanvasPos(pts[ptIndex + 1]);

          const curX = p0.x + (p1.x - p0.x) * progress;
          const curY = p0.y + (p1.y - p0.y) * progress;

          // Draw animated line onto animCtx (without stamping emoji!)
          animCtx.save();
          animCtx.strokeStyle = '#4f46e5';
          animCtx.lineWidth = 20;
          animCtx.lineCap = 'round';
          animCtx.lineJoin = 'round';
          animCtx.beginPath();
          animCtx.moveTo(p0.x, p0.y);
          animCtx.lineTo(curX, curY);
          animCtx.stroke();
          animCtx.restore();

          // Move floating stylus cursor above the canvas (never stamps on canvas!)
          if (stylus) {
            stylus.classList.remove('hidden');
            stylus.style.left = curX + 'px';
            stylus.style.top = curY + 'px';
          }

          if (progress >= 1) {
            ptIndex++;
            progress = 0;
          }

          animFrameId = requestAnimationFrame(step);
        }

        step();
      }

      animateStroke(0);
    }

    function celebrateSuccess() {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (_) {}
    }

    window.onload = init;
  </script>
    """
)


# MODULE 3: Ritmik Sayma & Sayı Doğrusu Atölyesi
# (Pixel-Perfect Hopping Mascot, Mobile Responsive Always-Visible Buttons, Interactive 100-Grid)
# ==============================================================================
MODULE_3_HTML = build_html_wrapper(
    "Ritmik Sayma & Sayı Doğrusu Atölyesi",
    """
  <!-- Header Bar -->
  <header class="bg-white border-b border-blue-100 p-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
        🔢
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Ritmik Sayma & Sayı Doğrusu Atölyesi</h1>
        <p class="text-[10px] sm:text-[11px] text-blue-600 font-semibold">1'den 100'e İnteraktif Yüzlük Tablo ve Zıplayan Sayı Doğrusu</p>
      </div>
    </div>
    
    <!-- Mode buttons -->
    <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto justify-between sm:justify-end">
      <button onclick="setMode('numberline')" id="modeBtnLine" class="touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-blue-900 shadow-xs transition cursor-pointer">
        🐸 Zıplayan Sayı Doğrusu
      </button>
      <button onclick="setMode('grid')" id="modeBtnGrid" class="touch-btn px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer">
        💯 Yüzlük Tablo
      </button>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4">
    <!-- Center Screen: Number Line or Grid -->
    <div class="flex-1 bg-white rounded-3xl border border-blue-200/80 shadow-md p-3 sm:p-5 flex flex-col justify-between overflow-y-auto min-h-[360px]">
      
      <!-- MODE 1: YÜZLÜK TABLO (INTERACTIVE WITH SOUND & CLICK-TO-PAINT) -->
      <div id="viewGrid" class="hidden flex-col h-full justify-between">
        <div>
          <!-- Grid Controls -->
          <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-wrap gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Ritmik Boya:</span>
              <button onclick="highlightStep(2)" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer">2'şer</button>
              <button onclick="highlightStep(3)" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer">3'er</button>
              <button onclick="highlightStep(4)" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer">4'er</button>
              <button onclick="highlightStep(5)" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer">5'er</button>
              <button onclick="highlightStep(10)" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer">10'ar</button>
            </div>

            <div class="flex items-center gap-1.5">
              <button onclick="playLiveCountAnimation()" id="liveCountBtn" class="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1">
                ▶️ Canlı Say
              </button>
              <button onclick="clearGrid()" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                🗑️ Temizle
              </button>
            </div>
          </div>

          <!-- 10x10 Grid -->
          <div id="grid100" class="grid grid-cols-10 gap-1 sm:gap-1.5 my-2 max-w-lg mx-auto select-none">
            <!-- 100 squares injected with click-to-paint -->
          </div>
        </div>

        <!-- Selected Number Info Banner -->
        <div id="gridInfoBanner" class="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
          💡 İstediğiniz sayıya tıklayarak boyayabilir veya üstteki ritmik adımları seçebilirsiniz.
        </div>
      </div>

      <!-- MODE 2: ADIM ADIM ZIPLAYAN SAYI DOĞRUSU (PIXEL-PERFECT ALIGNMENT) -->
      <div id="viewLine" class="flex flex-col h-full justify-between py-2 sm:py-4">
        <div class="w-full max-w-2xl mx-auto bg-blue-50/60 rounded-3xl p-4 sm:p-6 border border-blue-100 text-center relative overflow-hidden flex flex-col justify-between">
          
          <!-- Top Bar: Title & Mascot Selector -->
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
              ADIM ADIM SAYI DOĞRUSU
            </span>
            <!-- Character picker -->
            <div class="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-blue-200 text-xs shadow-xs">
              <span class="text-[10px] text-gray-500 font-bold">Maskot:</span>
              <button onclick="setMascot('🐸')" class="px-1 hover:scale-125 transition cursor-pointer">🐸</button>
              <button onclick="setMascot('🐰')" class="px-1 hover:scale-125 transition cursor-pointer">🐰</button>
              <button onclick="setMascot('🦘')" class="px-1 hover:scale-125 transition cursor-pointer">🦘</button>
            </div>
          </div>
          
          <!-- Big Number Counter -->
          <div class="text-5xl sm:text-6xl font-black text-blue-900 my-2 sm:my-3 transition-transform duration-200" id="lineCurrentNumber">
            0
          </div>
          
          <!-- Realistic Number Line Stage with Hopping Mascot (Exact Centering) -->
          <div class="relative w-full h-24 sm:h-28 my-2 sm:my-3 flex flex-col justify-end select-none" id="numberLineStage">
            
            <!-- Hopping Mascot Avatar (Centered exactly with translateX(-50%)) -->
            <div id="mascotWrapper" class="absolute z-20 pointer-events-none transition-all duration-300" style="bottom: 24px; left: 36px; transform: translateX(-50%);">
              <div id="mascotEl" class="text-4xl sm:text-5xl select-none filter drop-shadow-md origin-bottom transition-transform duration-200">
                🐸
              </div>
              <!-- Ripple landing effect -->
              <div id="landingRipple" class="hidden absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-400/40 rounded-full animate-ping"></div>
            </div>

            <!-- Number Line Track Bar -->
            <div class="relative w-full h-3 bg-blue-200 rounded-full overflow-hidden">
              <div id="lineProgress" class="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-300" style="width: 0%;"></div>
            </div>

            <!-- Graduated Number Ticks & Labels Container -->
            <div id="ticksContainer" class="relative w-full h-8 pt-1 text-[11px] font-mono font-bold text-blue-900">
              <!-- Dynamically positioned ticks -->
            </div>
          </div>

          <!-- Controls: Step Back / Step Forward (ALWAYS VISIBLE ON MOBILE) -->
          <div class="w-full flex items-center justify-center gap-3 pt-3">
            <button onclick="stepLine(-1)" class="touch-btn flex-1 max-w-[150px] py-3 rounded-2xl bg-white border border-slate-200 font-extrabold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 shadow-sm active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer">
              ◀️ Geri Adım
            </button>
            <button onclick="stepLine(1)" class="touch-btn flex-1 max-w-[180px] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer">
              İleri Adım ▶️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Controls: Auto-Counter & Speech -->
    <div class="w-full md:w-80 flex flex-col gap-3 shrink-0">
      <div class="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold text-blue-200 uppercase tracking-wider block mb-1">Ritmik Sayma Ayarları</span>
          <h2 class="text-lg font-black mb-3">Zıplama Aralığı</h2>

          <div class="space-y-3 text-xs text-blue-100">
            <div>
              <label class="block font-semibold mb-1">Kaçar Kaçar Zıplasın?</label>
              <select id="lineStepSelect" onchange="changeStepSize(this.value)" class="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-bold outline-none cursor-pointer">
                <option value="1" class="text-slate-900">1'er 1'er (+1)</option>
                <option value="2" class="text-slate-900">2'şer 2'şer (+2)</option>
                <option value="3" class="text-slate-900" selected>3'er 3'er (+3)</option>
                <option value="4" class="text-slate-900">4'er 4'er (+4)</option>
                <option value="5" class="text-slate-900">5'er 5'er (+5)</option>
                <option value="10" class="text-slate-900">10'ar 10'ar (+10)</option>
              </select>
            </div>

            <div class="p-3 bg-white/10 rounded-2xl text-[11px] leading-relaxed">
              💡 <strong>İpucu:</strong> Maskot cetveldeki sayının tam üzerine zıplar. Mobilde geri ve ileri butonlarına basarak ritmik adımları takip edebilirsiniz.
            </div>
          </div>
        </div>

        <div class="pt-5 mt-4 border-t border-white/10 space-y-2">
          <button onclick="resetNumberLine()" class="touch-btn w-full py-3 rounded-2xl bg-white text-blue-900 font-black text-xs shadow-md hover:bg-blue-50 transition cursor-pointer flex items-center justify-center gap-1.5">
            🔄 Sayı Doğrusunu Sıfırla (0)
          </button>
        </div>
      </div>
    </div>
  </main>

  <script>
    let activeMascot = '🐸';
    let currentStepSize = 3;
    let lineCurrent = 0;
    let isJumping = false;
    let minTick = 0;
    let maxTick = 24;
    const totalSteps = 8;
    let liveCountTimer = null;

    // Web Audio Synthesizer for pleasant chimes & boing tones
    function playAudioTone(freq = 320, type = 'sine', duration = 0.25) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (type === 'sine') {
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration * 0.4);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.9, ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (_) {}
    }

    function init() {
      buildGrid();
      highlightStep(2);
      renderTicks();
      updateMascotPosition(false);
      window.addEventListener('resize', () => {
        renderTicks();
        updateMascotPosition(false);
      });
    }

    function setMascot(char) {
      activeMascot = char;
      document.getElementById('mascotEl').textContent = char;
    }

    function setMode(mode) {
      if (mode === 'grid') {
        document.getElementById('viewGrid').classList.remove('hidden');
        document.getElementById('viewLine').classList.add('hidden');
        document.getElementById('modeBtnGrid').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-blue-900 shadow-xs transition';
        document.getElementById('modeBtnLine').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition';
      } else {
        document.getElementById('viewLine').classList.remove('hidden');
        document.getElementById('viewGrid').classList.add('hidden');
        document.getElementById('modeBtnLine').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-blue-900 shadow-xs transition';
        document.getElementById('modeBtnGrid').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition';
        setTimeout(() => {
          renderTicks();
          updateMascotPosition(false);
        }, 50);
      }
    }

    function changeStepSize(val) {
      currentStepSize = Number(val);
      renderTicks();
      updateMascotPosition(false);
    }

    // Computes exact track pixel bounds for 1:1 mascot centering
    function getTrackMetrics() {
      const stage = document.getElementById('numberLineStage');
      const stageW = stage.clientWidth || 300;
      const pad = 36;
      const usableW = Math.max(100, stageW - pad * 2);
      return { pad, usableW };
    }

    function renderTicks() {
      const container = document.getElementById('ticksContainer');
      container.innerHTML = '';

      const { pad, usableW } = getTrackMetrics();

      minTick = Math.max(0, lineCurrent - Math.floor(totalSteps / 2) * currentStepSize);
      maxTick = minTick + totalSteps * currentStepSize;

      for (let i = 0; i <= totalSteps; i++) {
        const n = minTick + i * currentStepSize;
        const tickX = pad + (i / totalSteps) * usableW;

        const el = document.createElement('div');
        el.className = 'absolute top-0 flex flex-col items-center pointer-events-none transform -translate-x-1/2';
        el.style.left = `${tickX}px`;

        const isCurrent = n === lineCurrent;
        el.innerHTML = `
          <span class="w-1.5 h-3 ${isCurrent ? 'bg-blue-600' : 'bg-blue-300'} rounded-full mb-0.5"></span>
          <span class="${isCurrent ? 'text-blue-600 font-black scale-125' : 'text-blue-900'}">${n}</span>
        `;
        container.appendChild(el);
      }
    }

    // ELASTIC PARABOLIC JUMP
    function stepLine(direction) {
      if (isJumping) return;
      isJumping = true;

      const target = Math.max(0, lineCurrent + direction * currentStepSize);
      if (target === lineCurrent && direction < 0) {
        isJumping = false;
        return;
      }

      lineCurrent = target;
      playAudioTone(direction > 0 ? 380 : 290, 'sine', 0.28);

      const mascotWrap = document.getElementById('mascotWrapper');
      const mascotEl = document.getElementById('mascotEl');
      const ripple = document.getElementById('landingRipple');

      // 1. Squash preparation (wind-up)
      mascotEl.style.transform = `scale(1.35, 0.65) rotate(${direction * -8}deg)`;

      setTimeout(() => {
        // 2. Parabolic Arc Jump
        mascotEl.style.transition = 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        mascotEl.style.transform = `translateY(-48px) scale(0.85, 1.25) rotate(${direction * 15}deg)`;

        // Calculate target position and update
        renderTicks();
        const { pad, usableW } = getTrackMetrics();
        const ratio = Math.max(0, Math.min(1, (lineCurrent - minTick) / (maxTick - minTick)));
        const targetX = pad + ratio * usableW;
        mascotWrap.style.left = `${targetX}px`;
        document.getElementById('lineProgress').style.width = `${ratio * 100}%`;

        setTimeout(() => {
          // 3. Landing & Elastic Squish & Wobble
          mascotEl.style.transition = 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)';
          mascotEl.style.transform = `translateY(0) scale(1.4, 0.6) rotate(0deg)`;

          ripple.classList.remove('hidden');
          setTimeout(() => ripple.classList.add('hidden'), 350);

          // Number pulse
          const numEl = document.getElementById('lineCurrentNumber');
          numEl.textContent = lineCurrent;
          numEl.style.transform = 'scale(1.25)';
          setTimeout(() => numEl.style.transform = 'scale(1.0)', 200);

          setTimeout(() => {
            // Rebound back to normal
            mascotEl.style.transform = 'scale(1, 1)';
            isJumping = false;
          }, 160);
        }, 280);
      }, 90);
    }

    function updateMascotPosition(animate = true) {
      renderTicks();
      const { pad, usableW } = getTrackMetrics();
      const ratio = Math.max(0, Math.min(1, (lineCurrent - minTick) / (maxTick - minTick)));
      const targetX = pad + ratio * usableW;
      const mascotWrap = document.getElementById('mascotWrapper');
      mascotWrap.style.left = `${targetX}px`;
      document.getElementById('lineProgress').style.width = `${ratio * 100}%`;
      document.getElementById('lineCurrentNumber').textContent = lineCurrent;
    }

    function resetNumberLine() {
      lineCurrent = 0;
      updateMascotPosition(true);
    }

    // 100'LÜK TABLO INTERAKTİVİTESİ
    const gridHighlights = new Set();

    function buildGrid() {
      const container = document.getElementById('grid100');
      container.innerHTML = '';
      for (let i = 1; i <= 100; i++) {
        const div = document.createElement('button');
        div.id = 'sq-' + i;
        div.className = 'aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold bg-slate-50 border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer';
        div.textContent = i;
        div.onclick = () => toggleSquare(i);
        container.appendChild(div);
      }
    }

    function toggleSquare(i) {
      const el = document.getElementById('sq-' + i);
      if (!el) return;

      playAudioTone(260 + (i % 12) * 35, 'triangle', 0.15);

      if (gridHighlights.has(i)) {
        gridHighlights.delete(i);
        el.className = 'aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 transition-all hover:scale-105';
      } else {
        gridHighlights.add(i);
        el.className = 'aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black bg-blue-600 text-white shadow-xs scale-105 transition-all';
      }

      updateGridInfo(i);
    }

    function updateGridInfo(i) {
      const banner = document.getElementById('gridInfoBanner');
      const isEven = i % 2 === 0;
      const katlar = [2, 3, 4, 5, 10].filter(k => i % k === 0).map(k => k + "'şer").join(', ') || 'Yok';
      banner.innerHTML = `Seçilen Sayı: <strong class="text-blue-600 text-sm">${i}</strong> • ${isEven ? 'Çift Sayı' : 'Tek Sayı'} • Ritmik Kat: <strong>${katlar}</strong>`;
    }

    function highlightStep(step) {
      gridHighlights.clear();
      for (let i = 1; i <= 100; i++) {
        const el = document.getElementById('sq-' + i);
        if (!el) continue;
        if (i % step === 0) {
          gridHighlights.add(i);
          el.className = 'aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black bg-blue-600 text-white shadow-xs scale-105 transition-all';
        } else {
          el.className = 'aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 transition-all';
        }
      }
      playAudioTone(440, 'triangle', 0.2);
      const banner = document.getElementById('gridInfoBanner');
      banner.innerHTML = `<strong>${step}'şer</strong> Ritmik Sayma: Toplam <strong>${Math.floor(100 / step)}</strong> sayı boyandı.`;
    }

    function clearGrid() {
      if (liveCountTimer) clearInterval(liveCountTimer);
      gridHighlights.clear();
      for (let i = 1; i <= 100; i++) {
        const el = document.getElementById('sq-' + i);
        if (el) el.className = 'aspect-square rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 transition-all';
      }
      document.getElementById('gridInfoBanner').textContent = 'Tablo temizlendi. Sayılara tıklayarak serbestçe boyayabilirsiniz.';
    }

    function playLiveCountAnimation() {
      clearGrid();
      const step = currentStepSize;
      let cur = step;
      const btn = document.getElementById('liveCountBtn');
      btn.textContent = '⏹️ Durdur';
      btn.onclick = () => {
        clearInterval(liveCountTimer);
        btn.textContent = '▶️ Canlı Say';
        btn.onclick = playLiveCountAnimation;
      };

      liveCountTimer = setInterval(() => {
        if (cur > 100) {
          clearInterval(liveCountTimer);
          btn.textContent = '▶️ Canlı Say';
          btn.onclick = playLiveCountAnimation;
          return;
        }
        toggleSquare(cur);
        cur += step;
      }, 350);
    }

    window.onload = init;
  </script>
    """
)


# MODULE 4: Güneş Sistemi & Gezegenler Keşif Atölyesi
# (Realistic Procedural Textures: Earth Clouds, Jupiter Bands, Saturn Rings, Mars Terrain, Corona - No "WebGL" Text)
# ==============================================================================
MODULE_4_HTML = build_html_wrapper(
    "Güneş Sistemi & Gezegenler Keşif Atölyesi",
    """
  <!-- Header Bar -->
  <header class="bg-slate-900 border-b border-slate-800 text-white p-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0 z-20">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
        🪐
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-white tracking-tight">Güneş Sistemi 3D Uzay Simülasyonu</h1>
        <p class="text-[10px] sm:text-[11px] text-amber-400 font-semibold">3 Boyutlu Gezegenler, Gerçekçi Dokular ve Etkileşimli Uzay Keşfi</p>
      </div>
    </div>
    
    <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
      <!-- Orbit Speed -->
      <button onclick="toggleOrbits()" id="orbitToggleBtn" class="touch-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700 transition cursor-pointer">
        ⏸️ Duraklat
      </button>
      <button onclick="resetCameraView()" class="touch-btn px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer">
        🔭 Genel Bakış
      </button>
    </div>
  </header>

  <!-- 3D Space Canvas & UI Workspace -->
  <main class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4 bg-slate-950 text-white">
    <!-- 3D Space Stage -->
    <div class="flex-1 bg-black rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden min-h-[420px] h-[500px]" id="stage3d">
      
      <!-- Three.js Canvas Container -->
      <div id="threeContainer" class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"></div>

      <!-- Touch Hint -->
      <div class="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-[10px] text-slate-300 pointer-events-none flex items-center gap-1.5">
        <span>👆 360° döndürün • Yakınlaşın • Gezegene tıklayın</span>
      </div>
      
      <!-- Planet Quick Select Bar overlay -->
      <div class="absolute bottom-3 inset-x-3 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto py-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 px-3 z-10 scrollbar-none">
        <button onclick="focusPlanet('sun')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 cursor-pointer">☀️ Güneş</button>
        <button onclick="focusPlanet('mercury')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">Merkür</button>
        <button onclick="focusPlanet('venus')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">Venüs</button>
        <button onclick="focusPlanet('earth')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0 cursor-pointer">🌍 Dünya</button>
        <button onclick="focusPlanet('mars')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">Mars</button>
        <button onclick="focusPlanet('jupiter')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">Jüpiter</button>
        <button onclick="focusPlanet('saturn')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">🪐 Satürn</button>
        <button onclick="focusPlanet('uranus')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">Uranüs</button>
        <button onclick="focusPlanet('neptune')" class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0 cursor-pointer">Neptün</button>
      </div>
    </div>

    <!-- Planet Fact Sheet / Detail Panel -->
    <div class="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shrink-0 shadow-lg">
      <div id="planetDetail">
        <div class="flex items-center gap-3 mb-4">
          <div id="planetIcon" class="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-3xl shrink-0">
            🌍
          </div>
          <div>
            <h2 id="planetName" class="text-xl font-black text-white">Dünya</h2>
            <p id="planetSub" class="text-xs text-blue-400 font-semibold">Yaşam Barındıran Tek Gezegen</p>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-800/60 rounded-xl flex justify-between border border-slate-700/50">
            <span class="text-slate-400">Güneş'e Mesafe:</span>
            <span id="factDistance" class="font-bold text-white">149.6 milyon km</span>
          </div>
          <div class="p-2.5 bg-slate-800/60 rounded-xl flex justify-between border border-slate-700/50">
            <span class="text-slate-400">Çap (Büyüklük):</span>
            <span id="factDiameter" class="font-bold text-white">12,742 km</span>
          </div>
          <div class="p-2.5 bg-slate-800/60 rounded-xl flex justify-between border border-slate-700/50">
            <span class="text-slate-400">1 Yıl (Dolanma):</span>
            <span id="factYear" class="font-bold text-white">365.25 Gün</span>
          </div>
          <div class="p-2.5 bg-slate-800/60 rounded-xl flex justify-between border border-slate-700/50">
            <span class="text-slate-400">Uydu Sayısı:</span>
            <span id="factMoons" class="font-bold text-white">1 (Ay)</span>
          </div>
        </div>

        <p id="planetInfoText" class="mt-4 p-3 bg-slate-800/40 rounded-2xl border border-slate-700/40 text-xs text-slate-300 leading-relaxed">
          Dünya, Güneş Sistemi'nde Güneş'e en yakın 3. gezegendir. Sıvı su ve zengin atmosferi sayesinde yaşam barındıran yegane gökcismidir.
        </p>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>3 Boyutlu Simülasyon</span>
        <span class="text-amber-400 font-semibold">60 FPS Akıcı</span>
      </div>
    </div>
  </main>

  <!-- Three.js + OrbitControls from CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

  <script>
    const PLANET_DATA = {
      sun: { name: "Güneş", icon: "☀️", sub: "Sistemin Kalbi & Isı Kaynağı", dist: "0 km (Merkez)", dia: "1,392,700 km", year: "230 milyon yıl", moons: "8 Gezegen", info: "Güneş, Güneş Sistemi'nin merkezinde yer alan dev bir plazma yıldızıdır. Tüm gezegenler onun kütleçekim kuvvetiyle etrafında döner.", radius: 18, orbitRadius: 0, speed: 0 },
      mercury: { name: "Merkür", icon: "🪨", sub: "Güneş'e En Yakın Gezegen", dist: "57.9 milyon km", dia: "4,879 km", year: "88 Gün", moons: "0", info: "Merkür, sistemin en küçük gezegenidir. Atmosferi neredeyse hiç yoktur, gündüzleri 430°C iken geceleri -180°C'ye kadar düşer.", radius: 3.2, orbitRadius: 38, speed: 0.04 },
      venus: { name: "Venüs", icon: "🟡", sub: "En Sıcak & Parlak Gezegen", dist: "108.2 milyon km", dia: "12,104 km", year: "225 Gün", moons: "0", info: "Venüs kalın sera gazı bulutları yüzünden kurşunu eritecek kadar sıcaktır (465°C). Gökyüzünde Çoban Yıldızı olarak parlar.", radius: 5.2, orbitRadius: 54, speed: 0.025 },
      earth: { name: "Dünya", icon: "🌍", sub: "Mavi Gezegen & Evimiz", dist: "149.6 milyon km", dia: "12,742 km", year: "365.25 Gün", moons: "1 (Ay)", info: "Dünya, Güneş Sistemi'nde sıvı su ve atmosferi sayesinde yaşamı destekleyen bilinen tek gezegendir.", radius: 5.6, orbitRadius: 74, speed: 0.018, isEarth: true },
      mars: { name: "Mars", icon: "🔴", sub: "Kızıl Gezegen", dist: "227.9 milyon km", dia: "6,779 km", year: "687 Gün", moons: "2", info: "Yüzeyindeki paslı demir oksit mineralleri yüzünden kızıl görünür. Güneş Sistemi'nin en yüksek dağı olan Olympus Mons buradadır.", radius: 4.2, orbitRadius: 96, speed: 0.014 },
      jupiter: { name: "Jüpiter", icon: "🪐", sub: "Gezegenlerin Dev Kralı", dist: "778.5 milyon km", dia: "139,820 km", year: "11.8 Yıl", moons: "95", info: "Jüpiter sistemdeki en büyük gezegendir. İçine 1300 tane Dünya sığabilir! Ünlü Büyük Kırmızı Leke dev bir fırtınadır.", radius: 12.5, orbitRadius: 132, speed: 0.009, isJupiter: true },
      saturn: { name: "Satürn", icon: "🪐", sub: "Büyüleyici Halkaların Sahibi", dist: "1.43 milyar km", dia: "116,460 km", year: "29.5 Yıl", moons: "146", info: "Buz ve kaya parçalarından oluşan muhteşem 3D halkalarıyla tanınır. Yoğunluğu o kadar düşüktür ki devasa bir okyanusta yüzebilirdi!", radius: 10.5, orbitRadius: 174, speed: 0.006, hasRings: true },
      uranus: { name: "Uranüs", icon: "🌀", sub: "Yan Yatan Buz Devi", dist: "2.87 milyar km", dia: "50,724 km", year: "84 Yıl", moons: "28", info: "Uranüs 98 derece yana yatık ekseniyle bir tekerlek gibi yuvarlanarak döner. Metan gazı ona güzel turkuaz mavisini verir.", radius: 7.2, orbitRadius: 214, speed: 0.004 },
      neptune: { name: "Neptün", icon: "🔵", sub: "Fırtınalı Mavi Gezegen", dist: "4.50 milyar km", dia: "49,244 km", year: "165 Yıl", moons: "16", info: "Güneş'e en uzak gezegendir. Saatte 2000 km hıza ulaşan dondurucu fırtınalara ev sahipliği yapar.", radius: 7.0, orbitRadius: 252, speed: 0.003 }
    };

    let scene, camera, renderer, controls;
    let planets = {};
    let isOrbiting = true;
    let cameraTarget = null;
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    // Procedural Texture Generators
    function createSunCanvasTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#ffcc00');
      grad.addColorStop(0.5, '#ff6600');
      grad.addColorStop(1, '#ff3300');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Granules / Solar Flares
      for (let i = 0; i < 600; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 8 + 2;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 200, 0.4)' : 'rgba(200, 50, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    }

    function createEarthCanvasTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');

      // Ocean base
      ctx.fillStyle = '#103778';
      ctx.fillRect(0, 0, 512, 256);

      // Continents (Africa, Europe, Americas, Asia)
      ctx.fillStyle = '#2d6a4f';
      const continents = [
        { x: 120, y: 110, rx: 35, ry: 60 },
        { x: 260, y: 130, rx: 50, ry: 70 },
        { x: 270, y: 65, rx: 45, ry: 35 },
        { x: 380, y: 90, rx: 70, ry: 45 },
        { x: 400, y: 180, rx: 30, ry: 25 },
        { x: 140, y: 190, rx: 28, ry: 45 },
      ];
      continents.forEach(cnt => {
        ctx.beginPath();
        ctx.ellipse(cnt.x, cnt.y, cnt.rx, cnt.ry, 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mountain / Desert highlights
      ctx.fillStyle = '#a68a56';
      ctx.beginPath();
      ctx.ellipse(250, 100, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Polar Ice Caps
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 20);
      ctx.fillRect(0, 236, 512, 20);

      // Swirling White Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, 40 + Math.random() * 160, 45 + Math.random() * 40, 10 + Math.random() * 8, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(c);
    }

    function createJupiterCanvasTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');

      const colors = ['#f4edea', '#d4a373', '#bc6c25', '#fefae0', '#9c6644', '#ddb892', '#b08968'];
      for (let y = 0; y < 256; y += 12) {
        ctx.fillStyle = colors[Math.floor(y / 12) % colors.length];
        ctx.fillRect(0, y, 512, 12);

        // Sinusoidal wave turbulence
        ctx.fillStyle = colors[(Math.floor(y / 12) + 1) % colors.length];
        for (let x = 0; x < 512; x += 30) {
          ctx.beginPath();
          ctx.arc(x + Math.sin(y) * 10, y + 6, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Great Red Spot (Dev Kırmızı Leke)
      ctx.fillStyle = '#9e2a2b';
      ctx.beginPath();
      ctx.ellipse(320, 160, 36, 20, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#540b0e';
      ctx.beginPath();
      ctx.ellipse(320, 160, 18, 10, 0.1, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    }

    function createMarsCanvasTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');

      ctx.fillStyle = '#c1440e';
      ctx.fillRect(0, 0, 512, 256);

      // Dark volcanic basalt patches
      ctx.fillStyle = '#5c2411';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, 60 + Math.random() * 140, 30 + Math.random() * 30, 15 + Math.random() * 15, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      // Polar Ice Caps
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(256, 12, 60, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(256, 244, 45, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    }

    function createSaturnRingTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 32;
      const ctx = c.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0.0, 'rgba(160, 130, 90, 0.0)');
      grad.addColorStop(0.15, 'rgba(190, 160, 110, 0.4)');
      grad.addColorStop(0.40, 'rgba(230, 200, 150, 0.9)'); // Bright B ring
      grad.addColorStop(0.55, 'rgba(210, 180, 130, 0.85)');
      grad.addColorStop(0.58, 'rgba(0, 0, 0, 0.05)'); // Cassini Division!
      grad.addColorStop(0.62, 'rgba(0, 0, 0, 0.05)');
      grad.addColorStop(0.65, 'rgba(190, 160, 120, 0.7)'); // A ring
      grad.addColorStop(0.95, 'rgba(150, 120, 80, 0.4)');
      grad.addColorStop(1.0, 'rgba(100, 80, 50, 0.0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 32);
      return new THREE.CanvasTexture(c);
    }

    function createPlanetTexture(type) {
      if (type === 'sun') return createSunCanvasTexture();
      if (type === 'earth') return createEarthCanvasTexture();
      if (type === 'jupiter') return createJupiterCanvasTexture();
      if (type === 'mars') return createMarsCanvasTexture();

      // Generic texture with surface noise for others
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 128;
      const ctx = c.getContext('2d');

      let baseCol = '#9e9e9e';
      if (type === 'mercury') baseCol = '#7a7a7a';
      if (type === 'venus') baseCol = '#e6b800';
      if (type === 'saturn') baseCol = '#e0c088';
      if (type === 'uranus') baseCol = '#64d8cb';
      if (type === 'neptune') baseCol = '#2b59c3';

      ctx.fillStyle = baseCol;
      ctx.fillRect(0, 0, 256, 128);

      // Surface bands / noise
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let y = 0; y < 128; y += 8) {
        if (Math.random() > 0.4) ctx.fillRect(0, y, 256, 4);
      }
      return new THREE.CanvasTexture(c);
    }

    function init3D() {
      const container = document.getElementById('threeContainer');
      if (!container) return;
      const width = container.clientWidth || window.innerWidth || 800;
      const height = container.clientHeight || window.innerHeight || 500;

      // 1. Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x02040a);

      // 2. Camera
      const aspect = (width > 0 && height > 0) ? (width / height) : 1.6;
      camera = new THREE.PerspectiveCamera(45, aspect, 1, 3000);
      camera.position.set(0, 190, 320);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 4. OrbitControls (with smooth fallback if CDN is delayed)
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 800;
        controls.minDistance = 25;
      } else {
        controls = setupFallbackControls(camera, renderer.domElement);
      }

      // 5. Lighting
      const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
      scene.add(ambientLight);

      // Sun Light (Point Light from center)
      const sunLight = new THREE.PointLight(0xffffff, 2.0, 1200, 0.6);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      // 6. Deep Space Starfield (1500 multi-colored stars)
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1500;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 2200;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2200;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2200;

        const colChoice = Math.random();
        if (colChoice > 0.8) {
          starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0; // Blue-white
        } else if (colChoice > 0.6) {
          starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.6; // Warm yellow
        } else {
          starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0; // Pure white
        }
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.85 });
      const starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      // 7. Build Sun & Orbiting Planets with Realistic Textures
      Object.keys(PLANET_DATA).forEach((key) => {
        const data = PLANET_DATA[key];
        const geo = new THREE.SphereGeometry(data.radius, 36, 36);

        let mat;
        if (key === 'sun') {
          const sunTex = createPlanetTexture('sun');
          mat = new THREE.MeshBasicMaterial({ map: sunTex });
        } else {
          const tex = createPlanetTexture(key);
          mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.65,
            metalness: 0.1
          });
        }

        const mesh = new THREE.Mesh(geo, mat);

        // Planet Pivot & Orbit Path
        const pivot = new THREE.Group();
        scene.add(pivot);

        if (data.orbitRadius > 0) {
          mesh.position.x = data.orbitRadius;

          // Orbit Line
          const orbitGeo = new THREE.RingGeometry(data.orbitRadius - 0.25, data.orbitRadius + 0.25, 128);
          const orbitMat = new THREE.MeshBasicMaterial({ color: 0x334466, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
          const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
          orbitRing.rotation.x = Math.PI / 2;
          scene.add(orbitRing);
        }

        // Saturn's Realistic 3D Rings
        if (data.hasRings) {
          const ringGeo = new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.3, 64);
          const ringTex = createSaturnRingTexture();
          const ringMat = new THREE.MeshStandardMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
            roughness: 0.5
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.3;
          mesh.add(ringMesh);
        }

        pivot.add(mesh);

        planets[key] = {
          mesh,
          pivot,
          speed: data.speed,
          angle: Math.random() * Math.PI * 2,
          data
        };
      });

      // 8. Raycasting for Click / Touch Focus
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function onPointerDown(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if (!clientX || !clientY) return;

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const meshes = Object.values(planets).map(p => p.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object;
          for (const [k, p] of Object.entries(planets)) {
            if (p.mesh === clickedMesh) {
              focusPlanet(k);
              break;
            }
          }
        }
      }

      renderer.domElement.addEventListener('click', onPointerDown);

      window.addEventListener('resize', onWindowResize);
      animate();
    }

    function onWindowResize() {
      const container = document.getElementById('threeContainer');
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function toggleOrbits() {
      isOrbiting = !isOrbiting;
      document.getElementById('orbitToggleBtn').textContent = isOrbiting ? '⏸️ Duraklat' : '▶️ Devam Et';
    }

    function resetCameraView() {
      cameraTarget = null;
      targetLookAt.set(0, 0, 0);
      controls.target.set(0, 0, 0);
      camera.position.set(0, 190, 320);
    }

    function focusPlanet(key) {
      const p = planets[key];
      if (!p) return;

      const d = p.data;
      document.getElementById('planetName').textContent = d.name;
      document.getElementById('planetSub').textContent = d.sub;
      document.getElementById('planetIcon').textContent = d.icon;
      document.getElementById('factDistance').textContent = d.dist;
      document.getElementById('factDiameter').textContent = d.dia;
      document.getElementById('factYear').textContent = d.year;
      document.getElementById('factMoons').textContent = d.moons;
      document.getElementById('planetInfoText').textContent = d.info;

      cameraTarget = p;
    }

    function animate() {
      requestAnimationFrame(animate);

      // Rotate planet on its axis & Orbit around Sun
      Object.keys(planets).forEach((key) => {
        const p = planets[key];
        p.mesh.rotation.y += 0.01;

        if (isOrbiting && p.speed > 0) {
          p.angle += p.speed * 0.45;
          p.mesh.position.x = Math.cos(p.angle) * p.data.orbitRadius;
          p.mesh.position.z = Math.sin(p.angle) * p.data.orbitRadius;
        }
      });

      // Smooth Camera Follow if a planet is selected
      if (cameraTarget) {
        const worldPos = new THREE.Vector3();
        cameraTarget.mesh.getWorldPosition(worldPos);

        targetLookAt.lerp(worldPos, 0.08);
        controls.target.copy(targetLookAt);

        const offsetDist = cameraTarget.data.radius * 3.8 + 14;
        const targetCamPos = new THREE.Vector3(
          worldPos.x + offsetDist * 0.8,
          worldPos.y + offsetDist * 0.5,
          worldPos.z + offsetDist
        );
        camera.position.lerp(targetCamPos, 0.05);
      }

      if (controls && controls.update) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function setupFallbackControls(cam, dom) {
      let isDragging = false;
      let prevX = 0, prevY = 0;
      dom.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
      window.addEventListener('mouseup', () => { isDragging = false; });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX; prevY = e.clientY;
        cam.position.x += dx * 0.5;
        cam.position.y -= dy * 0.5;
        cam.lookAt(targetLookAt);
      });
      dom.addEventListener('touchstart', (e) => { if (e.touches.length === 1) { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; } }, { passive: true });
      window.addEventListener('touchend', () => { isDragging = false; });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - prevX;
        const dy = e.touches[0].clientY - prevY;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
        cam.position.x += dx * 0.5;
        cam.position.y -= dy * 0.5;
        cam.lookAt(targetLookAt);
      }, { passive: true });
      return { update: () => {}, target: targetLookAt };
    }

    function safeStartSpaceSim() {
      if (typeof THREE === 'undefined') {
        setTimeout(safeStartSpaceSim, 60);
        return;
      }
      try {
        init3D();
      } catch (err) {
        console.warn("Space sim retry:", err);
        setTimeout(safeStartSpaceSim, 200);
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      safeStartSpaceSim();
    } else {
      window.addEventListener('load', safeStartSpaceSim);
    }
  </script>
    """
)


# MODULE 5: Sınıf Çarkı & Geri Sayım Araçları (Responsive)
# ==============================================================================
MODULE_5_HTML = build_html_wrapper(
    "Sınıf Çarkı & Geri Sayım Araçları",
    """
  <!-- Header Bar -->
  <header class="bg-white border-b border-rose-100 p-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
        🎡
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Sınıf Çarkı & Geri Sayım Araçları</h1>
        <p class="text-[10px] sm:text-[11px] text-rose-600 font-semibold">Öğrenci Seçici Şans Çarkı, Takım Kurucu ve Sınıf Geri Sayım Sayacı</p>
      </div>
    </div>
    
    <!-- Tool tabs -->
    <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto justify-between sm:justify-end">
      <button onclick="switchTab('wheel')" id="tabWheel" class="touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-rose-900 shadow-xs transition cursor-pointer">
        🎡 Şans Çarkı
      </button>
      <button onclick="switchTab('teams')" id="tabTeams" class="touch-btn px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer">
        👥 Takım Kurucu
      </button>
      <button onclick="switchTab('timer')" id="tabTimer" class="touch-btn px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer">
        ⏰ Sınıf Sayacı
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4">
    <!-- Center Display -->
    <div class="flex-1 bg-white rounded-3xl border border-rose-200/80 shadow-md p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
      
      <!-- 1. WHEEL VIEW -->
      <div id="viewWheel" class="flex flex-col items-center justify-center space-y-4">
        <div class="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
          <!-- Wheel Pointer -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-3xl filter drop-shadow-md">
            🔻
          </div>
          <canvas id="wheelCanvas" width="340" height="340" class="w-full h-full"></canvas>
        </div>

        <button id="spinBtn" onclick="spinWheel()" class="touch-btn px-10 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm shadow-lg active:scale-95 transition flex items-center gap-2 cursor-pointer">
          🎰 Çarkı Çevir!
        </button>

        <div id="winnerBanner" class="hidden text-center p-3 bg-rose-50 border border-rose-200 rounded-2xl">
          <span class="text-xs text-rose-500 font-bold block uppercase tracking-wider">Seçilen Öğrenci:</span>
          <span id="winnerName" class="text-xl font-black text-rose-900">Ali Yılmaz 🎉</span>
        </div>
      </div>

      <!-- 2. TEAMS VIEW -->
      <div id="viewTeams" class="hidden w-full h-full flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Takım Sayısı:</span>
            <div class="flex items-center gap-2">
              <button onclick="generateTeams(2)" class="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold hover:bg-rose-100 cursor-pointer">2 Takım</button>
              <button onclick="generateTeams(3)" class="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold hover:bg-rose-100 cursor-pointer">3 Takım</button>
              <button onclick="generateTeams(4)" class="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold hover:bg-rose-100 cursor-pointer">4 Takım</button>
            </div>
          </div>
          <div id="teamsContainer" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[300px]">
            <!-- Team cards -->
          </div>
        </div>
        <button onclick="generateTeams(currentTeamCount)" class="touch-btn w-full mt-3 py-3 rounded-2xl bg-rose-500 text-white font-black text-xs shadow-md transition cursor-pointer">
          🎲 Takımları Yeniden Karıştır
        </button>
      </div>

      <!-- 3. TIMER VIEW -->
      <div id="viewTimer" class="hidden flex-col items-center justify-center space-y-4 text-center">
        <div class="text-6xl sm:text-7xl font-mono font-black text-rose-900 tracking-tight my-2" id="classTimerDisplay">
          05:00
        </div>
        <div class="flex items-center gap-2 flex-wrap justify-center">
          <button onclick="setTimerMinutes(1)" class="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs hover:bg-rose-50 cursor-pointer">1 dk</button>
          <button onclick="setTimerMinutes(3)" class="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs hover:bg-rose-50 cursor-pointer">3 dk</button>
          <button onclick="setTimerMinutes(5)" class="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs hover:bg-rose-50 cursor-pointer">5 dk</button>
          <button onclick="setTimerMinutes(10)" class="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-xs hover:bg-rose-50 cursor-pointer">10 dk</button>
        </div>
        <div class="flex items-center gap-3 pt-2">
          <button id="classTimerToggle" onclick="toggleClassTimer()" class="touch-btn px-8 py-3 rounded-2xl bg-rose-500 text-white font-black text-sm shadow-md transition cursor-pointer">
            ▶️ Başlat
          </button>
          <button onclick="resetClassTimer()" class="touch-btn px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition cursor-pointer">
            Sıfırla
          </button>
        </div>
      </div>
    </div>

    <!-- Right Column: Student Names Roster -->
    <div class="w-full md:w-80 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between shrink-0">
      <div>
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">Öğrenci Listesi</h3>
          <span id="nameCountBadge" class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">10 Öğrenci</span>
        </div>
        <textarea id="namesInput" rows="10" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold leading-relaxed outline-none focus:ring-2 focus:ring-rose-400" placeholder="Her satıra bir isim yazın..."></textarea>
      </div>
      <button onclick="updateRoster()" class="touch-btn w-full mt-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer">
        Listeyi Çarka Uygula
      </button>
    </div>
  </main>

  <script>
    const DEFAULT_STUDENTS = ["Ali Yılmaz", "Zeynep Kaya", "Mehmet Demir", "Elif Şahin", "Can Yıldırım", "Defne Çelik", "Burak Öztürk", "Nehir Aydın", "Emre Koç", "Ece Arslan"];
    let students = [...DEFAULT_STUDENTS];
    let wheelAngle = 0;
    let isSpinning = false;
    let currentTeamCount = 2;

    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

    function init() {
      document.getElementById('namesInput').value = students.join('\\n');
      drawWheel();
      generateTeams(2);
    }

    function updateRoster() {
      const text = document.getElementById('namesInput').value.trim();
      students = text.split('\\n').map(s => s.trim()).filter(Boolean);
      document.getElementById('nameCountBadge').textContent = students.length + ' Öğrenci';
      drawWheel();
      generateTeams(currentTeamCount);
    }

    function drawWheel() {
      const canvas = document.getElementById('wheelCanvas');
      const ctx = canvas.getContext('2d');
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = cx - 15;
      const count = students.length;
      if (count === 0) return;
      const arc = (Math.PI * 2) / count;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(wheelAngle);

      for (let i = 0; i < count; i++) {
        const start = i * arc;
        const end = start + arc;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, start, end);
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(start + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 3;
        ctx.fillText(students[i], r - 25, 5);
        ctx.restore();
      }

      ctx.restore();

      // Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function spinWheel() {
      if (isSpinning || students.length === 0) return;
      isSpinning = true;
      document.getElementById('winnerBanner').classList.add('hidden');

      const extraSpins = 5 + Math.random() * 5;
      const targetAngle = wheelAngle + extraSpins * Math.PI * 2;
      const duration = 4000;
      const startTime = performance.now();
      const startAngle = wheelAngle;

      function animateSpin(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        wheelAngle = startAngle + (targetAngle - startAngle) * easeOut;
        drawWheel();

        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          isSpinning = false;
          announceWinner();
        }
      }

      requestAnimationFrame(animateSpin);
    }

    function announceWinner() {
      const count = students.length;
      const arc = (Math.PI * 2) / count;
      let normalized = (wheelAngle + Math.PI / 2) % (Math.PI * 2);
      if (normalized < 0) normalized += Math.PI * 2;
      const selectedIndex = Math.floor((Math.PI * 2 - normalized) / arc) % count;
      const winner = students[selectedIndex];

      document.getElementById('winnerName').textContent = winner + ' 🎉';
      document.getElementById('winnerBanner').classList.remove('hidden');

      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }

    function switchTab(tab) {
      ['viewWheel', 'viewTeams', 'viewTimer'].forEach(id => document.getElementById(id).classList.add('hidden'));
      ['tabWheel', 'tabTeams', 'tabTimer'].forEach(id => {
        document.getElementById(id).className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer';
      });

      if (tab === 'wheel') {
        document.getElementById('viewWheel').classList.remove('hidden');
        document.getElementById('tabWheel').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-rose-900 shadow-xs transition cursor-pointer';
      } else if (tab === 'teams') {
        document.getElementById('viewTeams').classList.remove('hidden');
        document.getElementById('tabTeams').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-rose-900 shadow-xs transition cursor-pointer';
      } else {
        document.getElementById('viewTimer').classList.remove('hidden');
        document.getElementById('tabTimer').className = 'touch-btn px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-rose-900 shadow-xs transition cursor-pointer';
      }
    }

    function generateTeams(teamCount) {
      currentTeamCount = teamCount;
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const teams = Array.from({ length: teamCount }, () => []);

      shuffled.forEach((student, idx) => {
        teams[idx % teamCount].push(student);
      });

      const container = document.getElementById('teamsContainer');
      container.innerHTML = '';
      teams.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-slate-50 rounded-2xl border border-slate-200';
        div.innerHTML = `
          <h4 class="font-black text-xs text-rose-700 mb-2">Takım ${i + 1} (${t.length})</h4>
          <ul class="space-y-1 text-xs text-slate-700">
            ${t.map(s => `<li class="truncate">• ${s}</li>`).join('')}
          </ul>
        `;
        container.appendChild(div);
      });
    }

    let classTimerSecs = 300;
    let classTimerInterval = null;
    let isClassTimerRunning = false;

    function setTimerMinutes(mins) {
      resetClassTimer();
      classTimerSecs = mins * 60;
      updateClassTimerDisplay();
    }

    function toggleClassTimer() {
      if (isClassTimerRunning) {
        clearInterval(classTimerInterval);
        isClassTimerRunning = false;
        document.getElementById('classTimerToggle').textContent = '▶️ Devam Et';
      } else {
        isClassTimerRunning = true;
        document.getElementById('classTimerToggle').textContent = '⏸️ Duraklat';
        classTimerInterval = setInterval(() => {
          classTimerSecs--;
          updateClassTimerDisplay();
          if (classTimerSecs <= 0) {
            clearInterval(classTimerInterval);
            isClassTimerRunning = false;
            document.getElementById('classTimerToggle').textContent = '▶️ Başlat';
            if (typeof confetti === 'function') confetti();
          }
        }, 1000);
      }
    }

    function resetClassTimer() {
      clearInterval(classTimerInterval);
      isClassTimerRunning = false;
      classTimerSecs = 300;
      updateClassTimerDisplay();
      document.getElementById('classTimerToggle').textContent = '▶️ Başlat';
    }

    function updateClassTimerDisplay() {
      const m = Math.floor(classTimerSecs / 60);
      const s = classTimerSecs % 60;
      document.getElementById('classTimerDisplay').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    window.onload = init;
  </script>
    """
)


# ==============================================================================
# MODULE 6: İngilizce Kelime & Görsel Macera Atölyesi (Responsive)
# ==============================================================================
MODULE_6_HTML = build_html_wrapper(
    "İngilizce Kelime & Görsel Macera Atölyesi",
    """
  <!-- Header Bar -->
  <header class="bg-white border-b border-teal-100 p-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
        🇬🇧
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">İngilizce Kelime & Görsel Macera Atölyesi</h1>
        <p class="text-[10px] sm:text-[11px] text-teal-600 font-semibold">Tematik Görsel Kartlar, İngilizce Telaffuz ve Eşleştirme Oyunları</p>
      </div>
    </div>
    
    <!-- Category select -->
    <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
      <select id="catSelect" onchange="changeCategory(this.value)" class="text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer">
        <option value="animals">Hayvanlar (Animals 🦁)</option>
        <option value="colors">Renkler (Colors 🎨)</option>
        <option value="numbers">Sayılar (Numbers 🔢)</option>
        <option value="fruits">Meyveler (Fruits 🍎)</option>
        <option value="school">Okul Eşyaları (School 🎒)</option>
      </select>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 md:p-5 gap-4">
    <!-- Center: Flashcards Grid -->
    <div class="flex-1 bg-white rounded-3xl border border-teal-200/80 shadow-md p-4 sm:p-5 flex flex-col justify-between overflow-y-auto min-h-[380px]">
      <div>
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Karta Dokununca Sesli Dinleyin</span>
          <span id="cardCountBadge" class="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">6 Kelime</span>
        </div>

        <div id="cardsGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 select-none">
          <!-- Flashcards injected -->
        </div>
      </div>

      <div class="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>İngilizce telaffuz tarayıcınızın konuşma motoruyla yapılır.</span>
      </div>
    </div>

    <!-- Right Column: Quiz Mini Game -->
    <div class="w-full md:w-80 bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-lg flex flex-col justify-between shrink-0">
      <div>
        <span class="text-xs font-bold text-teal-200 uppercase tracking-wider block mb-1">Mini Kelime Oyunu</span>
        <h2 class="text-lg font-black mb-3">Doğru Eşleştir!</h2>

        <div class="p-5 bg-white/15 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 mb-4 shadow-inner border border-white/20">
          <div class="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30 transform hover:scale-105 transition">
            <span id="quizEmoji" class="text-7xl block select-none drop-shadow-md">🦁</span>
          </div>
          <p id="quizQuestion" class="font-black text-sm text-teal-100">Bu görselin İngilizcesi hangisidir?</p>
        </div>

        <div id="quizOptions" class="grid grid-cols-2 gap-2 text-xs">
          <!-- Quiz buttons -->
        </div>
      </div>

      <div class="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
        <span>Skor: <strong id="scoreDisplay">0 Puan</strong></span>
        <button onclick="nextQuiz()" class="text-teal-200 underline font-bold cursor-pointer">Sıradaki Soru</button>
      </div>
    </div>
  </main>

  <script>
    const VOCAB = {
      animals: [
        { en: 'Lion', tr: 'Aslan', icon: '🦁' },
        { en: 'Elephant', tr: 'Fil', icon: '🐘' },
        { en: 'Monkey', tr: 'Maymun', icon: '🐒' },
        { en: 'Cat', tr: 'Kedi', icon: '🐱' },
        { en: 'Dog', tr: 'Köpek', icon: '🐶' },
        { en: 'Rabbit', tr: 'Tavşan', icon: '🐰' }
      ],
      colors: [
        { en: 'Red', tr: 'Kırmızı', icon: '🔴' },
        { en: 'Blue', tr: 'Mavi', icon: '🔵' },
        { en: 'Green', tr: 'Yeşil', icon: '🟢' },
        { en: 'Yellow', tr: 'Sarı', icon: '🟡' },
        { en: 'Purple', tr: 'Mor', icon: '🟣' },
        { en: 'Orange', tr: 'Turuncu', icon: '🟠' }
      ],
      numbers: [
        { en: 'One', tr: 'Bir', icon: '1️⃣' },
        { en: 'Two', tr: 'İki', icon: '2️⃣' },
        { en: 'Three', tr: 'Üç', icon: '3️⃣' },
        { en: 'Four', tr: 'Dört', icon: '4️⃣' },
        { en: 'Five', tr: 'Beş', icon: '5️⃣' },
        { en: 'Ten', tr: 'On', icon: '🔟' }
      ],
      fruits: [
        { en: 'Apple', tr: 'Elma', icon: '🍎' },
        { en: 'Banana', tr: 'Muz', icon: '🍌' },
        { en: 'Strawberry', tr: 'Çilek', icon: '🍓' },
        { en: 'Orange', tr: 'Portakal', icon: '🍊' },
        { en: 'Watermelon', tr: 'Karpuz', icon: '🍉' },
        { en: 'Grapes', tr: 'Üzüm', icon: '🍇' }
      ],
      school: [
        { en: 'Book', tr: 'Kitap', icon: '📖' },
        { en: 'Pencil', tr: 'Kalem', icon: '✏️' },
        { en: 'Bag', tr: 'Çanta', icon: '🎒' },
        { en: 'Ruler', tr: 'Cetvel', icon: '📏' },
        { en: 'Eraser', tr: 'Silgi', icon: '🧼' },
        { en: 'Scissors', tr: 'Makas', icon: '✂️' }
      ]
    };

    let activeCategory = 'animals';
    let quizScore = 0;
    let currentQuizItem = null;

    function init() {
      changeCategory('animals');
    }

    function changeCategory(cat) {
      activeCategory = cat;
      const items = VOCAB[cat] || [];
      document.getElementById('cardCountBadge').textContent = items.length + ' Kelime';

      const grid = document.getElementById('cardsGrid');
      grid.innerHTML = '';
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-teal-50/50 hover:bg-teal-100/60 border border-teal-200 rounded-2xl text-center shadow-xs transition hover:scale-105 cursor-pointer flex flex-col items-center justify-center';
        div.innerHTML = `
          <span class="text-4xl sm:text-5xl mb-2">${item.icon}</span>
          <span class="font-black text-sm text-slate-800">${item.en}</span>
          <span class="text-[11px] text-teal-700 font-semibold">${item.tr}</span>
        `;
        div.onclick = () => speakWord(item.en);
        grid.appendChild(div);
      });

      nextQuiz();
    }

    function speakWord(word) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    }

    function nextQuiz() {
      const items = VOCAB[activeCategory] || [];
      if (items.length === 0) return;
      currentQuizItem = items[Math.floor(Math.random() * items.length)];

      document.getElementById('quizEmoji').textContent = currentQuizItem.icon;
      const opts = [currentQuizItem.en];
      while (opts.length < 4) {
        const rand = items[Math.floor(Math.random() * items.length)].en;
        if (!opts.includes(rand)) opts.push(rand);
      }
      opts.sort(() => Math.random() - 0.5);

      const optContainer = document.getElementById('quizOptions');
      optContainer.innerHTML = '';
      opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'touch-btn p-2.5 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition cursor-pointer';
        btn.textContent = opt;
        btn.onclick = () => checkQuiz(opt, btn);
        optContainer.appendChild(btn);
      });
    }

    function checkQuiz(selected, btn) {
      if (selected === currentQuizItem.en) {
        btn.className = 'touch-btn p-2.5 rounded-xl bg-emerald-400 text-emerald-950 font-black';
        quizScore += 10;
        document.getElementById('scoreDisplay').textContent = quizScore + ' Puan';
        speakWord(currentQuizItem.en);
        setTimeout(nextQuiz, 600);
      } else {
        btn.className = 'touch-btn p-2.5 rounded-xl bg-red-400 text-white font-bold animate-shake';
      }
    }

    window.onload = init;
  </script>
    """
)


# Module list to export
CLAUDE_MODULES = [
    {
        "slug": "1-dk-okuma",
        "name": "1 Dk Okuma & Hızlı Okuma Atölyesi",
        "description": "[1. Sınıf Temel Beceriler] 60 saniye akıllı sayaç, MEB Dik Temel Abece yazı tipi, hece ve kelime piramitleri, anlık WPM ve başarı karnesi.",
        "published": True,
        "owner": "student-11",
        "html": MODULE_1_HTML,
    },
    {
        "slug": "harf-cizgi-atolyesi",
        "name": "Harf Çizgi & Yazılış Yönü Atölyesi",
        "description": "[1. Sınıf Temel Beceriler] MEB 4 çizgili kılavuz satırda adımlı yazılış yönü animasyonu, dokunmatik çizim tuvali ve çizgi çalışmaları.",
        "published": True,
        "owner": "student-11",
        "html": MODULE_2_HTML,
    },
    {
        "slug": "ritmik-sayma-atolyesi",
        "name": "Ritmik Sayma & Sayı Doğrusu Atölyesi",
        "description": "[Matematik & Sayılar] 1'den 100'e interaktif yüzlük tablo boyama, elastik parabolik zıplayan sevimli maskotlu sayı doğrusu.",
        "published": True,
        "owner": "student-08",
        "html": MODULE_3_HTML,
    },
    {
        "slug": "gunes-sistemi-atolyesi",
        "name": "Güneş Sistemi & Gezegenler Keşif Atölyesi",
        "description": "[Fen & Doğa] Three.js tabanlı 3D etkileşimli Güneş Sistemi, Satürn halkaları, 360° dokunmatik kamera ve gezegen bilgi kartları.",
        "published": True,
        "owner": "student-04",
        "html": MODULE_4_HTML,
    },
    {
        "slug": "sinif-carki-zamanlayici",
        "name": "Sınıf Çarkı & Geri Sayım Araçları",
        "description": "[Genel Modül] Etkileşimli öğrenci isim çarkı (şans çarkı), otomatik takım ve grup oluşturucu, sesli sınıf geri sayım sayacı.",
        "published": True,
        "owner": "student-00",
        "html": MODULE_5_HTML,
    },
    {
        "slug": "ingilizce-kelime-atolyesi",
        "name": "İngilizce Kelime & Görsel Macera Atölyesi",
        "description": "[Genel Modül] 5 tematik kategori, sesli kelime kartları ve doğru kelimeyi bulma mini oyunu.",
        "published": True,
        "owner": "student-08",
        "html": MODULE_6_HTML,
    },
]


def update_engagement_json():
    bundle_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../src/services/demo/bundle/engagement.json",
        )
    )
    with open(bundle_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["playgrounds"] = CLAUDE_MODULES

    with open(bundle_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ Successfully wrote 6 Claude modules to {bundle_path}")


async def sync_database():
    from src.core.events.database import get_db_session
    from src.db.playgrounds import Playground, PlaygroundAccessType
    from src.db.organizations import Organization
    from sqlmodel import select

    generator = get_db_session()
    db = await anext(generator)

    try:
        orgs = (await db.execute(select(Organization))).scalars().all()
        print(f"Found {len(orgs)} organizations in DB")

        for org in orgs:
            print(f"Syncing 6 modules for org: {org.name} (id={org.id}, slug={org.slug})")
            
            valid_names = [m["name"] for m in CLAUDE_MODULES]
            existing = (await db.execute(
                select(Playground).where(Playground.org_id == org.id)
            )).scalars().all()

            for p in existing:
                if p.name not in valid_names:
                    print(f"  Removing obsolete playground: {p.name}")
                    await db.delete(p)

            for spec in CLAUDE_MODULES:
                match = next((p for p in existing if p.name == spec["name"]), None)
                now = datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
                if match:
                    match.description = spec["description"]
                    match.html_content = spec["html"]
                    match.published = True
                    match.access_type = PlaygroundAccessType.AUTHENTICATED
                    match.update_date = now
                    db.add(match)
                    print(f"  Updated module: {spec['name']}")
                else:
                    new_pg = Playground(
                        org_id=org.id,
                        playground_uuid=f"playground_{spec['slug']}",
                        name=spec["name"],
                        description=spec["description"],
                        access_type=PlaygroundAccessType.AUTHENTICATED,
                        published=True,
                        html_content=spec["html"],
                        creation_date=now,
                        update_date=now,
                    )
                    db.add(new_pg)
                    print(f"  Created module: {spec['name']}")

            await db.commit()

        print("✅ Database sync complete!")

    finally:
        await db.close()


def main():
    update_engagement_json()
    asyncio.run(sync_database())


if __name__ == "__main__":
    main()
