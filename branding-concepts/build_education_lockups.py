#!/usr/bin/env python3
"""
Build high-legibility vector wordmark lockups for 'OXONOM | EDU'
ViewBox: 0 0 920 256
"""
import os

OUT_DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"

def make_crystal_clear_wordmark(x_start=280, edu_style="caps"):
    """
    Constructs 100% vector typography for 'OXONOM' + '|' + 'EDU' or 'Edu'.
    Zero live <text> tags. Pure SVG paths.
    """
    paths = []
    x = x_start
    
    # --- OXONOM (Height 62, Baseline 158, Top 96, Stroke 13) ---
    # 1. 'O'
    paths.append(f'<path fill="#000000" fill-rule="evenodd" d="M {x+31} 96 A 31 31 0 1 1 {x+30.9} 96 Z M {x+31} 109 A 18 18 0 1 0 {x+31.1} 109 Z" />')
    x += 72
    
    # 2. 'X'
    paths.append(f'''<polygon fill="#000000" points="
      {x+2},96 {x+17},96 {x+28},112 {x+39},96 {x+54},96 
      {x+36},127 {x+54},158 {x+39},158 {x+28},142 {x+17},158 {x+2},158 
      {x+20},127" />''')
    x += 64
    
    # 3. 'O'
    paths.append(f'<path fill="#000000" fill-rule="evenodd" d="M {x+31} 96 A 31 31 0 1 1 {x+30.9} 96 Z M {x+31} 109 A 18 18 0 1 0 {x+31.1} 109 Z" />')
    x += 72
    
    # 4. 'N'
    paths.append(f'''<polygon fill="#000000" points="
      {x},96 {x+13},96 {x+37},136 {x+37},96 {x+50},96 
      {x+50},158 {x+37},158 {x+13},118 {x+13},158 {x},158" />''')
    x += 62
    
    # 5. 'O'
    paths.append(f'<path fill="#000000" fill-rule="evenodd" d="M {x+31} 96 A 31 31 0 1 1 {x+30.9} 96 Z M {x+31} 109 A 18 18 0 1 0 {x+31.1} 109 Z" />')
    x += 72
    
    # 6. 'M'
    paths.append(f'''<polygon fill="#000000" points="
      {x},96 {x+13},96 {x+29},130 {x+45},96 {x+58},96 
      {x+58},158 {x+45},158 {x+45},114 {x+33},142 {x+25},142 {x+13},114 {x+13},158 {x},158" />''')
    x += 74
    
    # --- DIVIDER '|' ---
    x += 18
    paths.append(f'<rect x="{x}" y="94" width="3" height="66" rx="1.5" fill="#94a3b8" />')
    x += 28
    
    if edu_style == "caps":
        # --- ALL-CAPS 'EDU' (Maximum Legibility & Academic Authority) ---
        # Cap height: 62 (96 to 158), tracked and crystal clear
        
        # 'E'
        paths.append(f'''<polygon fill="#000000" points="
          {x},96 {x+36},96 {x+36},108 {x+13},108 
          {x+13},121 {x+32},121 {x+32},132 {x+13},132 
          {x+13},146 {x+37},146 {x+37},158 {x},158" />''')
        x += 48
        
        # 'D' (Stem + semicircular outer bowl, wide open counter)
        paths.append(f'''<path fill="#000000" fill-rule="evenodd" d="
          M {x} 96 H {x+22} C {x+39} 96 {x+46} 108 {x+46} 127 C {x+46} 146 {x+39} 158 {x+22} 158 H {x} Z
          M {x+13} 108 V 146 H {x+21} C {x+30} 146 {x+33} 139 {x+33} 127 C {x+33} 115 {x+30} 108 {x+21} 108 Z" />''')
        x += 58
        
        # 'U' (Stems + bottom arc, open counter)
        paths.append(f'''<path fill="#000000" fill-rule="evenodd" d="
          M {x} 96 H {x+13} V 136 C {x+13} 144 {x+17} 147 {x+24} 147 C {x+31} 147 {x+35} 144 {x+35} 136 V 96 H {x+48} V 136 C {x+48} 151 {x+38} 159 {x+24} 159 C {x+10} 159 {x} 151 {x} 136 Z" />''')
        
    elif edu_style == "title":
        # --- TITLE-CASE 'Edu' (Refined and open) ---
        # 'E'
        paths.append(f'''<polygon fill="#000000" points="
          {x},96 {x+34},96 {x+34},108 {x+13},108 
          {x+13},121 {x+30},121 {x+30},132 {x+13},132 
          {x+13},146 {x+35},146 {x+35},158 {x},158" />''')
        x += 46
        
        # 'd' (Clean ascender to 96, large round bowl 116 to 158)
        paths.append(f'''<path fill="#000000" fill-rule="evenodd" d="
          M {x+28} 96 H {x+40} V 158 H {x+28} V 151 
          A 21 21 0 0 1 {x} 137 A 21 21 0 0 1 {x+28} 118 Z 
          M {x+20} 137 A 9 9 0 1 0 {x+20} 137.1 Z" />''')
        x += 52
        
        # 'u' (Height 118 to 158)
        paths.append(f'''<path fill="#000000" d="
          M {x} 118 H {x+12} V 142 A 8 8 0 0 0 {x+28} 142 V 118 H {x+40} V 158 H {x+28} V 151 
          A 17 17 0 0 1 {x} 141 Z" />''')
          
    return "\n".join(paths)

def generate_education_lockups():
    # Read A1, A2, A3 symbols
    symbols = {
        "a1": ("concept-a1-folio.svg", "The Open Folio Nexus", "caps"),
        "a2": ("concept-a2-academic.svg", "The Academic Diamond Nexus", "caps"),
        "a3": ("concept-a3-tome.svg", "The Scholastic Tome Nexus", "title"),
    }
    
    for key, (svg_file, title, edu_style) in symbols.items():
        with open(os.path.join(OUT_DIR, svg_file)) as f:
            sym_raw = f.read()
            
        start = sym_raw.find("<g")
        end = sym_raw.rfind("</svg>")
        sym_inner = sym_raw[start:end]
        
        wordmark_code = make_crystal_clear_wordmark(270, edu_style=edu_style)
        
        lockup_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 256" width="920" height="256" role="img" aria-labelledby="title-lockup-{key}">
  <title id="title-lockup-{key}">OXONOM | Edu — {title} Lockup</title>
  <!-- Symbol scaled on left: 200x200 inside 256x256 -->
  <g id="symbol" transform="translate(18, 28) scale(0.78125)">
    {sym_inner}
  </g>
  <!-- High-Legibility Wordmark 'OXONOM | EDU' -->
  <g id="wordmark">
    {wordmark_code}
  </g>
</svg>"""
        out_path = os.path.join(OUT_DIR, f"concept-{key}-lockup.svg")
        with open(out_path, "w") as f:
            f.write(lockup_svg)
        print(f"Generated lockup: {out_path}")

if __name__ == "__main__":
    generate_education_lockups()
