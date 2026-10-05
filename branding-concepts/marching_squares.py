import struct
import math

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# Grid of samples
grid = [[0]*(width+2) for _ in range(height+2)]
for y in range(height):
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        if gray < 160:
            grid[y+1][x+1] = 1

# Connected components of black pixels
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
                comp.append((cx-1, cy-1))
                for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < width+2 and 0 <= ny < height+2:
                        if grid[ny][nx] == 1 and not visited[ny][nx]:
                            visited[ny][nx] = True
                            queue.append((nx, ny))
            if len(comp) > 50:
                components.append(comp)

print(f"Connected black components: {len(components)}")
for i, c in enumerate(components):
    xs = [p[0] for p in c]
    ys = [p[1] for p in c]
    print(f"Comp {i}: {len(c)} px, bbox: x=[{min(xs)}, {max(xs)}], y=[{min(ys)}, {max(ys)}]")

