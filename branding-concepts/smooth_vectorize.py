import struct
import math
import subprocess

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

grid = [[0]*(width+2) for _ in range(height+2)]
for y in range(height):
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        if gray < 160:
            grid[y+1][x+1] = 1

# Extract horizontal runs per component
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

print(f"Components found: {len(components)}")

# For each component, create SVG path using boundary pixel tracing
def rdp(pts, epsilon=0.65):
    if len(pts) < 3:
        return pts
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

# Outer boundary tracing using direction walk
def trace_boundary(comp_pixels):
    comp_set = set(comp_pixels)
    # Find top-left pixel
    sorted_pixels = sorted(comp_pixels, key=lambda p: (p[1], p[0]))
    start = sorted_pixels[0]
    
    # Trace around outer perimeter
    # Directions: 0: R, 1: D, 2: L, 3: U
    dx = [1, 0, -1, 0]
    dy = [0, 1, 0, -1]
    
    # We trace on grid of edges:
    # A pixel at (x, y) has 4 edges: top (y), right (x+1), bottom (y+1), left (x)
    # Let's collect boundary edges
    boundary_edges = set()
    for x, y in comp_pixels:
        for d in range(4):
            nx, ny = x + dx[d], y + dy[d]
            if (nx, ny) not in comp_set:
                # This edge is on boundary
                if d == 0: boundary_edges.add(((x+1, y), (x+1, y+1))) # Right
                elif d == 1: boundary_edges.add(((x+1, y+1), (x, y+1))) # Bottom
                elif d == 2: boundary_edges.add(((x, y+1), (x, y))) # Left
                elif d == 3: boundary_edges.add(((x, y), (x+1, y))) # Top
                
    # Connect edges into loops
    from collections import defaultdict
    adj = defaultdict(list)
    for p1, p2 in boundary_edges:
        adj[p1].append(p2)
        
    loops = []
    visited_e = set()
    for p1, p2 in boundary_edges:
        if (p1, p2) in visited_e:
            continue
        loop = [p1]
        curr = p2
        visited_e.add((p1, p2))
        while True:
            loop.append(curr)
            candidates = [p for p in adj[curr] if (curr, p) not in visited_e]
            if not candidates:
                break
            np = candidates[0]
            visited_e.add((curr, np))
            if np == loop[0]:
                break
            curr = np
            if len(loop) > 10000:
                break
        if len(loop) > 8:
            loops.append(loop)
    return loops

all_simplified_paths = []
total_anchors = 0
for i, comp in enumerate(components):
    loops = trace_boundary(comp)
    for l in loops:
        s = rdp(l, epsilon=0.65)
        # Shift back from grid offset (x-1, y-1)
        s_shifted = [(p[0]-1, p[1]-1) for p in s]
        total_anchors += len(s_shifted)
        # SVG path
        d = "M " + " L ".join(f"{p[0]:.1f} {p[1]:.1f}" for p in s_shifted) + " Z"
        all_simplified_paths.append(d)

print(f"Generated {len(all_simplified_paths)} smooth paths, total anchors: {total_anchors}")

svg_out = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" aria-labelledby="title-edu">
  <title id="title-edu">edu Ribbon Ligature</title>
  <path fill="#000000" fill-rule="evenodd" d="{' '.join(all_simplified_paths)}" />
</svg>"""

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_edu.svg", "w") as f:
    f.write(svg_out)

subprocess.run([
    "python3", "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py",
    "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_edu.svg",
    "-o", "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_edu.png",
    "--width", str(width), "--height", str(height), "--bg", "#ffffff"
], check=True)

# Run audit
subprocess.run([
    "python3", "/Users/ugurugurlu/.agents/skills/logo-design/scripts/svg_audit.py",
    "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_edu.svg"
], check=True)

print("Rendered and audited smooth_edu.svg!")
