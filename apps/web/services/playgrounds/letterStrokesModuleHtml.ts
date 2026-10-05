/**
 * Harf Çizgi & Yazılış Yönü Atölyesi Modülü
 * - MEB 1. Sınıf Dik Temel Abece Müfredatına %100 Uyumlu
 * - Kusursuz Parametrik Yuvarlak Harfler (O, o, e, c, a, d, b vb. köşesiz pürüzsüz yaylar)
 * - Her Hamleye Özel Pedagojik Türkçe "Nasıl Yazılır?" Sesli ve Yazılı Tarifler
 * - Tüm 5 Harf Grubu + Rakamlar + Temel Çizgi Çalışmaları (H, h, V, Ğ, F, J eksiksiz)
 * - 4 Çizgili 3 Aralıklı MEB Standart Kılavuz Satır (Kırmızı Taban Çizgisi, Kesikli Orta Çizgi)
 * - Dokunmatik Tablet & Mobil Uyumlu Çizim Tuvali
 */

export const LETTER_STROKES_MODULE_HTML = `<!DOCTYPE html>
<html lang="tr" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Harf Çizgi & Yazılış Yönü Atölyesi</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
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
      min-height: 44px; min-width: 44px;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 8px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 8px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }

    /* Custom stylings */
    .char-pill {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .char-pill.active {
      background-color: #4f46e5 !important;
      color: #ffffff !important;
      border-color: #4338ca !important;
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }
  </style>
</head>
<body class="h-full w-full bg-slate-50 text-slate-800 flex flex-col overflow-y-auto md:overflow-hidden select-none">

  <!-- Header Bar -->
  <header class="bg-white border-b border-indigo-100 p-3 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs shrink-0 z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
        ✍️
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">Harf Çizgi & Yazılış Yönü Atölyesi</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">MEB 1. Sınıf</span>
        </div>
        <p class="text-[11px] text-indigo-600 font-semibold">T.C. MEB Dik Temel Abece Standartları & Adımlı Yazılış Yönü Rehberi</p>
      </div>
    </div>
    
    <!-- Controls: Case Toggle & Group Switcher -->
    <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
      <!-- Upper / Lower Case Toggle -->
      <div class="flex items-center bg-indigo-100/70 p-0.5 rounded-xl border border-indigo-200/50">
        <button id="caseUpperBtn" onclick="setLetterCase('upper')" class="px-3 py-1.5 text-xs font-black rounded-lg transition bg-white text-indigo-900 shadow-xs cursor-pointer">BÜYÜK</button>
        <button id="caseLowerBtn" onclick="setLetterCase('lower')" class="px-3 py-1.5 text-xs font-black rounded-lg transition text-indigo-700 hover:text-indigo-950 cursor-pointer">küçük</button>
      </div>

      <!-- MEB Groups Dropdown -->
      <select id="groupSelect" onchange="changeGroup(this.value)" class="text-xs font-bold bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl px-3 py-2 outline-none cursor-pointer shadow-2xs">
        <option value="1" selected>1. Grup (E - L - A - K - İ - N)</option>
        <option value="2">2. Grup (O - M - U - T - Ü - Y)</option>
        <option value="3">3. Grup (Ö - R - I - D - S - B)</option>
        <option value="4">4. Grup (Z - Ç - G - Ş - C - P)</option>
        <option value="5">5. Grup (H - V - Ğ - F - J)</option>
        <option value="numbers">🔢 Rakamlar (0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9)</option>
        <option value="strokes">✏️ Temel Çizgiler (Dik, Eğik, Çember, Dalgalı...)</option>
      </select>
    </div>
  </header>

  <!-- Main Content Workspace -->
  <main class="flex-1 flex flex-col p-3 md:p-5 gap-3 overflow-hidden">
    
    <!-- Horizontal Character Selector Strip -->
    <div id="charList" class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0 py-1">
      <!-- Character buttons injected by JS -->
    </div>

    <!-- Active Character Stage & Canvas -->
    <div class="flex-1 bg-white rounded-3xl border border-indigo-200/90 shadow-sm p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative">
      
      <!-- Top Character Info Banner -->
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2 shrink-0">
        <div class="flex items-center gap-3">
          <span id="activeCharBadge" class="font-meb text-3xl font-black text-indigo-700 bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center border border-indigo-200 shadow-2xs">
            E
          </span>
          <div>
            <span id="charWord" class="text-xs sm:text-sm font-black text-slate-900 block">Elma 🍎</span>
            <span id="charDesc" class="text-[11px] sm:text-xs text-slate-500 block font-medium">Büyük E (4 Hamle)</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button id="guideBtn" onclick="playMebStrokeAnimation()" class="touch-btn px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95">
            <span>✨ Nasıl Yazılır? (Rehber)</span>
          </button>
          <button onclick="speakCharDescription()" title="Tarifi Seslendir" class="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg border border-indigo-200 transition cursor-pointer">
            🔊
          </button>
        </div>
      </div>

      <!-- 4-Line Guide Ruling & Canvas Area -->
      <div class="flex-1 relative my-2 bg-indigo-50/20 rounded-2xl border border-indigo-100 flex items-center justify-center overflow-hidden min-h-[300px]" id="canvasWrapper">
        
        <!-- Ruler Line Legend Badges (Left Margin) -->
        <div class="absolute left-2 top-0 bottom-0 pointer-events-none flex flex-col justify-between py-6 text-[9px] font-extrabold text-slate-400 select-none z-10 hidden sm:flex">
          <span class="text-slate-400">Tepe</span>
          <span class="text-indigo-400">Orta Gövde (Kesikli)</span>
          <span class="text-rose-500">Zemin (Kırmızı Taban)</span>
          <span class="text-slate-400">Alt Kuyruk</span>
        </div>

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

        <!-- Guidance Banner (Shows active pedagogical stroke description) -->
        <div id="strokeBanner" class="hidden absolute top-3 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 bg-indigo-950/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-2xl z-20 shadow-lg flex items-center justify-center gap-2 border border-indigo-700/50 text-center">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0"></span>
          <span id="strokeText">1. Hamle Çiziliyor...</span>
        </div>
      </div>

      <!-- Bottom Palette & Controls -->
      <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <!-- Color Dots -->
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-bold text-slate-400 mr-1">Renk:</span>
          <button onclick="setPenColor('#4f46e5')" title="Mor" class="w-7 h-7 rounded-full bg-indigo-600 ring-2 ring-indigo-600/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#ef4444')" title="Kırmızı" class="w-7 h-7 rounded-full bg-red-500 ring-2 ring-red-500/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#10b981')" title="Yeşil" class="w-7 h-7 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#f59e0b')" title="Turuncu" class="w-7 h-7 rounded-full bg-amber-500 ring-2 ring-amber-500/30 hover:scale-110 transition cursor-pointer"></button>
          <button onclick="setPenColor('#0f172a')" title="Siyah" class="w-7 h-7 rounded-full bg-slate-900 ring-2 ring-slate-900/30 hover:scale-110 transition cursor-pointer"></button>
        </div>

        <!-- Pen Width Selector -->
        <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button onclick="setPenWidth(10)" class="px-2 py-1 text-[11px] font-bold rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer">İnce</button>
          <button onclick="setPenWidth(16)" class="px-2 py-1 text-[11px] font-black rounded-lg bg-white text-indigo-900 shadow-xs cursor-pointer">Normal</button>
          <button onclick="setPenWidth(24)" class="px-2 py-1 text-[11px] font-bold rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer">Kalın</button>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button onclick="clearCanvas()" class="touch-btn px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer">
            🗑️ Temizle
          </button>
          <button onclick="celebrateSuccess()" class="touch-btn px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-1 transition cursor-pointer active:scale-95">
            ⭐ Tamamladım!
          </button>
        </div>
      </div>
    </div>
  </main>

  <!-- JAVASCRIPT ENGINE -->
  <script>
    // ==========================================
    // CURVE & ELLIPSE MATH GENERATORS
    // ==========================================
    // Generates smooth parametric points for circles and ovals (counter-clockwise)
    function makeOvalPoints(cx, cy, rx, ry, startDeg = 75, sweepDeg = -360, steps = 32) {
      const pts = [];
      const startRad = (startDeg * Math.PI) / 180;
      const sweepRad = (sweepDeg * Math.PI) / 180;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = startRad + t * sweepRad;
        pts.push({
          x: Math.round((cx + rx * Math.cos(ang)) * 1000) / 1000,
          y: Math.round((cy + ry * Math.sin(ang)) * 1000) / 1000
        });
      }
      return pts;
    }

    // Generates smooth cubic bezier curve points
    function makeBezierPoints(p0, p1, p2, p3, steps = 24) {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
        pts.push({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 });
      }
      return pts;
    }

    // ==========================================
    // MEB AUTHENTIC GLYPH DATA & INSTRUCTIONS
    // ==========================================
    // Coordinates normalized in standard unit space:
    // Top line = 0.18, Mid line = 0.45, Base line = 0.72, Bottom line = 0.90
    // Capital letters: 0.18 -> 0.72
    // Lowercase mid: 0.45 -> 0.72
    // Lowercase ascenders: 0.18 -> 0.72
    // Lowercase descenders: 0.45 -> 0.90

    const GLYPH_DATA = {
      // --- GRUP 1: E, L, A, K, İ, N ---
      'E': {
        word: 'Elma 🍎',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [{ x: 0.35, y: 0.18 }, { x: 0.68, y: 0.18 }],
          [{ x: 0.35, y: 0.45 }, { x: 0.62, y: 0.45 }],
          [{ x: 0.35, y: 0.72 }, { x: 0.68, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı taban çizgisine dik bir çizgi indir.',
          '2. Hamle: En üstten sağa doğru düz bir yatay çizgi çiz.',
          '3. Hamle: Kesikli orta çizgiden sağa doğru düz bir yatay çizgi çiz.',
          '4. Hamle: Taban çizgisinden sağa doğru düz bir yatay çizgi çiz.'
        ]
      },
      'e': {
        word: 'Elbise 👗',
        // Authentic MEB Dik Temel 'e': 1 continuous smooth stroke!
        strokes: [
          [
            { x: 0.36, y: 0.58 }, { x: 0.64, y: 0.58 }, // Horizontal bar to right
            ...makeBezierPoints(
              { x: 0.64, y: 0.58 },
              { x: 0.64, y: 0.45 },
              { x: 0.50, y: 0.45 },
              { x: 0.36, y: 0.52 },
              12
            ),
            ...makeBezierPoints(
              { x: 0.36, y: 0.52 },
              { x: 0.33, y: 0.68 },
              { x: 0.50, y: 0.72 },
              { x: 0.66, y: 0.68 },
              16
            )
          ]
        ],
        instructions: [
          '1. Hamle: Gövdenin ortasından sağa düz çizgi çiz, yukarı kıvrılıp sola dön ve tabanda açık bir yay oluştur.'
        ]
      },
      'L': {
        word: 'Limon 🍋',
        strokes: [
          [{ x: 0.36, y: 0.18 }, { x: 0.36, y: 0.72 }],
          [{ x: 0.36, y: 0.72 }, { x: 0.68, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı taban çizgisine dik bir çizgi indir.',
          '2. Hamle: Taban çizgisinde soldan sağa doğru yatay çizgi çek.'
        ]
      },
      'l': {
        word: 'Leylek 🪶',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.50, y: 0.18 },
              { x: 0.50, y: 0.66 },
              { x: 0.50, y: 0.72 },
              { x: 0.60, y: 0.72 },
              16
            )
          ]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana kadar dik in ve tabanda hafifçe sağa kıvır.'
        ]
      },
      'A': {
        word: 'Arı 🐝',
        strokes: [
          [{ x: 0.50, y: 0.18 }, { x: 0.30, y: 0.72 }],
          [{ x: 0.50, y: 0.18 }, { x: 0.70, y: 0.72 }],
          [{ x: 0.38, y: 0.52 }, { x: 0.62, y: 0.52 }]
        ],
        instructions: [
          '1. Hamle: Tepeden sola doğru eğik bir çizgi indir.',
          '2. Hamle: Tepeden sağa doğru eğik bir çizgi indir.',
          '3. Hamle: Ortadaki yatay köprüyü soldan sağa birleştir.'
        ]
      },
      'a': {
        word: 'Ayı 🐻',
        strokes: [
          // Stroke 1: Counter-clockwise circle in middle space
          makeOvalPoints(0.48, 0.585, 0.14, 0.135, 75, -360, 24),
          // Stroke 2: Down stroke on the right side
          [
            ...makeBezierPoints(
              { x: 0.62, y: 0.46 },
              { x: 0.62, y: 0.66 },
              { x: 0.62, y: 0.72 },
              { x: 0.68, y: 0.72 },
              12
            )
          ]
        ],
        instructions: [
          '1. Hamle: Saat yönünün tersine sola doğru yuvarlak bir çember çizip kapat.',
          '2. Hamle: Sağ yanından yukarıdan aşağıya dik çizgi indirip tabanda hafifçe kıvır.'
        ]
      },
      'K': {
        word: 'Kedi 🐱',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [{ x: 0.66, y: 0.22 }, { x: 0.36, y: 0.47 }],
          [{ x: 0.36, y: 0.47 }, { x: 0.68, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı taban çizgisine dik bir çizgi indir.',
          '2. Hamle: Yukarıdan ortaya doğru eğik bir çizgi çiz.',
          '3. Hamle: Ortadan sağa aşağıya doğru eğik bir bacak çiz.'
        ]
      },
      'k': {
        word: 'Kelebek 🦋',
        strokes: [
          [{ x: 0.36, y: 0.18 }, { x: 0.36, y: 0.72 }],
          [{ x: 0.62, y: 0.48 }, { x: 0.37, y: 0.60 }],
          [{ x: 0.37, y: 0.60 }, { x: 0.64, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana uzun dik bir çizgi indir.',
          '2. Hamle: Kesikli orta çizgiden gövdeye doğru eğik çizgi çiz.',
          '3. Hamle: Ortadan kırmızı tabana doğru eğik bacak çiz.'
        ]
      },
      'İ': {
        word: 'İncir 🍐',
        strokes: [
          [{ x: 0.50, y: 0.26 }, { x: 0.50, y: 0.72 }],
          [{ x: 0.50, y: 0.16 }, { x: 0.50, y: 0.19 }]
        ],
        instructions: [
          '1. Hamle: Yukarıdan kırmızı taban çizgisine dik bir çizgi indir.',
          '2. Hamle: Çizginin üstüne net bir nokta koy.'
        ]
      },
      'i': {
        word: 'İğne 🪡',
        strokes: [
          [{ x: 0.50, y: 0.45 }, { x: 0.50, y: 0.72 }],
          [{ x: 0.50, y: 0.32 }, { x: 0.50, y: 0.35 }]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden kırmızı tabana dik bir çizgi indir.',
          '2. Hamle: Çizginin üstüne minik bir nokta koy.'
        ]
      },
      'N': {
        word: 'Nar 🍎',
        strokes: [
          [{ x: 0.32, y: 0.72 }, { x: 0.32, y: 0.18 }],
          [{ x: 0.32, y: 0.18 }, { x: 0.68, y: 0.72 }],
          [{ x: 0.68, y: 0.72 }, { x: 0.68, y: 0.18 }]
        ],
        instructions: [
          '1. Hamle: Tabandan tepeye dik bir çizgi çık.',
          '2. Hamle: Tepeden sağ tabana eğik bir çizgi indir.',
          '3. Hamle: Sağ tabandan tepeye dik bir çizgi çık.'
        ]
      },
      'n': {
        word: 'Nal 🧲',
        strokes: [
          [{ x: 0.36, y: 0.45 }, { x: 0.36, y: 0.72 }],
          [
            ...makeBezierPoints(
              { x: 0.36, y: 0.54 },
              { x: 0.40, y: 0.45 },
              { x: 0.58, y: 0.45 },
              { x: 0.64, y: 0.54 },
              12
            ),
            { x: 0.64, y: 0.72 }
          ]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden tabana dik çizgi indir.',
          '2. Hamle: Yukarı çıkıp sağa doğru yuvarlayarak tabana inen bir kemer yap.'
        ]
      },

      // --- GRUP 2: O, M, U, T, Ü, Y ---
      'O': {
        word: 'Otobüs 🚌',
        // PERFECT SMOOTH OVAL: 1 hamle, starts top, counter-clockwise ↺ back to start
        strokes: [
          makeOvalPoints(0.50, 0.45, 0.20, 0.27, 80, -360, 36)
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden başla, saat yönünün tersine sola doğru kavisli yuvarlak bir daire çizerek birleştir.'
        ]
      },
      'o': {
        word: 'Orman 🌳',
        // PERFECT SMOOTH SMALL OVAL: Middle space (0.45 to 0.72)
        strokes: [
          makeOvalPoints(0.50, 0.585, 0.14, 0.135, 80, -360, 28)
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizginin altından başla, sola doğru yuvarlak bir çember çizip başladığın yerde birleştir.'
        ]
      },
      'M': {
        word: 'Maymun 🐒',
        strokes: [
          [{ x: 0.28, y: 0.72 }, { x: 0.28, y: 0.18 }],
          [{ x: 0.28, y: 0.18 }, { x: 0.50, y: 0.56 }],
          [{ x: 0.50, y: 0.56 }, { x: 0.72, y: 0.18 }],
          [{ x: 0.72, y: 0.18 }, { x: 0.72, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tabandan tepeye dik bir çizgi çık.',
          '2. Hamle: Tepeden ortaya doğru eğik bir çizgi indir.',
          '3. Hamle: Ortadan sağ tepeye eğik bir çizgi çık.',
          '4. Hamle: Sağ tepeden tabana dik bir çizgi indir.'
        ]
      },
      'm': {
        word: 'Masa 🪑',
        strokes: [
          [{ x: 0.28, y: 0.45 }, { x: 0.28, y: 0.72 }],
          [
            ...makeBezierPoints({ x: 0.28, y: 0.54 }, { x: 0.32, y: 0.45 }, { x: 0.46, y: 0.45 }, { x: 0.50, y: 0.54 }, 10),
            { x: 0.50, y: 0.72 }
          ],
          [
            ...makeBezierPoints({ x: 0.50, y: 0.54 }, { x: 0.54, y: 0.45 }, { x: 0.68, y: 0.45 }, { x: 0.72, y: 0.54 }, 10),
            { x: 0.72, y: 0.72 }
          ]
        ],
        instructions: [
          '1. Hamle: Orta çizgiden tabana dik çizgi indir.',
          '2. Hamle: Yukarı çıkıp sağa doğru birinci kemeri çizip tabana in.',
          '3. Hamle: Tekrar yukarı çıkıp sağa doğru ikinci kemeri çizip tabana in.'
        ]
      },
      'U': {
        word: 'Uçak ✈️',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.32, y: 0.18 },
              { x: 0.32, y: 0.72 },
              { x: 0.68, y: 0.72 },
              { x: 0.68, y: 0.18 },
              24
            )
          ]
        ],
        instructions: [
          '1. Hamle: Tepeden aşağı inip tabanda genişçe yuvarlayarak sağ tepeye doğru çıkan bir çanak çiz.'
        ]
      },
      'u': {
        word: 'Uçurtma 🪁',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.35, y: 0.45 },
              { x: 0.35, y: 0.72 },
              { x: 0.62, y: 0.72 },
              { x: 0.62, y: 0.45 },
              16
            )
          ],
          [{ x: 0.62, y: 0.45 }, { x: 0.62, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden tabana in, yuvarlayarak yukarı çıkan bir çanak yap.',
          '2. Hamle: Sağ taraftan yukarıdan aşağıya dik bir çizgi indir.'
        ]
      },
      'T': {
        word: 'Top ⚽',
        strokes: [
          [{ x: 0.28, y: 0.18 }, { x: 0.72, y: 0.18 }],
          [{ x: 0.50, y: 0.18 }, { x: 0.50, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinde soldan sağa yatay bir çizgi çek.',
          '2. Hamle: Tam ortasından kırmızı taban çizgisine dik bir çizgi indir.'
        ]
      },
      't': {
        word: 'Tren 🚆',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.48, y: 0.24 },
              { x: 0.48, y: 0.66 },
              { x: 0.48, y: 0.72 },
              { x: 0.58, y: 0.72 },
              14
            )
          ],
          [{ x: 0.36, y: 0.45 }, { x: 0.62, y: 0.45 }]
        ],
        instructions: [
          '1. Hamle: Tepeye yakın bir noktadan tabana dik in ve tabanda hafifçe sağa kıvır.',
          '2. Hamle: Kesikli orta çizginin üzerinden soldan sağa yatay çizgiyi çek.'
        ]
      },
      'Ü': {
        word: 'Üzüm 🍇',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.32, y: 0.26 },
              { x: 0.32, y: 0.72 },
              { x: 0.68, y: 0.72 },
              { x: 0.68, y: 0.26 },
              24
            )
          ],
          [{ x: 0.40, y: 0.15 }, { x: 0.40, y: 0.18 }],
          [{ x: 0.60, y: 0.15 }, { x: 0.60, y: 0.18 }]
        ],
        instructions: [
          '1. Hamle: Yukarıdan inip tabanda yuvarlayarak sağa çıkan çanağı çiz.',
          '2. Hamle: Sol üst tarafa birinci noktayı koy.',
          '3. Hamle: Sağ üst tarafa ikinci noktayı koy.'
        ]
      },
      'ü': {
        word: 'Ütü 👕',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.35, y: 0.45 },
              { x: 0.35, y: 0.72 },
              { x: 0.62, y: 0.72 },
              { x: 0.62, y: 0.45 },
              16
            )
          ],
          [{ x: 0.62, y: 0.45 }, { x: 0.62, y: 0.72 }],
          [{ x: 0.42, y: 0.32 }, { x: 0.42, y: 0.35 }],
          [{ x: 0.55, y: 0.32 }, { x: 0.55, y: 0.35 }]
        ],
        instructions: [
          '1. Hamle: Kesikli çizgiden inip tabanda yuvarlayarak yukarı çıkan çanak yap.',
          '2. Hamle: Sağdan aşağıya dik çizgi indir.',
          '3. Hamle: Üstüne iki adet sevimli nokta koy.'
        ]
      },
      'Y': {
        word: 'Yıldız ⭐',
        strokes: [
          [{ x: 0.30, y: 0.18 }, { x: 0.50, y: 0.46 }],
          [{ x: 0.70, y: 0.18 }, { x: 0.50, y: 0.46 }],
          [{ x: 0.50, y: 0.46 }, { x: 0.50, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Sol tepeden ortaya doğru eğik bir kol çiz.',
          '2. Hamle: Sağ tepeden ortaya doğru eğik bir kol çiz.',
          '3. Hamle: Ortadan kırmızı tabana dik bir bacak indir.'
        ]
      },
      'y': {
        word: 'Yelkenli ⛵',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.35, y: 0.45 },
              { x: 0.35, y: 0.72 },
              { x: 0.64, y: 0.72 },
              { x: 0.64, y: 0.45 },
              16
            )
          ],
          [
            ...makeBezierPoints(
              { x: 0.64, y: 0.45 },
              { x: 0.64, y: 0.82 },
              { x: 0.64, y: 0.90 },
              { x: 0.45, y: 0.90 },
              16
            )
          ]
        ],
        instructions: [
          '1. Hamle: Orta çizgiden tabana inip yuvarlayarak yukarı çıkan çanağı çiz.',
          '2. Hamle: Sağdan alt kuyruk çizgisine inip sola doğru kıvrılan sevimli bir kuyruk yap.'
        ]
      },

      // --- GRUP 3: Ö, R, I, D, S, B ---
      'Ö': {
        word: 'Ördek 🦆',
        strokes: [
          makeOvalPoints(0.50, 0.47, 0.20, 0.25, 80, -360, 36),
          [{ x: 0.42, y: 0.14 }, { x: 0.42, y: 0.17 }],
          [{ x: 0.58, y: 0.14 }, { x: 0.58, y: 0.17 }]
        ],
        instructions: [
          '1. Hamle: Sola doğru yuvarlak büyük bir daire çizip kapat.',
          '2. Hamle: Üstüne iki adet nokta koy.'
        ]
      },
      'ö': {
        word: 'Önlük 🥼',
        strokes: [
          makeOvalPoints(0.50, 0.585, 0.14, 0.135, 80, -360, 28),
          [{ x: 0.43, y: 0.32 }, { x: 0.43, y: 0.35 }],
          [{ x: 0.57, y: 0.32 }, { x: 0.57, y: 0.35 }]
        ],
        instructions: [
          '1. Hamle: Orta alanda sola doğru yuvarlak bir çember çizip kapat.',
          '2. Hamle: Üstüne iki adet nokta koy.'
        ]
      },
      'R': {
        word: 'Robot 🤖',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [
            ...makeBezierPoints(
              { x: 0.35, y: 0.18 },
              { x: 0.68, y: 0.18 },
              { x: 0.68, y: 0.45 },
              { x: 0.35, y: 0.45 },
              16
            )
          ],
          [{ x: 0.48, y: 0.45 }, { x: 0.68, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana dik bir çizgi indir.',
          '2. Hamle: Üst kısımda sağa doğru yuvarlak bir göbek çizip ortada kapat.',
          '3. Hamle: Ortadan sağa aşağıya eğik bir bacak çiz.'
        ]
      },
      'r': {
        word: 'Roket 🚀',
        strokes: [
          [{ x: 0.38, y: 0.45 }, { x: 0.38, y: 0.72 }],
          [
            ...makeBezierPoints(
              { x: 0.38, y: 0.54 },
              { x: 0.42, y: 0.45 },
              { x: 0.56, y: 0.45 },
              { x: 0.64, y: 0.50 },
              14
            )
          ]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden kırmızı tabana dik çizgi indir.',
          '2. Hamle: Yukarı doğru çıkıp sağa doğru minik bir dal dalgası kıvır.'
        ]
      },
      'I': {
        word: 'Işık 💡',
        strokes: [
          [{ x: 0.50, y: 0.18 }, { x: 0.50, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı taban çizgisine tek hamlede düz dik bir çizgi indir.'
        ]
      },
      'ı': {
        word: 'Ispanak 🥬',
        strokes: [
          [{ x: 0.50, y: 0.45 }, { x: 0.50, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden kırmızı taban çizgisine noktasız dik bir çizgi indir.'
        ]
      },
      'D': {
        word: 'Dede 👴',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [
            ...makeBezierPoints(
              { x: 0.35, y: 0.18 },
              { x: 0.74, y: 0.18 },
              { x: 0.74, y: 0.72 },
              { x: 0.35, y: 0.72 },
              24
            )
          ]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana dik bir çizgi indir.',
          '2. Hamle: Tepeden tabana kadar uzanan kocaman yuvarlak bir göbek çiz.'
        ]
      },
      'd': {
        word: 'Davul 🥁',
        strokes: [
          makeOvalPoints(0.48, 0.585, 0.14, 0.135, 75, -360, 24),
          [{ x: 0.62, y: 0.18 }, { x: 0.62, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Sola doğru yuvarlak göbeği çizip kapat.',
          '2. Hamle: Tepe çizgisinden kırmızı tabana kadar uzun dik çizgiyi indir.'
        ]
      },
      'S': {
        word: 'Salyangoz 🐌',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.64, y: 0.24 }, { x: 0.50, y: 0.18 }, { x: 0.36, y: 0.28 }, { x: 0.50, y: 0.45 }, 16),
            ...makeBezierPoints({ x: 0.50, y: 0.45 }, { x: 0.66, y: 0.56 }, { x: 0.50, y: 0.72 }, { x: 0.36, y: 0.66 }, 16)
          ]
        ],
        instructions: [
          '1. Hamle: Yukarıdan başla, sola kavis yap, ortaya gelince sağa kıvrılıp tabanda sola dönen dalgalı çizgiyi çiz.'
        ]
      },
      's': {
        word: 'Saat ⏰',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.60, y: 0.49 }, { x: 0.50, y: 0.45 }, { x: 0.40, y: 0.51 }, { x: 0.50, y: 0.585 }, 12),
            ...makeBezierPoints({ x: 0.50, y: 0.585 }, { x: 0.62, y: 0.64 }, { x: 0.50, y: 0.72 }, { x: 0.40, y: 0.68 }, 12)
          ]
        ],
        instructions: [
          '1. Hamle: Orta alanda yukarıdan sola kavis yap, ortada sağa dönüp tabanda biten kıvrımlı çizgiyi çiz.'
        ]
      },
      'B': {
        word: 'Balık 🐟',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [
            ...makeBezierPoints({ x: 0.35, y: 0.18 }, { x: 0.66, y: 0.18 }, { x: 0.66, y: 0.45 }, { x: 0.35, y: 0.45 }, 16)
          ],
          [
            ...makeBezierPoints({ x: 0.35, y: 0.45 }, { x: 0.70, y: 0.45 }, { x: 0.70, y: 0.72 }, { x: 0.35, y: 0.72 }, 16)
          ]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana dik bir çizgi indir.',
          '2. Hamle: Üst kısımda sağa doğru birinci yuvarlak göbeği yap.',
          '3. Hamle: Alt kısımda sağa doğru ikinci yuvarlak göbeği yap.'
        ]
      },
      'b': {
        word: 'Balon 🎈',
        strokes: [
          [{ x: 0.36, y: 0.18 }, { x: 0.36, y: 0.72 }],
          makeOvalPoints(0.50, 0.585, 0.14, 0.135, -90, -360, 24)
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana uzun dik bir çizgi indir.',
          '2. Hamle: Orta alanda sağa doğru yuvarlak göbeği çizip tabanda birleştir.'
        ]
      },

      // --- GRUP 4: Z, Ç, G, Ş, C, P ---
      'Z': {
        word: 'Zebra 🦓',
        strokes: [
          [{ x: 0.32, y: 0.18 }, { x: 0.68, y: 0.18 }],
          [{ x: 0.68, y: 0.18 }, { x: 0.32, y: 0.72 }],
          [{ x: 0.32, y: 0.72 }, { x: 0.68, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Üstte soldan sağa yatay çizgi çiz.',
          '2. Hamle: Sağ üstten sol alta doğru eğik bir çizgi indir.',
          '3. Hamle: Tabanda soldan sağa yatay çizgi çek.'
        ]
      },
      'z': {
        word: 'Zil 🔔',
        strokes: [
          [{ x: 0.36, y: 0.45 }, { x: 0.64, y: 0.45 }],
          [{ x: 0.64, y: 0.45 }, { x: 0.36, y: 0.72 }],
          [{ x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Kesikli çizgide soldan sağa yatay çiz.',
          '2. Hamle: Sağdan sol tabana eğik in.',
          '3. Hamle: Tabanda soldan sağa yatay çizgiyi çek.'
        ]
      },
      'C': {
        word: 'Civciv 🐥',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.66, y: 0.25 },
              { x: 0.32, y: 0.18 },
              { x: 0.32, y: 0.72 },
              { x: 0.66, y: 0.65 },
              24
            )
          ]
        ],
        instructions: [
          '1. Hamle: Yukarıdan başla, saat yönünün tersine sola dönerek tabanda açık bir hilal çiz.'
        ]
      },
      'c': {
        word: 'Ceviz 🥜',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.62, y: 0.50 },
              { x: 0.36, y: 0.45 },
              { x: 0.36, y: 0.72 },
              { x: 0.62, y: 0.67 },
              18
            )
          ]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden başla, sola doğru açık bir hilal yayı çiz.'
        ]
      },
      'Ç': {
        word: 'Çiçek 🌸',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.66, y: 0.25 },
              { x: 0.32, y: 0.18 },
              { x: 0.32, y: 0.72 },
              { x: 0.66, y: 0.65 },
              24
            )
          ],
          [{ x: 0.50, y: 0.76 }, { x: 0.50, y: 0.84 }]
        ],
        instructions: [
          '1. Hamle: Sola doğru büyük bir hilal çiz.',
          '2. Hamle: Altına dikey minik bir çentik çizgisi koy.'
        ]
      },
      'ç': {
        word: 'Çanta 🎒',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.62, y: 0.50 },
              { x: 0.36, y: 0.45 },
              { x: 0.36, y: 0.72 },
              { x: 0.62, y: 0.67 },
              18
            )
          ],
          [{ x: 0.49, y: 0.75 }, { x: 0.49, y: 0.83 }]
        ],
        instructions: [
          '1. Hamle: Orta alanda sola doğru hilal yayı çiz.',
          '2. Hamle: Altına minik bir çentik çizgisi ekle.'
        ]
      },
      'G': {
        word: 'Güneş ☀️',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.66, y: 0.25 },
              { x: 0.32, y: 0.18 },
              { x: 0.32, y: 0.72 },
              { x: 0.66, y: 0.72 },
              24
            ),
            { x: 0.66, y: 0.45 },
            { x: 0.52, y: 0.45 }
          ]
        ],
        instructions: [
          '1. Hamle: Sola doğru hilal çiz, tabandan yukarı çıkıp içeri doğru yatay bir çizgi çek.'
        ]
      },
      'g': {
        word: 'Gözlük 👓',
        strokes: [
          makeOvalPoints(0.50, 0.585, 0.14, 0.135, 75, -360, 24),
          [
            ...makeBezierPoints(
              { x: 0.64, y: 0.46 },
              { x: 0.64, y: 0.82 },
              { x: 0.64, y: 0.90 },
              { x: 0.45, y: 0.90 },
              16
            )
          ]
        ],
        instructions: [
          '1. Hamle: Orta alanda sola doğru yuvarlak göbeği çizip kapat.',
          '2. Hamle: Sağdan alt kuyruk çizgisine inip sola kıvrılan kuyruğu çiz.'
        ]
      },
      'Ş': {
        word: 'Şapka 👒',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.64, y: 0.24 }, { x: 0.50, y: 0.18 }, { x: 0.36, y: 0.28 }, { x: 0.50, y: 0.45 }, 16),
            ...makeBezierPoints({ x: 0.50, y: 0.45 }, { x: 0.66, y: 0.56 }, { x: 0.50, y: 0.72 }, { x: 0.36, y: 0.66 }, 16)
          ],
          [{ x: 0.50, y: 0.76 }, { x: 0.50, y: 0.84 }]
        ],
        instructions: [
          '1. Hamle: Kıvrımlı S çizgisini yap.',
          '2. Hamle: Altına dikey minik bir çentik çizgisi koy.'
        ]
      },
      'ş': {
        word: 'Şemsiye ☂️',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.60, y: 0.49 }, { x: 0.50, y: 0.45 }, { x: 0.40, y: 0.51 }, { x: 0.50, y: 0.585 }, 12),
            ...makeBezierPoints({ x: 0.50, y: 0.585 }, { x: 0.62, y: 0.64 }, { x: 0.50, y: 0.72 }, { x: 0.40, y: 0.68 }, 12)
          ],
          [{ x: 0.50, y: 0.76 }, { x: 0.50, y: 0.84 }]
        ],
        instructions: [
          '1. Hamle: Küçük s harfini kıvır.',
          '2. Hamle: Altına minik bir çentik koy.'
        ]
      },
      'P': {
        word: 'Piyano 🎹',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [
            ...makeBezierPoints(
              { x: 0.35, y: 0.18 },
              { x: 0.68, y: 0.18 },
              { x: 0.68, y: 0.45 },
              { x: 0.35, y: 0.45 },
              16
            )
          ]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana dik bir çizgi indir.',
          '2. Hamle: Üst kısımda sağa doğru yuvarlak bir göbek çizip ortada kapat.'
        ]
      },
      'p': {
        word: 'Papatya 🌼',
        strokes: [
          [{ x: 0.36, y: 0.45 }, { x: 0.36, y: 0.90 }],
          makeOvalPoints(0.50, 0.585, 0.14, 0.135, -90, -360, 24)
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden alt kuyruk çizgisine kadar dik bir çizgi indir.',
          '2. Hamle: Orta alanda sağa doğru yuvarlak bir göbek çizip tabanda birleştir.'
        ]
      },

      // --- GRUP 5: H, V, Ğ, F, J ---
      'H': {
        word: 'Havuç 🥕',
        strokes: [
          [{ x: 0.34, y: 0.18 }, { x: 0.34, y: 0.72 }],
          [{ x: 0.66, y: 0.18 }, { x: 0.66, y: 0.72 }],
          [{ x: 0.34, y: 0.45 }, { x: 0.66, y: 0.45 }]
        ],
        instructions: [
          '1. Hamle: Sol dikey çizgiyi yukarıdan aşağıya çiz.',
          '2. Hamle: Sağ dikey çizgiyi yukarıdan aşağıya çiz.',
          '3. Hamle: Ortadaki yatay köprüyü soldan sağa çiz.'
        ]
      },
      'h': {
        word: 'Helikopter 🚁',
        // AUTHENTIC MEB SMALL h: 2 strokes (down, then arch over!)
        strokes: [
          [{ x: 0.36, y: 0.18 }, { x: 0.36, y: 0.72 }],
          [
            ...makeBezierPoints(
              { x: 0.36, y: 0.54 },
              { x: 0.40, y: 0.45 },
              { x: 0.60, y: 0.45 },
              { x: 0.64, y: 0.54 },
              12
            ),
            { x: 0.64, y: 0.72 }
          ]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı taban çizgisine yukarıdan aşağıya dik bir çizgi indir.',
          '2. Hamle: Kesikli orta çizgiden yukarı kavislenip sağa dön ve tabana inen kemeri çiz.'
        ]
      },
      'V': {
        word: 'Vapur 🚢',
        strokes: [
          [{ x: 0.32, y: 0.18 }, { x: 0.50, y: 0.72 }],
          [{ x: 0.50, y: 0.72 }, { x: 0.68, y: 0.18 }]
        ],
        instructions: [
          '1. Hamle: Sol tepeden kırmızı tabanın ortasına eğik bir çizgi indir.',
          '2. Hamle: Tabandan sağ tepeye eğik bir çizgi çık.'
        ]
      },
      'v': {
        word: 'Vazo 🏺',
        strokes: [
          [{ x: 0.36, y: 0.45 }, { x: 0.50, y: 0.72 }],
          [{ x: 0.50, y: 0.72 }, { x: 0.64, y: 0.45 }]
        ],
        instructions: [
          '1. Hamle: Kesikli çizgiden tabana eğik in.',
          '2. Hamle: Tabandan sağa yukarıya eğik çık.'
        ]
      },
      'Ğ': {
        word: 'Ağaç 🌳',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.66, y: 0.25 },
              { x: 0.32, y: 0.18 },
              { x: 0.32, y: 0.72 },
              { x: 0.66, y: 0.72 },
              24
            ),
            { x: 0.66, y: 0.45 },
            { x: 0.52, y: 0.45 }
          ],
          [
            ...makeBezierPoints({ x: 0.42, y: 0.13 }, { x: 0.50, y: 0.16 }, { x: 0.58, y: 0.13 }, { x: 0.58, y: 0.13 }, 8)
          ]
        ],
        instructions: [
          '1. Hamle: Büyük G harfini çiz.',
          '2. Hamle: Üstüne yatay hafif yay biçiminde şapka koy.'
        ]
      },
      'ğ': {
        word: 'Dağ 🏔️',
        strokes: [
          makeOvalPoints(0.50, 0.585, 0.14, 0.135, 75, -360, 24),
          [
            ...makeBezierPoints(
              { x: 0.64, y: 0.46 },
              { x: 0.64, y: 0.82 },
              { x: 0.64, y: 0.90 },
              { x: 0.45, y: 0.90 },
              16
            )
          ],
          [
            ...makeBezierPoints({ x: 0.42, y: 0.36 }, { x: 0.50, y: 0.39 }, { x: 0.58, y: 0.36 }, { x: 0.58, y: 0.36 }, 8)
          ]
        ],
        instructions: [
          '1. Hamle: Küçük g harfinin yuvarlak göbeğini yap.',
          '2. Hamle: Alt kuyruğu çiz.',
          '3. Hamle: Üstüne yay biçimindeki şapkayı koy.'
        ]
      },
      'F': {
        word: 'Fil 🐘',
        strokes: [
          [{ x: 0.35, y: 0.18 }, { x: 0.35, y: 0.72 }],
          [{ x: 0.35, y: 0.18 }, { x: 0.68, y: 0.18 }],
          [{ x: 0.35, y: 0.45 }, { x: 0.60, y: 0.45 }]
        ],
        instructions: [
          '1. Hamle: Tepe çizgisinden kırmızı tabana dik bir çizgi indir.',
          '2. Hamle: Üstten sağa yatay çizgi çiz.',
          '3. Hamle: Ortadan sağa yatay çizgi çiz.'
        ]
      },
      'f': {
        word: 'Fındık 🌰',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.60, y: 0.22 },
              { x: 0.52, y: 0.18 },
              { x: 0.45, y: 0.25 },
              { x: 0.45, y: 0.72 },
              16
            )
          ],
          [{ x: 0.34, y: 0.45 }, { x: 0.58, y: 0.45 }]
        ],
        instructions: [
          '1. Hamle: Tepede baston gibi kıvrılarak kırmızı tabana kadar dik in.',
          '2. Hamle: Kesikli orta çizgide soldan sağa yatay köprüyü çiz.'
        ]
      },
      'J': {
        word: 'Jandarma 👮',
        strokes: [
          [{ x: 0.34, y: 0.18 }, { x: 0.66, y: 0.18 }],
          [
            ...makeBezierPoints(
              { x: 0.50, y: 0.18 },
              { x: 0.50, y: 0.66 },
              { x: 0.50, y: 0.72 },
              { x: 0.34, y: 0.66 },
              16
            )
          ]
        ],
        instructions: [
          '1. Hamle: Tepede soldan sağa kısa bir yatay çizgi çiz.',
          '2. Hamle: Ortasından tabana dik in ve sola doğru kıvrılan kanca yap.'
        ]
      },
      'j': {
        word: 'Jelibon 🍬',
        strokes: [
          [
            ...makeBezierPoints(
              { x: 0.52, y: 0.45 },
              { x: 0.52, y: 0.84 },
              { x: 0.52, y: 0.90 },
              { x: 0.36, y: 0.85 },
              16
            )
          ],
          [{ x: 0.52, y: 0.32 }, { x: 0.52, y: 0.35 }]
        ],
        instructions: [
          '1. Hamle: Kesikli orta çizgiden alt kuyruk çizgisine inip sola kıvrılan kanca yap.',
          '2. Hamle: Üstüne minik bir nokta koy.'
        ]
      },

      // --- RAKAMLAR ---
      '0': {
        word: 'Sıfır ⭕',
        strokes: [makeOvalPoints(0.50, 0.45, 0.18, 0.27, 80, -360, 32)],
        instructions: ['1. Hamle: Tepe çizgisinden başla, saat yönünün tersine sola dönerek tam bir oval çiz ve kapat.']
      },
      '1': {
        word: 'Bir 1️⃣',
        strokes: [
          [{ x: 0.38, y: 0.32 }, { x: 0.50, y: 0.18 }],
          [{ x: 0.50, y: 0.18 }, { x: 0.50, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Soldan tepeye doğru eğik bir burun çiz.',
          '2. Hamle: Tepeden kırmızı tabana kadar dik bir çizgi indir.'
        ]
      },
      '2': {
        word: 'İki 2️⃣',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.36, y: 0.30 }, { x: 0.40, y: 0.18 }, { x: 0.64, y: 0.18 }, { x: 0.64, y: 0.35 }, 14),
            { x: 0.35, y: 0.72 },
            { x: 0.68, y: 0.72 }
          ]
        ],
        instructions: ['1. Hamle: Yukarıda yuvarlak kıvrım yap, sol tabana eğik in ve tabanda sağa doğru düz çizgi çek.']
      },
      '3': {
        word: 'Üç 3️⃣',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.36, y: 0.22 }, { x: 0.64, y: 0.18 }, { x: 0.64, y: 0.44 }, { x: 0.48, y: 0.45 }, 12),
            ...makeBezierPoints({ x: 0.48, y: 0.45 }, { x: 0.66, y: 0.46 }, { x: 0.66, y: 0.72 }, { x: 0.36, y: 0.68 }, 14)
          ]
        ],
        instructions: ['1. Hamle: Üstte yuvarlak bir yay çiz, ortadan girip altta ikinci yuvarlak yayı çiz.']
      },
      '4': {
        word: 'Dört 4️⃣',
        strokes: [
          [{ x: 0.58, y: 0.18 }, { x: 0.34, y: 0.54 }, { x: 0.68, y: 0.54 }],
          [{ x: 0.58, y: 0.18 }, { x: 0.58, y: 0.72 }]
        ],
        instructions: [
          '1. Hamle: Eğik inip sağa doğru yatay çizgi çiz.',
          '2. Hamle: Yukarıdan aşağıya dik bir çizgi indir.'
        ]
      },
      '5': {
        word: 'Beş 5️⃣',
        strokes: [
          [{ x: 0.62, y: 0.18 }, { x: 0.38, y: 0.18 }],
          [
            { x: 0.38, y: 0.18 }, { x: 0.36, y: 0.42 },
            ...makeBezierPoints({ x: 0.36, y: 0.42 }, { x: 0.66, y: 0.42 }, { x: 0.66, y: 0.72 }, { x: 0.36, y: 0.68 }, 14)
          ]
        ],
        instructions: [
          '1. Hamle: Üstte sağa yatay çizgi çiz.',
          '2. Hamle: Aşağı dik inip alt kısımda yuvarlak bir göbek yap.'
        ]
      },
      '6': {
        word: 'Altı 6️⃣',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.60, y: 0.22 }, { x: 0.36, y: 0.45 }, { x: 0.36, y: 0.72 }, { x: 0.52, y: 0.72 }, 16),
            ...makeBezierPoints({ x: 0.52, y: 0.72 }, { x: 0.66, y: 0.72 }, { x: 0.66, y: 0.50 }, { x: 0.40, y: 0.50 }, 14)
          ]
        ],
        instructions: ['1. Hamle: Yukarıdan sola doğru inip tabanda yuvarlak bir çember çizerek kapat.']
      },
      '7': {
        word: 'Yedi 7️⃣',
        strokes: [
          [{ x: 0.34, y: 0.18 }, { x: 0.68, y: 0.18 }, { x: 0.44, y: 0.72 }],
          [{ x: 0.42, y: 0.45 }, { x: 0.60, y: 0.45 }]
        ],
        instructions: [
          '1. Hamle: Üstte sağa çizip sol tabana eğik bir çizgi indir.',
          '2. Hamle: Ortadaki yatay kemeri soldan sağa çiz.'
        ]
      },
      '8': {
        word: 'Sekiz 8️⃣',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.50, y: 0.45 }, { x: 0.36, y: 0.35 }, { x: 0.36, y: 0.18 }, { x: 0.50, y: 0.18 }, 12),
            ...makeBezierPoints({ x: 0.50, y: 0.18 }, { x: 0.64, y: 0.18 }, { x: 0.64, y: 0.35 }, { x: 0.50, y: 0.45 }, 12),
            ...makeBezierPoints({ x: 0.50, y: 0.45 }, { x: 0.34, y: 0.58 }, { x: 0.34, y: 0.72 }, { x: 0.50, y: 0.72 }, 12),
            ...makeBezierPoints({ x: 0.50, y: 0.72 }, { x: 0.66, y: 0.72 }, { x: 0.66, y: 0.58 }, { x: 0.50, y: 0.45 }, 12)
          ]
        ],
        instructions: ['1. Hamle: Ortadan başla, önce yukarıda sonra aşağıda sekiz kıvrımı çizip başladığın yerde birleştir.']
      },
      '9': {
        word: 'Dokuz 9️⃣',
        strokes: [
          [
            ...makeOvalPoints(0.50, 0.34, 0.15, 0.15, 0, 360, 20),
            { x: 0.65, y: 0.34 },
            ...makeBezierPoints({ x: 0.65, y: 0.34 }, { x: 0.65, y: 0.68 }, { x: 0.45, y: 0.72 }, { x: 0.38, y: 0.68 }, 14)
          ]
        ],
        instructions: ['1. Hamle: Üstte yuvarlak çemberi kapat, sağdan aşağı inip tabanda hafifçe sola kıvır.']
      },

      // --- TEMEL ÇİZGİLER ---
      '|': {
        word: 'Dik Çizgi 📏',
        strokes: [[{ x: 0.50, y: 0.18 }, { x: 0.50, y: 0.72 }]],
        instructions: ['1. Hamle: Tepe çizgisinden kırmızı tabana yukarıdan aşağıya dimdik in.']
      },
      '—': {
        word: 'Yatay Çizgi ➖',
        strokes: [[{ x: 0.25, y: 0.45 }, { x: 0.75, y: 0.45 }]],
        instructions: ['1. Hamle: Soldan sağa doğru düz bir yatay çizgi çiz.']
      },
      '/': {
        word: 'Sağa Eğik Çizgi 📐',
        strokes: [[{ x: 0.65, y: 0.18 }, { x: 0.35, y: 0.72 }]],
        instructions: ['1. Hamle: Yukarıdan sol tabana doğru eğik bir çizgi indir.']
      },
      '\\': {
        word: 'Sola Eğik Çizgi 📐',
        strokes: [[{ x: 0.35, y: 0.18 }, { x: 0.65, y: 0.72 }]],
        instructions: ['1. Hamle: Yukarıdan sağ tabana doğru eğik bir çizgi indir.']
      },
      '○': {
        word: 'Çember / Daire 🟢',
        strokes: [makeOvalPoints(0.50, 0.45, 0.20, 0.25, 80, -360, 32)],
        instructions: ['1. Hamle: Yukarıdan başla, sola doğru yuvarlak bir çember çizip başladığın noktada birleştir.']
      },
      '~': {
        word: 'Dalgalı Çizgi 🌊',
        strokes: [
          [
            ...makeBezierPoints({ x: 0.20, y: 0.45 }, { x: 0.35, y: 0.25 }, { x: 0.35, y: 0.65 }, { x: 0.50, y: 0.45 }, 14),
            ...makeBezierPoints({ x: 0.50, y: 0.45 }, { x: 0.65, y: 0.25 }, { x: 0.65, y: 0.65 }, { x: 0.80, y: 0.45 }, 14)
          ]
        ],
        instructions: ['1. Hamle: Deniz dalgası gibi bir yukarı bir aşağı yumuşak kıvrımlarla ilerle.']
      }
    };

    // MEB Letter Groups Definition
    const MEB_GROUPS = {
      '1': ['E', 'L', 'A', 'K', 'İ', 'N'],
      '2': ['O', 'M', 'U', 'T', 'Ü', 'Y'],
      '3': ['Ö', 'R', 'I', 'D', 'S', 'B'],
      '4': ['Z', 'Ç', 'G', 'Ş', 'C', 'P'],
      '5': ['H', 'V', 'Ğ', 'F', 'J'],
      'numbers': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      'strokes': ['|', '—', '/', '\\\\', '○', '~']
    };

    // State
    let activeGroup = '1';
    let activeLetterCase = 'upper'; // 'upper' | 'lower'
    let activeChar = 'E';
    let currentColor = '#4f46e5';
    let currentPenWidth = 16;
    let isDrawing = false;
    let isAnimatingGuide = false;
    let animFrameId = null;

    // Canvas references
    let bgCanvas, bgCtx;
    let paintCanvas, paintCtx;
    let animCanvas, animCtx;

    // Web Audio Synthesizer
    let audioCtx = null;
    function playTone(freq, dur = 0.08) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch (e) {}
    }

    // ==========================================
    // INITIALIZATION & RESIZE
    // ==========================================
    function init() {
      bgCanvas = document.getElementById('bgCanvas');
      bgCtx = bgCanvas.getContext('2d');
      paintCanvas = document.getElementById('paintCanvas');
      paintCtx = paintCanvas.getContext('2d');
      animCanvas = document.getElementById('animCanvas');
      animCtx = animCanvas.getContext('2d');

      window.addEventListener('resize', resizeCanvases);
      resizeCanvases();
      setupDrawingEvents();
      changeGroup('1');
    }

    function resizeCanvases() {
      const wrapper = document.getElementById('canvasWrapper');
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;

      [bgCanvas, paintCanvas, animCanvas].forEach(canvas => {
        canvas.width = w;
        canvas.height = h;
      });

      drawMebRulingAndGuide();
    }

    // ==========================================
    // GROUP & CHARACTER SELECTION
    // ==========================================
    function changeGroup(groupId) {
      activeGroup = groupId;
      renderCharList();
      const list = MEB_GROUPS[groupId] || MEB_GROUPS['1'];
      selectChar(list[0]);
    }

    function setLetterCase(c) {
      activeLetterCase = c;
      const upperBtn = document.getElementById('caseUpperBtn');
      const lowerBtn = document.getElementById('caseLowerBtn');

      if (c === 'upper') {
        upperBtn.className = 'px-3 py-1.5 text-xs font-black rounded-lg transition bg-white text-indigo-900 shadow-xs cursor-pointer';
        lowerBtn.className = 'px-3 py-1.5 text-xs font-black rounded-lg transition text-indigo-700 hover:text-indigo-950 cursor-pointer';
      } else {
        lowerBtn.className = 'px-3 py-1.5 text-xs font-black rounded-lg transition bg-white text-indigo-900 shadow-xs cursor-pointer';
        upperBtn.className = 'px-3 py-1.5 text-xs font-black rounded-lg transition text-indigo-700 hover:text-indigo-950 cursor-pointer';
      }

      renderCharList();
      selectChar(activeChar);
    }

    function getDisplayedCharKey(rawChar) {
      if (activeGroup === 'numbers' || activeGroup === 'strokes') return rawChar;
      return activeLetterCase === 'upper' ? rawChar.toUpperCase() : rawChar.toLowerCase();
    }

    function renderCharList() {
      const container = document.getElementById('charList');
      container.innerHTML = '';
      const chars = MEB_GROUPS[activeGroup] || [];

      chars.forEach(ch => {
        const displayChar = getDisplayedCharKey(ch);
        const btn = document.createElement('button');
        btn.className = 'char-pill touch-btn px-4 py-2 rounded-2xl font-black text-sm border border-slate-200 bg-white text-slate-800 shadow-xs hover:border-indigo-400 cursor-pointer';
        btn.id = 'pill_' + ch;
        btn.textContent = displayChar;
        btn.onclick = () => selectChar(ch);
        container.appendChild(btn);
      });
    }

    function selectChar(ch) {
      activeChar = ch;
      const displayKey = getDisplayedCharKey(ch);
      const data = GLYPH_DATA[displayKey] || GLYPH_DATA[ch] || GLYPH_DATA['E'];

      // Update badge and title
      document.getElementById('activeCharBadge').textContent = displayKey;
      document.getElementById('charWord').textContent = data.word || displayKey;
      const strokeCount = (data.strokes || []).length;
      document.getElementById('charDesc').textContent = displayKey + ' (' + strokeCount + ' Hamleli Yazılış)';

      // Highlight active pill
      document.querySelectorAll('.char-pill').forEach(p => p.classList.remove('active'));
      const activePill = document.getElementById('pill_' + ch);
      if (activePill) activePill.classList.add('active');

      clearCanvas();
    }

    // ==========================================
    // MEB 4-LINE RULING & FAINT GUIDE RENDERING
    // ==========================================
    function toCanvasPos(pt) {
      return {
        x: pt.x * bgCanvas.width,
        y: pt.y * bgCanvas.height
      };
    }

    function drawMebRulingAndGuide() {
      if (!bgCtx) return;
      const w = bgCanvas.width;
      const h = bgCanvas.height;
      bgCtx.clearRect(0, 0, w, h);

      // MEB Standard 4-Line Ruling
      const topY = h * 0.18;    // Line 1: Tepe Çizgisi
      const midY = h * 0.45;    // Line 2: Kesikli Orta Gövde Çizgisi
      const baseY = h * 0.72;   // Line 3: Kırmızı Zemin / Taban Çizgisi
      const botY = h * 0.90;    // Line 4: Alt Kuyruk Çizgisi

      bgCtx.save();

      // Top line (Üst çizgi)
      bgCtx.strokeStyle = '#cbd5e1';
      bgCtx.lineWidth = 2;
      bgCtx.beginPath();
      bgCtx.moveTo(0, topY);
      bgCtx.lineTo(w, topY);
      bgCtx.stroke();

      // Mid line (Kesikli Orta Gövde Çizgisi - Mavi/İndigo Kesikli)
      bgCtx.strokeStyle = '#818cf8';
      bgCtx.lineWidth = 2;
      bgCtx.setLineDash([8, 8]);
      bgCtx.beginPath();
      bgCtx.moveTo(0, midY);
      bgCtx.lineTo(w, midY);
      bgCtx.stroke();
      bgCtx.setLineDash([]);

      // Baseline (Kırmızı Zemin Çizgisi - Belirgin)
      bgCtx.strokeStyle = '#ef4444';
      bgCtx.lineWidth = 3;
      bgCtx.beginPath();
      bgCtx.moveTo(0, baseY);
      bgCtx.lineTo(w, baseY);
      bgCtx.stroke();

      // Bottom line (Alt Kuyruk Çizgisi)
      bgCtx.strokeStyle = '#cbd5e1';
      bgCtx.lineWidth = 1.5;
      bgCtx.beginPath();
      bgCtx.moveTo(0, botY);
      bgCtx.lineTo(w, botY);
      bgCtx.stroke();

      bgCtx.restore();

      // Draw faint glyph guide (Silik Kılavuz Harf)
      drawFaintGuideGlyph();
    }

    function drawFaintGuideGlyph() {
      const displayKey = getDisplayedCharKey(activeChar);
      const data = GLYPH_DATA[displayKey] || GLYPH_DATA[activeChar] || GLYPH_DATA['E'];
      const strokes = data.strokes || [];
      if (strokes.length === 0) return;

      bgCtx.save();

      // Thick translucent purple track
      bgCtx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
      bgCtx.lineWidth = 28;
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

      // Thin dashed midline guideline
      bgCtx.strokeStyle = 'rgba(79, 70, 229, 0.45)';
      bgCtx.lineWidth = 2.5;
      bgCtx.setLineDash([6, 6]);

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
    }

    // ==========================================
    // FREEHAND DRAWING ENGINE
    // ==========================================
    function setupDrawingEvents() {
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
        playTone(380, 0.04);
      };

      const move = (e) => {
        if (!isDrawing || isAnimatingGuide) return;
        const pos = getPos(e);
        paintCtx.lineTo(pos.x, pos.y);
        paintCtx.strokeStyle = currentColor;
        paintCtx.lineWidth = currentPenWidth;
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

    function setPenWidth(w) {
      currentPenWidth = w;
    }

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

      drawMebRulingAndGuide();
    }

    // ==========================================
    // STEP-BY-STEP MEB STROKE ANIMATION ENGINE
    // ==========================================
    function playMebStrokeAnimation() {
      if (isAnimatingGuide) return;
      isAnimatingGuide = true;

      // Clear layers
      paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
      animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);

      const banner = document.getElementById('strokeBanner');
      const bannerText = document.getElementById('strokeText');
      const stylus = document.getElementById('stylusCursor');
      banner.classList.remove('hidden');

      const displayKey = getDisplayedCharKey(activeChar);
      const data = GLYPH_DATA[displayKey] || GLYPH_DATA[activeChar] || GLYPH_DATA['E'];
      const strokes = data.strokes || [];
      const instructions = data.instructions || [];

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
        const instruction = instructions[strokeIdx] || ((strokeIdx + 1) + '. Hamle: Yöne doğru çiziniz');
        bannerText.textContent = instruction;

        // Speak instruction if speech synthesis available
        speakText(instruction);

        let ptIndex = 0;
        let progress = 0;
        const speed = 0.055;

        playTone(520, 0.1);

        function step() {
          if (ptIndex >= pts.length - 1) {
            setTimeout(() => animateStroke(strokeIdx + 1), 300);
            return;
          }

          progress += speed;
          if (progress > 1) progress = 1;

          const p0 = toCanvasPos(pts[ptIndex]);
          const p1 = toCanvasPos(pts[ptIndex + 1]);

          const curX = p0.x + (p1.x - p0.x) * progress;
          const curY = p0.y + (p1.y - p0.y) * progress;

          // Render glowing stroke trail onto anim layer
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

          // Move floating stylus pencil above canvas
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

    // Speech narration for pedagogical instructions
    function speakText(txt) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'tr-TR';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }

    function speakCharDescription() {
      const displayKey = getDisplayedCharKey(activeChar);
      const data = GLYPH_DATA[displayKey] || GLYPH_DATA[activeChar] || GLYPH_DATA['E'];
      const desc = (data.instructions || []).join(' ');
      speakText(displayKey + ' harfi. ' + desc);
    }

    function celebrateSuccess() {
      playTone(880, 0.15);
      setTimeout(() => playTone(1200, 0.25), 100);

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 }
        });
      }
    }

    window.onload = init;
  </script>
</body>
</html>
`;
