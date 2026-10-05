#!/usr/bin/env python3
"""
Parametric geometric reconstruction of the ribbon 'edu' logo:
- Continuous geometric ribbon ligature connecting e, d, and u
- Matches the reference image uploaded by the user
- 'X' in OXONOM is the exact same straight bold geometric font as O, N, M
"""
import os
import math
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"

# --- 1. Standard Pure Straight Bold OXONOM ('X' is the same font) ---
def get_standard_oxonom(x_start=236, fill_color="currentColor"):
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
    
    # 2. 'X' - Standard, straight, bold, identical font family as O, N, M
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

print("Straight OXONOM function ready.")
