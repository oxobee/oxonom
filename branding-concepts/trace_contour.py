import struct
import math

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

binary = [[0]*(width+2) for _ in range(height+2)]
for y in range(height):
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        if gray < 160:
            binary[y+1][x+1] = 1

# Find all boundary contours using Moore Neighbor tracing
visited_edges = set()
contours = []

# Directions: 0: R, 1: DR, 2: D, 3: DL, 4: L, 5: UL, 6: U, 7: UR
dx = [1, 1, 0, -1, -1, -1, 0, 1]
dy = [0, 1, 1, 1, 0, -1, -1, -1]

for y in range(1, height+1):
    for x in range(1, width+1):
        if binary[y][x] == 1 and binary[y][x-1] == 0:
            # Found outer boundary
            edge = (x, y, 4)
            if edge in visited_edges:
                continue
            
            # Trace contour
            curr_x, curr_y = x, y
            curr_dir = 6 # Entered from left
            pts = [(curr_x-1, curr_y-1)]
            
            start_x, start_y = curr_x, curr_y
            while True:
                # Search neighborhood clockwise
                found = False
                for i in range(8):
                    check_dir = (curr_dir + 5 + i) % 8
                    nx = curr_x + dx[check_dir]
                    ny = curr_y + dy[check_dir]
                    if binary[ny][nx] == 1:
                        curr_x, curr_y = nx, ny
                        curr_dir = check_dir
                        visited_edges.add((curr_x, curr_y, check_dir))
                        pts.append((curr_x-1, curr_y-1))
                        found = True
                        break
                if not found or (curr_x == start_x and curr_y == start_y):
                    break
                if len(pts) > 5000:
                    break
            
            if len(pts) > 20:
                contours.append(pts)

print(f"Found {len(contours)} contours.")
for i, c in enumerate(contours):
    print(f"Contour {i}: {len(c)} points")

