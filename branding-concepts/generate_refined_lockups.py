#!/usr/bin/env python3
import os
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"
AUDIT_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/svg_audit.py"

# Read A1 symbol inner geometry
with open(os.path.join(DIR, "concept-a1-folio.svg")) as f:
    sym_raw = f.read()

# Extract the inner shapes inside <g fill="#000000">
# The A1 file has paths and polygon
p_start = sym_raw.find("<path")
p_end = sym_raw.rfind("</g>")
sym_shapes = sym_raw[p_start:p_end]

# --- 1. Master OXONOM Straight Bold (Height: 64, Baseline: 160, Top: 96) ---
def get_oxonom_svg(x_start=246, fill_color="currentColor"):
    paths = []
    x = x_start
    h = 64
    y_top = 96
    stroke_w = 15.5
    r_out = 32
    r_in = r_out - stroke_w # 16.5
    
    # 1. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+32} 96 A 32 32 0 1 1 {x+31.9} 96 Z M {x+32} {96+stroke_w} A {r_in} {r_in} 0 1 0 {x+32.1} {96+stroke_w} Z" />')
    x += 73
    
    # 2. 'X'
    w_x = 58
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},96 {x+17},96 {x+29},113 {x+41},96 {x+58},96 
      {x+38},128 {x+58},160 {x+41},160 {x+29},143 {x+17},160 {x},160 
      {x+20},128" />''')
    x += 67
    
    # 3. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+32} 96 A 32 32 0 1 1 {x+31.9} 96 Z M {x+32} {96+stroke_w} A {r_in} {r_in} 0 1 0 {x+32.1} {96+stroke_w} Z" />')
    x += 73
    
    # 4. 'N'
    w_n = 56
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},96 {x+15.5},96 {x+w_n-15.5},142 {x+w_n-15.5},96 {x+w_n},96 
      {x+w_n},160 {x+w_n-15.5},160 {x+15.5},114 {x+15.5},160 {x},160" />''')
    x += 65
    
    # 5. 'O'
    paths.append(f'<path fill="{fill_color}" fill-rule="evenodd" d="M {x+32} 96 A 32 32 0 1 1 {x+31.9} 96 Z M {x+32} {96+stroke_w} A {r_in} {r_in} 0 1 0 {x+32.1} {96+stroke_w} Z" />')
    x += 73
    
    # 6. 'M'
    w_m = 68
    paths.append(f'''<polygon fill="{fill_color}" points="
      {x},96 {x+15.5},96 {x+34},136 {x+52.5},96 {x+68},96 
      {x+68},160 {x+52.5},160 {x+52.5},120 {x+38},148 {x+30},148 {x+15.5},120 {x+15.5},160 {x},160" />''')
    x += w_m
    
    return "\n    ".join(paths), x

# --- 2. Dynamic edu. Variations (Forward Slant, Fluid, Kinetic Dot) ---

def get_edu_lowercase_kinetic(x_start, dot_type="circle", slant=12, color="currentColor"):
    paths = []
    lx = 0
    
    # 'e' (Height 114 to 160, stroke 13)
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx+22} 114 C {lx+36} 114 {lx+44} 123 {lx+44} 136 C {lx+44} 138 {lx+44} 140 {lx+43} 140 H {lx+12} C {lx+13} 147 {lx+18} 151 {lx+26} 151 C {lx+33} 151 {lx+38} 148 {lx+41} 143 L {lx+48} 150 C {lx+43} 158 {lx+35} 161 {lx+25} 161 C {lx+11} 161 {lx} 150 {lx} 137 C {lx} 124 {lx+10} 114 {lx+22} 114 Z
      M {lx+12} 130 H {lx+32} C {lx+32} 124 {lx+28} 122 {lx+22} 122 C {lx+16} 122 {lx+13} 125 {lx+12} 130 Z" />''')
    lx += 50
    
    # 'd' (Bowl 114 to 160, stem from 96 to 160, stroke 13)
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx+30} 96 H {lx+42} V 160 H {lx+30} V 153 C {lx+26} 158 {lx+20} 161 {lx+14} 161 C {lx+5} 161 {lx} 151 {lx} 137 C {lx} 124 {lx+5} 114 {lx+15} 114 C {lx+21} 114 {lx+26} 117 {lx+30} 122 Z
      M {lx+21} 123 C {lx+14} 123 {lx+11} 129 {lx+11} 137 C {lx+11} 145 {lx+15} 151 {lx+21} 151 C {lx+27} 151 {lx+31} 145 {lx+31} 137 C {lx+31} 129 {lx+27} 123 {lx+21} 123 Z" />''')
    lx += 48
    
    # 'u' (Height 114 to 160, stroke 13)
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx} 114 H {lx+12} V 144 C {lx+12} 150 {lx+16} 152 {lx+21} 152 C {lx+26} 152 {lx+30} 149 {lx+30} 144 V 114 H {lx+42} V 160 H {lx+31} V 153 C {lx+28} 158 {lx+22} 161 {lx+16} 161 C {lx+5} 161 {lx} 151 {lx} 140 Z" />''')
    lx += 48
    
    # Dot '.'
    if dot_type == "circle":
        paths.append(f'''<circle cx="{lx+8}" cy="154" r="6.5" fill="{color}" />''')
    elif dot_type == "diamond":
        paths.append(f'''<polygon points="{lx+8},145 {lx+16},153 {lx+8},161 {lx},153" fill="{color}" />''')
        
    group_svg = f'''<g transform="translate({x_start}, 0) skewX(-{slant})">
      {''.join(paths)}
    </g>'''
    return group_svg

def get_edu_uppercase_kinetic(x_start, slant=12, color="currentColor"):
    paths = []
    lx = 0
    # E
    paths.append(f'''<polygon fill="{color}" points="
      {lx},96 {lx+36},96 {lx+36},109 {lx+14},109 
      {lx+14},121 {lx+32},121 {lx+32},133 {lx+14},133 
      {lx+14},147 {lx+37},147 {lx+37},160 {lx},160" />''')
    lx += 48
    
    # D
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx} 96 H {lx+22} C {lx+40} 96 {lx+47} 108 {lx+47} 128 C {lx+47} 148 {lx+40} 160 {lx+22} 160 H {lx} Z
      M {lx+14} 109 V 147 H {lx+21} C {lx+30} 147 {lx+33} 140 {lx+33} 128 C {lx+33} 116 {lx+30} 109 {lx+21} 109 Z" />''')
    lx += 58
    
    # U
    paths.append(f'''<path fill="{color}" fill-rule="evenodd" d="
      M {lx} 96 H {lx+14} V 136 C {lx+14} 144 {lx+18} 148 {lx+24} 148 C {lx+30} 148 {lx+34} 144 {lx+34} 136 V 96 H {lx+48} V 136 C {lx+48} 153 {lx+37} 161 {lx+24} 161 C {lx+10} 161 {lx} 153 {lx} 136 Z" />''')
    lx += 54
    
    # Dot '.'
    paths.append(f'''<circle cx="{lx+7}" cy="153.5" r="6.5" fill="{color}" />''')
    
    return f'''<g transform="translate({x_start}, 0) skewX(-{slant})">
      {''.join(paths)}
    </g>'''

# --- Generate the 4 Variants ---
variants = [
    {
        "id": "opt1_lowercase_kinetic",
        "name": "Opt 1 · Kinetic Lowercase (edu.)",
        "desc": "Düz Bold OXONOM + 12° İleri Eğimli Dinamik edu. + Yuvarlak Nokta",
        "maker": lambda x, col: get_edu_lowercase_kinetic(x, dot_type="circle", slant=12, color=col),
        "accent": None
    },
    {
        "id": "opt2_diamond_dot",
        "name": "Opt 2 · Nexus Diamond Dot (edu.◆)",
        "desc": "Düz Bold OXONOM + Dinamik edu. + A1 Merkez Elmasını Yansıtan Nokta",
        "maker": lambda x, col: get_edu_lowercase_kinetic(x, dot_type="diamond", slant=12, color=col),
        "accent": None
    },
    {
        "id": "opt3_tech_azure",
        "name": "Opt 3 · Electric Azure Accent (edu.)",
        "desc": "Düz Bold OXONOM + Elektrik Mavi (#2563eb) Dinamik edu.",
        "maker": lambda x, col: get_edu_lowercase_kinetic(x, dot_type="circle", slant=12, color="#2563eb"),
        "accent": "#2563eb"
    },
    {
        "id": "opt4_uppercase_kinetic",
        "name": "Opt 4 · Kinetic All-Caps (EDU.)",
        "desc": "Düz Bold OXONOM + 12° İleri Eğimli Dinamik Büyük Harf EDU.",
        "maker": lambda x, col: get_edu_uppercase_kinetic(x, slant=12, color=col),
        "accent": None
    }
]

for var in variants:
    vid = var["id"]
    # 1. Light version (black text, transparent)
    ox_code, x_end = get_oxonom_svg(246, fill_color="#000000")
    edu_code = var["maker"](x_end + 24, "#000000")
    
    svg_light = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 256" width="880" height="256" role="img" aria-labelledby="title-{vid}">
  <title id="title-{vid}">OXONOM edu. — {var['name']}</title>
  <!-- Symbol -->
  <g id="symbol" transform="translate(24, 28) scale(0.78125)" fill="#000000">
    {sym_shapes}
  </g>
  <!-- Wordmark -->
  <g id="wordmark">
    {ox_code}
    {edu_code}
  </g>
</svg>"""
    
    svg_path_light = os.path.join(DIR, f"lockup_{vid}_light.svg")
    with open(svg_path_light, "w") as f:
        f.write(svg_light)
        
    # 2. Dark version (white text on #090D16)
    ox_code_w, x_end_w = get_oxonom_svg(246, fill_color="#ffffff")
    edu_col_dark = var["accent"] if var["accent"] else "#ffffff"
    edu_code_w = var["maker"](x_end_w + 24, edu_col_dark)
    
    svg_dark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 256" width="880" height="256" role="img" aria-labelledby="title-{vid}-dark">
  <title id="title-{vid}-dark">OXONOM edu. — {var['name']} (Dark)</title>
  <rect width="880" height="256" rx="28" fill="#090D16" />
  <!-- Symbol -->
  <g id="symbol" transform="translate(24, 28) scale(0.78125)" fill="#ffffff">
    {sym_shapes}
  </g>
  <!-- Wordmark -->
  <g id="wordmark">
    {ox_code_w}
    {edu_code_w}
  </g>
</svg>"""
    
    svg_path_dark = os.path.join(DIR, f"lockup_{vid}_dark.svg")
    with open(svg_path_dark, "w") as f:
        f.write(svg_dark)
        
    # Render PNGs
    png_light = os.path.join(DIR, f"lockup_{vid}_light.png")
    png_dark = os.path.join(DIR, f"lockup_{vid}_dark.png")
    subprocess.run(["python3", RENDER_SCRIPT, svg_path_light, "-o", png_light, "--width", "880", "--height", "256", "--bg", "#ffffff"], check=True)
    subprocess.run(["python3", RENDER_SCRIPT, svg_path_dark, "-o", png_dark, "--width", "880", "--height", "256"], check=True)
    print(f"Generated and rendered {vid}")

# Run audit on all light SVGs
svgs_to_audit = [os.path.join(DIR, f"lockup_{v['id']}_light.svg") for v in variants]
subprocess.run(["python3", AUDIT_SCRIPT] + svgs_to_audit, check=True)
print("All variants generated & audited!")
