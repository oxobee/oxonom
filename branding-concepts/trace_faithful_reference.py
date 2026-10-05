import struct
import math

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# Binary grid
grid = [[0]*(width+2) for _ in range(height+2)]
for y in range(height):
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        if gray < 160:
            grid[y+1][x+1] = 1

# Connected components
visited = [[False]*(width+2) for _ in range(height+2)]
components = []

for y in range(1, height+1):
    for x in range(1, width+1):
        if grid[y][x] == 1 and not visited[y][x]:
            comp = []
            queue = [(x, y)]
            visited[y][x] = True
            while queue:
                cx, cy = queue.pop()
                comp.append((cx, cy))
                for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < width+2 and 0 <= ny < height+2:
                        if grid[ny][nx] == 1 and not visited[ny][nx]:
                            visited[ny][nx] = True
                            queue.append((nx, ny))
            if len(comp) > 100:
                components.append(comp)

print(f"Found {len(components)} significant components")

# For each component, trace outer contour and inner holes
def get_component_svg_paths(comp):
    comp_set = set(comp)
    # Bounding box
    xs = [p[0] for p in comp]
    ys = [p[1] for p in comp]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    # Local grid
    w = max_x - min_x + 3
    h = max_y - min_y + 3
    local_grid = [[0]*w for _ in range(h)]
    for x, y in comp:
        local_grid[y - min_y + 1][x - min_x + 1] = 1
        
    # Marching squares on local grid
    segments = []
    for ly in range(h - 1):
        for lx in range(w - 1):
            tl = local_grid[ly][lx]
            tr = local_grid[ly][lx+1]
            br = local_grid[ly+1][lx+1]
            bl = local_grid[ly+1][lx]
            case = (tl << 3) | (tr << 2) | (br << 1) | bl
            
            pT = (lx + 0.5, ly)
            pR = (lx + 1, ly + 0.5)
            pB = (lx + 0.5, ly + 1)
            pL = (lx, ly + 0.5)
            
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
            
    # Connect segments into loops
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
            if not next_pts: break
            np = next_pts[0]
            visited_segs.add((curr, np))
            if np == loop[0]: break
            curr = np
            if len(loop) > 10000: break
        if len(loop) > 8:
            # Shift back to global coordinates
            global_loop = [(p[0] + min_x - 1, p[1] + min_y - 1) for p in loop]
            loops.append(global_loop)
    return loops

all_loops = []
for c in components:
    all_loops.extend(get_component_svg_paths(c))

print(f"Total clean loops extracted: {len(all_loops)}")

# Let's simplify each loop using Ramer-Douglas-Peucker (epsilon = 1.0)
def rdp(pts, epsilon=1.0):
    if len(pts) < 3:
        return pts
    # Find point with max distance from line between first and last
    p1 = pts[0]
    p2 = pts[-1]
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    d_norm = math.hypot(dx, dy)
    if d_norm == 0:
        return [p1, p2]
    
    max_d = 0
    max_idx = 0
    for i in range(1, len(pts) - 1):
        p = pts[i]
        # Distance to line
        d = abs(dy*p[0] - dx*p[1] + p2[0]*p1[1] - p2[1]*p1[0]) / d_norm
        if d > max_d:
            max_d = d
            max_idx = i
            
    if max_d > epsilon:
        res1 = rdp(pts[:max_idx+1], epsilon)
        res2 = rdp(pts[max_idx:], epsilon)
        return res1[:-1] + res2
    else:
        return [p1, p2]

simplified_loops = []
for l in all_loops:
    sl = rdp(l, epsilon=0.9)
    simplified_loops.append(sl)

print(f"Simplified vertices: {[len(l) for l in simplified_loops]}")

# Write to SVG
path_strs = []
for l in simplified_loops:
    d = "M " + " L ".join(f"{p[0]-1:.1f} {p[1]-1:.1f}" for p in l) + " Z"
    path_strs.append(d)

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <path fill="#000000" fill-rule="evenodd" d="{' '.join(path_strs)}" />
</svg>"""

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/faithful_edu.svg", "w") as f:
    f.write(svg_content)

import subprocess
subprocess.run([
    "python3", "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py",
    "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/faithful_edu.svg",
    "-o", "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/faithful_edu.png",
    "--width", str(width), "--height", str(height), "--bg", "#ffffff"
], check=True)

print("Rendered faithful_edu.png successfully!")
