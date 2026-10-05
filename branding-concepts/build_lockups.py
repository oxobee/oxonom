#!/usr/bin/env python3
"""
Generate vector lockups (Symbol + Wordmark "OXONOM | Edu")
ViewBox 0 0 860 256.
Clean geometric vector outlines for 'OXONOM' and 'Edu'.
"""
import os

OUT_DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"

# Geometric font coordinates on baseline y = 160, cap height = 64 (top y = 96), stroke = 14
# Letter O: ellipse/circle centered at (x_c, 128), R_out = 32, R_in = 18
# Letter X: diagonals with stroke 14
# Letter N: stems at x1, x2 with diagonal
# Letter M: stems with V-peak

def make_wordmark_paths(start_x=280):
    # Generates path d for "OXONOM" + separator + "Edu"
    # cap height 64, baseline y = 160, cap top y = 96
    paths = []
    
    x = start_x
    
    # 1. 'O'
    paths.append(f'<path fill-rule="evenodd" d="M {x+32} 96 A 32 32 0 1 1 {x+31.9} 96 Z M {x+32} 110 A 18 18 0 1 0 {x+32.1} 110 Z" />')
    x += 74
    
    # 2. 'X'
    # Crossed diagonals from (x, 96) to (x+56, 160)
    # Using polygon for crisp geometry
    paths.append(f'''<polygon points="
      {x+2},96 {x+18},96 {x+28},112 {x+38},96 {x+54},96 
      {x+36},128 {x+54},160 {x+38},160 {x+28},144 {x+18},160 {x+2},160 
      {x+20},128" />''')
    x += 66
    
    # 3. 'O'
    paths.append(f'<path fill-rule="evenodd" d="M {x+32} 96 A 32 32 0 1 1 {x+31.9} 96 Z M {x+32} 110 A 18 18 0 1 0 {x+32.1} 110 Z" />')
    x += 74
    
    # 4. 'N'
    paths.append(f'''<polygon points="
      {x},96 {x+14},96 {x+38},138 {x+38},96 {x+52},96 
      {x+52},160 {x+38},160 {x+14},118 {x+14},160 {x},160" />''')
    x += 64
    
    # 5. 'O'
    paths.append(f'<path fill-rule="evenodd" d="M {x+32} 96 A 32 32 0 1 1 {x+31.9} 96 Z M {x+32} 110 A 18 18 0 1 0 {x+32.1} 110 Z" />')
    x += 74
    
    # 6. 'M'
    paths.append(f'''<polygon points="
      {x},96 {x+14},96 {x+30},132 {x+46},96 {x+60},96 
      {x+60},160 {x+47},160 {x+47},114 {x+34},144 {x+26},144 {x+13},114 {x+13},160 {x},160" />''')
    x += 72
    
    # Divider Bar '|'
    x += 16
    paths.append(f'<rect x="{x}" y="98" width="3" height="60" rx="1.5" fill="#666666" />')
    x += 24
    
    # 'Edu' Badge / Type
    # 'E'
    paths.append(f'''<polygon points="
      {x},98 {x+32},98 {x+32},110 {x+13},110 
      {x+13},122 {x+28},122 {x+28},133 {x+13},133 
      {x+13},147 {x+33},147 {x+33},158 {x},158" />''')
    x += 42
    
    # 'd' (lowercase, ascender to 98, bowl 116 to 158)
    paths.append(f'''<path fill-rule="evenodd" d="
      M {x+22} 98 H {x+33} V 158 H {x+22} V 152 
      A 19 19 0 0 1 {x} 137 A 19 19 0 0 1 {x+22} 120 Z 
      M {x+19} 137 A 9 9 0 1 0 {x+19} 137.1 Z" />''')
    x += 44
    
    # 'u' (lowercase 116 to 158)
    paths.append(f'''<path d="
      M {x} 120 H {x+11} V 143 A 8 8 0 0 0 {x+27} 143 V 120 H {x+38} V 158 H {x+28} V 152 
      A 16 16 0 0 1 {x} 142 Z" />''')
    
    return "\n".join(paths)

def build_lockups():
    # Read symbol contents
    with open(os.path.join(OUT_DIR, "concept-a-nexus.svg")) as f:
        sym_a = f.read()
    with open(os.path.join(OUT_DIR, "concept-b-keystone.svg")) as f:
        sym_b = f.read()
    with open(os.path.join(OUT_DIR, "concept-c-meridian.svg")) as f:
        sym_c = f.read()
        
    # Extract inner g tags
    def extract_inner(svg_str):
        start = svg_str.find("<g")
        end = svg_str.rfind("</svg>")
        return svg_str[start:end]
        
    wordmark = make_wordmark_paths(270)
    
    for letter, sym in [("a", extract_inner(sym_a)), ("b", extract_inner(sym_b)), ("c", extract_inner(sym_c))]:
        lockup_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 256" width="860" height="256" role="img" aria-labelledby="title-lockup-{letter}">
  <title id="title-lockup-{letter}">OXONOM | Edu — Concept {letter.upper()} Lockup</title>
  <!-- Symbol scaled and positioned on left: 200x200 inside 256x256 -->
  <g id="symbol" transform="translate(16, 28) scale(0.78125)">
    {sym}
  </g>
  <!-- Wordmark 'OXONOM | Edu' in pure vector geometry -->
  <g id="wordmark" fill="#000000">
    {wordmark}
  </g>
</svg>"""
        out_path = os.path.join(OUT_DIR, f"concept-{letter}-lockup.svg")
        with open(out_path, "w") as f:
            f.write(lockup_svg)
        print(f"Wrote {out_path}")

if __name__ == "__main__":
    build_lockups()
