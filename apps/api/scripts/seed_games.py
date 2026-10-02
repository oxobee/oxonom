import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
import json
import uuid
from src.core.events.database import get_db_session
from src.db.games import Game, GameCategory
from sqlalchemy import select

def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat()

# GAME 1: 2048 Sayı ve Mantık Bulmacası
GAME_1_HTML = """<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2048 Mantık Bulmacası</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body { background: #0f172a; color: #fff; font-family: system-ui, -apple-system, sans-serif; touch-action: none; }
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
  .tile-2048 { background: #ec4899; color: #fff; font-size: 1.25rem; box-shadow: 0 0 20px rgba(236, 72, 153, 0.6); }
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
    <div id="gameOver" class="hidden absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center gap-3">
      <span class="text-2xl font-black text-rose-400">Oyun Bitti!</span>
      <button onclick="initGame()" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-sm transition">Tekrar Dene</button>
    </div>
  </div>

  <div class="w-full max-w-sm flex flex-col items-center gap-2 mb-2">
    <p class="text-xs text-slate-400">👆 Ekranı kaydırın veya klavye ok tuşlarını kullanın</p>
    <div class="grid grid-cols-3 gap-2 w-48">
      <div></div>
      <button onclick="move('up')" class="p-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 text-lg">⬆️</button>
      <div></div>
      <button onclick="move('left')" class="p-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 text-lg">⬅️</button>
      <button onclick="move('down')" class="p-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 text-lg">⬇️</button>
      <button onclick="move('right')" class="p-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 text-lg">➡️</button>
    </div>
  </div>

  <script>
    let board = [];
    let score = 0;

    function initGame() {
      board = Array(4).fill(null).map(() => Array(4).fill(0));
      score = 0;
      document.getElementById('score').textContent = score;
      document.getElementById('gameOver').classList.add('hidden');
      spawnRandom();
      spawnRandom();
      render();
    }

    function spawnRandom() {
      const empty = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === 0) empty.push({ r, c });
        }
      }
      if (empty.length > 0) {
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
      }
    }

    function render() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = board[r][c];
          const div = document.createElement('div');
          div.className = 'w-full h-full rounded-xl flex items-center justify-center font-black text-xl select-none ' + (val ? 'tile tile-' + val : 'grid-cell');
          div.textContent = val ? val : '';
          grid.appendChild(div);
        }
      }
    }

    function move(dir) {
      let moved = false;
      const rotate = (m) => m[0].map((_, i) => m.map(row => row[i]).reverse());
      let b = JSON.parse(JSON.stringify(board));

      if (dir === 'up') { b = rotate(rotate(rotate(b))); }
      else if (dir === 'right') { b = rotate(rotate(b)); }
      else if (dir === 'down') { b = rotate(b); }

      for (let r = 0; r < 4; r++) {
        let row = b[r].filter(x => x !== 0);
        for (let i = 0; i < row.length - 1; i++) {
          if (row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row.splice(i + 1, 1);
            moved = true;
          }
        }
        while (row.length < 4) row.push(0);
        if (JSON.stringify(b[r]) !== JSON.stringify(row)) moved = true;
        b[r] = row;
      }

      if (dir === 'up') { b = rotate(b); }
      else if (dir === 'right') { b = rotate(rotate(b)); }
      else if (dir === 'down') { b = rotate(rotate(rotate(b))); }

      if (moved) {
        board = b;
        document.getElementById('score').textContent = score;
        spawnRandom();
        render();
        checkGameOver();
      }
    }

    function checkGameOver() {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === 0) return;
          if (r < 3 && board[r][c] === board[r + 1][c]) return;
          if (c < 3 && board[r][c] === board[r][c + 1]) return;
        }
      }
      document.getElementById('gameOver').classList.remove('hidden');
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
    });

    let touchStartX = 0, touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
    window.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        move(dx > 0 ? 'right' : 'left');
      } else if (Math.abs(dy) > 30) {
        move(dy > 0 ? 'down' : 'up');
      }
    });

    window.onload = initGame;
  </script>
</body>
</html>"""

# GAME 2: Hafıza Kartları & Görsel Eşleştirme
GAME_2_HTML = """<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hafıza Kartları</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body { background: #0f172a; color: #fff; font-family: system-ui, sans-serif; }
  .card-inner { transition: transform 0.5s; transform-style: preserve-3d; }
  .card.flipped .card-inner { transform: rotateY(180deg); }
  .card-front, .card-back { backface-visibility: hidden; position: absolute; inset: 0; border-radius: 1rem; }
  .card-front { background: #1e293b; border: 2px solid #334155; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
  .card-back { background: linear-gradient(135deg, #4f46e5, #7c3aed); transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; }
</style>
</head>
<body class="flex flex-col items-center justify-between min-h-screen p-4 select-none">
  <div class="w-full max-w-md flex items-center justify-between mt-2">
    <div>
      <h1 class="text-2xl font-black text-indigo-400">Hafıza & Eşleştirme</h1>
      <p class="text-xs text-slate-400">Gizli kartları çevirip çiftleri bul</p>
    </div>
    <div class="flex gap-2">
      <div class="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
        <span class="text-[10px] text-slate-400 block font-bold">HAMLE</span>
        <span id="moves" class="text-base font-black text-amber-400">0</span>
      </div>
      <button onclick="startGame()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-xs transition">Yenile</button>
    </div>
  </div>

  <div id="board" class="grid grid-cols-4 gap-3 w-full max-w-md aspect-square my-auto"></div>

  <div id="winModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center max-w-xs space-y-3">
      <span class="text-5xl">🏆</span>
      <h2 class="text-xl font-black text-white">Tebrikler Kazandın!</h2>
      <p id="winStats" class="text-xs text-slate-400">Harika bir hafıza başarısı.</p>
      <button onclick="startGame()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-sm transition">Tekrar Oyna</button>
    </div>
  </div>

  <script>
    const ICONS = ['🚀', '🪐', '🦁', '🍎', '⭐', '🎸', '🎨', '⚽'];
    let cards = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;

    function startGame() {
      document.getElementById('winModal').classList.add('hidden');
      moves = 0;
      matched = 0;
      flipped = [];
      document.getElementById('moves').textContent = moves;

      cards = [...ICONS, ...ICONS].sort(() => Math.random() - 0.5);
      const board = document.getElementById('board');
      board.innerHTML = '';

      cards.forEach((icon, idx) => {
        const card = document.createElement('div');
        card.className = 'card relative cursor-pointer';
        card.dataset.index = idx;
        card.dataset.icon = icon;
        card.innerHTML = `
          <div class="card-inner w-full h-full relative">
            <div class="card-front">❓</div>
            <div class="card-back">${icon}</div>
          </div>
        `;
        card.onclick = () => flipCard(card);
        board.appendChild(card);
      });
    }

    function flipCard(card) {
      if (flipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

      card.classList.add('flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        const [c1, c2] = flipped;
        if (c1.dataset.icon === c2.dataset.icon) {
          c1.classList.add('matched');
          c2.classList.add('matched');
          matched += 2;
          flipped = [];
          if (matched === cards.length) {
            setTimeout(() => {
              document.getElementById('winStats').textContent = `${moves} hamlede tüm kartları eşleştirdin!`;
              document.getElementById('winModal').classList.remove('hidden');
            }, 500);
          }
        } else {
          setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = [];
          }, 800);
        }
      }
    }

    window.onload = startGame;
  </script>
</body>
</html>"""

# GAME 3: Uzay Roketi Matematik Görevi
GAME_3_HTML = """<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Uzay Roketi Matematik</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body { background: #030712; color: #fff; font-family: system-ui, sans-serif; overflow: hidden; }
  canvas { background: radial-gradient(circle at center, #111827 0%, #030712 100%); }
</style>
</head>
<body class="flex flex-col items-center justify-between min-h-screen p-3 select-none">
  <div class="w-full max-w-md flex items-center justify-between z-10">
    <div class="flex items-center gap-2">
      <span class="text-2xl">🚀</span>
      <div>
        <h1 class="text-sm font-black text-amber-400">Uzay Roketi Matematik</h1>
        <p class="text-[10px] text-slate-400">Doğru cevabı vur, roketi koru!</p>
      </div>
    </div>
    <div class="flex gap-2">
      <div class="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 text-center">
        <span class="text-[9px] text-slate-400 block font-bold">PUAN</span>
        <span id="score" class="text-sm font-black text-emerald-400">0</span>
      </div>
    </div>
  </div>

  <!-- Question Banner -->
  <div class="w-full max-w-sm bg-slate-900/90 border border-slate-700 rounded-2xl p-3 text-center my-2 shadow-xl">
    <span class="text-xs text-indigo-400 font-bold block mb-1">Gelen Soru:</span>
    <span id="mathQuestion" class="text-2xl font-black text-white">7 + 8 = ?</span>
  </div>

  <!-- Options Grid -->
  <div id="options" class="grid grid-cols-3 gap-2.5 w-full max-w-sm mb-4 z-10">
    <!-- Buttons -->
  </div>

  <div id="feedback" class="h-6 text-xs font-bold text-center"></div>

  <script>
    let score = 0;
    let currentAns = 0;

    function nextQuestion() {
      const ops = ['+', '-', '*'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a = Math.floor(Math.random() * 12) + 1;
      let b = Math.floor(Math.random() * 12) + 1;

      if (op === '+') {
        currentAns = a + b;
        document.getElementById('mathQuestion').textContent = `${a} + ${b} = ?`;
      } else if (op === '-') {
        if (a < b) [a, b] = [b, a];
        currentAns = a - b;
        document.getElementById('mathQuestion').textContent = `${a} - ${b} = ?`;
      } else {
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
        currentAns = a * b;
        document.getElementById('mathQuestion').textContent = `${a} × ${b} = ?`;
      }

      const choices = [currentAns];
      while (choices.length < 3) {
        const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
        const wrong = Math.max(0, currentAns + offset);
        if (!choices.includes(wrong)) choices.push(wrong);
      }
      choices.sort(() => Math.random() - 0.5);

      const optsContainer = document.getElementById('options');
      optsContainer.innerHTML = '';
      choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xl shadow-lg border border-indigo-400/30 transition cursor-pointer';
        btn.textContent = ch;
        btn.onclick = () => check(ch);
        optsContainer.appendChild(btn);
      });
    }

    function check(val) {
      const fb = document.getElementById('feedback');
      if (val === currentAns) {
        score += 10;
        document.getElementById('score').textContent = score;
        fb.textContent = '✨ Mükemmel! Roket hızlandı!';
        fb.className = 'h-6 text-xs font-bold text-center text-emerald-400';
      } else {
        fb.textContent = '❌ Dikkat et, doğru cevap: ' + currentAns;
        fb.className = 'h-6 text-xs font-bold text-center text-rose-400';
      }
      setTimeout(nextQuestion, 700);
    }

    window.onload = nextQuestion;
  </script>
</body>
</html>"""

# GAME 4: Kelime Avcısı & Harf Çözücü
GAME_4_HTML = """<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kelime Avcısı & Harf Çözücü</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; }
  
  @keyframes tileDrop {
    0% { opacity: 0; transform: translateY(-16px) scale(0.6); }
    70% { transform: translateY(2px) scale(1.08); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes slotPop {
    0% { transform: scale(0.85); }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
  }

  .scrambled-tile {
    width: 46px;
    height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 22px;
    border-radius: 14px;
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border: 2px solid #334155;
    color: #f8fafc;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
    transition: all 0.15s ease-out;
    user-select: none;
  }
  .scrambled-tile:hover {
    border-color: #6366f1;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -2px rgba(99,102,241,0.25);
  }
  .scrambled-tile:active {
    transform: scale(0.95);
  }

  .letter-slot {
    width: 44px;
    height: 52px;
    border-radius: 14px;
    background: #020617;
    border: 2px solid #334155;
    display: inline-flex;
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
  <!-- Top Navigation & Score Bar -->
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

  <!-- Main Game Stage Card -->
  <main class="w-full max-w-md bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 text-center space-y-5 my-auto shadow-2xl backdrop-blur-sm">
    <!-- Category & Level Tag -->
    <div class="flex items-center justify-center gap-2">
      <span id="categoryBadge" class="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
        Kategori: Doğa & Çevre
      </span>
      <span id="letterCountBadge" class="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
        4 Harfli
      </span>
    </div>

    <!-- Scrambled Letter Tiles -->
    <div class="space-y-2">
      <div class="flex items-center justify-between px-1">
        <p class="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Karışık Harfler</p>
        <p class="text-[10px] text-indigo-400">Harflere tıklayarak da yazabilirsin</p>
      </div>
      <div id="tilesContainer" class="flex items-center justify-center gap-2 flex-wrap min-h-[54px] py-1">
        <!-- Scrambled tiles generated dynamically with popIn animation -->
      </div>
    </div>

    <!-- Segmented Character Input Slots (Kelime kadar karakter alanı) -->
    <div class="space-y-2 pt-1">
      <p class="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Tahmininiz</p>
      <div
        id="slotsContainer"
        onclick="focusHiddenInput()"
        class="flex items-center justify-center gap-2 flex-wrap min-h-[56px] p-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition"
      >
        <!-- Dynamic letter slots generated here -->
      </div>

      <!-- Real Hidden input handling all keyboard and mobile typing -->
      <input
        id="wordInput"
        type="text"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        class="sr-only"
      />
    </div>

    <!-- Actions: Sil & Kontrol Et -->
    <div class="flex items-center gap-2 pt-1">
      <button
        onclick="clearLastLetter()"
        class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition active:scale-95 cursor-pointer"
        title="Son harfi sil"
      >
        ⌫ Sil
      </button>
      <button
        onclick="checkGuess()"
        class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
      >
        <span>Kontrol Et</span>
        <span>✓</span>
      </button>
    </div>

    <!-- Hint Section with Strict Point Requirement -->
    <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <span>💡</span>
          <span>İpucu Alanı</span>
        </div>
        <button
          id="btnHint"
          onclick="revealHint()"
          class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          İpucu Al (-5 Puan)
        </button>
      </div>
      <p id="hintText" class="text-xs text-slate-300 italic min-h-[20px] leading-relaxed">
        İpucu almak için yukarıdaki butona tıklayabilirsiniz.
      </p>
    </div>

    <!-- Feedback Message -->
    <div id="msg" class="text-xs font-bold text-slate-400 h-5 transition-all flex items-center justify-center"></div>
  </main>

  <!-- Footer Help -->
  <footer class="w-full max-w-md text-center py-2">
    <p class="text-[11px] text-slate-500 font-medium">
      Klavyenizden cevabı yazıp <span class="text-slate-400 font-bold">Enter</span> tuşuna basabilirsiniz.
    </p>
  </footer>

  <script>
    // Rich Educational Words Database
    const WORDS = [
      { word: 'KEDİ', category: 'Doğa & Hayvan', hint: 'Miyavlayan sevimli evcil dost 🐱' },
      { word: 'KÖPEK', category: 'Doğa & Hayvan', hint: 'Sadık ve koruyucu dört ayaklı dost 🐶' },
      { word: 'TAVŞAN', category: 'Doğa & Hayvan', hint: 'Uzun kulaklı, havucu çok seven hızlı hayvan 🐰' },
      { word: 'GÜNEŞ', category: 'Uzay & Bilim', hint: 'Sistemimizin merkezindeki dev ısı ve ışık kaynağı ☀️' },
      { word: 'DÜNYA', category: 'Uzay & Bilim', hint: 'Üzerinde yaşadığımız mavi gezegen 🌍' },
      { word: 'ROKET', category: 'Uzay & Bilim', hint: 'Uzaya uydu ve astronot taşıyan güçlü araç 🚀' },
      { word: 'YILDIZ', category: 'Uzay & Bilim', hint: 'Gece gökyüzünde parıldayan gökcisimleri ✨' },
      { word: 'KİTAP', category: 'Eğitim & Dil', hint: 'Sayfalarında bilgi ve masallar saklı okuma aracı 📖' },
      { word: 'KALEM', category: 'Eğitim & Dil', hint: 'Düşünceleri kağıda dökmeye yarayan araç ✏️' },
      { word: 'DEFTER', category: 'Eğitim & Dil', hint: 'Ders notlarını yazdığımız sayfalar bütünü 📓' },
      { word: 'OKUL', category: 'Eğitim & Sosyal', hint: 'Öğretmen ve arkadaşlarla bilgi öğrendiğimiz yuva 🏫' },
      { word: 'ORMAN', category: 'Doğa & Çevre', hint: 'Çok sayıda ağaç ve canlının bir arada yaşadığı yeşil alan 🌲' },
      { word: 'DENİZ', category: 'Doğa & Çevre', hint: 'Tuzlu büyük su kütlesi, balıkların evi 🌊' },
      { word: 'BULUT', category: 'Doğa & Çevre', hint: 'Gökyüzünde pamuk gibi süzülen su buharı ☁️' },
      { word: 'YAĞMUR', category: 'Doğa & Çevre', hint: 'Bulutlardan yeryüzüne düşen bereketli su damlaları 🌧️' },
      { word: 'ÜÇGEN', category: 'Matematik & Geometri', hint: 'Üç kenarı ve üç köşesi olan geometrik şekil 📐' },
      { word: 'KARE', category: 'Matematik & Geometri', hint: 'Dört kenarı da birbirine eşit geometrik şekil ⏹️' },
      { word: 'ÇEMBER', category: 'Matematik & Geometri', hint: 'Yuvarlak, köşesi olmayan simetrik çizgi ⭕' },
      { word: 'MÜZİK', category: 'Sanat & Kültür', hint: 'Ritmik sesler ve melodilerden oluşan sanat dalı 🎵' },
      { word: 'RESİM', category: 'Sanat & Kültür', hint: 'Fırça ve boyalarla yapılan görsel sanat eseri 🎨' }
    ];

    const HINT_COST = 5;
    let current = null;
    let score = 0;
    let hintLevel = 0;

    // Accurate Turkish character normalization (forces uppercase everywhere)
    function normalizeTR(str) {
      if (!str) return '';
      return str.trim()
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'I')
        .replace(/ç/g, 'Ç')
        .replace(/ğ/g, 'Ğ')
        .replace(/ö/g, 'Ö')
        .replace(/ş/g, 'Ş')
        .replace(/ü/g, 'Ü')
        .toLocaleUpperCase('tr-TR');
    }

    // Scramble letters
    function scrambleWord(word) {
      const letters = word.split('');
      if (letters.length <= 1) return letters;
      let shuffled = letters.slice();
      for (let attempt = 0; attempt < 10; attempt++) {
        shuffled.sort(() => Math.random() - 0.5);
        if (shuffled.join('') !== word) break;
      }
      return shuffled;
    }

    // Focus hidden input
    function focusHiddenInput() {
      const input = document.getElementById('wordInput');
      if (input && !input.disabled) input.focus();
    }

    // Render scrambled tiles with staggered drop animation
    function renderTiles(letters) {
      const container = document.getElementById('tilesContainer');
      container.innerHTML = '';
      letters.forEach((letter, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scrambled-tile';
        btn.textContent = letter;
        btn.style.animation = `tileDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both`;
        btn.style.animationDelay = `${idx * 70}ms`;
        btn.onclick = () => addLetter(letter);
        container.appendChild(btn);
      });
    }

    // Render segmented slots for the word length
    function renderSlots() {
      const container = document.getElementById('slotsContainer');
      container.innerHTML = '';
      const inputVal = normalizeTR(document.getElementById('wordInput').value);

      for (let i = 0; i < current.word.length; i++) {
        const slot = document.createElement('div');
        const char = inputVal[i] || '';
        const isFilled = char !== '';
        const isActive = inputVal.length === i;

        slot.className = 'letter-slot';
        if (isFilled) {
          slot.classList.add('filled');
          slot.textContent = char;
        } else if (isActive) {
          slot.classList.add('active');
          slot.textContent = '';
        } else {
          slot.textContent = '';
        }
        container.appendChild(slot);
      }
    }

    // Add letter to input
    function addLetter(char) {
      const input = document.getElementById('wordInput');
      if (input.disabled) return;
      if (input.value.length < current.word.length) {
        input.value = normalizeTR(input.value + char);
        renderSlots();
      }
      focusHiddenInput();
    }

    // Backspace
    function clearLastLetter() {
      const input = document.getElementById('wordInput');
      if (input.disabled) return;
      input.value = input.value.slice(0, -1);
      renderSlots();
      focusHiddenInput();
    }

    // Update Hint button based on score & level
    function updateHintButton() {
      const btn = document.getElementById('btnHint');
      if (!btn) return;

      if (hintLevel >= 3) {
        btn.disabled = true;
        btn.className = 'px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-800/60 border border-slate-700/50 rounded-xl cursor-not-allowed';
        btn.textContent = 'Tüm İpuçları Açıldı';
        return;
      }

      if (score < HINT_COST) {
        btn.disabled = true;
        btn.className = 'px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-800/60 border border-slate-700/50 rounded-xl cursor-not-allowed opacity-60';
        btn.title = 'İpucu için en az 5 puana sahip olmalısınız!';
        btn.textContent = `İpucu Al (5 Puan - Yetersiz)`;
      } else {
        btn.disabled = false;
        btn.className = 'px-3.5 py-1.5 text-xs font-black text-amber-300 hover:text-amber-100 bg-gradient-to-r from-amber-500/20 via-amber-600/25 to-indigo-600/20 hover:from-amber-500/30 hover:to-indigo-600/30 border border-amber-400/40 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer';
        btn.title = '5 Puan karşılığında ipucu al';
        if (hintLevel === 0) btn.textContent = '💡 İpucu Al (-5 Puan)';
        else if (hintLevel === 1) btn.textContent = '💡 İlk Harfi Aç (-5 Puan)';
        else if (hintLevel === 2) btn.textContent = '💡 Son Harfi Aç (-5 Puan)';
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

      // Update UI
      document.getElementById('categoryBadge').textContent = 'Kategori: ' + current.category;
      document.getElementById('letterCountBadge').textContent = current.word.length + ' Harfli';

      const scrambledLetters = scrambleWord(current.word);
      renderTiles(scrambledLetters);

      const input = document.getElementById('wordInput');
      input.value = '';
      input.disabled = false;
      renderSlots();

      document.getElementById('hintText').textContent = 'İpucu almak için yukarıdaki butona tıklayabilirsiniz.';
      updateHintButton();

      const msg = document.getElementById('msg');
      msg.textContent = '';
      msg.className = 'text-xs font-bold text-slate-400 h-5 transition-all';
      focusHiddenInput();
    }

    // Reveal Hint with Strict Balance Check
    function revealHint() {
      if (!current) return;
      const msg = document.getElementById('msg');

      if (score < HINT_COST) {
        msg.textContent = '⚠️ İpucu almak için en az 5 puanınız olmalıdır!';
        msg.className = 'text-xs font-bold text-rose-400 h-5 transition-all';
        return;
      }

      hintLevel++;
      score -= HINT_COST;
      document.getElementById('score').textContent = score;

      const hintTextEl = document.getElementById('hintText');

      if (hintLevel === 1) {
        hintTextEl.textContent = '💡 ' + current.hint;
      } else if (hintLevel === 2) {
        const firstChar = current.word.charAt(0);
        hintTextEl.textContent = '💡 ' + current.hint + ' (Başlangıç: ' + firstChar + '...)';
      } else {
        const firstChar = current.word.charAt(0);
        const lastChar = current.word.charAt(current.word.length - 1);
        hintTextEl.textContent = '💡 ' + current.hint + ' (' + firstChar + ' ... ' + lastChar + ')';
      }

      updateHintButton();
    }

    // Check guess
    function checkGuess() {
      const inputEl = document.getElementById('wordInput');
      const normalizedInput = normalizeTR(inputEl.value);
      const normalizedTarget = normalizeTR(current.word);
      const msg = document.getElementById('msg');
      const slotsContainer = document.getElementById('slotsContainer');

      if (!normalizedInput || normalizedInput.length < current.word.length) {
        msg.textContent = 'Lütfen ' + current.word.length + ' harfi de doldurun.';
        msg.className = 'text-xs font-bold text-amber-400 h-5 transition-all';
        slotsContainer.classList.add('animate-shake');
        setTimeout(() => slotsContainer.classList.remove('animate-shake'), 400);
        return;
      }

      if (normalizedInput === normalizedTarget) {
        // Correct!
        const earned = Math.max(10, 25 - (hintLevel * 5));
        score += earned;
        document.getElementById('score').textContent = score;

        // Visual slot success
        const slots = document.querySelectorAll('.letter-slot');
        slots.forEach(s => s.classList.add('correct'));

        msg.textContent = '✨ Tebrikler! Doğru bildin: ' + current.word + ' (+' + earned + ' Puan)';
        msg.className = 'text-xs font-bold text-emerald-400 h-5 transition-all';

        inputEl.disabled = true;
        updateHintButton();
        setTimeout(nextWord, 1300);
      } else {
        // Wrong
        msg.textContent = 'Farklı bir kelime olmalı, tekrar deneyin!';
        msg.className = 'text-xs font-bold text-rose-400 h-5 transition-all';
        slotsContainer.classList.add('animate-shake');
        setTimeout(() => slotsContainer.classList.remove('animate-shake'), 400);
        focusHiddenInput();
      }
    }

    // Input listeners: force uppercase & auto-update character slots
    const wordInput = document.getElementById('wordInput');
    wordInput.addEventListener('input', (e) => {
      wordInput.value = normalizeTR(wordInput.value).slice(0, current ? current.word.length : 10);
      renderSlots();
    });

    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        checkGuess();
      } else if (e.key === 'Backspace' && wordInput.value.length === 0) {
        renderSlots();
      }
    });

    window.onload = nextWord;
  </script>
</body>
</html>"""


async def main():
    async for db in get_db_session():
        # 1. Create or ensure categories
        cat_defs = [
            {"name": "Zeka & Mantık", "slug": "zeka-mantik", "icon": "🧠", "desc": "Bulmacalar, hafıza ve mantık oyunları"},
            {"name": "Matematik Maceraları", "slug": "matematik", "icon": "📐", "desc": "Ritmik sayma, işlem pratikleri ve hızlı hesaplama"},
            {"name": "Fen & Uzay", "slug": "fen-uzay", "icon": "🚀", "desc": "Güneş sistemi, fizik simülasyonları ve uzay keşfi"},
            {"name": "Dil & Kelime", "slug": "dil-kelime", "icon": "📚", "desc": "Kelime avı, Türkçe ve İngilizce maceralar"}
        ]
        
        cats = {}
        for c in cat_defs:
            existing = (await db.execute(select(GameCategory).where(GameCategory.slug == c["slug"]))).scalars().first()
            if not existing:
                cat = GameCategory(
                    category_uuid=str(uuid.uuid4()),
                    name=c["name"],
                    slug=c["slug"],
                    icon=c["icon"],
                    description=c["desc"],
                    is_active=True,
                    creation_date=_now(),
                )
                db.add(cat)
                await db.commit()
                await db.refresh(cat)
                cats[c["slug"]] = cat
                print(f"Created category: {cat.name}")
            else:
                cats[c["slug"]] = existing
                print(f"Existing category: {existing.name}")

        # 2. Create Games
        games_defs = [
            {
                "title": "2048 Sayı & Mantık Bulmacası",
                "slug": "2048-sayi-mantik-bulmacasi",
                "cat_slug": "zeka-mantik",
                "desc": "Sayıları kaydırarak birbirine ekleyin, zekanızı ve stratejinizi konuşturup 2048 hedefine ulaşın!",
                "age_range": "7-14 Yaş",
                "grades": ["3. Sınıf", "4. Sınıf", "5-8. Sınıf", "Lise"],
                "outcomes": "Stratejik planlama, uzamsal zeka, sayılarla işlem yetisi.",
                "html": GAME_1_HTML,
                "featured": True,
                "order": 1,
            },
            {
                "title": "Hafıza Kartları & Çiftini Bul",
                "slug": "hafiza-kartlari-ciftini-bul",
                "cat_slug": "zeka-mantik",
                "desc": "Gizlenmiş görsel çiftleri çevirerek en az hamlede eşleştirin. Görsel hafızayı ve dikkati güçlendirir.",
                "age_range": "5-10 Yaş",
                "grades": ["Okul Öncesi", "1. Sınıf", "2. Sınıf", "3. Sınıf"],
                "outcomes": "Görsel hafıza, odaklanma süresi, eşleştirme becerisi.",
                "html": GAME_2_HTML,
                "featured": True,
                "order": 2,
            },
            {
                "title": "Uzay Roketi Matematik Görevi",
                "slug": "uzay-roket-matematik-gorevi",
                "cat_slug": "matematik",
                "desc": "Uzayda hızla ilerleyen roketin önüne çıkan engelleri doğru toplama, çıkarma ve çarpma yaparak aş!",
                "age_range": "7-12 Yaş",
                "grades": ["2. Sınıf", "3. Sınıf", "4. Sınıf"],
                "outcomes": "Zihinden hızlı işlem yapma, matematiksel özgüven ve refleks.",
                "html": GAME_3_HTML,
                "featured": True,
                "order": 3,
            },
            {
                "title": "Kelime Avcısı & Harf Çözücü",
                "slug": "kelime-avcisi-harf-cozucu",
                "cat_slug": "dil-kelime",
                "desc": "Karışık verilmiş harfleri bir araya getirip ipuçlarını kullanarak doğru kelimeyi tahmin edin.",
                "age_range": "6-12 Yaş",
                "grades": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
                "outcomes": "Kelime dağarcığı, heceleme, analitik düşünme.",
                "html": GAME_4_HTML,
                "featured": False,
                "order": 4,
            },
        ]

        for g in games_defs:
            existing = (await db.execute(select(Game).where(Game.slug == g["slug"]))).scalars().first()
            cat = cats[g["cat_slug"]]
            if not existing:
                game = Game(
                    game_uuid=str(uuid.uuid4()),
                    category_id=cat.id,
                    title=g["title"],
                    slug=g["slug"],
                    description=g["desc"],
                    html_content=g["html"],
                    grade_levels=g["grades"],
                    age_range=g["age_range"],
                    learning_objectives=g["outcomes"],
                    status="published",
                    is_featured=g["featured"],
                    featured_order=g["order"],
                    target_org_ids=None, # accessible to all schools
                    play_count=14,
                    creation_date=_now(),
                    update_date=_now(),
                )
                db.add(game)
                print(f"Created game: {game.title}")
            else:
                existing.html_content = g["html"]
                existing.description = g["desc"]
                existing.is_featured = g["featured"]
                existing.status = "published"
                db.add(existing)
                print(f"Updated game: {existing.title}")

        await db.commit()
        print("All categories and games seeded successfully!")

asyncio.run(main())
