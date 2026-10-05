#!/usr/bin/env python3
import os
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"
AUDIT_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/svg_audit.py"
ARTIFACTS_DIR = "/Users/ugurugurlu/.gemini/antigravity/brain/dc33a5f2-756f-48b1-9183-cf3a41a2e67c"

# Symbol A1
with open(os.path.join(DIR, "concept-a1-folio.svg")) as f:
    sym_raw = f.read()
p_start = sym_raw.find("<path")
p_end = sym_raw.rfind("</g>")
sym_shapes = sym_raw[p_start:p_end]

# 1. Straight Bold OXONOM (Height 62, Baseline 158, Top 96, stroke 14.5)
def get_oxonom_perfect(x_start=240, fill_color="currentColor"):
    paths = []
    x = x_start
    h = 62
    y_top = 96
    y_bot = 158
    stroke_w = 14.5
    r_out = 31
    r_in = r_out - stroke_w # 16.5
    
    # 1. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+31} {y_top} A 31 31 0 1 1 {x+30.9} {y_top} Z M {x+31} {y_top+stroke_w} A {r_in} {r_in} 0 1 0 {x+31.1} {y_top+stroke_w} Z" />')
    x += 71
    
    # 2. 'X'
    w_x = 56
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},{y_top} {x+17},{y_top} {x+w_x/2},{y_top+h/2-2:.1f} {x+w_x-17},{y_top} {x+w_x},{y_top} 
      {x+w_x/2+10},{y_top+h/2:.1f} {x+w_x},{y_bot} {x+w_x-17},{y_bot} {x+w_x/2},{y_top+h/2+2:.1f} {x+17},{y_bot} {x},{y_bot} 
      {x+w_x/2-10},{y_top+h/2:.1f}" />''')
    x += 65
    
    # 3. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+31} {y_top} A 31 31 0 1 1 {x+30.9} {y_top} Z M {x+31} {y_top+stroke_w} A {r_in} {r_in} 0 1 0 {x+31.1} {y_top+stroke_w} Z" />')
    x += 71
    
    # 4. 'N'
    w_n = 56
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},{y_top} {x+stroke_w},{y_top} {x+w_n-stroke_w},{y_bot-17} {x+w_n-stroke_w},{y_top} {x+w_n},{y_top} 
      {x+w_n},{y_bot} {x+w_n-stroke_w},{y_bot} {x+stroke_w},{y_top+17} {x+stroke_w},{y_bot} {x},{y_bot}" />''')
    x += 65
    
    # 5. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+31} {y_top} A 31 31 0 1 1 {x+30.9} {y_top} Z M {x+31} {y_top+stroke_w} A {r_in} {r_in} 0 1 0 {x+31.1} {y_top+stroke_w} Z" />')
    x += 71
    
    # 6. 'M'
    w_m = 68
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},{y_top} {x+stroke_w},{y_top} {x+w_m/2},{y_bot-22} {x+w_m-stroke_w},{y_top} {x+w_m},{y_top} 
      {x+w_m},{y_bot} {x+w_m-stroke_w+1},{y_bot} {x+w_m-stroke_w+1},{y_top+22} {x+w_m/2},{y_bot-2} {x+stroke_w-1},{y_top+22} {x+stroke_w-1},{y_bot} {x},{y_bot}" />''')
    x += w_m
    
    return "\n    ".join(paths), x

# --- DYNAMIC EDU. STYLES (Baseline-anchored skew, energetic, with abbreviation dot) ---

def make_kinetic_lowercase(x_start, slant=11, color="currentColor", dot_style="circle"):
    paths = []
    lx = 0
    
    # 'e' (y: 116 to 158, width 42)
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx+21} 116 C {lx+34} 116 {lx+42} 124 {lx+42} 136 C {lx+42} 138 {lx+41} 139 {lx+40} 139 H {lx+12} C {lx+13} 145 {lx+17} 148 {lx+24} 148 C {lx+30} 148 {lx+35} 146 {lx+38} 142 L {lx+45} 149 C {lx+40} 156 {lx+33} 158 {lx+24} 158 C {lx+10} 158 {lx} 147 {lx} 137 C {lx} 124 {lx+10} 116 {lx+21} 116 Z
      M {lx+12} 131 H {lx+31} C {lx+31} 125 {lx+27} 123 {lx+21} 123 C {lx+16} 123 {lx+13} 126 {lx+12} 131 Z" />''')
    lx += 48
    
    # 'd' (Bowl y: 116 to 158, stem y: 96 to 158, width 44)
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx+28} 96 H {lx+39} V 158 H {lx+28} V 152 C {lx+25} 156 {lx+20} 158 {lx+14} 158 C {lx+5} 158 {lx} 148 {lx} 137 C {lx} 125 {lx+5} 116 {lx+14} 116 C {lx+20} 116 {lx+25} 119 {lx+28} 123 Z
      M {lx+20} 125 C {lx+14} 125 {lx+11} 130 {lx+11} 137 C {lx+11} 144 {lx+14} 149 {lx+20} 149 C {lx+26} 149 {lx+29} 144 {lx+29} 137 C {lx+29} 130 {lx+26} 125 {lx+20} 125 Z" />''')
    lx += 46
    
    # 'u' (y: 116 to 158, width 42)
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx} 116 H {lx+11} V 143 C {lx+11} 148 {lx+15} 150 {lx+20} 150 C {lx+25} 150 {lx+29} 147 {lx+29} 143 V 116 H {lx+40} V 158 H {lx+30} V 152 C {lx+27} 156 {lx+22} 158 {lx+16} 158 C {lx+5} 158 {lx} 149 {lx} 139 Z" />''')
    lx += 45
    
    # Abbreviation Dot
    if dot_style == "circle":
        paths.append(f'''<circle cx="{lx+7}" cy="152" r="6" fill="{color}" />''')
    elif dot_style == "diamond":
        paths.append(f'''<polygon points="{lx+7},144 {lx+15},152 {lx+7},160 {lx-1},152" fill="{color}" />''')
    elif dot_style == "blue":
        paths.append(f'''<circle cx="{lx+7}" cy="152" r="6" fill="#2563eb" />''')
        
    return f'''<g transform="translate({x_start}, 158) skewX(-{slant}) translate(0, -158)">
      {''.join(paths)}
    </g>'''

def make_kinetic_uppercase(x_start, slant=11, color="currentColor", dot_style="circle"):
    paths = []
    lx = 0
    # E
    paths.append(f'''<polygon fill="{color}" points="
      {lx},96 {lx+36},96 {lx+36},108 {lx+13},108 
      {lx+13},120 {lx+32},120 {lx+32},132 {lx+13},132 
      {lx+13},146 {lx+37},146 {lx+37},158 {lx},158" />''')
    lx += 47
    
    # D
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx} 96 H {lx+22} C {lx+39} 96 {lx+46} 108 {lx+46} 127 C {lx+46} 146 {lx+39} 158 {lx+22} 158 H {lx} Z
      M {lx+13} 108 V 146 H {lx+21} C {lx+30} 146 {lx+33} 139 {lx+33} 127 C {lx+33} 115 {lx+30} 108 {lx+21} 108 Z" />''')
    lx += 56
    
    # U
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx} 96 H {lx+13} V 136 C {lx+13} 144 {lx+17} 147 {lx+24} 147 C {lx+30} 147 {lx+34} 144 {lx+34} 136 V 96 H {lx+47} V 136 C {lx+47} 151 {lx+37} 159 {lx+24} 159 C {lx+10} 159 {lx} 151 {lx} 136 Z" />''')
    lx += 53
    
    # Dot '.'
    if dot_style == "circle":
        paths.append(f'''<circle cx="{lx+7}" cy="152" r="6" fill="{color}" />''')
    elif dot_style == "diamond":
        paths.append(f'''<polygon points="{lx+7},144 {lx+15},152 {lx+7},160 {lx-1},152" fill="{color}" />''')
    elif dot_style == "blue":
        paths.append(f'''<circle cx="{lx+7}" cy="152" r="6" fill="#2563eb" />''')
        
    return f'''<g transform="translate({x_start}, 158) skewX(-{slant}) translate(0, -158)">
      {''.join(paths)}
    </g>'''

# 4 Refined Lockup Directions with Perfect Optical Word Spacing (36px)
configs = [
    {
        "id": "v1_lowercase_circle",
        "name": "Yön 1 · Dinamik Küçük Harf (edu.) + Dairesel Nokta",
        "tag": "TAVSİYE EDİLEN — MODERN SAAS",
        "tag_class": "tag-rec",
        "desc": "Düz ve net ağır mimari OXONOM ile 11° ileri eğimli, akıcı ve hareketli edu. kontrastı. Arada ayırıcı çizgi yok, 36px optik nefes aralığı.",
        "fn": lambda x, col: make_kinetic_lowercase(x, 11, col, "circle"),
        "accent": None
    },
    {
        "id": "v2_lowercase_diamond",
        "name": "Yön 2 · Dinamik Küçük Harf (edu.◆) + Merkez Elmas Nokta",
        "tag": "KARAKTERİSTİK İMZA",
        "tag_class": "tag-spec",
        "desc": "Kısaltma noktası, A1 ambleminin kalbindeki akademik içgörü elması (45° diamond) ile aynı formu taşır. Logo ve yazı arasında dahice bir bağ kurar.",
        "fn": lambda x, col: make_kinetic_lowercase(x, 11, col, "diamond"),
        "accent": None
    },
    {
        "id": "v3_azure_accent",
        "name": "Yön 3 · Electric Azure Renk Vurgusu (edu.)",
        "tag": "TEKNOLOJİ & EĞİTİM VURGUSU",
        "tag_class": "tag-spec",
        "desc": "OXONOM kurumsal antrasit/siyah güç taşırken, edu. enerjik küresel teknoloji mavisi (#2563eb) ile parlar.",
        "fn": lambda x, col: make_kinetic_lowercase(x, 11, "#2563eb", "circle"),
        "accent": "#2563eb"
    },
    {
        "id": "v4_uppercase_kinetic",
        "name": "Yön 4 · Dinamik Büyük Harf (EDU.)",
        "tag": "AKADEMİK OTORİTE & HAREKET",
        "tag_class": "tag-spec",
        "desc": "Büyük harf EDU., 11° ileri eğimli hız açısıyla hareket kazanırken, OXONOM ile aynı kurumsal ağırlığı korur.",
        "fn": lambda x, col: make_kinetic_uppercase(x, 11, col, "circle"),
        "accent": None
    }
]

# Generate each SVG & render
for cfg in configs:
    cid = cfg["id"]
    
    # Light (Black on White)
    ox_code, x_end = get_oxonom_perfect(236, "#000000")
    edu_code = cfg["fn"](x_end + 36, "#000000")
    
    svg_light = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 256" width="920" height="256" role="img" aria-labelledby="title-{cid}">
  <title id="title-{cid}">OXONOM edu. — {cfg['name']}</title>
  <!-- A1 Open Folio Nexus Symbol -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)" fill="#000000">
    {sym_shapes}
  </g>
  <!-- Wordmark 'OXONOM edu.' -->
  <g id="wordmark">
    {ox_code}
    {edu_code}
  </g>
</svg>"""
    
    path_l = os.path.join(DIR, f"lockup_{cid}_light.svg")
    with open(path_l, "w") as f:
        f.write(svg_light)
        
    # Dark (White on #090D16)
    ox_code_w, x_end_w = get_oxonom_perfect(236, "#ffffff")
    col_edu_dark = cfg["accent"] if cfg["accent"] else "#ffffff"
    edu_code_w = cfg["fn"](x_end_w + 36, col_edu_dark)
    
    svg_dark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 256" width="920" height="256" role="img" aria-labelledby="title-{cid}-dark">
  <title id="title-{cid}-dark">OXONOM edu. — {cfg['name']} (Dark)</title>
  <rect width="920" height="256" rx="28" fill="#090D16" />
  <!-- A1 Open Folio Nexus Symbol -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)" fill="#ffffff">
    {sym_shapes}
  </g>
  <!-- Wordmark 'OXONOM edu.' -->
  <g id="wordmark">
    {ox_code_w}
    {edu_code_w}
  </g>
</svg>"""
    path_d = os.path.join(DIR, f"lockup_{cid}_dark.svg")
    with open(path_d, "w") as f:
        f.write(svg_dark)
        
    png_l = os.path.join(DIR, f"lockup_{cid}_light.png")
    png_d = os.path.join(DIR, f"lockup_{cid}_dark.png")
    subprocess.run(["python3", RENDER_SCRIPT, path_l, "-o", png_l, "--width", "920", "--height", "256", "--bg", "#ffffff"], check=True)
    subprocess.run(["python3", RENDER_SCRIPT, path_d, "-o", png_d, "--width", "920", "--height", "256"], check=True)
    
    # Copy to artifacts
    subprocess.run(["cp", png_l, os.path.join(ARTIFACTS_DIR, f"{cid}_light.png")], check=True)
    subprocess.run(["cp", png_d, os.path.join(ARTIFACTS_DIR, f"{cid}_dark.png")], check=True)
    print(f"Generated and rendered {cid}")

# HTML Showcase
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OXONOM edu. Lockup Karşılaştırma Panosu</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #090D16;
    color: #F8FAFC;
    padding: 44px;
  }}
  .container {{ max-width: 1400px; margin: 0 auto; }}
  .header {{ text-align: center; margin-bottom: 44px; }}
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
    margin-bottom: 14px;
  }}
  h1 {{ font-size: 32px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 10px; color: #FFFFFF; }}
  p.subtitle {{ font-size: 16px; color: #94A3B8; max-width: 840px; margin: 0 auto; line-height: 1.55; }}
  .grid {{ display: grid; grid-template-columns: 1fr; gap: 36px; }}
  .card {{
    background: #111827;
    border: 1px solid #1F2937;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }}
  .card-header {{
    padding: 20px 28px;
    background: #162032;
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
  .tag {{ font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 700; letter-spacing: 0.04em; }}
  .tag-rec {{ background: #059669; color: #ECFDF5; }}
  .tag-spec {{ background: #2563EB; color: #EFF6FF; }}
  .card-desc {{ font-size: 14px; color: #94A3B8; max-width: 580px; text-align: right; line-height: 1.4; }}
  .card-previews {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 24px;
    gap: 20px;
    background: #0B0F19;
  }}
  .preview-box {{
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }}
  .preview-box.light {{ background: #FFFFFF; border: 1px solid #E2E8F0; }}
  .preview-box.dark {{ background: #06090F; border: 1px solid #1E293B; }}
  .preview-box img {{ max-width: 100%; height: auto; display: block; }}
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
    <div class="badge">A1 · The Open Folio Nexus Lockup Mimarisi</div>
    <h1>OXONOM edu. Tipografi & Bütünlük Tasarımları</h1>
    <p class="subtitle">
      Aradaki ayırıcı çizgi kaldırıldı. <strong>OXONOM</strong> düz, geometrik ve ağır bold (heavy) mimariye geçirildi. <strong>edu.</strong> kelimesi 11° ileri eğimli hız/hareket açısı ve kısaltma noktasıyla tek bir kurumsal gövdede birleştirildi.
    </p>
  </div>
  <div class="grid">
"""

for cfg in configs:
    cid = cfg["id"]
    html += f"""
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>{cfg['name']}</span>
          <span class="tag {cfg['tag_class']}">{cfg['tag']}</span>
        </div>
        <div class="card-desc">{cfg['desc']}</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin (Light / Pure Vector)</div>
          <img src="{DIR}/lockup_{cid}_light.png" alt="{cid} Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Koyu Zemin (Dark / Pure Vector)</div>
          <img src="{DIR}/lockup_{cid}_dark.png" alt="{cid} Dark">
        </div>
      </div>
    </div>
"""

html += """
  </div>
</div>
</body>
</html>
"""

html_file = os.path.join(DIR, "lockup_showcase_perfect.html")
with open(html_file, "w") as f:
    f.write(html)

showcase_png = os.path.join(ARTIFACTS_DIR, "oxonom_edu_final_showcase.png")
subprocess.run(["python3", RENDER_SCRIPT, html_file, "-o", showcase_png, "--width", "1440", "--height", "2150"], check=True)
print(f"Final showcase board generated: {showcase_png}")
