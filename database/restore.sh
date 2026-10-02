#!/bin/bash
# ==============================================================================
# LearnHouze v2.0 — Otomatik Veritabanı Geri Yükleme Betiği (Database Restore)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$DIR/learnhouse_dump.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ HATA: Veritabanı döküm dosyası bulunamadı: $SQL_FILE"
    exit 1
fi

echo "=========================================================="
echo " LearnHouze v2.0 — PostgreSQL Veritabanı Geri Yükleme    "
echo "=========================================================="

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-learnhouse}"
DB_NAME="${DB_NAME:-learnhouse}"
export PGPASSWORD="${DB_PASSWORD:-learnhouse}"

echo "Hedef Veritabanı: postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "Döküm Dosyası:    $SQL_FILE ($(du -h "$SQL_FILE" | cut -f1))"

# 1. PostgreSQL bağlantısını kontrol et
echo "[1/3] PostgreSQL bağlantısı test ediliyor..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
    echo "⚠️ Uyarı: $DB_USER kullanıcısı ile doğrudan bağlanılamadı. 'postgres' superuser ile veritabanı oluşturulmaya çalışılıyor..."
    PGPASSWORD="${PGPASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
    PGPASSWORD="${PGPASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "CREATE USER $DB_USER WITH PASSWORD 'learnhouse' SUPERUSER;" 2>/dev/null || true
    PGPASSWORD="${PGPASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
fi

# 2. Veritabanını oluştur (eğer yoksa)
echo "[2/3] Veritabanı ve eklentiler hazırlanıyor..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true

# pgvector extension
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true

# 3. SQL dökümünü yükle
echo "[3/3] SQL verileri geri yükleniyor (Bu işlem birkaç saniye sürebilir)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE" >/dev/null 2>&1 || \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

echo "=========================================================="
echo "✅ Veritabanı başarıyla geri yüklendi!"
echo "   - Kurum: Atatürk Fen ve Anadolu Lisesi"
echo "   - Sınıflar: 10-A, 11-B, 9-C"
echo "   - Oyunlar: ORBIT, 2048, Hafıza Kartları, Uzay Roketi, Kelime Avcısı"
echo "   - Demo Hesaplar: idare@oxonom.com, ogretmen@oxonom.com, ogrenci@oxonom.com, admin@oxonom.com"
echo "=========================================================="
