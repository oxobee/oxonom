#!/usr/bin/env python3
"""
Generate reversed (white on dark) SVGs and render all scale test PNGs
(16px, 32px, 64px, 512px) for Concept A, B, and C.
"""
import os
import subprocess

DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
RENDER_SCRIPT = "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py"

concepts = ["concept-a-nexus", "concept-b-keystone", "concept-c-meridian"]

# 1. Create reversed (white symbol on #090D16 dark background) SVGs
for c in concepts:
    in_path = os.path.join(DIR, f"{c}.svg")
    out_path = os.path.join(DIR, f"{c}-reversed.svg")
    with open(in_path) as f:
        content = f.read()
    
    # Replace fill="#000000" with fill="#ffffff" and add a dark background rect
    rev_content = content.replace('fill="#000000"', 'fill="#ffffff"')
    # Insert dark background rect right after <g fill="#ffffff"> or before it
    bg_rect = '<rect width="256" height="256" rx="36" fill="#090D16" />\n  '
    idx = rev_content.find("<g fill=")
    if idx != -1:
        rev_content = rev_content[:idx] + bg_rect + rev_content[idx:]
    
    with open(out_path, "w") as f:
        f.write(rev_content)
    print(f"Created {out_path}")

# 2. Render test PNGs at sizes 16, 32, 64, 512
os.makedirs(os.path.join(DIR, "renders"), exist_ok=True)
sizes = [16, 32, 64, 512]

for c in concepts:
    # Original (black on transparent)
    orig_svg = os.path.join(DIR, f"{c}.svg")
    for s in sizes:
        out_png = os.path.join(DIR, "renders", f"{c}-{s}px.png")
        subprocess.run(["python3", RENDER_SCRIPT, orig_svg, "-o", out_png, "--size", str(s)], check=True)
    
    # Reversed (white on dark #090D16)
    rev_svg = os.path.join(DIR, f"{c}-reversed.svg")
    for s in sizes:
        out_png = os.path.join(DIR, "renders", f"{c}-reversed-{s}px.png")
        subprocess.run(["python3", RENDER_SCRIPT, rev_svg, "-o", out_png, "--size", str(s)], check=True)

print("All scale and reversed renders completed successfully!")
