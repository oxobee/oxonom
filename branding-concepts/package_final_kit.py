import os
import shutil
import subprocess

SRC_DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
KIT_DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/final-logo-kit"
ARTIFACTS_DIR = "/Users/ugurugurlu/.gemini/antigravity/brain/dc33a5f2-756f-48b1-9183-cf3a41a2e67c"

os.makedirs(KIT_DIR, exist_ok=True)

# Copy core vectors
shutil.copyfile(os.path.join(SRC_DIR, "concept-a1-folio.svg"), os.path.join(KIT_DIR, "oxonom-symbol-black.svg"))
shutil.copyfile(os.path.join(SRC_DIR, "var_1_ribbon_dot_pen_mono_light.svg"), os.path.join(KIT_DIR, "oxonom-edu-lockup-light.svg"))
shutil.copyfile(os.path.join(SRC_DIR, "var_1_ribbon_dot_pen_mono_dark.svg"), os.path.join(KIT_DIR, "oxonom-edu-lockup-dark.svg"))
shutil.copyfile(os.path.join(SRC_DIR, "var_1_ribbon_dot_pen_mono_light.png"), os.path.join(KIT_DIR, "oxonom-edu-lockup-light.png"))
shutil.copyfile(os.path.join(SRC_DIR, "var_1_ribbon_dot_pen_mono_dark.png"), os.path.join(KIT_DIR, "oxonom-edu-lockup-dark.png"))
shutil.copyfile(os.path.join("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/apps/web/public/favicon.ico"), os.path.join(KIT_DIR, "favicon.ico"))

# Copy to artifacts
shutil.copyfile(os.path.join(KIT_DIR, "oxonom-edu-lockup-light.png"), os.path.join(ARTIFACTS_DIR, "final_lockup_light.png"))
shutil.copyfile(os.path.join(KIT_DIR, "oxonom-edu-lockup-dark.png"), os.path.join(ARTIFACTS_DIR, "final_lockup_dark.png"))

# Brand Guidelines Document
guidelines = """# OXONOM | Edu — Brand Identity & Guidelines

## 1. Logo & Amblem Mimarisi
* **Amblem:** The Open Folio Nexus (A1) — Dairesel teknoloji halkası (O-X kesişimi) ile açık akademik sayfalar (open folios) ve merkezdeki rehberlik/içgörü elması (◆).
* **Wordmark:** 
  - `OXONOM`: Düz, mimari, dik ve ağır gövdeli (heavy bold) geometrik sans-serif. 'X' harfi O, N, M ile birebir aynı font ailesini ve et kalınlığını taşır.
  - `edu`: Özel sonsuzluk şeridi ligatürü (Ribbon Ligature) — Kesintisiz geometrik bağ ile birbirine kenetlenen harfler.
  - `◆` (Elmas Nokta): Kısaltma noktası, amblemin kalbindeki 45° elmasla özdeştir.
  - Dolma Kalem Ucu: Elmas noktanın üzerinde 32° akademik yazarlık açısıyla konumlanmış orantılı dolma kalem ucu.

## 2. Kurumsal Renk Standartları
* **Deep Obsidian (Ana Siyah):**
  - HEX: `#000000` / `#090D16` (Karanlık Arayüz Arka Planı)
  - RGB: `0, 0, 0`
  - CMYK: `75, 68, 67, 90`
* **Pure Light (Ana Beyaz):**
  - HEX: `#FFFFFF`
  - RGB: `255, 255, 255`
  - CMYK: `0, 0, 0, 0`
* **Electric Azure (Opsiyonel Teknoloji Vurgusu):**
  - HEX: `#2563EB`
  - RGB: `37, 99, 235`
  - CMYK: `84, 58, 0, 8`
  - Pantone: `Pantone 2174 C`

## 3. Uygulanan Dosyalar (Web Platformu)
* `apps/web/public/lrn.svg` — 256x256 Saf Vektör The Open Folio Nexus Amblemi
* `apps/web/public/lrn-dash.svg` — Dashboard Menü Amblemi
* `apps/web/public/lrn-text.svg` — Tam Yatay Marka Lockup'ı (OXONOM edu.)
* `apps/web/public/favicon.ico` — 16/32/48px Çoklu Çözünürlüklü Favicon
* `apps/web/public/learnhouse_icon.png` — 512x512 Uygulama İkonu
* `apps/web/public/learnhouse_logo.png` — 1200x326 Yüksek Çözünürlüklü Web Logosu
* `apps/web/public/learnhouse_text_white.png` — Koyu Zemin Yatay Logo
"""

with open(os.path.join(KIT_DIR, "BRAND_GUIDELINES.md"), "w") as f:
    f.write(guidelines)

print("Final kit and guidelines packaged successfully!")
