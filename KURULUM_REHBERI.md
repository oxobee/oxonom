# 🎓 LearnHouze v2.0 — Tam Sistem Yedekleme ve Kurulum Rehberi

Bu klasör (`/Users/ugurugurlu/Desktop/LearnHouze_v2.0`), LearnHouze / Oxonom platformunun **tüm bileşenlerini, kaynak kodlarını ve eksiksiz PostgreSQL veritabanını** içeren taşınabilir bir tam sistem yedeğidir.

Yeni bir sunucuya (VPS, Bulut, Ubuntu, Debian veya macOS) aktarıldığında tek komutla veya Docker ile kurulabilir.

---

## 📦 Yedek Paketi İçeriği

1. **`database/learnhouse_dump.sql`:**
   - 14 MB boyutunda eksiksiz PostgreSQL veritabanı dökümü.
   - **Atatürk Fen ve Anadolu Lisesi** okulu ve tüm okul ayarları.
   - **10-A Fen ve Matematik Şubesi**, 11-B ve 9-C şubeleri.
   - Bağlı tüm hesaplar:
     - Okul Müdürü: `idare@oxonom.com` / `Ugur2803*`
     - Öğretmen: `ogretmen@oxonom.com` / `Ugur2803*`
     - Öğrenci: `ogrenci@oxonom.com` / `Ugur2803*`
     - Süperadmin: `admin@oxonom.com` / `Ugur2803*`
   - Tüm oyunlar: **ORBIT 3D Simülasyonu**, 2048, Hafıza Kartları, Uzay Roketi, Kelime Avcısı.
   - 13 adet akıllı tahta panosu, MEB kazanımlı ödevler ve veli tartışma forumları.
2. **`database/restore.sh`:**
   - PostgreSQL veritabanını tek tıkla hedef sunucuya geri yükleyen betik.
3. **`docker-compose.yml`:**
   - PostgreSQL (pgvector ile), Redis, API, Collab ve Web arayüzünü otomatik ayağa kaldıran Docker Compose dosyası.
4. **`install.sh`:**
   - Yeni sunucuda tüm bağımlılıkları yükleyip veritabanını kuran ve sistemi başlatan hepsi bir arada kurulum betiği.
5. **`AI_AGENT_INSTRUCTIONS.md`:**
   - Bir yapay zeka ajanına ("Bu projeyi sunucuya kur") dendiğinde ajanın adım adım eksiksiz kurulum yapmasını sağlayan teknik rehber.
6. **`apps/web/`:**
   - Next.js 16 Web arayüzü, oyun motorları ve akıllı tahta araç çubuğu.
7. **`apps/api/`:**
   - FastAPI Python arka uç servisi, rol ve izin yönetimleri, oyun ve modül API'leri.
8. **`apps/collab/`:**
   - Hocuspocus v4 WebSocket canlı tahta ve doküman işbirliği sunucusu.

---

## 🚀 Yeni Bir Sunucuya Kurulum Adımları

### Seçenek 1: Docker ile Kurulum (En Kolay & En Hızlı)
Hedef sunucuda Docker kuruluysa:
```bash
cd LearnHouze_v2.0
docker compose up -d --build
```
> Bu komut veritabanını otomatik olarak içe aktarır, Redis ve tüm web/api servislerini başlatır.

---

### Seçenek 2: Tek Komutla Otomatik Kurulum (Ubuntu / Debian / macOS)
```bash
cd LearnHouze_v2.0
bash install.sh
```
> Bu betik sistemdeki eksik paketleri tespit eder, PostgreSQL ve Redis'i başlatır, `database/restore.sh` ile veritabanını yükler ve servisleri ayağa kaldırır.

---

### Seçenek 3: Manuel Yerel Başlatma (Mevcut Makinede)
```bash
cd LearnHouze_v2.0
./start.sh
```
Servisleri kapatmak için:
```bash
./stop.sh
```

---

## 🌐 Çalışan Servisler ve Portlar

- **Web Arayüzü:** `http://localhost:3010` (veya `http://sunucu_ip:3010` / `http://lvh.me:3010`)
- **API Dokümantasyonu (Swagger):** `http://localhost:1348/docs`
- **Canlı Tahta / Collab (WebSocket):** `ws://localhost:4000`
- **PostgreSQL Veritabanı:** Port `5432` (`learnhouse` kullanıcısı)
- **Redis Önbellek:** Port `6379`

---

## 🤖 Bir Yapay Zeka Ajanına Kurdurmak İçin Komut
Herhangi bir AI ajanı (Antigravity, Cursor, Devin, Claude vb.) kullandığınızda ajana sadece şunu söylemeniz yeterlidir:

> *"Lütfen `LearnHouze_v2.0` klasöründeki `AI_AGENT_INSTRUCTIONS.md` dosyasını oku ve yönergeleri takip ederek sistemi bu sunucuya kur ve çalıştır."*

Ajan dosyayı okuyarak ortamınıza uygun kurulumu (Docker veya native) otomatik olarak tamamlayacaktır.
