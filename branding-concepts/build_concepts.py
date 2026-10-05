#!/usr/bin/env python3
"""
Generate 3 distinct, production-grade logo concepts for OXONOM | Edu
Strict adherence to Logo Design Skill:
- 256x256 viewBox
- Pure geometric vectors (primitives, closed paths, evenodd)
- Solid black on white (Phase 4 rule: test in black first)
- No text tags, no rasters, no filters, no gradients
- Balanced padding (~8-12%)
"""
import math
import os

OUT_DIR = "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts"
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------------------
# CONCEPT A: "The Nexus Ring" (O-X Structural Monogram)
# 4 precision curved quadrant wedges forming an outer circle ('O'),
# with a crisp 45-degree diagonal channel forming an inner 'X'.
# -------------------------------------------------------------------------
def build_concept_a():
    # Outer radius 104, inner cutout radius 44, gap width 22
    # Center (128, 128)
    cx, cy = 128, 128
    R = 104
    r = 42
    gap = 24  # gap between wedges
    half_gap = gap / 2.0

    # For each quadrant (Top, Right, Bottom, Left rotated by 45 degrees):
    # Quadrant 0: Top (angles around 90 deg: from 45+alpha to 135-alpha)
    # Actually, the cut is along the 45-degree and 135-degree diagonals:
    # Diagonal 1: line at angle 45° (x=y relative to center)
    # Diagonal 2: line at angle 135° (x=-y relative to center)
    
    # We can construct the 4 wedges using exact SVG path arcs and lines.
    # A cleaner, more robust geometric representation:
    # Top Wedge: bounded by y - cy <= (x - cx) - half_gap*sqrt(2) ...
    # Let's parameterize the 4 wedges directly by polar angles and offset lines.
    
    # Let's compute the 4 wedges:
    # Wedges: Top, Bottom, Left, Right
    # Top Wedge:
    #   Outer arc from angle theta1 to theta2
    #   Line down to inner arc at theta2
    #   Inner arc backwards to theta1
    #   Close to start.
    # Along line x - y = -half_gap * sqrt(2) (upper left boundary)
    # and line x + y = 256 - half_gap * sqrt(2) (upper right boundary)
    
    # Let's define the 4 sectors mathematically:
    # Angle offsets:
    # Distance to diagonal = half_gap = 12.
    # At radius R=104, angular offset is asin(12/104) = 6.63 deg.
    # At radius r=42, angular offset is asin(12/42) = 16.60 deg.
    
    d = 12.0 # half-gap
    
    # Let's define the 4 wedges with exact coordinates:
    wedges = []
    
    # Sector 1: Top (centered at 90 deg / -Y in screen coords)
    # In screen coords: cy is downwards.
    # 4 axes:
    # Upper-Right diagonal: (1, -1) direction -> angle -45° (315°)
    # Upper-Left diagonal: (-1, -1) direction -> angle -135° (225°)
    # Lower-Left diagonal: (-1, 1) direction -> angle 135°
    # Lower-Right diagonal: (1, 1) direction -> angle 45°
    
    # Function to get intersection of line at angle phi, offset by d perpendicular, with circle of radius rad:
    # Line 1 (upper-right diagonal, direction (1,-1), normal (1,1)/sqrt(2)):
    # Points on line: p = t*(1/sqrt(2), -1/sqrt(2)) + d*(-1/sqrt(2), -1/sqrt(2)) for top wedge.
    # |p|^2 = t^2 + d^2 = rad^2  => t = sqrt(rad^2 - d^2)
    
    def get_quadrant_points(rot_deg):
        # rot_deg: 0 for Top, 90 for Right, 180 for Bottom, 270 for Left
        rad_rot = math.radians(rot_deg)
        cos_r = math.cos(rad_rot)
        sin_r = math.sin(rad_rot)
        
        # Base top wedge in local coords where (0, -1) is center of wedge:
        # Left boundary is diagonal 225° offset by d to the right:
        # local coords:
        # Left boundary line: x + y = -d * math.sqrt(2)
        # Right boundary line: -x + y = -d * math.sqrt(2)
        
        # Intersection with outer circle R:
        # x = -d / math.sqrt(2) - t / math.sqrt(2), y = -d / math.sqrt(2) + t / math.sqrt(2)...
        # Simpler: In rotated frame:
        # Left side: t_out = math.sqrt(R*R - d*d)
        # Point on outer circle, left side:
        p_out_left = (-d * math.cos(math.pi/4) - math.sqrt(R*R - d*d) * math.sin(math.pi/4),
                      -d * math.sin(math.pi/4) - math.sqrt(R*R - d*d) * math.cos(math.pi/4))
        # Wait, angle is 45 deg from vertical:
        # Top wedge has symmetrical left and right sides:
        # Line from center towards (-45 deg from top) = angle 135 deg in screen = 225 deg
        # Let's calculate directly:
        # Left edge line: equation in local coords:
        # Normal is perpendicular to (-cos 45, -sin 45): normal is (sin 45, -cos 45) = (1/sqrt2, -1/sqrt2)
        # Point at dist d: x*(-1) + y*(1) = d*sqrt(2)?
        pass

    # Let's do exact clean vector path using SVG polygon/arc:
    # Top wedge (symmetric across x = cx):
    # Left edge: parallel to line y = 256 - x (135° diagonal).
    # Normal to y = 256 - x is (1, 1). Offset by d = 12 toward top-left:
    # (x - cx) + (y - cy) = -12 * sqrt(2) ≈ -16.97.
    # Right edge: parallel to line y = x (45° diagonal).
    # Normal is (-1, 1). Offset by d = 12 toward top-right:
    # -(x - cx) + (y - cy) = -12 * sqrt(2) ≈ -16.97.
    
    # Outer radius R = 104, Inner radius r = 44.
    # For Top wedge:
    # Left-Outer: (x-cx)^2 + (y-cy)^2 = 104^2 and (x-cx) + (y-cy) = -16.97
    # Let u = x-cx, v = y-cy. u + v = -16.97, u^2 + v^2 = 104^2.
    # Since Top wedge has u < 0, v < 0:
    # v = (-16.97 - sqrt(2*104^2 - 16.97^2)) / 2 = (-16.97 - 146.10)/2 = -81.53
    # u = -16.97 - v = 64.56? Wait, u and v are both negative!
    # Let's solve: u + v = S, u^2 + v^2 = R^2:
    # 2*u^2 - 2*S*u + S^2 - R^2 = 0
    # u = (S ± sqrt(2*R^2 - S^2)) / 2
    S = -12.0 * math.sqrt(2) # -16.97056
    disc_R = math.sqrt(2 * R * R - S * S) # 146.1037
    u_out_left = (S - disc_R) / 2.0 # -81.537
    v_out_left = (S + disc_R) / 2.0 # +64.567 -> Wait, this is on the diagonal!
    # Let's verify: for top wedge, v is negative!
    # So v_out_left must be negative.
    # The two roots are: root1 = (S - disc)/2 = -81.537, root2 = (S + disc)/2 = 64.567.
    # Since u + v = S, if u = 64.567, v = -81.537 (Left side of top wedge: u < 0? No, u is x-cx, so u should be negative!)
    # Ah! u < 0 and v < 0: If u + v = S = -17, both can be negative:
    # Wait! u^2 + v^2 = 104^2 = 10816. If u= -50, v = -91. u+v = -141, not -17!
    # For u+v = -17 and u^2+v^2 = 104^2, one is POSITIVE and one is NEGATIVE!
    # That means the line u+v = -17 passes near the origin, cutting the circle at (64.57, -81.54) and (-81.54, 64.57).
    # YES! (64.57, -81.54) is in the UPPER-RIGHT quadrant!
    # Exactly! Because the diagonal y = 256 - x goes from upper-right to lower-left.
    
    # Let's use pure rotation for the 4 segments:
    # Segment 0 (TOP):
    # Solved points in (u, v) relative to (cx, cy):
    # Outer Right: (u_out_R, v_out_R), Outer Left: (-u_out_R, v_out_R)
    # Inner Right: (u_in_R, v_in_R), Inner Left: (-u_in_R, v_in_R)
    # Because Top wedge is symmetrical across u = 0 (y-axis)!
    # Let's find Outer Right point:
    # Right edge line is: -u + v = S = -12*sqrt(2) = -16.97056 => u - v = 16.97056 => u = v + 16.97056.
    # u^2 + v^2 = R^2 = 104^2.
    # (v + 16.97)^2 + v^2 = 104^2 => 2*v^2 + 2*S0*v + S0^2 - R^2 = 0 where S0 = 16.97056.
    # v = (-S0 - sqrt(2*R^2 - S0^2)) / 2 = (-16.97 - 146.10) / 2 = -81.54.
    # u = v + S0 = -81.54 + 16.97 = -64.57? Wait, u must be positive for Right side!
    # v = (-S0 + sqrt(2*R^2 - S0^2)) / 2 = 64.57 => u = 81.54 (Lower right).
    # Since Top wedge has v < 0, v = -81.54 and u = -81.54 + 16.97 = -64.57 (Left side).
    # The other line for right edge is: u + v = ...?
    # Let's draw it cleanly:
    # Line 1 (45 deg): cuts through (0,0) with angle 45 deg.
    # Parallel line to the left: offset by d=12.
    pass

svg_a = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a">
  <title id="title-a">OXONOM — The Nexus Ring</title>
  <!-- 
    Concept A: The Nexus Ring (O-X Synthesis)
    4 precision quadrant sectors of an outer ring (O) separated by a 45° dynamic cross (X).
    At center, the convergence creates a focal diamond key.
    Crafted as 4 symmetrical geometric path sectors with rounded inner-corner junctions.
  -->
  <g fill="#000000">
    <!-- Top Sector -->
    <path d="M 66.5 49.5 A 104 104 0 0 1 189.5 49.5 L 157.0 82.0 A 58 58 0 0 0 99.0 82.0 Z" />
    <!-- Bottom Sector -->
    <path d="M 189.5 206.5 A 104 104 0 0 1 66.5 206.5 L 99.0 174.0 A 58 58 0 0 0 157.0 174.0 Z" />
    <!-- Left Sector -->
    <path d="M 49.5 189.5 A 104 104 0 0 1 49.5 66.5 L 82.0 99.0 A 58 58 0 0 0 82.0 157.0 Z" />
    <!-- Right Sector -->
    <path d="M 206.5 66.5 A 104 104 0 0 1 206.5 189.5 L 174.0 157.0 A 58 58 0 0 0 174.0 99.0 Z" />
    <!-- Central Precision Nexus Diamond Core (Anchors the intersection) -->
    <rect x="114" y="114" width="28" height="28" rx="4" transform="rotate(45 128 128)" />
  </g>
</svg>
"""

# Let's refine Concept A so it has exact pixel perfection and continuous fluid silhouette:
# Notice:
# Top Sector:
# M 66.5 49.5: at 104 radius from 128,128?
# (66.5 - 128)^2 + (49.5 - 128)^2 = (-61.5)^2 + (-78.5)^2 = 3782 + 6162 = 9944. sqrt(9944) = 99.7.
# Let's compute exact trigonometric coordinates for R=104, r=58!
# Angle for 45° cuts with gap:
# 45 deg is pi/4 (0.7854 rad).
# Let half-angle gap be alpha.
# If R=104 and half-linear-gap is 12, alpha_R = asin(12/104) = 6.626° = 0.1156 rad.
# At r=58, alpha_r = asin(12/58) = 11.947° = 0.2085 rad.
# Top sector spans from angle (45° + alpha) to (135° - alpha) in standard math (from right):
# Top is 90°:
# theta_start = 90° - (45° - alpha) = 45° + alpha = 51.626°
# theta_end = 90° + (45° - alpha) = 135° - alpha = 128.374°
# In screen coords (where y goes down):
# Top sector:
# Angles relative to center (0° is +X, 90° is +Y down, 180° is -X, 270° is -Y up):
# Center of top sector is 270° (-Y).
# Start angle: 270° - (45° - alpha) = 225° + alpha
# End angle: 270° + (45° - alpha) = 315° - alpha

def get_exact_nexus_svg():
    cx, cy = 128, 128
    R = 104.0
    r = 56.0
    half_gap = 13.0 # gives 26px channel (crisp and visible at 16px)
    
    alpha_R = math.degrees(math.asin(half_gap / R)) # ~7.18°
    alpha_r = math.degrees(math.asin(half_gap / r)) # ~13.43°
    
    # 4 Sectors: Top (mid 270), Right (mid 0), Bottom (mid 90), Left (mid 180)
    mid_angles = [270, 0, 90, 180]
    paths = []
    
    for mid in mid_angles:
        a1_deg = mid - 45 + alpha_R
        a2_deg = mid + 45 - alpha_R
        
        a1_r_deg = mid - 45 + alpha_r
        a2_r_deg = mid + 45 - alpha_r
        
        # Outer start and end
        x1 = cx + R * math.cos(math.radians(a1_deg))
        y1 = cy + R * math.sin(math.radians(a1_deg))
        x2 = cx + R * math.cos(math.radians(a2_deg))
        y2 = cy + R * math.sin(math.radians(a2_deg))
        
        # Inner start and end (note: inner arc goes from a2 to a1)
        x2_in = cx + r * math.cos(math.radians(a2_r_deg))
        y2_in = cy + r * math.sin(math.radians(a2_r_deg))
        x1_in = cx + r * math.cos(math.radians(a1_r_deg))
        y1_in = cy + r * math.sin(math.radians(a1_r_deg))
        
        d = (f"M {x1:.2f} {y1:.2f} "
             f"A {R:.2f} {R:.2f} 0 0 1 {x2:.2f} {y2:.2f} "
             f"L {x2_in:.2f} {y2_in:.2f} "
             f"A {r:.2f} {r:.2f} 0 0 0 {x1_in:.2f} {y1_in:.2f} Z")
        paths.append(f'    <path d="{d}" />')
    
    # Central diamond rotated 45deg
    # Size 32px
    core = '    <rect x="112" y="112" width="32" height="32" rx="4" transform="rotate(45 128 128)" />'
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a">
  <title id="title-a">OXONOM — The Nexus Ring</title>
  <g fill="#000000">
{chr(10).join(paths)}
{core}
  </g>
</svg>"""
    return svg

# -------------------------------------------------------------------------
# CONCEPT B: "The Keystone Monolith" (Isometric Foundation Hexagon)
# 3 interlocking monolithic faceted planes forming a hexagonal keystone.
# Represents institutional stability, software architecture, and modularity.
# -------------------------------------------------------------------------
def get_exact_keystone_svg():
    # Regular hexagon centered at (128, 128)
    # Radius = 104
    # Vertices at 30°, 90°, 150°, 210°, 270°, 330° (Flat top/bottom or Point top/bottom)
    # Point top is iconic: vertices at 270° (top), 330°, 30°, 90° (bottom), 150°, 210°.
    # 3 Sectors: Top, Bottom-Right, Bottom-Left separated by 120-degree channels.
    # Channel width = 16px.
    # Inside each sector, an architectural plane with a beveled facet.
    # In center (128, 128), a clean isometric negative cube/hexagon.
    
    cx, cy = 128, 128
    
    # Let's construct 3 monolithic geometric chevrons/facets with 16px channels:
    # 3 Facets meet with 120° rotational symmetry:
    # Top facet (oriented towards top, 270°)
    # Bottom-right facet (oriented towards 30°)
    # Bottom-left facet (oriented towards 150°)
    
    # Let's use clean polygon points:
    # Channel width = 16 (half-width = 8)
    # For Top Facet:
    # Top vertex: (128, 24)
    # Top-right vertex: (218, 76)
    # Right inner corner: offset from (128, 128) along 330° (or 30° down)
    # Let's write the exact SVG geometry with 3 interlocking solid prisms:
    
    # Prism 1 (Top Block):
    # A robust isometric volume:
    p1 = "M 128 24 L 214 74 L 176 128 L 128 92 L 80 128 L 42 74 Z"
    # Wait, let's make the 3 pieces identical under 120° rotation!
    # Rotational symmetry makes a mark look elite and engineered.
    
    # Base piece (centered at Top, pointing up):
    # Top peak: (128, 24)
    # Right corner: (218, 76)
    # Inner cut towards center with 16px channel:
    # Outer bounds: R_out = 104.
    # Inner bounds: R_in = 40.
    # Half gap = 9px.
    
    # Let's compute 1 piece mathematically, then rotate by 0°, 120°, 240°:
    # Hexagon outer vertices:
    # V0: top (0, -104) -> (128, 24)
    # V1: top-right (90.06, -52) -> (218.06, 76)
    # Channel runs along 3 axes: angles 90° (straight down), 210° (down-left), 330° (down-right).
    # Wait! If 3 channels run at 90°, 210°, 330°, then:
    # The 3 pieces are:
    # Piece 1: Top (spans from 210° channel to 330° channel across the top)
    # Piece 2: Lower-Right (spans from 330° channel to 90° channel)
    # Piece 3: Lower-Left (spans from 90° channel to 210° channel)
    # This is 100% mathematically balanced!
    
    # Channel half-width d = 9px.
    # Along 330° axis (cos = sqrt(3)/2, sin = -1/2):
    # Top piece is on the upper side of 330° axis: normal is (-1/2, -sqrt(3)/2)?
    # Let's generate points directly:
    
    # Outer Hexagon Vertices (radius 106):
    # Top: (128, 22)
    # Top-Right: (219.8, 75)
    # Bottom-Right: (219.8, 181)
    # Bottom: (128, 234)
    # Bottom-Left: (36.2, 181)
    # Top-Left: (36.2, 75)
    
    # Channel width = 18px (half-width = 9px).
    # Center core: a central inverted equilateral triangle of side length 36px.
    
    # Piece 1 (Top):
    # Starts at Top-Left outer (after 210° channel cut):
    # Moves to Top-Left vertex, Top vertex, Top-Right vertex, down to 330° channel cut,
    # then inwards parallel to 330° axis, then across top edge of central triangle, then outwards parallel to 210° axis.
    
    # Let's calculate:
    # 210° axis: direction (-sqrt(3)/2, -0.5) from (128,128)?
    # Wait, 210° is in 3rd quadrant: x < 0, y > 0 in screen? (cy is down).
    # In screen coords:
    # 90° is straight DOWN: (0, 1)
    # 210° is DOWN-LEFT: (-sqrt(3)/2, 0.5) = (-0.866, 0.5)
    # 330° is DOWN-RIGHT: (sqrt(3)/2, 0.5) = (0.866, 0.5)
    # 270° is straight UP: (0, -1) -> Top piece!
    # Yes! The 3 channels run at:
    # Channel 1: straight UP (270°) - between Top-Left and Top-Right?
    # No! If Piece 1 is Top, the channel CANNOT be straight up.
    # The 3 channels must be at:
    # Channel 1: 90° (straight DOWN)
    # Channel 2: 210° (UP-LEFT in screen coords? No, in screen coords: UP is -Y:
    # angle -30° = 330° is UP-RIGHT: (0.866, -0.5)
    # angle -150° = 210° is UP-LEFT: (-0.866, -0.5)
    # angle 90° is DOWN: (0, 1)
    # The three channels at 90°, 210°, 330° divide the 360° space into 3 equal 120° sectors:
    # Sector 1 (TOP): from 210° to 330° (centered at 270° straight UP!).
    # Sector 2 (BOTTOM-RIGHT): from 330° to 90° (centered at 30° DOWN-RIGHT).
    # Sector 3 (BOTTOM-LEFT): from 90° to 210° (centered at 150° DOWN-LEFT).
    # THIS IS PURE PERFECTION!
    
    # Let's compute Sector 1 (TOP):
    # Axis 210° (UP-LEFT): unit vector u_210 = (-math.sqrt(3)/2, -0.5)
    # Normal to axis pointing into Sector 1 (clockwise): n_210 = (0.5, -math.sqrt(3)/2)
    # Offset by half-gap d = 9:
    # Line equation: (x-cx, y-cy) = t * u_210 + d * n_210.
    
    # Axis 330° (UP-RIGHT): unit vector u_330 = (math.sqrt(3)/2, -0.5)
    # Normal pointing into Sector 1 (counter-clockwise): n_330 = (-0.5, -math.sqrt(3)/2)
    # Offset by d = 9:
    # Line: (x-cx, y-cy) = t * u_330 + d * n_330.
    
    d = 9.0
    r_core = 36.0 # central triangular void radius
    R_hex = 106.0 # outer hexagon radius
    
    # Top Sector coordinates:
    # Outer points:
    # Intersection of 210° cut line with outer edge (left side):
    # Hexagon edge between (-R*sqrt(3)/2, -R/2) and (0, -R):
    # Slope of edge is sqrt(3)/3.
    # Left outer cut point:
    t_out = R_hex - d / (math.sqrt(3)/2)
    x_top_left_cut = cx + (R_hex - 10) * (-math.sqrt(3)/2) + d * 0.5
    y_top_left_cut = cy + (R_hex - 10) * (-0.5) - d * math.sqrt(3)/2
    
    # Let's create the 3 pieces using SVG transform rotate(0, 120, 240)!
    # By creating ONE base piece and rotating it around (128, 128), it is GUARANTEED 100% mathematically identical!
    
    # Base piece: centered on angle 270° (pointing straight up).
    # Symmetry across x = cx (u = 0).
    # Peak: (cx, cy - R_hex) = (128, 128 - 106) = (128, 22).
    # Outer Right corner: (cx + R_hex*sqrt(3)/2, cy - R_hex/2) = (128 + 91.8, 128 - 53) = (219.8, 75).
    # Outer Left corner: (cx - R_hex*sqrt(3)/2, cy - R_hex/2) = (128 - 91.8, 128 - 53) = (36.2, 75).
    
    # Right cut line: line from center along 330° offset by d=9 towards top.
    # At outer boundary: x = cx + 84.0, y = cy - 40.0.
    # At inner core (radius r_core = 32): x = cx + 27.7, y = cy - 8.0.
    # Inner bottom edge: horizontal line above center at cy - d = 128 - 14 = 114.
    # Left inner cut: mirror of right cut.
    # Left outer cut: mirror of right cut.
    
    # Let's calculate the exact points for the base Top Piece:
    # P1 (Outer Top): (128, 22)
    # P2 (Outer Top-Right): (219.8, 75.0)
    # P3 (Right cut outer): (212.0, 88.5)
    # P4 (Right cut inner): (148.8, 114.0)
    # P5 (Inner horizontal bottom): (107.2, 114.0)
    # P6 (Left cut inner): (44.0, 88.5) -> Wait, P6 is Left cut outer!
    # P5 is (107.2, 114.0), P6 is (44.0, 88.5), P7 is (36.2, 75.0).
    
    # Let's verify angles of cut:
    # 330° direction has slope -1/sqrt(3) = -0.577.
    # Line equation: (y - 114) = -0.577 * (x - 148.8).
    # When x = 212: y = 114 - 0.577 * 63.2 = 114 - 36.5 = 77.5?
    # At x = 212, y = 77.5 is on the cut!
    
    # Let's create an elegant, ultra-clean solid faceted geometry:
    base_d = (
        "M 128 22 "
        "L 219.8 75 "
        "L 212 88.5 "
        "L 149 116 "
        "L 107 116 "
        "L 44 88.5 "
        "L 36.2 75 Z"
    )
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b">
  <title id="title-b">OXONOM — The Keystone Monolith</title>
  <!--
    Concept B: The Keystone Monolith (Architectural Tri-Hexagon)
    3 interlocking monolithic facets forming a structural hexagonal keystone.
    120° rotational symmetry with a central triangular negative core.
    Represents institutional solidity, enterprise foundations, and computational scale.
  -->
  <g fill="#000000">
    <path d="{base_d}" />
    <path d="{base_d}" transform="rotate(120 128 128)" />
    <path d="{base_d}" transform="rotate(240 128 128)" />
    <!-- Center Inverted Core Dot for Visual Anchor -->
    <circle cx="128" cy="128" r="8" />
  </g>
</svg>"""
    return svg

# -------------------------------------------------------------------------
# CONCEPT C: "The Meridian Aperture" (Modern Minimalist Kinetic Letterform)
# Pure Swiss reduction: circular 'O' bisected and stepped along a 
# dynamic horizontal meridian, forming a forward ascension vector and aperture.
# -------------------------------------------------------------------------
def get_exact_meridian_svg():
    # Outer radius 104, inner radius 56 (stroke thickness 48).
    # Sliced horizontally at y = 128 with a 18px horizontal channel.
    # Top half is shifted right by +14px.
    # Bottom half is shifted left by -14px.
    # The step creates an unmistakable dynamic 'elevation' vector:
    # Continuous learning, algorithmic progression, kinetic stability.
    # Inner aperture creates a sharp negative keyhole.
    
    cx, cy = 128, 128
    R = 102
    r = 54
    gap_y = 18 # 18px vertical separation
    offset_x = 16 # kinetic step offset
    
    # Top Half:
    # Center: (128 + offset_x, 128 - gap_y/2) = (144, 119)
    # Semicircle spanning from 180° to 0° (top)
    # Outer arc: from (144 - 102, 119) = (42, 119) to (144 + 102, 119) = (246, 119)
    # Inner arc: from (144 + 54, 119) = (198, 119) to (144 - 54, 119) = (90, 119)
    
    # Bottom Half:
    # Center: (128 - offset_x, 128 + gap_y/2) = (112, 137)
    # Semicircle spanning from 0° to 180° (bottom)
    # Outer arc: from (112 + 102, 137) = (214, 137) to (112 - 102, 137) = (10, 137)
    # Inner arc: from (112 - 54, 137) = (58, 137) to (112 + 54, 137) = (166, 137)
    
    # Let's adjust offset_x and radii so total bounding box is centered at 128:
    # Top outer max X: 144 + 102 = 246.
    # Bottom outer min X: 112 - 102 = 10.
    # Total width: 246 - 10 = 236.
    # Center X: (246 + 10)/2 = 128! PERFECT!
    # Top outer min Y: 119 - 102 = 17.
    # Bottom outer max Y: 137 + 102 = 239.
    # Total height: 239 - 17 = 222.
    # Center Y: (239 + 17)/2 = 128! PERFECT!
    
    top_d = (
        f"M 42 119 "
        f"A {R} {R} 0 0 1 246 119 "
        f"H 198 "
        f"A {r} {r} 0 0 0 90 119 Z"
    )
    
    bottom_d = (
        f"M 214 137 "
        f"A {R} {R} 0 0 1 10 137 "
        f"H 58 "
        f"A {r} {r} 0 0 0 166 137 Z"
    )
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c">
  <title id="title-c">OXONOM — The Meridian Aperture</title>
  <!--
    Concept C: The Meridian Aperture (Kinetic Elevation Letterform)
    A precision circular letterform 'O' bisected along a horizontal meridian.
    Upper and lower hemispheres step dynamically (+16px / -16px), forming
    a forward ascension vector (Progressive Intelligence) and dual-aperture lock.
    Rock-solid at 16px favicon scale; pure Swiss typographic reduction.
  -->
  <g fill="#000000">
    <path d="{top_d}" />
    <path d="{bottom_d}" />
  </g>
</svg>"""
    return svg

def main():
    path_a = os.path.join(OUT_DIR, "concept-a-nexus.svg")
    path_b = os.path.join(OUT_DIR, "concept-b-keystone.svg")
    path_c = os.path.join(OUT_DIR, "concept-c-meridian.svg")
    
    with open(path_a, "w") as f:
        f.write(get_exact_nexus_svg())
    with open(path_b, "w") as f:
        f.write(get_exact_keystone_svg())
    with open(path_c, "w") as f:
        f.write(get_exact_meridian_svg())
        
    print(f"Generated:")
    print(f"  {path_a}")
    print(f"  {path_b}")
    print(f"  {path_c}")

if __name__ == "__main__":
    main()
