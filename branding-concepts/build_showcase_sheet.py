#!/usr/bin/env python3
import os
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"
ARTIFACTS_DIR = "/Users/ugurugurlu/.gemini/antigravity/brain/dc33a5f2-756f-48b1-9183-cf3a41a2e67c"

html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OXONOM edu. Refined Lockup Directions</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #0B0F17;
    color: #F8FAFC;
    padding: 48px;
  }}
  .container {{
    max-width: 1400px;
    margin: 0 auto;
  }}
  .header {{
    text-align: center;
    margin-bottom: 48px;
  }}
  .badge {{
    display: inline-block;
    padding: 6px 14px;
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(37, 99, 235, 0.4);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: #60A5FA;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }}
  h1 {{
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
    color: #FFFFFF;
  }}
  p.subtitle {{
    font-size: 16px;
    color: #94A3B8;
    max-width: 780px;
    margin: 0 auto;
    line-height: 1.5;
  }}
  .grid {{
    display: grid;
    grid-template-columns: 1fr;
    gap: 36px;
  }}
  .card {{
    background: #131B29;
    border: 1px solid #1E293B;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }}
  .card-header {{
    padding: 20px 28px;
    background: #182234;
    border-bottom: 1px solid #233149;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .card-title {{
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .tag {{
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
  }}
  .tag-rec {{ background: #059669; color: #ECFDF5; }}
  .tag-spec {{ background: #3B82F6; color: #EFF6FF; }}
  .card-desc {{
    font-size: 14px;
    color: #94A3B8;
  }}
  .card-previews {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 24px;
    gap: 20px;
    background: #0E1420;
  }}
  .preview-box {{
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }}
  .preview-box.light {{
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
  }}
  .preview-box.dark {{
    background: #06090F;
    border: 1px solid #1E293B;
  }}
  .preview-box img {{
    max-width: 100%;
    height: auto;
    display: block;
  }}
  .preview-label {{
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    margin-bottom: 12px;
    align-self: flex-start;
  }}
  .preview-box.light .preview-label {{ color: #64748B; }}
  .preview-box.dark .preview-label {{ color: #64748B; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="badge">A1 · The Open Folio Nexus Lockup Tasarımları</div>
    <h1>OXONOM edu. Tipografi & Bütünlük Çalışması</h1>
    <p class="subtitle">
      Geri bildiriminiz doğrultusunda: Aradaki ayırıcı çizgi kaldırıldı, OXONOM düz ve ağır bold (geometric heavy) mimariye geçirildi, "edu." kelimesi ise dinamik, hareketli (ileri eğimli) ve kısaltma noktasıyla tek bir kurumsal marka lockup'ında bütünleştirildi.
    </p>
  </div>

  <div class="grid">
    <!-- Option 1 -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>Yön 1 · Dinamik Küçük Harf (edu.) + Dairesel Nokta</span>
          <span class="tag tag-rec">Tavsiye Edilen — Modern SaaS Denge</span>
        </div>
        <div class="card-desc">Düz mimari OXONOM ile dinamik, esnek ve hareketli edu. kontrastı.</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin (Monokrom)</div>
          <img src="{DIR}/lockup_opt1_lowercase_kinetic_light.png" alt="Opt 1 Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Karanlık Zemin (Monokrom)</div>
          <img src="{DIR}/lockup_opt1_lowercase_kinetic_dark.png" alt="Opt 1 Dark">
        </div>
      </div>
    </div>

    <!-- Option 2 -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>Yön 2 · Nexus Diamond Dot (edu.◆)</span>
          <span class="tag tag-spec">Karakteristik İmza</span>
        </div>
        <div class="card-desc">Dinamik edu. kısaltma noktası, A1 ambleminin merkezindeki içgörü elmasını yansıtır.</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin</div>
          <img src="{DIR}/lockup_opt2_diamond_dot_light.png" alt="Opt 2 Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Karanlık Zemin</div>
          <img src="{DIR}/lockup_opt2_diamond_dot_dark.png" alt="Opt 2 Dark">
        </div>
      </div>
    </div>

    <!-- Option 3 -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>Yön 3 · Electric Azure Accent (edu.)</span>
          <span class="tag tag-spec">Global Tech & Eğitim Renk Vurgusu</span>
        </div>
        <div class="card-desc">OXONOM kurumsal monokrom kalırken, dinamik edu. canlı teknoloji mavisiyle öne çıkar.</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin</div>
          <img src="{DIR}/lockup_opt3_tech_azure_light.png" alt="Opt 3 Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Karanlık Zemin</div>
          <img src="{DIR}/lockup_opt3_tech_azure_dark.png" alt="Opt 3 Dark">
        </div>
      </div>
    </div>

    <!-- Option 4 -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>Yön 4 · Dinamik Büyük Harf (EDU.)</span>
          <span class="tag tag-spec">Akademik Otorite</span>
        </div>
        <div class="card-desc">İleri eğimli büyük harf EDU. ve solid nokta ile güçlü kurumsal duruş.</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin</div>
          <img src="{DIR}/lockup_opt4_uppercase_kinetic_light.png" alt="Opt 4 Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Karanlık Zemin</div>
          <img src="{DIR}/lockup_opt4_uppercase_kinetic_dark.png" alt="Opt 4 Dark">
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""

html_path = os.path.join(DIR, "lockup_showcase.html")
with open(html_path, "w") as f:
    f.write(html_content)

# Render HTML to PNG via render_png.py
png_out = os.path.join(DIR, "oxonom_lockup_showcase.png")
subprocess.run(["python3", RENDER_SCRIPT, html_path, "-o", png_out, "--width", "1440", "--height", "2150"], check=True)

# Copy to artifacts directory
artifact_out = os.path.join(ARTIFACTS_DIR, "oxonom_edu_refined_lockups.png")
with open(png_out, "rb") as f_src:
    with open(artifact_out, "wb") as f_dst:
        f_dst.write(f_src.read())

print(f"Showcase sheet rendered and copied to {artifact_out}")
