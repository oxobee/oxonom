#!/usr/bin/env python3
"""
Master Lockup Generator for OXONOM edu:
1. Symbol: A1 · The Open Folio Nexus
2. OXONOM: Straight, uniform, heavy bold geometric sans ('X' is the same font as O, N, M)
3. edu: Exact geometric ribbon ligature from the user's reference image
4. Options with & without the diamond dot & proportional tilted fountain pen
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

# Read smooth_edu.svg inner path
with open(os.path.join(DIR, "smooth_edu.svg")) as f:
    edu_svg_raw = f.read()
p_tag = edu_svg_raw.find('<path')
d_start = edu_svg_raw.find('d="', p_tag) + 3
d_end = edu_svg_raw.find('"', d_start)
edu_path_d = edu_svg_raw[d_start:d_end]

# 1. Straight Bold OXONOM ('X' has identical font styling as O, N, M)
def get_straight_oxonom(x_start=236, fill_color="currentColor"):
    paths = []
    x = x_start
    y_top = 96
    y_bot = 158
    h = 62
    stroke_w = 14.5
    r_out = 31
    r_in = r_out - stroke_w # 16.5
    
    # 1. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+31} {y_top} A 31 31 0 1 1 {x+30.9} {y_top} Z M {x+31} {y_top+stroke_w} A {r_in} {r_in} 0 1 0 {x+31.1} {y_top+stroke_w} Z" />')
    x += 71
    
    # 2. 'X' - Identical straight bold geometric font
    w_x = 56
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},{y_top} {x+17},{y_top} {x+w_x/2:.1f},{y_top+h/2-2:.1f} {x+w_x-17},{y_top} {x+w_x},{y_top} 
      {x+w_x/2+10:.1f},{y_top+h/2:.1f} {x+w_x},{y_bot} {x+w_x-17},{y_bot} {x+w_x/2:.1f},{y_top+h/2+2:.1f} {x+17},{y_bot} {x},{y_bot} 
      {x+w_x/2-10:.1f},{y_top+h/2:.1f}" />''')
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

# 2. Geometric Ribbon 'edu' Placement
# Reference bounds: x: [32, 381] (w=349), y: [62, 234] (h=172). Baseline is at y=234.
# We want the baseline of edu to align with OXONOM baseline (y=158).
# Scale factor S = 0.44.
# Shift:
# x_edu = target_x - 32 * S
# y_edu = 158 - 234 * S
SCALE = 0.44

def get_ribbon_edu(x_start, color="currentColor", with_dot=True, with_pen=True, pen_color=None):
    if pen_color is None:
        pen_color = color
        
    s = SCALE
    tx = x_start - 32 * s
    ty = 158 - 234 * s
    
    # The end of 'u' in reference is at x = 381.
    # Scaled end x:
    end_x = tx + 381 * s
    
    elements = []
    # Scaled Ribbon edu path
    elements.append(f'''<g id="ribbon-edu" transform="translate({tx:.2f}, {ty:.2f}) scale({s:.4f})" fill="{color}">
      <path fill-rule="evenodd" d="{edu_path_d}" />
    </g>''')
    
    if with_dot:
        # Diamond Dot ◆ (45-degree diamond, matching A1 center diamond)
        dot_x = end_x + 16
        dot_y = 152
        elements.append(f'''<!-- Diamond Period ◆ -->
        <polygon points="{dot_x:.1f},{dot_y-6:.1f} {dot_x+6:.1f},{dot_y:.1f} {dot_x:.1f},{dot_y+6:.1f} {dot_x-6:.1f},{dot_y:.1f}" fill="{color}" />''')
        
        if with_pen:
            # Proportional Tilted Fountain Pen Nib
            pen_tip_x = dot_x + 2.5
            pen_tip_y = dot_y - 9.5
            pen_angle = 32
            elements.append(f'''<!-- Proportional Fountain Pen Nib (Dolma Kalem Ucu) -->
            <g id="fountain-pen" transform="translate({pen_tip_x:.1f}, {pen_tip_y:.1f}) rotate({pen_angle})">
              <path fill="{pen_color}" fill-rule="evenodd" d="
                M 0 0 
                C -1.6 -3.2 -4.8 -9.5 -5.5 -13.5
                C -6.2 -16.5 -5.3 -20 -4.5 -24
                L 4.5 -24
                C 5.3 -20 6.2 -16.5 5.5 -13.5
                C 4.8 -9.5 1.6 -3.2 0 0 Z
                M 0 -11
                A 1.4 1.4 0 1 0 0.01 -11 Z
                M -0.5 -11 V -1.2 H 0.5 V -11 Z" />
            </g>''')
            
    return "\n    ".join(elements)

# Variations to Generate
configs = [
    {
        "id": "var_1_ribbon_dot_pen_mono",
        "name": "Yön 1 · Ribbon edu + Elmas Nokta + Dolma Kalem (Monokrom)",
        "tag": "TAVSİYE EDİLEN — MASTER BÜTÜNLÜK",
        "tag_class": "tag-rec",
        "desc": "Referansınızdaki 'edu' geometrik şerit bağı, orijinal düz 'X' ile standart OXONOM, elmas kısaltma noktası ve zarif açılı dolma kalem ucu.",
        "with_dot": True,
        "with_pen": True,
        "accent": None
    },
    {
        "id": "var_2_ribbon_azure_pen",
        "name": "Yön 2 · Electric Azure Dolma Kalem Vurgusu",
        "tag": "PREMIUM TEKNOLOJİ & EĞİTİM",
        "tag_class": "tag-spec",
        "desc": "Tüm gövde monokrom kurumsal gücünü korurken, dolma kalem ucu küresel teknoloji mavisi (#2563eb) ile parlar.",
        "with_dot": True,
        "with_pen": True,
        "accent": "#2563eb"
    },
    {
        "id": "var_3_ribbon_dot_only",
        "name": "Yön 3 · Ribbon edu + Sadece Elmas Nokta (◆)",
        "tag": "MİNİMALİST GEOMETRİ",
        "tag_class": "tag-spec",
        "desc": "Dolma kalemsiz, sadece A1 içgörü elmasıyla mühürlenmiş temiz kısaltma noktası.",
        "with_dot": True,
        "with_pen": False,
        "accent": None
    },
    {
        "id": "var_4_ribbon_pure_ref",
        "name": "Yön 4 · Saf Referans Ribbon edu (Noktasız)",
        "tag": "BİREBİR REFERANS LİGATÜR",
        "tag_class": "tag-spec",
        "desc": "Eklediğiniz görseldeki 'edu' formunun noktasız, saf sonsuzluk şeridi halinde OXONOM ile yan yana kullanımı.",
        "with_dot": False,
        "with_pen": False,
        "accent": None
    }
]

for cfg in configs:
    cid = cfg["id"]
    
    # 1. Light (Black on White)
    ox_code, x_end = get_straight_oxonom(236, "#000000")
    edu_code = get_ribbon_edu(x_end + 32, color="#000000", with_dot=cfg["with_dot"], with_pen=cfg["with_pen"], pen_color=cfg["accent"] if cfg["accent"] else "#000000")
    
    safe_title = cfg["name"].replace("&", "&amp;")
    
    svg_light = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256" width="940" height="256" role="img" aria-labelledby="title-{cid}">
  <title id="title-{cid}">OXONOM edu. — {safe_title}</title>
  <!-- A1 Open Folio Nexus Symbol -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)" fill="#000000">
    {sym_shapes}
  </g>
  <!-- Wordmark: Straight OXONOM + Reference Ribbon edu -->
  <g id="wordmark">
    {ox_code}
    {edu_code}
  </g>
</svg>"""
    
    path_l = os.path.join(DIR, f"{cid}_light.svg")
    with open(path_l, "w") as f:
        f.write(svg_light)
        
    # 2. Dark (White on #090D16)
    ox_code_w, x_end_w = get_straight_oxonom(236, "#ffffff")
    col_pen_dark = cfg["accent"] if cfg["accent"] else "#ffffff"
    edu_code_w = get_ribbon_edu(x_end_w + 32, color="#ffffff", with_dot=cfg["with_dot"], with_pen=cfg["with_pen"], pen_color=col_pen_dark)
    
    svg_dark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256" width="940" height="256" role="img" aria-labelledby="title-{cid}-dark">
  <title id="title-{cid}-dark">OXONOM edu. — {safe_title} (Dark)</title>
  <rect width="940" height="256" rx="28" fill="#090D16" />
  <!-- A1 Open Folio Nexus Symbol -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)" fill="#ffffff">
    {sym_shapes}
  </g>
  <!-- Wordmark: Straight OXONOM + Reference Ribbon edu -->
  <g id="wordmark">
    {ox_code_w}
    {edu_code_w}
  </g>
</svg>"""
    
    path_d = os.path.join(DIR, f"{cid}_dark.svg")
    with open(path_d, "w") as f:
        f.write(svg_dark)
        
    png_l = os.path.join(DIR, f"{cid}_light.png")
    png_d = os.path.join(DIR, f"{cid}_dark.png")
    subprocess.run(["python3", RENDER_SCRIPT, path_l, "-o", png_l, "--width", "940", "--height", "256", "--bg", "#ffffff"], check=True)
    subprocess.run(["python3", RENDER_SCRIPT, path_d, "-o", png_d, "--width", "940", "--height", "256"], check=True)
    
    # Copy to artifacts
    subprocess.run(["cp", png_l, os.path.join(ARTIFACTS_DIR, f"{cid}_light.png")], check=True)
    subprocess.run(["cp", png_d, os.path.join(ARTIFACTS_DIR, f"{cid}_dark.png")], check=True)
    print(f"Generated {cid}")

# HTML Showcase Board
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OXONOM edu. Referans Ribbon Font & Düz 'X' Tasarımları</title>
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
    <div class="badge">Referans Görsel & Font Entegrasyonu</div>
    <h1>OXONOM edu. Referans Ribbon Font & Düz 'X' Tasarımları</h1>
    <p class="subtitle">
      Yüklediğiniz görseldeki birbirine bağlı sonsuzluk/şerit bağı mimarisi (Ribbon Ligature) <strong>edu</strong> kelimesine birebir uygulandı. <strong>'X'</strong> harfi ise talimatınız gereği diğer <strong>OXONOM</strong> harfleriyle (O, N, M) tamamen aynı düz, güçlü ve geometrik font ailesine geri getirildi.
    </p>
  </div>
  <div class="grid">
"""

for cfg in configs:
    cid = cfg["id"]
    tag_cls = cfg.get("tag_class", "tag-spec")
    html += f"""
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>{cfg['name']}</span>
          <span class="tag {tag_cls}">{cfg['tag']}</span>
        </div>
        <div class="card-desc">{cfg['desc']}</div>
      </div>
      <div class="card-previews">
        <div class="preview-box light">
          <div class="preview-label">Açık Zemin (Pure Vector / Light)</div>
          <img src="{DIR}/{cid}_light.png" alt="{cid} Light">
        </div>
        <div class="preview-box dark">
          <div class="preview-label">Koyu Zemin (Pure Vector / Dark)</div>
          <img src="{DIR}/{cid}_dark.png" alt="{cid} Dark">
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

html_file = os.path.join(DIR, "ribbon_master_showcase.html")
with open(html_file, "w") as f:
    f.write(html)

showcase_png = os.path.join(ARTIFACTS_DIR, "oxonom_ribbon_master_showcase.png")
subprocess.run(["python3", RENDER_SCRIPT, html_file, "-o", showcase_png, "--width", "1440", "--height", "2150"], check=True)
print(f"Master ribbon showcase generated: {showcase_png}")
