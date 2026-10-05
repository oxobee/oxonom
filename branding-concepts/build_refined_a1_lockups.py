#!/usr/bin/env python3
"""
Build Refined Lockups for OXONOM edu. based on User Feedback:
- Chosen Mark: A1 · The Open Folio Nexus
- OXONOM: Straight, upright, heavy bold geometric sans ("düz bolt bir font")
- No separator line/divider ("arada çizgi olmadan")
- edu: Abbreviation with dot ("kısaltma ve sonunda nokta olmalı")
- edu: Dynamic & lively ("daha hareketli olmalı") - forward-leaning kinetic angle, fluid modern forms, energetic dot
"""
import os
import math
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"
AUDIT_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/svg_audit.py"

# --- 1. Pure Vector Upright Straight Bold 'OXONOM' ---
def get_oxonom_bold_straight(start_x=260, y_top=96, h=64, stroke_w=15.5):
    """
    Returns SVG path elements for 'OXONOM'
    Height: 64px, Baseline: 160px.
    Pure geometric heavy bold sans.
    """
    paths = []
    x = start_x
    y_mid = y_top + h / 2
    r_outer = h / 2
    r_inner = r_outer - stroke_w
    
    # 1. 'O'
    paths.append(f'''<path fill="currentColor" fill-rule="evenodd" d="
      M {x + r_outer:.1f} {y_top:.1f}
      A {r_outer:.1f} {r_outer:.1f} 0 1 1 {x + r_outer - 0.01:.1f} {y_top:.1f} Z
      M {x + r_outer:.1f} {y_top + stroke_w:.1f}
      A {r_inner:.1f} {r_inner:.1f} 0 1 0 {x + r_outer + 0.01:.1f} {y_top + stroke_w:.1f} Z" />''')
    x += int(h + 9) # 73px
    
    # 2. 'X'
    w_x = 58
    # Exact geometric X with stroke_w = 15.5
    # Let's make crisp diagonal polygon
    # Diagonal 1: (x, y_top) to (x + w_x, y_top + h)
    # Diagonal 2: (x + w_x, y_top) to (x, y_top + h)
    # Intersecting polygon:
    paths.append(f'''<polygon fill="currentColor" points="
      {x:.1f},{y_top:.1f} {x+17.5:.1f},{y_top:.1f} {x+w_x/2:.1f},{y_mid-3:.1f} {x+w_x-17.5:.1f},{y_top:.1f} {x+w_x:.1f},{y_top:.1f}
      {x+w_x/2+10.5:.1f},{y_mid:.1f} {x+w_x:.1f},{y_top+h:.1f} {x+w_x-17.5:.1f},{y_top+h:.1f} {x+w_x/2:.1f},{y_mid+3:.1f} {x+17.5:.1f},{y_top+h:.1f} {x:.1f},{y_top+h:.1f}
      {x+w_x/2-10.5:.1f},{y_mid:.1f}" />''')
    x += w_x + 9 # 67px
    
    # 3. 'O'
    paths.append(f'''<path fill="currentColor" fill-rule="evenodd" d="
      M {x + r_outer:.1f} {y_top:.1f}
      A {r_outer:.1f} {r_outer:.1f} 0 1 1 {x + r_outer - 0.01:.1f} {y_top:.1f} Z
      M {x + r_outer:.1f} {y_top + stroke_w:.1f}
      A {r_inner:.1f} {r_inner:.1f} 0 1 0 {x + r_outer + 0.01:.1f} {y_top + stroke_w:.1f} Z" />''')
    x += int(h + 9) # 73px
    
    # 4. 'N'
    w_n = 56
    paths.append(f'''<polygon fill="currentColor" points="
      {x:.1f},{y_top:.1f} {x+15.5:.1f},{y_top:.1f} {x+w_n-15.5:.1f},{y_top+h-18:.1f} {x+w_n-15.5:.1f},{y_top:.1f} {x+w_n:.1f},{y_top:.1f}
      {x+w_n:.1f},{y_top+h:.1f} {x+w_n-15.5:.1f},{y_top+h:.1f} {x+15.5:.1f},{y_top+18:.1f} {x+15.5:.1f},{y_top+h:.1f} {x:.1f},{y_top+h:.1f}" />''')
    x += w_n + 9 # 65px
    
    # 5. 'O'
    paths.append(f'''<path fill="currentColor" fill-rule="evenodd" d="
      M {x + r_outer:.1f} {y_top:.1f}
      A {r_outer:.1f} {r_outer:.1f} 0 1 1 {x + r_outer - 0.01:.1f} {y_top:.1f} Z
      M {x + r_outer:.1f} {y_top + stroke_w:.1f}
      A {r_inner:.1f} {r_inner:.1f} 0 1 0 {x + r_outer + 0.01:.1f} {y_top + stroke_w:.1f} Z" />''')
    x += int(h + 9) # 73px
    
    # 6. 'M'
    w_m = 68
    paths.append(f'''<polygon fill="currentColor" points="
      {x:.1f},{y_top:.1f} {x+15.5:.1f},{y_top:.1f} {x+w_m/2:.1f},{y_top+h-24:.1f} {x+w_m-15.5:.1f},{y_top:.1f} {x+w_m:.1f},{y_top:.1f}
      {x+w_m:.1f},{y_top+h:.1f} {x+w_m-14.5:.1f},{y_top+h:.1f} {x+w_m-14.5:.1f},{y_top+24:.1f} {x+w_m/2:.1f},{y_top+h-2:.1f} {x+14.5:.1f},{y_top+24:.1f} {x+14.5:.1f},{y_top+h:.1f} {x:.1f},{y_top+h:.1f}" />''')
    x += w_m
    
    return "\n    ".join(paths), x

print("Script template ready")
