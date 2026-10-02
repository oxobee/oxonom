#!/bin/bash
# ==============================================================================
# LearnHouze v2.0 — Tek Komutla Otomatik Kurulum Betiği (All-in-One Installer)
# ==============================================================================
# Bu betik, yeni bir sunucuda (Ubuntu/Debian, macOS vb.) veya yerel ortamda
# LearnHouze v2.0 platformunu tüm bağımlılıkları ve veritabanı ile birlikte kurar.
#
# Bir yapay zeka ajanı veya sistem yöneticisi şu komutla doğrudan çalıştırabilir:
#   bash install.sh
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=================================================================="
echo "    🚀 LearnHouze v2.0 — Otomatik Sunucu & Sistem Kurulumu       "
echo "=================================================================="

# 1. İşletim Sistemi Tespiti
OS="$(uname -s)"
echo "[1/6] İşletim sistemi tespit ediliyor: $OS"

# 2. Kurulum Yöntemi Seçimi (Docker veya Yerel/Bare-Metal)
USE_DOCKER=false
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "  -> Docker ve Docker Compose tespit edildi."
    USE_DOCKER=true
fi

# Eğer parametre olarak --bare-metal verilirse Docker atlanır
if [ "$1" == "--bare-metal" ] || [ "$1" == "--local" ]; then
    USE_DOCKER=false
fi

# ------------------------------------------------------------------------------
# YÖNTEM A: DOCKER İLE KURULUM (Önerilen & En Hızlı)
# ------------------------------------------------------------------------------
if [ "$USE_DOCKER" = true ]; then
    echo "=================================================================="
    echo " Yöntem: Docker Compose ile İzole ve Hızlı Kurulum                "
    echo "=================================================================="
    
    if [ ! -f "$DIR/.env" ]; then
        cp "$DIR/.env.example" "$DIR/.env"
        echo "  -> .env dosyası oluşturuldu."
    fi

    echo "[2/4] Konteynerler derleniyor ve başlatılıyor..."
    docker compose up -d --build

    echo "[3/4] Servislerin hazır olması bekleniyor..."
    sleep 5
    docker compose ps

    echo "=================================================================="
    echo "🎉 LearnHouze v2.0 Docker ile Başarıyla Kuruldu ve Başlatıldı!   "
    echo "=================================================================="
    echo " Web UI:           http://localhost:3000 (veya http://sunucu_ip:3000) "
    echo " Nginx Girişi:     http://localhost:80   "
    echo " Backend API:      http://localhost:1348/docs "
    echo " Collab Server:    ws://localhost:4000 "
    echo "=================================================================="
    echo " Demo Hesaplar:                                                  "
    echo "  - Okul Müdürü:   idare@oxonom.com    / Şifre: Ugur2803*        "
    echo "  - Öğretmen:      ogretmen@oxonom.com / Şifre: Ugur2803*        "
    echo "  - Öğrenci:       ogrenci@oxonom.com  / Şifre: Ugur2803*        "
    echo "  - Süperadmin:    admin@oxonom.com    / Şifre: Ugur2803*        "
    echo "=================================================================="
    exit 0
fi

# ------------------------------------------------------------------------------
# YÖNTEM B: BARE-METAL / YEREL SİSTEM KURULUMU
# ------------------------------------------------------------------------------
echo "=================================================================="
echo " Yöntem: Yerel / Bare-Metal Sistem Kurulumu                      "
echo "=================================================================="

# Linux (Debian/Ubuntu) Paket Kurulumu
if [ "$OS" == "Linux" ] && command -v apt-get >/dev/null 2>&1; then
    echo "[2/6] Ubuntu/Debian paketleri kontrol ediliyor..."
    sudo apt-get update -y
    sudo apt-get install -y curl wget git build-essential postgresql postgresql-contrib redis-server python3 python3-pip python3-venv

    # Bun kurulumu (eğer yoksa)
    if ! command -v bun >/dev/null 2>&1; then
        echo "  -> Bun kuruluyor..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
    fi

    # uv (hızlı Python paket yöneticisi) kurulumu
    if ! command -v uv >/dev/null 2>&1; then
        echo "  -> uv kuruluyor..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        export PATH="$HOME/.cargo/bin:$PATH"
    fi

    # PostgreSQL ve Redis servislerini başlat
    sudo systemctl enable --now postgresql
    sudo systemctl enable --now redis-server
fi

# macOS Homebrew Paket Kontrolü
if [ "$OS" == "Darwin" ]; then
    echo "[2/6] macOS servisleri kontrol ediliyor..."
    brew services start postgresql@16 2>/dev/null || true
    brew services start redis 2>/dev/null || true
fi

# 3. Veritabanını Geri Yükle
echo "[3/6] PostgreSQL veritabanı geri yükleniyor..."
chmod +x "$DIR/database/restore.sh"
bash "$DIR/database/restore.sh"

# 4. Backend Bağımlılıkları (Python)
echo "[4/6] Backend API bağımlılıkları kuruluyor..."
cd "$DIR/apps/api"
if command -v uv >/dev/null 2>&1; then
    uv sync
else
    python3 -m venv .venv
    . .venv/bin/activate
    pip install -r pyproject.toml 2>/dev/null || pip install fastapi uvicorn sqlmodel asyncpg redis pydantic
fi

# 5. Collab ve Web Bağımlılıkları (Bun / Node)
echo "[5/6] Collab ve Web arayüz bağımlılıkları kuruluyor..."
cd "$DIR/apps/collab"
bun install || npm install

cd "$DIR/apps/web"
bun install || npm install

# 6. Servisleri Başlat
echo "[6/6] Servisler başlatılıyor..."
cd "$DIR"
chmod +x "$DIR/start.sh" "$DIR/stop.sh"
bash "$DIR/start.sh"

echo "=================================================================="
echo "🎉 LearnHouze v2.0 Başarıyla Kuruldu ve Çalışıyor!                "
echo "=================================================================="
echo " Web UI:           http://lvh.me:3010/login                       "
echo " Demo Okul Paneli: http://demo.lvh.me:3010/dash                   "
echo " Backend API Docs: http://lvh.me:1348/docs                        "
echo "=================================================================="
echo " Demo Hesaplar:                                                  "
echo "  - Okul Müdürü:   idare@oxonom.com    / Şifre: Ugur2803*        "
echo "  - Öğretmen:      ogretmen@oxonom.com / Şifre: Ugur2803*        "
echo "  - Öğrenci:       ogrenci@oxonom.com  / Şifre: Ugur2803*        "
echo "  - Süperadmin:    admin@oxonom.com    / Şifre: Ugur2803*        "
echo "=================================================================="
