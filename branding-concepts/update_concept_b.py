#!/usr/bin/env python3
"""
Refine Concept B: The Keystone Monolith
3 distinct isometric architectural rhombi forming an isometric foundation monolith,
separated by a crisp 16px negative space isometric channel.
"""
import math

cx, cy = 128, 128
gap = 14.0 # 14px channel
h_gap = gap / 2.0

# 3 Planes:
# 1. Top Plane (horizontal rhombus)
# Top vertex: (128, 32)
# Right vertex: (211, 80)
# Center vertex: (128, 128)
# Left vertex: (45, 80)
#
# Shrinking inward by h_gap along the normals:
# Bottom-left edge of top plane runs along seam angle -150° (from center to left vertex)
# Bottom-right edge of top plane runs along seam angle -30° (from center to right vertex)
# Normal to -30° is (-0.5, -math.sqrt(3)/2) -> offset by h_gap.
#
# Let's compute exact polygon coordinates:

# Top Rhombus:
# P_top: (128, 38)
# P_right: (200, 80)
# P_bottom: (128, 121)
# P_left: (56, 80)
# Edge from (56,80) to (128,121) has dx = 72, dy = 41 (slope 0.569 ≈ tan 30° = 0.577)
# Edge from (128,121) to (200,80) has dx = 72, dy = -41 (slope -0.569)

# Bottom-Right Rhombus:
# Seam with top plane: slope tan(-30°) = -0.577. Offset downward by h_gap.
# P_top_in: (135, 125)
# P_top_out: (207, 84)
# P_bottom_out: (207, 168)
# P_bottom_in: (135, 210)
# Outer right edge is vertical at x = 207.
# Inner left edge is vertical at x = 135 (gap of 14px with bottom-left rhombus at x = 121!)
# Top edge: from (135, 125) to (207, 84) -> dy/dx = -41/72 = -0.569 (parallel to top rhombus!)
# Bottom edge: from (135, 210) to (207, 168) -> dy/dx = -42/72 = -0.583

# Bottom-Left Rhombus: (Mirror of Bottom-Right across x = 128)
# Inner right edge at x = 121 (128 - 7)
# Outer left edge at x = 49 (128 - 79)
# P_top_in: (121, 125)
# P_top_out: (49, 84)
# P_bottom_out: (49, 168)
# P_bottom_in: (121, 210)

p_top = "128,38 200,80 128,121 56,80"
p_br  = "135,125 207,84 207,168 135,210"
p_bl  = "121,125 49,84 49,168 121,210"

# Also inside each of the 3 planes, we can add a subtle internal faceted slit/slot,
# or keep them solid for maximum iconic monolithic presence.
# Solid is MUCH more powerful at 16px!

svg_b = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b">
  <title id="title-b">OXONOM — The Keystone Monolith</title>
  <!--
    Concept B: The Keystone Monolith (Isometric Foundation Hexagon)
    3 solid interlocking architectural planes forming an isometric cube/hexagon.
    Separated by a 14px negative-space isometric Y-channel.
    Represents institutional solidity, enterprise foundations, and computational scale.
  -->
  <g fill="#000000">
    <!-- Top Monolithic Plane -->
    <polygon points="{p_top}" />
    <!-- Bottom-Right Monolithic Plane -->
    <polygon points="{p_br}" />
    <!-- Bottom-Left Monolithic Plane -->
    <polygon points="{p_bl}" />
  </g>
</svg>"""

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/concept-b-keystone.svg", "w") as f:
    f.write(svg_b)

print("Updated concept-b-keystone.svg with clean 3-plane isometric geometry!")
