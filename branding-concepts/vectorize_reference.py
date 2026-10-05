import struct
import math

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# Create 2D binary array: 1 = dark (black), 0 = white
binary = []
for y in range(height):
    row = []
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        row.append(1 if gray < 160 else 0)
    binary.append(row)

# Let's write an SVG using horizontal spans (run-length encoded rectangles or path)
# A clean compound path of horizontal scanline runs merged:
rects = []
for y in range(height):
    in_run = False
    start_x = 0
    for x in range(width):
        if binary[y][x] == 1 and not in_run:
            in_run = True
            start_x = x
        elif binary[y][x] == 0 and in_run:
            in_run = False
            rects.append(f"M {start_x} {y} H {x} V {y+1} H {start_x} Z")
    if in_run:
        rects.append(f"M {start_x} {y} H {width} V {y+1} H {start_x} Z")

# Also find bounding box
min_x, max_x = 32, 381
min_y, max_y = 62, 234

print(f"Total scanline segments: {len(rects)}")
