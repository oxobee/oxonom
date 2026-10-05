#!/usr/bin/env python3
"""
Build Nexus Ring V2 variations with explicit Education cues:
- Evoking open book / folios / academic graduation diamond
- Highly legible 'Edu' / 'EDU' typography in wordmark lockup
"""
import os
import math

OUT_DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"

cx, cy = 128, 128

# -------------------------------------------------------------------------
# VARIANT A1: "The Open Folio Nexus" (Open Book + Orbit Ring + Diamond Core)
# Lower half features two open book pages meeting at center spine,
# Upper half features the enclosing dome/arch of knowledge.
# Center features the academic diamond / spark of discovery.
# -------------------------------------------------------------------------
def build_nexus_a1():
    # Outer radius 104, inner radius 54.
    # The lower two wings are shaped like open book pages:
    # A central spine runs down from (128, 128) to (128, 232).
    # The bottom left page and bottom right page flare open at an angle.
    # Let's craft this cleanly in pure vector geometry:
    
    # Upper Arc (Arch of Wisdom):
    # Two top quadrants separated by a clean 20px vertical or 45° channel.
    # Let's make the top arch clean and dignified.
    
    # Even better: The classic Nexus Ring (4 sectors), but:
    # 1. The central diamond is scaled and shaped like an academic mortarboard diamond (ratio 1.2:1 width-to-height or pure 45° diamond).
    # 2. The bottom gap between lower sectors forms an open book spine (V-channel pointing up to the center diamond).
    # 3. The bottom contours slope gently like open pages (dihedral angle 15°).
    
    # Let's calculate:
    # Top Sector: A majestic arch from (54, 110) to (202, 110)
    # Or keep the 4-sector symmetry, but lower sectors have book-page spine:
    
    # Let's build A1: "Open Book & Radiant Ring"
    # An outer circle (O), where:
    # - Top is an open arch / portal
    # - Bottom is an open book with two symmetric folios (pages)
    # - Center is the academic diamond (mortarboard cap)
    
    R = 104
    r = 54
    spine_w = 16 # gap between book pages
    
    # Left Page (Bottom-Left):
    # Spans from bottom spine x = 128 - 8 = 120, to outer edge at angle ~195°
    # Outer arc along R=104 from 120° to 195°
    # Inner arc along r=54
    # Bottom spine line at x = 120
    
    # Let's make the geometry pure and undeniable:
    # Top Arch (The Dome):
    # from angle 220° to 320°:
    # Outer arc: from (cx + R*cos(220), cy + R*sin(220)) to (cx + R*cos(320), cy + R*sin(320))
    # In screen coords:
    # Top Arch:
    # Angle 215° to 325°
    
    # Wait, let's create 3 distinct design explorations:
    
    # DESIGN 1: "The Folio Nexus" (4 Quadrants with Open-Book Spine & Academic Diamond)
    # - Top two sectors form an academic arch
    # - Bottom two sectors form open book leaves with a subtle V-spine at the bottom (y=128 down to y=232)
    # - Center: precision academic diamond
    
    # DESIGN 2: "The Beacon Nexus" (Academic Cap Core + Open Pages)
    # - The central diamond has a subtle graduation cap top silhouette
    # - The 4 sectors are precision calibrated with wider channel so it reads instantly at 16px
    
    # DESIGN 3: "The Scholastic Ring" (Dual Book & Orbit)
    # - Lower half: pure stylized geometric open book (2 symmetrical leaves)
    # - Upper half: complementary orbit arch
    # - Center: star/diamond of intelligence
    pass

def make_clean_folio_nexus():
    # A1: The Open Folio Nexus
    # Center (128, 128)
    # Upper-left and upper-right quadrants (Arch of Knowledge)
    # Lower-left and lower-right quadrants (Open Book Pages)
    # Central Diamond (Academic Milestone)
    
    # Top arch: M 50 110 A 104 104 0 0 1 206 110 L 176 110 A 62 62 0 0 0 80 110 Z ?
    # Let's compute exact path with open book bottom:
    
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a1">
  <title id="title-a1">OXONOM — The Open Folio Nexus</title>
  <!--
    Concept A1: The Open Folio Nexus
    Combines the circular O-X Nexus with an unmistakable open book foundation:
    - Lower sectors angle upward like the open pages of a book of knowledge (15° dihedral)
    - Upper sectors form the sheltering dome / academy portal
    - Center diamond evokes the academic graduation cap & focal insight
  -->
  <g fill="#000000">
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
    return svg

def make_academic_nexus_v2():
    # A2: The Academic Crest Nexus
    # 4 Sectors rotated 45 degrees like Concept A, but:
    # 1. The lower gap is an open book spine (V-groove)
    # 2. Central diamond is prominent
    # 3. Channel width is optimized for 16px legibility (24px clean gap)
    cx, cy = 128, 128
    
    # Let's craft:
    # Top Sector (Academy Dome)
    # Bottom Sector (Open Book Foundation with V-notch)
    # Left & Right Sectors (Wings of Growth)
    
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a2">
  <title id="title-a2">OXONOM — The Academic Diamond Nexus</title>
  <!--
    Concept A2: The Academic Diamond Nexus
    Refined 4-sector circular mark with an explicit academic diamond keystone.
    The bottom sector features an open-book spine contour, framing the central diamond
    like an academic cap sitting atop an open tome.
  -->
  <g fill="#000000">
    <!-- Top Canopy (Dome of Wisdom) -->
    <path d="M 64 52 A 104 104 0 0 1 192 52 L 161 83 A 60 60 0 0 0 95 83 Z" />
    <!-- Left Wing (Adaptive Progress) -->
    <path d="M 52 64 A 104 104 0 0 0 52 192 L 83 161 A 60 60 0 0 1 83 95 Z" />
    <!-- Right Wing (Computational Scale) -->
    <path d="M 204 64 A 104 104 0 0 1 204 192 L 173 161 A 60 60 0 0 0 173 95 Z" />
    <!-- Bottom Folio (Open Book Spine with V-Notch) -->
    <path d="M 64 204 A 104 104 0 0 0 128 228 A 104 104 0 0 0 192 204 L 161 173 A 60 60 0 0 1 128 186 A 60 60 0 0 1 95 173 Z" />
    <!-- Central Academic Mortarboard Diamond -->
    <polygon points="128,102 154,128 128,154 102,128" />
  </g>
</svg>"""
    return svg

def make_scholastic_tome_nexus():
    # A3: The Open Book & Horizon Nexus
    # Direct, unmistakable education metaphor:
    # Lower half is a stylized geometric open book (2 leaves with spine at center).
    # Upper half is a majestic knowledge arc with the academic diamond floating between them.
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a3">
  <title id="title-a3">OXONOM — The Scholastic Tome Nexus</title>
  <!--
    Concept A3: The Scholastic Tome Nexus
    Lower half: Two geometric pages of an open book forming the foundational base of learning.
    Upper half: The overarching horizon of intelligence and innovation.
    Center: The graduation diamond / focal insight.
  -->
  <g fill="#000000">
    <!-- Upper Horizon Arc -->
    <path d="M 40 116 A 100 100 0 0 1 216 116 H 176 A 60 60 0 0 0 80 116 Z" />
    <!-- Lower Left Page (Open Book Leaf) -->
    <path d="M 44 140 H 118 V 220 L 44 186 A 100 100 0 0 1 44 140 Z" />
    <!-- Lower Right Page (Open Book Leaf) -->
    <path d="M 212 140 H 138 V 220 L 212 186 A 100 100 0 0 0 212 140 Z" />
    <!-- Central Milestone Diamond -->
    <polygon points="128,108 148,128 128,148 108,128" />
  </g>
</svg>"""
    return svg

# Write SVGs
with open(os.path.join(OUT_DIR, "concept-a1-folio.svg"), "w") as f:
    f.write(make_clean_folio_nexus())

with open(os.path.join(OUT_DIR, "concept-a2-academic.svg"), "w") as f:
    f.write(make_academic_nexus_v2())

with open(os.path.join(OUT_DIR, "concept-a3-tome.svg"), "w") as f:
    f.write(make_scholastic_tome_nexus())

print("Built A1, A2, A3 SVGs successfully!")
