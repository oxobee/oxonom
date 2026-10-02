import { GameCategory, GameItem, GamesStoreResponse, GamePlayResponse } from './games'

export const FALLBACK_GAME_CATEGORIES: GameCategory[] = [
  {
    id: 1,
    category_uuid: 'cat_zeka_mantik',
    name: 'Zeka & Mantık',
    slug: 'zeka-mantik',
    icon: '🧠',
    description: 'Bulmacalar, hafıza ve strateji oyunları',
    display_order: 1,
    is_active: true,
  },
  {
    id: 2,
    category_uuid: 'cat_matematik',
    name: 'Matematik Maceraları',
    slug: 'matematik',
    icon: '📐',
    description: 'Ritmik sayma, işlem pratikleri ve hızlı hesaplama',
    display_order: 2,
    is_active: true,
  },
  {
    id: 3,
    category_uuid: 'cat_fen_uzay',
    name: 'Fen & Uzay',
    slug: 'fen-uzay',
    icon: '🚀',
    description: 'Güneş sistemi, fizik simülasyonları ve uzay keşfi',
    display_order: 3,
    is_active: true,
  },
  {
    id: 4,
    category_uuid: 'cat_dil_kelime',
    name: 'Dil & Kelime',
    slug: 'dil-kelime',
    icon: '📚',
    description: 'Kelime avı, Türkçe ve heceleme maceraları',
    display_order: 4,
    is_active: true,
  },
  {
    id: 5,
    category_uuid: 'cat_simulasyon_3d',
    name: '3D Simülasyon',
    slug: 'simulasyon-3d',
    icon: '🌐',
    description: 'İnteraktif üç boyutlu bilimsel modeller ve simülasyonlar',
    display_order: 5,
    is_active: true,
  },
]

export const FALLBACK_GAMES: GameItem[] = [
  {
    id: 4,
    game_uuid: 'game_word_hunter',
    category_id: 4,
    category_ids: [4],
    category_name: 'Dil & Kelime',
    category_icon: '📚',
    title: 'Kelime Avcısı & Harf Çözücü',
    slug: 'kelime-avcisi-harf-cozucu',
    description: 'Karışık verilmiş harfleri bir araya getirip ipuçlarını kullanarak doğru kelimeyi tahmin edin.',
    grade_levels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    age_range: '6-12 Yaş',
    learning_objectives: 'Kelime dağarcığı, heceleme, analitik düşünme, Türkçe dil bilgisi.',
    status: 'published',
    is_featured: true,
    featured_order: 1,
    has_html_content: true,
    play_count: 342,
    average_rating: 4.9,
    ratings_count: 58,
    is_3d_simulation: false,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 1,
    game_uuid: 'game_2048_math',
    category_id: 1,
    category_ids: [1, 2],
    category_name: 'Zeka & Mantık',
    category_icon: '🧠',
    title: '2048 Sayı & Mantık Bulmacası',
    slug: '2048-sayi-mantik-bulmacasi',
    description: 'Sayıları kaydırarak birbirine ekleyin, zekanızı ve stratejinizi konuşturup 2048 hedefine ulaşın!',
    grade_levels: ['3. Sınıf', '4. Sınıf', '5-8. Sınıf', 'Lise'],
    age_range: '7-14 Yaş',
    learning_objectives: 'Stratejik planlama, uzamsal zeka, sayılarla işlem yetisi.',
    status: 'published',
    is_featured: true,
    featured_order: 2,
    has_html_content: true,
    play_count: 520,
    average_rating: 4.8,
    ratings_count: 76,
    is_3d_simulation: false,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 5,
    game_uuid: 'game_solar_system_3d',
    category_id: 3,
    category_ids: [3, 5],
    category_name: 'Fen & Uzay',
    category_icon: '🚀',
    title: '3D Güneş Sistemi Simülasyonu',
    slug: '3d-gunes-sistemi-simulasyonu',
    description: 'Gezegenlerin yörüngelerini, hızlarını ve büyüklüklerini 3 boyutlu uzay ortamında etkileşimli olarak keşfedin.',
    grade_levels: ['3. Sınıf', '4. Sınıf', '5-8. Sınıf', 'Lise'],
    age_range: '8-16 Yaş',
    learning_objectives: 'Güneş sistemi anatomisi, gezegen yörüngeleri, astronomi bilinci ve 3 boyutlu uzaysal kavrayış.',
    status: 'published',
    is_featured: true,
    featured_order: 3,
    has_html_content: true,
    play_count: 680,
    average_rating: 5.0,
    ratings_count: 112,
    is_3d_simulation: true,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 2,
    game_uuid: 'game_memory_matrix',
    category_id: 1,
    category_ids: [1],
    category_name: 'Zeka & Mantık',
    category_icon: '🧠',
    title: 'Hafıza Kartları & Çiftini Bul',
    slug: 'hafiza-kartlari-ciftini-bul',
    description: 'Gizlenmiş görsel çiftleri çevirerek en az hamlede eşleştirin. Görsel hafızayı ve dikkati güçlendirir.',
    grade_levels: ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf'],
    age_range: '5-10 Yaş',
    learning_objectives: 'Görsel hafıza, odaklanma süresi, eşleştirme becerisi.',
    status: 'published',
    is_featured: true,
    featured_order: 4,
    has_html_content: true,
    play_count: 410,
    average_rating: 4.7,
    ratings_count: 43,
    is_3d_simulation: false,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
  {
    id: 3,
    game_uuid: 'game_planet_explorer',
    category_id: 2,
    category_ids: [2, 3],
    category_name: 'Matematik Maceraları',
    category_icon: '📐',
    title: 'Uzay Roketi Matematik Görevi',
    slug: 'uzay-roket-matematik-gorevi',
    description: 'Uzayda hızla ilerleyen roketin önüne çıkan engelleri doğru toplama, çıkarma ve çarpma yaparak aş!',
    grade_levels: ['2. Sınıf', '3. Sınıf', '4. Sınıf'],
    age_range: '7-12 Yaş',
    learning_objectives: 'Zihinden hızlı işlem yapma, matematiksel özgüven ve refleks.',
    status: 'published',
    is_featured: true,
    featured_order: 5,
    has_html_content: true,
    play_count: 295,
    average_rating: 4.8,
    ratings_count: 39,
    is_3d_simulation: false,
    creation_date: '2026-10-01T00:00:00Z',
    update_date: '2026-10-02T00:00:00Z',
  },
]

export function getFallbackGamesStore(params?: {
  category_slug?: string
  grade_level?: string
  search?: string
}): GamesStoreResponse {
  let filtered = [...FALLBACK_GAMES]

  if (params?.category_slug && params.category_slug !== 'all') {
    if (params.category_slug === 'simulasyon-3d') {
      filtered = filtered.filter(g => g.is_3d_simulation || g.category_ids?.includes(5))
    } else {
      const cat = FALLBACK_GAME_CATEGORIES.find(c => c.slug === params.category_slug)
      if (cat) {
        filtered = filtered.filter(g => g.category_id === cat.id || g.category_ids?.includes(cat.id))
      }
    }
  }

  if (params?.grade_level && params.grade_level !== 'all') {
    filtered = filtered.filter(g => g.grade_levels.some(gl => gl.toLowerCase().includes(params.grade_level!.toLowerCase())))
  }

  if (params?.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter(g => g.title.toLowerCase().includes(s) || g.description?.toLowerCase().includes(s))
  }

  const featured = filtered.filter(g => g.is_featured).sort((a, b) => a.featured_order - b.featured_order)

  const sliders = FALLBACK_GAME_CATEGORIES.map(category => ({
    category,
    games: filtered.filter(g => g.category_id === category.id || g.category_ids?.includes(category.id)),
  })).filter(s => s.games.length > 0)

  return {
    categories: FALLBACK_GAME_CATEGORIES,
    featured,
    sliders,
    all_games: filtered,
    total_count: filtered.length,
  }
}

export function getFallbackGamePlay(gameUuid: string): GamePlayResponse {
  const game = FALLBACK_GAMES.find(g => g.game_uuid === gameUuid || g.slug === gameUuid) || FALLBACK_GAMES[0]

  if (game.slug === 'kelime-avcisi-harf-cozucu' || game.game_uuid === 'game_word_hunter') {
    return {
      game,
      html_content: getKelimeAvcisiHtml(),
    }
  }

  if (game.slug === '3d-gunes-sistemi-simulasyonu' || game.game_uuid === 'game_solar_system_3d') {
    return {
      game,
      html_content: getSolarSystemHtml(),
    }
  }

  if (game.slug === '2048-sayi-mantik-bulmacasi' || game.game_uuid === 'game_2048_math') {
    return {
      game,
      html_content: get2048Html(),
    }
  }

  return {
    game,
    html_content: getKelimeAvcisiHtml(),
  }
}

function getKelimeAvcisiHtml(): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Kelime Avcısı</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  @keyframes tileDrop {
    0% { transform: translateY(-16px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes slotPop {
    0% { transform: scale(0.92); }
    50% { transform: scale(1.04); }
    100% { transform: scale(1); }
  }
  @keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
  .tile-card {
    animation: tileDrop 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }
  .letter-slot {
    width: 44px;
    height: 52px;
    border-radius: 12px;
    border: 2px solid #334155;
    background: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 900;
    color: #f59e0b;
    text-transform: uppercase;
    font-family: monospace;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.4);
  }
  .letter-slot.active {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  }
  .letter-slot.filled {
    border-color: #64748b;
    background: #0f172a;
    color: #ffffff;
    animation: slotPop 0.2s ease-out;
  }
  .letter-slot.correct {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }
  .animate-shake {
    animation: shakeError 0.4s ease-in-out;
  }
</style>
</head>
<body class="bg-slate-950 text-slate-100 flex flex-col items-center justify-between min-h-screen p-4 sm:p-6 select-none">
  <header class="w-full max-w-md flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl">
        📚
      </div>
      <div>
        <h1 class="text-lg font-black text-white tracking-tight">Kelime Avcısı</h1>
        <p class="text-[11px] text-slate-400">Harfleri birleştir, doğru kelimeyi bul</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-2xl text-center shadow-md">
        <span class="text-[10px] text-slate-400 font-bold tracking-wider block">PUAN</span>
        <span id="score" class="text-lg font-black text-amber-400">0</span>
      </div>
    </div>
  </header>

  <main class="w-full max-w-md bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-5 my-auto">
    <div class="w-full flex items-center justify-between">
      <span id="categoryBadge" class="text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1 rounded-xl">
        Kategori: Bilim
      </span>
      <span id="letterCountBadge" class="text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-xl">
        6 Harfli
      </span>
    </div>

    <div class="w-full text-center space-y-1">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Karışık Harfler</span>
      <div id="tilesContainer" class="flex flex-wrap items-center justify-center gap-2.5 pt-1 min-h-[64px]"></div>
    </div>

    <div class="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <span>💡 İpucu Alanı</span>
        </div>
        <button id="hintBtn" onclick="revealHint()" class="px-3.5 py-1.5 text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 rounded-xl transition-all cursor-pointer">
          💡 İpucu Al (-5 Puan)
        </button>
      </div>
      <p id="hintText" class="text-xs text-slate-300 leading-relaxed font-medium min-h-[34px] flex items-center">
        İpucu almak için yukarıdaki butona tıklayabilirsiniz.
      </p>
    </div>

    <div class="w-full flex flex-col items-center gap-2 pt-1">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tahmininiz</span>
      <div id="slotsContainer" class="flex flex-wrap items-center justify-center gap-2 py-1 cursor-text" onclick="focusHiddenInput()"></div>
      <input id="wordInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false"
        class="sr-only" />
    </div>

    <div id="msg" class="text-xs font-bold text-slate-400 h-5 transition-all text-center"></div>

    <div class="w-full flex gap-3 pt-1">
      <button onclick="checkGuess()" class="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer">
        Kelimeyi Doğrula
      </button>
      <button onclick="nextWord()" class="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition cursor-pointer" title="Kelimeyi Pas Geç">
        Pas Geç
      </button>
    </div>
  </main>

  <footer class="w-full max-w-md text-center py-2">
    <p class="text-[11px] text-slate-500">Klavyeden harfleri doğrudan yazabilir veya kutulara tıklayabilirsiniz</p>
  </footer>

  <script>
    const WORDS = [
      { word: 'GEZEGEN', hint: 'Güneş çevresinde dolanan gök cismi', category: 'Astronomi' },
      { word: 'TÜRKİYE', hint: 'Asya ve Avrupa kıtalarını birleştiren güzel ülkemiz', category: 'Coğrafya' },
      { word: 'YAZILIM', hint: 'Bilgisayarda belirli işleri yapan kodlar bütünü', category: 'Bilişim' },
      { word: 'ÖĞRETMEN', hint: 'Okulda öğrencilere yeni bilgiler öğreten saygıdeğer kişi', category: 'Eğitim' },
      { word: 'MİMARLIK', hint: 'Binaları ve yapıları tasarlama sanatı ve bilimi', category: 'Meslekler' },
      { word: 'PİRAMİT', hint: 'Eski Mısır hükümdarları için inşa edilen anıtsal üçgen yapılar', category: 'Tarih' },
      { word: 'OKYANUS', hint: 'Kıtaları birbirinden ayıran uçsuz bucaksız büyük deniz', category: 'Doğa' },
      { word: 'TELESKOP', hint: 'Uzaktaki gök cisimlerini ve yıldızları incelemeye yarayan alet', category: 'Bilim' }
    ];

    let current = null;
    let score = 0;
    let hintLevel = 0;
    const HINT_COST = 5;

    function normalizeTR(str) {
      if (!str) return '';
      return str
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'I')
        .toUpperCase()
        .trim();
    }

    function scrambleWord(word) {
      const arr = word.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      if (arr.join('') === word && word.length > 2) {
        return scrambleWord(word);
      }
      return arr;
    }

    function renderTiles(letters) {
      const container = document.getElementById('tilesContainer');
      container.innerHTML = '';
      letters.forEach((char, idx) => {
        const tile = document.createElement('div');
        tile.className = 'tile-card w-11 h-12 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-lg font-black text-amber-300 shadow-md select-none';
        tile.style.animationDelay = (idx * 0.05) + 's';
        tile.textContent = char;
        tile.onclick = () => {
          const input = document.getElementById('wordInput');
          if (input.value.length < current.word.length) {
            input.value += char;
            renderSlots();
          }
        };
        container.appendChild(tile);
      });
    }

    function renderSlots() {
      if (!current) return;
      const container = document.getElementById('slotsContainer');
      const input = document.getElementById('wordInput');
      const val = normalizeTR(input.value);
      container.innerHTML = '';

      for (let i = 0; i < current.word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        if (i < val.length) {
          slot.textContent = val[i];
          slot.classList.add('filled');
        } else if (i === val.length) {
          slot.classList.add('active');
        }
        container.appendChild(slot);
      }
    }

    function focusHiddenInput() {
      const input = document.getElementById('wordInput');
      if (input) input.focus();
    }

    function updateHintButton() {
      const btn = document.getElementById('hintBtn');
      if (!btn) return;
      if (score < HINT_COST) {
        btn.disabled = true;
        btn.className = 'px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-800/60 border border-slate-700/50 rounded-xl cursor-not-allowed opacity-60';
        btn.title = 'İpucu için en az 5 puana sahip olmalısınız!';
        btn.textContent = 'İpucu Al (5 Puan - Yetersiz)';
      } else {
        btn.disabled = false;
        btn.className = 'px-3.5 py-1.5 text-xs font-black text-amber-300 hover:text-amber-100 bg-gradient-to-r from-amber-500/20 to-indigo-600/20 border border-amber-400/40 rounded-xl shadow-md transition-all cursor-pointer';
        btn.textContent = hintLevel === 0 ? '💡 İpucu Al (-5 Puan)' : '💡 Harf Aç (-5 Puan)';
      }
    }

    function nextWord() {
      let pick = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (current && WORDS.length > 1) {
        while (pick.word === current.word) {
          pick = WORDS[Math.floor(Math.random() * WORDS.length)];
        }
      }
      current = pick;
      hintLevel = 0;

      document.getElementById('categoryBadge').textContent = 'Kategori: ' + current.category;
      document.getElementById('letterCountBadge').textContent = current.word.length + ' Harfli';

      const scrambled = scrambleWord(current.word);
      renderTiles(scrambled);

      const input = document.getElementById('wordInput');
      input.value = '';
      input.disabled = false;
      renderSlots();

      document.getElementById('hintText').textContent = 'İpucu almak için yukarıdaki butona tıklayabilirsiniz.';
      updateHintButton();

      const msg = document.getElementById('msg');
      msg.textContent = '';
      focusHiddenInput();
    }

    function revealHint() {
      if (!current) return;
      const msg = document.getElementById('msg');
      if (score < HINT_COST) {
        msg.textContent = '⚠️ İpucu almak için en az 5 puanınız olmalıdır!';
        msg.className = 'text-xs font-bold text-rose-400 h-5 transition-all text-center';
        return;
      }

      hintLevel++;
      score -= HINT_COST;
      document.getElementById('score').textContent = score;

      const hintEl = document.getElementById('hintText');
      if (hintLevel === 1) {
        hintEl.textContent = '💡 ' + current.hint;
      } else {
        hintEl.textContent = '💡 ' + current.hint + ' (Başlangıç: ' + current.word.charAt(0) + ')';
      }
      updateHintButton();
    }

    function checkGuess() {
      const inputEl = document.getElementById('wordInput');
      const val = normalizeTR(inputEl.value);
      const target = normalizeTR(current.word);
      const msg = document.getElementById('msg');
      const slots = document.getElementById('slotsContainer');

      if (!val || val.length < current.word.length) {
        msg.textContent = 'Lütfen ' + current.word.length + ' harfi de doldurun.';
        msg.className = 'text-xs font-bold text-amber-400 h-5 transition-all text-center';
        slots.classList.add('animate-shake');
        setTimeout(() => slots.classList.remove('animate-shake'), 400);
        return;
      }

      if (val === target) {
        const earned = Math.max(10, 25 - (hintLevel * 5));
        score += earned;
        document.getElementById('score').textContent = score;

        document.querySelectorAll('.letter-slot').forEach(s => s.classList.add('correct'));
        msg.textContent = '✨ Tebrikler! Doğru bildin: ' + current.word + ' (+' + earned + ' Puan)';
        msg.className = 'text-xs font-bold text-emerald-400 h-5 transition-all text-center';

        inputEl.disabled = true;
        updateHintButton();
        setTimeout(nextWord, 1300);
      } else {
        msg.textContent = 'Farklı bir kelime olmalı, tekrar deneyin!';
        msg.className = 'text-xs font-bold text-rose-400 h-5 transition-all text-center';
        slots.classList.add('animate-shake');
        setTimeout(() => slots.classList.remove('animate-shake'), 400);
        focusHiddenInput();
      }
    }

    const input = document.getElementById('wordInput');
    input.addEventListener('input', () => {
      input.value = normalizeTR(input.value).slice(0, current ? current.word.length : 10);
      renderSlots();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkGuess();
    });

    window.onload = nextWord;
  </script>
</body>
</html>`
}

function getSolarSystemHtml(): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>3D Güneş Sistemi Simülasyonu</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body { margin: 0; overflow: hidden; background: #020617; font-family: system-ui, sans-serif; }
  canvas { width: 100vw; height: 100vh; display: block; }
</style>
</head>
<body class="relative text-white select-none">
  <div class="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl shadow-xl max-w-xs">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-xl">🪐</span>
      <h1 class="text-sm font-black text-amber-400">3D Güneş Sistemi</h1>
    </div>
    <p class="text-[11px] text-slate-300 leading-snug">Gezegenlerin gerçekçi yörünge hareketlerini izleyin. Fareyle çevirebilir, yakınlaşabilirsiniz.</p>
  </div>
  <div id="container" class="w-full h-full"></div>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    const pointLight = new THREE.PointLight(0xffffff, 2, 300);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0x222233));

    const planets = [
      { name: 'Merkür', color: 0x888888, size: 0.5, dist: 6, speed: 0.04 },
      { name: 'Venüs', color: 0xe3bb76, size: 0.8, dist: 9, speed: 0.025 },
      { name: 'Dünya', color: 0x2277ff, size: 0.9, dist: 13, speed: 0.018 },
      { name: 'Mars', color: 0xcc4422, size: 0.6, dist: 17, speed: 0.014 },
      { name: 'Jüpiter', color: 0xd4a373, size: 2.0, dist: 23, speed: 0.008 },
      { name: 'Satürn', color: 0xf4e2bb, size: 1.6, dist: 30, speed: 0.006 }
    ];

    const planetMeshes = planets.map(p => {
      const orbitGeo = new THREE.RingGeometry(p.dist - 0.05, p.dist + 0.05, 64);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      const geo = new THREE.SphereGeometry(p.size, 24, 24);
      const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.8 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return { mesh, ...p, angle: Math.random() * Math.PI * 2 };
    });

    camera.position.set(0, 30, 45);
    camera.lookAt(0, 0, 0);

    function animate() {
      requestAnimationFrame(animate);
      sun.rotation.y += 0.003;
      planetMeshes.forEach(p => {
        p.angle += p.speed;
        p.mesh.position.x = Math.cos(p.angle) * p.dist;
        p.mesh.position.z = Math.sin(p.angle) * p.dist;
        p.mesh.rotation.y += 0.02;
      });
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`
}

function get2048Html(): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2048 Mantık Bulmacası</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body { background: #0f172a; color: #fff; font-family: system-ui, sans-serif; touch-action: none; }
  .grid-cell { background: rgba(255, 255, 255, 0.08); border-radius: 12px; }
  .tile { transition: all 120ms ease-in-out; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .tile-2 { background: #e2e8f0; color: #1e293b; }
  .tile-4 { background: #fed7aa; color: #7c2d12; }
  .tile-8 { background: #fb923c; color: #fff; }
  .tile-16 { background: #f97316; color: #fff; }
  .tile-32 { background: #ea580c; color: #fff; }
  .tile-64 { background: #dc2626; color: #fff; }
  .tile-128 { background: #eab308; color: #fff; font-size: 1.5rem; }
  .tile-256 { background: #ca8a04; color: #fff; font-size: 1.5rem; }
  .tile-512 { background: #6366f1; color: #fff; font-size: 1.5rem; }
  .tile-1024 { background: #4f46e5; color: #fff; font-size: 1.25rem; }
  .tile-2048 { background: #ec4899; color: #fff; font-size: 1.25rem; }
</style>
</head>
<body class="flex flex-col items-center justify-between min-h-screen p-4 select-none">
  <div class="w-full max-w-sm flex items-center justify-between mt-2">
    <div>
      <h1 class="text-3xl font-black text-amber-400">2048</h1>
      <p class="text-xs text-slate-400">Sayıları Kaydır & Eşleştir</p>
    </div>
    <div class="flex gap-2">
      <div class="bg-slate-800 px-3 py-2 rounded-xl text-center border border-slate-700">
        <span class="text-[10px] text-slate-400 block font-bold">SKOR</span>
        <span id="score" class="text-lg font-black text-amber-300">0</span>
      </div>
      <button onclick="initGame()" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition">Yenile</button>
    </div>
  </div>

  <div class="relative w-80 h-80 bg-slate-900 rounded-2xl p-3 border-2 border-slate-700 shadow-2xl">
    <div class="grid grid-cols-4 gap-2.5 w-full h-full" id="grid"></div>
  </div>

  <p class="text-xs text-slate-400 text-center mb-4">Ok tuşlarını kullanarak sayıları birleştirin.</p>

  <script>
    let board = [];
    let score = 0;

    function initGame() {
      board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      score = 0;
      document.getElementById('score').textContent = score;
      spawn(); spawn();
      render();
    }

    function spawn() {
      const empties = [];
      for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
          if (board[r][c] === 0) empties.push({r, c});
        }
      }
      if (empties.length > 0) {
        const {r, c} = empties[Math.floor(Math.random() * empties.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
      }
    }

    function render() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
          const val = board[r][c];
          const cell = document.createElement('div');
          cell.className = 'grid-cell w-full h-full flex items-center justify-center';
          if (val > 0) {
            cell.classList.add('tile', 'tile-' + (val <= 2048 ? val : 2048));
            cell.textContent = val;
          }
          grid.appendChild(cell);
        }
      }
    }

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        // Simple slide logic
        render();
      }
    });

    initGame();
  </script>
</body>
</html>`
}
