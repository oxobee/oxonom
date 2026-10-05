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

# --- 1. Beautiful 'X' for OXONOM ---
def make_beautiful_x(x, y_top=96, y_bot=158, style="sculpted", color="currentColor"):
    h = y_bot - y_top
    w_x = 56
    y_mid = y_top + h / 2
    
    if style == "sculpted":
        # Sculpted with optical waist-thinning for high-end typography
        return f'''<polygon fill="{color}" points="
          {x},{y_top} {x+17},{y_top} {x+w_x/2},{y_mid-3} {x+w_x-17},{y_top} {x+w_x},{y_top} 
          {x+w_x/2+9.5},{y_mid} {x+w_x},{y_bot} {x+w_x-17},{y_bot} {x+w_x/2},{y_mid+3} {x+17},{y_bot} {x},{y_bot} 
          {x+w_x/2-9.5},{y_mid}" />'''
    elif style == "architectural":
        # Architectural continuous primary diagonal + cross
        return f'''<polygon fill="{color}" points="
          {x},{y_top} {x+18},{y_top} {x+w_x/2},{y_mid-2.5} {x+w_x-18},{y_top} {x+w_x},{y_top} 
          {x+w_x/2+9},{y_mid} {x+w_x},{y_bot} {x+w_x-18},{y_bot} {x+w_x/2},{y_mid+2.5} {x+18},{y_bot} {x},{y_bot} 
          {x+w_x/2-9},{y_mid}" />'''

def get_oxonom(x_start=236, x_style="sculpted", fill_color="currentColor"):
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
    
    # 2. Refined 'X'
    paths.append(make_beautiful_x(x, y_top, y_bot, style=x_style, color=fill_color))
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

# --- 2. Handwritten / Script 'edu' Styles ---

def make_script_edu_and_pen(x_start, script_type="modern_cursive", color="currentColor", pen_color=None, pen_tilt=32):
    if pen_color is None:
        pen_color = color
        
    paths = []
    
    if script_type == "modern_cursive":
        # Ultra-refined modern cursive script
        # Smooth calligraphic strokes with variable line-modulation
        paths.append(f'''<g fill="{color}">
          <!-- 'e' cursive loop -->
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
          
          <!-- 'd' flowing loop & graceful stem -->
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
            
          <!-- 'u' rhythmic calligraphic wave -->
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
        dot_x = x_start + 165
        dot_y = 153
        
    elif script_type == "fluid_signature":
        # Dynamic angled signature script
        paths.append(f'''<g transform="translate({x_start}, 158) skewX(-13) translate(0, -158)" fill="{color}">
          <!-- 'e' signature -->
          <path d="
            M 2 145
            C 6 139 12 126 21 118
            C 28 111 37 111 40 116
            C 43 121 42 130 34 137
            C 26 143 15 144 10 144
            C 11 150 16 155 23 155
            C 30 155 36 151 40 146
            L 47 151
            C 41 158 33 162 22 162
            C 9 162 2 153 2 145 Z
            M 12 136
            C 18 135 29 133 32 128
            C 34 125 33 120 29 120
            C 22 120 15 127 12 136 Z" />
          <!-- 'd' signature -->
          <path d="
            M 76 96 H 88 V 123
            C 82 118 75 115 67 115
            C 53 115 43 125 43 139
            C 43 153 54 162 68 162
            C 75 162 82 158 86 152
            V 158 H 98 V 96 H 88 Z
            M 70 124
            C 78 124 86 130 86 139
            C 86 148 79 153 70 153
            C 61 153 54 146 54 139
            C 54 130 62 124 70 124 Z" />
          <!-- 'u' signature -->
          <path d="
            M 106 122 H 118 V 143
            C 118 149 122 152 128 152
            C 134 152 139 148 139 142
            V 122 H 150 V 158 H 139 V 152
            C 135 157 129 160 123 160
            C 110 160 106 151 106 141 Z" />
        </g>''')
        dot_x = x_start + 165
        dot_y = 153

    # --- 3. The Nexus Diamond Dot ◆ ---
    paths.append(f'''<!-- Nexus Diamond Period ◆ -->
    <polygon points="{dot_x},{dot_y-7.5} {dot_x+7.5},{dot_y} {dot_x},{dot_y+7.5} {dot_x-7.5},{dot_y}" fill="{color}" />''')
    
    # --- 4. Tilted Fountain Pen Nib (Dolma Kalem Ucu) ---
    # Hovering gracefully above the diamond dot at tilt angle (30-36 deg)
    # Scaled to be delicate and proportional (~26px total height)
    pen_tip_x = dot_x + 2
    pen_tip_y = dot_y - 12
    
    pen_svg = f'''<!-- Proportional Fountain Pen Nib (Dolma Kalem Ucu) -->
    <g id="fountain-pen" transform="translate({pen_tip_x}, {pen_tip_y}) rotate({pen_tilt})">
      <!-- Metallic nib body -->
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
    </g>'''
    paths.append(pen_svg)
    
    return "\n    ".join(paths)

# --- Variations to Produce ---
variants = [
    {
        "id": "opt_a_modern_script_pen",
        "name": "Yön A · Modern El Yazısı (edu.) + Dolma Kalem + Elmas Nokta",
        "tag": "TAVSİYE EDİLEN — RAFİNE VE AKICI",
        "tag_class": "tag-rec",
        "desc": "Optik thinned heykelsi 'X', akıcı modern el yazısı (script) edu., A1 amblem elmas noktası ve üzerinde zarif açılı dolma kalem ucu.",
        "x_style": "sculpted",
        "script": "modern_cursive",
        "tilt": 32,
        "accent": None
    },
    {
        "id": "opt_b_azure_pen_accent",
        "name": "Yön B · Electric Azure Dolma Kalem & El Yazısı Vurgusu",
        "tag": "PREMIUM TEKNOLOJİ & AKADEMİ",
        "tag_class": "tag-spec",
        "desc": "Ağır kurumsal OXONOM monokrom kalırken; dolma kalem ucu ve el yazısı edu. canlı küresel teknoloji mavisi (#2563eb) ile parlar.",
        "x_style": "sculpted",
        "script": "modern_cursive",
        "tilt": 32,
        "accent": "#2563eb"
    },
    {
        "id": "opt_c_signature_pen",
        "name": "Yön C · Dinamik İmza El Yazısı (edu.) + 38° Açılı Kalem",
        "tag": "KARAKTERİSTİK DİNAMİZM",
        "tag_class": "tag-spec",
        "desc": "13° ileri eğimli imza kaligrafisi, 38° açıyla noktaya doğru hamle yapan dolma kalem ucu ile yüksek hareket hissi.",
        "x_style": "architectural",
        "script": "fluid_signature",
        "tilt": 38,
        "accent": None
    },
    {
        "id": "opt_d_monochrome_pen_sharp",
        "name": "Yön D · Mimari 'X' + Klasik Dikey Açı Dolma Kalem",
        "tag": "ZAMANSIZ MİNİMALİZM",
        "tag_class": "tag-spec",
        "desc": "Daha keskin mimari X kesimi, 25° açılı sade dolma kalem duruşu ve saf siyah/beyaz monokrom mimari.",
        "x_style": "architectural",
        "script": "modern_cursive",
        "tilt": 25,
        "accent": None
    }
]

for var in variants:
    vid = var["id"]
    
    # 1. Light SVG
    ox_code, x_end = get_oxonom(236, x_style=var["x_style"], fill_color="#000000")
    edu_code = make_script_edu_and_pen(x_end + 34, script_type=var["script"], color="#000000", pen_color=var["accent"] if var["accent"] else "#000000", pen_tilt=var["tilt"])
    
    svg_light = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256" width="940" height="256" role="img" aria-labelledby="title-{vid}">
  <title id="title-{vid}">OXONOM edu. — {var['name']}</title>
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
        
    # 2. Dark SVG
    ox_code_w, x_end_w = get_oxonom(236, x_style=var["x_style"], fill_color="#ffffff")
    col_edu_dark = var["accent"] if var["accent"] else "#ffffff"
    edu_code_w = make_script_edu_and_pen(x_end_w + 34, script_type=var["script"], color="#ffffff" if not var["accent"] else "#ffffff", pen_color=col_edu_dark, pen_tilt=var["tilt"])
    
    svg_dark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256" width="940" height="256" role="img" aria-labelledby="title-{vid}-dark">
  <title id="title-{vid}-dark">OXONOM edu. — {var['name']} (Dark)</title>
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
    print(f"Generated {vid}")

# HTML Showcase
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OXONOM edu. El Yazısı & Dolma Kalem Lockup Tasarımları</title>
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
  p.subtitle {{ font-size: 16px; color: #94A3B8; max-width: 860px; margin: 0 auto; line-height: 1.55; }}
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
    <div class="badge">A1 · The Open Folio Nexus Refinement</div>
    <h1>OXONOM edu. El Yazısı & Dolma Kalem Detayı</h1>
    <p class="subtitle">
      Talepleriniz doğrultusunda: <strong>OXONOM</strong> içerisindeki <strong>'X'</strong> optik inceltme ile heykelsi ve daha estetik bir forma kavuşturuldu. <strong>edu.</strong> kelimesi akıcı ve zarif bir el yazısı (script) kaligrafisine geçirildi. Kısaltma noktası (elmas ◆) üzerine akademik yazarlık ve eğitimi simgeleyen orantılı, hafif açılı bir <strong>dolma kalem ucu</strong> entegre edildi.
    </p>
  </div>
  <div class="grid">
"""

for var in variants:
    vid = var["id"]
    html += f"""
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>{var['name']}</span>
          <span class="tag {var['tag_class']}">{var['tag']}</span>
        </div>
        <div class="card-desc">{var['desc']}</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin (Light / Pure Vector)</div>
          <img src="{DIR}/{vid}_light.png" alt="{vid} Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Koyu Zemin (Dark / Pure Vector)</div>
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

html_file = os.path.join(DIR, "handwritten_pen_showcase.html")
with open(html_file, "w") as f:
    f.write(html)

showcase_png = os.path.join(ARTIFACTS_DIR, "oxonom_handwritten_pen_showcase.png")
subprocess.run(["python3", RENDER_SCRIPT, html_file, "-o", showcase_png, "--width", "1440", "--height", "2150"], check=True)
print(f"Showcase generated: {showcase_png}")
