#!/usr/bin/env python3
"""
Test vector geometry for:
1. Refined, beautiful 'X' in OXONOM
2. Fluid, handwritten/script 'edu'
3. Proportional tilted fountain pen nib hovering over the dot
"""
import os
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"

def draw_pen_nib(cx, cy, scale=1.0, angle_deg=35, color="currentColor"):
    """
    Constructs an iconic, elegant fountain pen nib rotated by angle_deg around (cx, cy).
    Tip is at (cx, cy).
    """
    # A classic fountain pen nib pointing downwards at (0, 0):
    # Tip: (0, 0)
    # Tines flare out to shoulders at (-8, -20) and (8, -20)
    # Breather hole at (0, -14)
    # Slit from (0, 0) to (0, -14)
    # Base narrows slightly to (-6, -30) and (6, -30)
    # All dimensions scaled by `scale`
    nib_svg = f'''<g transform="translate({cx}, {cy}) rotate({angle_deg}) scale({scale})">
      <!-- Pen Nib Outer Contour -->
      <path fill="{color}" fill-rule="evenodd" d="
        M 0 0 
        C -2 -5 -7 -14 -8 -20
        C -8 -24 -7 -28 -6 -32
        L 6 -32
        C 7 -28 8 -24 8 -20
        C 7 -14 2 -5 0 0 Z
        M 0 -13
        A 2 2 0 1 0 0.01 -13 Z
        M -0.7 -13
        V -1
        H 0.7
        V -13
        Z" />
    </g>'''
    return nib_svg

print("Pen test function ready")
