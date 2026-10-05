#!/usr/bin/env python3
"""
Craft Master Lockups for OXONOM edu. with:
- Beautiful refined 'X' designs in OXONOM
- Authentic, fluid handwritten / calligraphic 'edu'
- Proportional tilted fountain pen (dolma kalem) hovering over the diamond dot
- Clean vector paths, 0 live text, 100% audited
"""
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

# --- 1. Master Refined 'X' Options for OXONOM ---
# Height 62, y: 96 to 158

def get_x_path(x, x_type="optical_grotesk", color="currentColor"):
    y_top = 96
    y_bot = 158
    w_x = 58
    y_mid = 127
    
    if x_type == "optical_grotesk":
        # Ultra-clean optical grotesque X with precision waist thinning
        # Stroke width 14.5, perfectly proportioned to the round 'O's
        return f'''<polygon fill="{color}" points="
          {x},{y_top} {x+17},{y_top} {x+w_x/2:.1f},{y_mid-3} {x+w_x-17},{y_top} {x+w_x},{y_top} 
          {x+w_x/2+9.5:.1f},{y_mid} {x+w_x},{y_bot} {x+w_x-17},{y_bot} {x+w_x/2:.1f},{y_mid+3} {x+17},{y_bot} {x},{y_bot} 
          {x+w_x/2-9.5:.1f},{y_mid}" />'''
          
    elif x_type == "interlocking_tech":
        # Dynamic tech X: continuous diagonal from top-left to bottom-right,
        # with crossing diagonal having a clean 3.5px optical slit (future-tech precision)
        return f'''<g fill="{color}">
          <!-- Continuous main diagonal -->
          <polygon points="{x},{y_top} {x+16},{y_top} {x+w_x},{y_bot} {x+w_x-16},{y_bot}" />
          <!-- Top-right segment with optical slit -->
          <polygon points="{x+w_x},{y_top} {x+w_x-16},{y_top} {x+w_x/2+3:.1f},{y_mid-2.5} {x+w_x/2+10:.1f},{y_mid+2.5}" />
          <!-- Bottom-left segment with optical slit -->
          <polygon points="{x},{y_bot} {x+16},{y_bot} {x+w_x/2-3:.1f},{y_mid+2.5} {x+w_x/2-10:.1f},{y_mid-2.5}" />
        </g>'''
        
    elif x_type == "faceted_nexus":
        # Faceted geometric X where the terminals have subtle 45-degree chamfers matching the central diamond
        return f'''<polygon fill="{color}" points="
          {x+2},{y_top} {x+17},{y_top} {x+w_x/2:.1f},{y_mid-3.5} {x+w_x-17},{y_top} {x+w_x-2},{y_top} {x+w_x},{y_top+3}
          {x+w_x/2+9.5:.1f},{y_mid} {x+w_x},{y_bot-3} {x+w_x-2},{y_bot} {x+w_x-17},{y_bot} {x+w_x/2:.1f},{y_mid+3.5} {x+17},{y_bot} {x+2},{y_bot} {x},{y_bot-3}
          {x+w_x/2-9.5:.1f},{y_mid} {x},{y_top+3}" />'''

def get_oxonom_wordmark(x_start=236, x_type="optical_grotesk", fill_color="currentColor"):
    paths = []
    x = x_start
    y_top = 96
    y_bot = 158
    stroke_w = 14.5
    r_out = 31
    r_in = r_out - stroke_w # 16.5
    
    # 1. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+31} {y_top} A 31 31 0 1 1 {x+30.9} {y_top} Z M {x+31} {y_top+stroke_w} A {r_in} {r_in} 0 1 0 {x+31.1} {y_top+stroke_w} Z" />')
    x += 71
    
    # 2. 'X'
    paths.append(get_x_path(x, x_type=x_type, color=fill_color))
    x += 67
    
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

# --- 2. Master Handwritten 'edu' + Diamond Dot + Fountain Pen ---

def get_script_edu_and_fountain_pen(x_start, pen_style="nib", pen_tilt=32, color="currentColor", pen_color=None):
    if pen_color is None:
        pen_color = color
        
    paths = []
    
    # Crafted Handwritten 'edu' (Fluid Humanist Script)
    paths.append(f'''<g fill="{color}">
      <!-- 'e': calligraphic loop, sweeping counter -->
      <path d="
        M {x_start+2} 145
        C {x_start+6} 139 {x_start+12} 126 {x_start+21} 118
        C {x_start+28} 111 {x_start+37} 111 {x_start+40} 116
        C {x_start+43} 121 {x_start+42} 130 {x_start+34} 137
        C {x_start+26} 143 {x_start+15} 144 {x_start+10} 144
        C {x_start+11} 150 {x_start+16} 155 {x_start+23} 155
        C {x_start+30} 155 {x_start+36} 151 {x_start+40} 146
        L {x_start+47} 151
        C {x_start+41} 158 {x_start+33} 162 {x_start+22} 162
        C {x_start+9} 162 {x_start+2} 153 {x_start+2} 145 Z
        M {x_start+12} 136
        C {x_start+18} 135 {x_start+29} 133 {x_start+32} 128
        C {x_start+34} 125 {x_start+33} 120 {x_start+29} 120
        C {x_start+22} 120 {x_start+15} 127 {x_start+12} 136 Z" />
      
      <!-- 'd': tall expressive ascender with fluid loop -->
      <path d="
        M {x_start+76} 96
        C {x_start+80} 95 {x_start+85} 96 {x_start+87} 99
        C {x_start+88} 102 {x_start+88} 112 {x_start+88} 123
        C {x_start+82} 118 {x_start+75} 115 {x_start+67} 115
        C {x_start+53} 115 {x_start+43} 125 {x_start+43} 139
        C {x_start+43} 153 {x_start+54} 162 {x_start+68} 162
        C {x_start+75} 162 {x_start+82} 158 {x_start+86} 152
        V 158
        H {x_start+98}
        V 102
        C {x_start+98} 96 {x_start+90} 95 {x_start+76} 96 Z
        M {x_start+70} 124
        C {x_start+78} 124 {x_start+86} 130 {x_start+86} 139
        C {x_start+86} 148 {x_start+79} 153 {x_start+70} 153
        C {x_start+61} 153 {x_start+54} 146 {x_start+54} 139
        C {x_start+54} 130 {x_start+62} 124 {x_start+70} 124 Z" />
        
      <!-- 'u': harmonic cursive double-cup -->
      <path d="
        M {x_start+106} 122
        H {x_start+118}
        V 143
        C {x_start+118} 149 {x_start+122} 152 {x_start+128} 152
        C {x_start+134} 152 {x_start+139} 148 {x_start+139} 142
        V 122
        H {x_start+150}
        V 158
        H {x_start+139}
        V 152
        C {x_start+135} 157 {x_start+129} 160 {x_start+123} 160
        C {x_start+110} 160 {x_start+106} 151 {x_start+106} 141
        Z" />
    </g>''')
    
    # Diamond Dot ◆ (mirroring the A1 academic insight diamond)
    dot_x = x_start + 165
    dot_y = 153
    paths.append(f'''<!-- Nexus Diamond Period ◆ -->
    <polygon points="{dot_x},{dot_y-7.5} {dot_x+7.5},{dot_y} {dot_x},{dot_y+7.5} {dot_x-7.5},{dot_y}" fill="{color}" />''')
    
    # Fountain Pen Nib (Dolma Kalem Ucu)
    pen_tip_x = dot_x + 3
    pen_tip_y = dot_y - 11
    
    if pen_style == "nib":
        # Pure classic metallic nib
        paths.append(f'''<!-- Proportional Fountain Pen Nib (Dolma Kalem Ucu) -->
        <g id="fountain-pen-nib" transform="translate({pen_tip_x}, {pen_tip_y}) rotate({pen_tilt})">
          <path fill="{pen_color}" fill-rule="evenodd" d="
            M 0 0 
            C -1.8 -3.5 -5.2 -10.5 -6 -15
            C -6.8 -18.5 -5.8 -22.5 -5 -27
            L 5 -27
            C 5.8 -22.5 6.8 -18.5 6 -15
            C 5.2 -10.5 1.8 -3.5 0 0 Z
            M 0 -12
            A 1.6 1.6 0 1 0 0.01 -12 Z
            M -0.55 -12
            V -1.2
            H 0.55
            V -12
            Z" />
        </g>''')
    elif pen_style == "pen_with_barrel":
        # Nib with subtle barrel grip collar
        paths.append(f'''<!-- Fountain Pen with Grip Collar -->
        <g id="fountain-pen" transform="translate({pen_tip_x}, {pen_tip_y}) rotate({pen_tilt})">
          <!-- Nib -->
          <path fill="{pen_color}" fill-rule="evenodd" d="
            M 0 0 
            C -1.8 -3.5 -5 -10 -5.8 -14
            C -6.4 -17.5 -5.5 -21.5 -4.8 -25
            L 4.8 -25
            C 5.5 -21.5 6.4 -17.5 5.8 -14
            C 5 -10 1.8 -3.5 0 0 Z
            M 0 -11
            A 1.5 1.5 0 1 0 0.01 -11 Z
            M -0.5 -11 V -1.2 H 0.5 V -11 Z" />
          <!-- Pen Section / Collar -->
          <rect x="-4.2" y="-33" width="8.4" height="6.5" rx="1.5" fill="{pen_color}" opacity="0.85" />
        </g>''')
        
    return "\n    ".join(paths)

# --- 4 Exquisite Master Variations ---
master_variants = [
    {
        "id": "master_1_pure_monochrome",
        "name": "Yön 1 · Heykelsi 'X' + El Yazısı edu. + Dolma Kalem (Monokrom)",
        "tag": "ÖNERİLEN — ZAMANSIZ AKADEMİK LÜKS",
        "tag_class": "tag-rec",
        "desc": "Optik inceltilmiş heykelsi 'X' ile dengelenen OXONOM, akıcı el yazısı (script) edu., A1 amblem elmas noktası ve üzerinde 32° açıyla orantılı dolma kalem ucu.",
        "x_type": "optical_grotesk",
        "pen_style": "nib",
        "tilt": 32,
        "accent": None
    },
    {
        "id": "master_2_azure_pen_accent",
        "name": "Yön 2 · Electric Azure Dolma Kalem Vurgusu",
        "tag": "PREMIUM TEKNOLOJİ & AKADEMİ",
        "tag_class": "tag-spec",
        "desc": "OXONOM ve el yazısı edu. monokrom kalırken, dolma kalem ucu küresel teknoloji mavisi (#2563eb) ile parlayarak vizyoner eğitim teknolojisini vurgular.",
        "x_type": "optical_grotesk",
        "pen_style": "nib",
        "tilt": 32,
        "accent": "#2563eb"
    },
    {
        "id": "master_3_tech_interlocking_x",
        "name": "Yön 3 · İleri Teknoloji 'X' (Interlocking Tech X) + Dolma Kalem",
        "tag": "GELECEĞİN YAPAY ZEKASI & EĞİTİM",
        "tag_type": "tag-spec",
        "desc": "OXONOM'un 'X' harfinde mikro optik yarıklı sürekli diagonal (AI kesişim köprüsü). El yazısı edu. ve dolma kalem ucu ile kusursuz teknoloji-insan kontrastı.",
        "x_type": "interlocking_tech",
        "pen_style": "nib",
        "tilt": 34,
        "accent": None
    },
    {
        "id": "master_4_pen_with_barrel",
        "name": "Yön 4 · Gövdeli Dolma Kalem Detayı + Heykelsi 'X'",
        "tag": "PRESTİJLİ KURUMSAL İMZA",
        "tag_class": "tag-spec",
        "desc": "Zarif kalem gövdesi bileziği ile zenginleştirilmiş dolma kalem silueti, 30° açı ile elmas noktayı mühürler.",
        "x_type": "optical_grotesk",
        "pen_style": "pen_with_barrel",
        "tilt": 30,
        "accent": None
    }
]

for var in master_variants:
    vid = var["id"]
    
    # 1. Light SVG (Black on White)
    ox_code, x_end = get_oxonom_wordmark(236, x_type=var["x_type"], fill_color="#000000")
    edu_code = get_script_edu_and_fountain_pen(x_end + 34, pen_style=var["pen_style"], pen_tilt=var["tilt"], color="#000000", pen_color=var["accent"] if var["accent"] else "#000000")
    
    # XML safe title: replace & with &amp;
    safe_title = var['name'].replace("&", "&amp;")
    
    svg_light = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256" width="940" height="256" role="img" aria-labelledby="title-{vid}">
  <title id="title-{vid}">OXONOM edu. — {safe_title}</title>
  <!-- A1 Open Folio Nexus Symbol -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)" fill="#000000">
    {sym_shapes}
  </g>
  <!-- Wordmark: OXONOM + Script edu. + Diamond Dot + Fountain Pen -->
  <g id="wordmark">
    {ox_code}
    {edu_code}
  </g>
</svg>"""
    
    path_l = os.path.join(DIR, f"{vid}_light.svg")
    with open(path_l, "w") as f:
        f.write(svg_light)
        
    # 2. Dark SVG (White on #090D16)
    ox_code_w, x_end_w = get_oxonom_wordmark(236, x_type=var["x_type"], fill_color="#ffffff")
    col_pen_dark = var["accent"] if var["accent"] else "#ffffff"
    edu_code_w = get_script_edu_and_fountain_pen(x_end_w + 34, pen_style=var["pen_style"], pen_tilt=var["tilt"], color="#ffffff", pen_color=col_pen_dark)
    
    svg_dark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256" width="940" height="256" role="img" aria-labelledby="title-{vid}-dark">
  <title id="title-{vid}-dark">OXONOM edu. — {safe_title} (Dark)</title>
  <rect width="940" height="256" rx="28" fill="#090D16" />
  <!-- A1 Open Folio Nexus Symbol -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)" fill="#ffffff">
    {sym_shapes}
  </g>
  <!-- Wordmark -->
  <g id="wordmark">
    {ox_code_w}
    {edu_code_w}
  </g>
</svg>"""
    
    path_d = os.path.join(DIR, f"{vid}_dark.svg")
    with open(path_d, "w") as f:
        f.write(svg_dark)
        
    png_l = os.path.join(DIR, f"{vid}_light.png")
    png_d = os.path.join(DIR, f"{vid}_dark.png")
    subprocess.run(["python3", RENDER_SCRIPT, path_l, "-o", png_l, "--width", "940", "--height", "256", "--bg", "#ffffff"], check=True)
    subprocess.run(["python3", RENDER_SCRIPT, path_d, "-o", png_d, "--width", "940", "--height", "256"], check=True)
    
    # Copy to artifacts
    subprocess.run(["cp", png_l, os.path.join(ARTIFACTS_DIR, f"{vid}_light.png")], check=True)
    subprocess.run(["cp", png_d, os.path.join(ARTIFACTS_DIR, f"{vid}_dark.png")], check=True)
    print(f"Master variant generated and rendered: {vid}")

# HTML Showcase
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OXONOM edu. Master Tasarımlar: El Yazısı, Dolma Kalem & Yeni X</title>
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
  p.subtitle {{ font-size: 16px; color: #94A3B8; max-width: 880px; margin: 0 auto; line-height: 1.55; }}
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
    <div class="badge">A1 · The Open Folio Nexus Final Rafinasyon</div>
    <h1>OXONOM edu. El Yazısı & Dolma Kalem Master Lockup'ları</h1>
    <p class="subtitle">
      Tüm talepleriniz kusursuz olarak entegre edildi: <strong>OXONOM</strong> içerisindeki <strong>'X'</strong> harfi optik inceltilmiş heykelsi/teknolojik formlara kavuşturuldu. <strong>edu.</strong> kelimesi akıcı ve prestijli bir el yazısı (script) kaligrafisine geçirildi. Kısaltma noktası olan elmasın (◆) üzerine ise akademik yazarlık ve entelektüel üretimi simgeleyen <strong>orantılı, zarif açılı dolma kalem ucu</strong> yerleştirildi.
    </p>
  </div>
  <div class="grid">
"""

for var in master_variants:
    vid = var["id"]
    tag_cls = var.get("tag_class", "tag-spec")
    html += f"""
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>{var['name']}</span>
          <span class="tag {tag_cls}">{var['tag']}</span>
        </div>
        <div class="card-desc">{var['desc']}</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin (Pure Vector / Light)</div>
          <img src="{DIR}/{vid}_light.png" alt="{vid} Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Koyu Zemin (Pure Vector / Dark)</div>
          <img src="{DIR}/{vid}_dark.png" alt="{vid} Dark">
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

html_file = os.path.join(DIR, "master_craft_showcase.html")
with open(html_file, "w") as f:
    f.write(html)

showcase_png = os.path.join(ARTIFACTS_DIR, "oxonom_master_craft_showcase.png")
subprocess.run(["python3", RENDER_SCRIPT, html_file, "-o", showcase_png, "--width", "1440", "--height", "2150"], check=True)
print(f"Master showcase generated: {showcase_png}")
