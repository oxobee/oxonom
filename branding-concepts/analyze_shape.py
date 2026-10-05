import struct

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# Create binary grid
grid = []
for y in range(60, 240):
    row_chars = []
    for x in range(30, 385, 3):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        row_chars.append('#' if gray < 140 else '.')
    grid.append(''.join(row_chars))

# Print downsampled ASCII view
for i, line in enumerate(grid):
    if i % 3 == 0:
        print(f"{60+i:3d}: {line}")
