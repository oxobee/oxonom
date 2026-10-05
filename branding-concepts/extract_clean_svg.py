import struct
import math

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# High-resolution boundary extraction
# We have 4 components. Let's trace the boundary of each component into an SVG path.
# We can use marching squares on the pixel grid.

# Binary grid
grid = [[0]*(width+2) for _ in range(height+2)]
for y in range(height):
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        if gray < 160:
            grid[y+1][x+1] = 1

# Marching squares to generate line segments, then chain into closed loops
# Edges: for cell (x, y) with corners (x,y), (x+1,y), (x+1,y+1), (x,y+1)
# Top edge midpoint: (x+0.5, y)
# Right edge midpoint: (x+1, y+0.5)
# Bottom edge midpoint: (x+0.5, y+1)
# Left edge midpoint: (x, y+0.5)

segments = []
for y in range(height+1):
    for x in range(width+1):
        tl = grid[y][x]
        tr = grid[y][x+1]
        br = grid[y+1][x+1]
        bl = grid[y+1][x]
        case = (tl << 3) | (tr << 2) | (br << 1) | bl
        
        # Midpoints
        pT = (x + 0.5, y)
        pR = (x + 1, y + 0.5)
        pB = (x + 0.5, y + 1)
        pL = (x, y + 0.5)
        
        if case in (1, 14): segments.append((pL, pB))
        elif case in (2, 13): segments.append((pB, pR))
        elif case in (3, 12): segments.append((pL, pR))
        elif case in (4, 11): segments.append((pT, pR))
        elif case in (5,):
            segments.append((pL, pT))
            segments.append((pB, pR))
        elif case in (10,):
            segments.append((pT, pR))
            segments.append((pL, pB))
        elif case in (6, 9): segments.append((pT, pB))
        elif case in (7, 8): segments.append((pL, pT))

print(f"Total line segments from marching squares: {len(segments)}")

# Chain segments into closed loops
from collections import defaultdict
pt_map = defaultdict(list)
for p1, p2 in segments:
    pt_map[p1].append(p2)

visited_segs = set()
loops = []

for p1, p2 in segments:
    if (p1, p2) in visited_segs or (p2, p1) in visited_segs:
        continue
    loop = [p1]
    curr = p2
    visited_segs.add((p1, p2))
    
    while True:
        loop.append(curr)
        next_pts = [p for p in pt_map[curr] if (curr, p) not in visited_segs]
        if not next_pts:
            break
        np = next_pts[0]
        visited_segs.add((curr, np))
        if np == loop[0]:
            break
        curr = np
        if len(loop) > 10000:
            break
    if len(loop) > 10:
        loops.append(loop)

print(f"Formed {len(loops)} loops.")
# Sort loops by length
loops.sort(key=lambda l: len(l), reverse=True)
for i, l in enumerate(loops):
    print(f"Loop {i}: {len(l)} vertices")
