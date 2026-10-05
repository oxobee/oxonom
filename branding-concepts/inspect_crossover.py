import struct

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# Print high-res ASCII around x=140..300, y=110..240
print("Detailed ASCII around d and u crossover:")
for y in range(115, 235, 4):
    row_str = f"{y:3d}: "
    for x in range(140, 310, 2):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        row_str += '#' if gray < 160 else ' '
    print(row_str)
