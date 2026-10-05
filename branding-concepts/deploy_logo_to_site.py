#!/usr/bin/env python3
"""
Deploy the approved master logo and icon to the LearnHouse / Oxonom Edu web app.
Replaces all legacy logos, marks, icons, and favicons in apps/web/public/
with high-resolution, production-grade vector and raster assets.
"""
import os
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
WEB_PUBLIC = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/apps/web/public"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"

# 1. Master Symbol SVG (fill="currentColor" for responsive CSS & invert support)
symbol_svg_currentcolor = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a1">
  <title id="title-a1">OXONOM — The Open Folio Nexus</title>
  <g fill="currentColor">
    <!-- Top-Left Arch Segment -->
    <path d="M 118 30 A 102 102 0 0 0 32 116 L 76 116 A 58 58 0 0 1 118 74 Z" />
    <!-- Top-Right Arch Segment -->
    <path d="M 138 30 A 102 102 0 0 1 224 116 L 180 116 A 58 58 0 0 0 138 74 Z" />
    <!-- Bottom-Left Folio (Book Page) -->
    <path d="M 32 140 A 102 102 0 0 0 118 226 L 118 182 A 58 58 0 0 1 76 140 Z" />
    <!-- Bottom-Right Folio (Book Page) -->
    <path d="M 224 140 A 102 102 0 0 1 138 226 L 138 182 A 58 58 0 0 0 180 140 Z" />
    <!-- Central Academic Mortarboard Diamond -->
    <polygon points="128,104 152,128 128,152 104,128" />
  </g>
</svg>"""

# 2. Master Symbol SVG with solid Black (for SVG image viewers without CSS currentColor context)
symbol_svg_black = symbol_svg_currentcolor.replace('fill="currentColor"', 'fill="#000000"')
# Master Symbol SVG with solid White
symbol_svg_white = symbol_svg_currentcolor.replace('fill="currentColor"', 'fill="#ffffff"')

# Write /lrn.svg (Primary Icon)
with open(os.path.join(WEB_PUBLIC, "lrn.svg"), "w") as f:
    f.write(symbol_svg_currentcolor)
print("Updated lrn.svg")

# Write /lrn-dash.svg (Dashboard Icon)
with open(os.path.join(WEB_PUBLIC, "lrn-dash.svg"), "w") as f:
    f.write(symbol_svg_currentcolor)
print("Updated lrn-dash.svg")

# 3. Master Full Horizontal Lockup (OXONOM edu.)
# Read var_1_ribbon_dot_pen_mono_light.svg
with open(os.path.join(DIR, "var_1_ribbon_dot_pen_mono_light.svg")) as f:
    lockup_light = f.read()

# Replace fill="#000000" with fill="currentColor" in lockup for responsive theme switching
lockup_currentcolor = lockup_light.replace('fill="#000000"', 'fill="currentColor"')

# Write /lrn-text.svg (Primary Horizontal Brand Lockup)
with open(os.path.join(WEB_PUBLIC, "lrn-text.svg"), "w") as f:
    f.write(lockup_currentcolor)
print("Updated lrn-text.svg")

# 4. Generate Favicon & App Icons from Symbol
temp_sym_file = os.path.join(DIR, "temp_symbol_black.svg")
with open(temp_sym_file, "w") as f:
    f.write(symbol_svg_black)

# Generate favicon.ico (16, 32, 48px)
favicon_ico_path = os.path.join(WEB_PUBLIC, "favicon.ico")
subprocess.run([
    "python3", RENDER_SCRIPT, temp_sym_file,
    "--ico", favicon_ico_path,
    "--ico-sizes", "16", "32", "48"
], check=True)
print("Generated multi-resolution favicon.ico")

# Generate App Icons & Rasters
icon_renders = [
    ("learnhouse_icon.png", 512, "#ffffff"),
    ("learnhouse_bigicon.png", 512, "#ffffff"),
    ("learnhouse_bigicon_1.png", 512, "#ffffff"),
    ("black_logo.png", 512, None), # transparent
    ("lrnai_icon.png", 256, None),
    ("learnhouse_ai_simple.png", 256, None),
]

for filename, size, bg in icon_renders:
    out_path = os.path.join(WEB_PUBLIC, filename)
    cmd = ["python3", RENDER_SCRIPT, temp_sym_file, "-o", out_path, "--size", str(size)]
    if bg:
        cmd.extend(["--bg", bg])
    subprocess.run(cmd, check=True)
    print(f"Rendered {filename} ({size}x{size})")

# 5. Generate Horizontal Logo Rasters (Lockup PNGs)
temp_lockup_light = os.path.join(DIR, "var_1_ribbon_dot_pen_mono_light.svg")
temp_lockup_dark = os.path.join(DIR, "var_1_ribbon_dot_pen_mono_dark.svg")

lockup_renders = [
    ("learnhouse_logo.png", temp_lockup_light, 1200, 326, None),
    ("dashLogo.png", temp_lockup_light, 1200, 326, None),
    ("learnhouse_ai_black_logo.png", temp_lockup_light, 1200, 326, None),
    ("learnhouse_text_white.png", temp_lockup_dark, 1200, 326, None),
]

for filename, src_svg, w, h, bg in lockup_renders:
    out_path = os.path.join(WEB_PUBLIC, filename)
    cmd = ["python3", RENDER_SCRIPT, src_svg, "-o", out_path, "--width", str(w), "--height", str(h)]
    if bg:
        cmd.extend(["--bg", bg])
    subprocess.run(cmd, check=True)
    print(f"Rendered {filename} ({w}x{h})")

print("All site assets deployed successfully!")
