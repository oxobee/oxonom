import struct
import subprocess

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# Binary grid
grid = []
for y in range(height):
    row = []
    for x in range(width):
        b, g, r = rows[y][x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        row.append(1 if gray < 160 else 0)
    grid.append(row)

# Run-length encoded horizontal rectangles
rect_paths = []
for y in range(height):
    in_run = False
    start_x = 0
    for x in range(width):
        if grid[y][x] == 1 and not in_run:
            in_run = True
            start_x = x
        elif grid[y][x] == 0 and in_run:
            in_run = False
            w_run = x - start_x
            rect_paths.append(f"M {start_x} {y} h {w_run} v 1 h -{w_run} Z")
    if in_run:
        w_run = width - start_x
        rect_paths.append(f"M {start_x} {y} h {w_run} v 1 h -{w_run} Z")

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <path fill="#000000" d="{' '.join(rect_paths)}" />
</svg>"""

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/rle_edu.svg", "w") as f:
    f.write(svg_content)

subprocess.run([
    "python3", "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py",
    "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/rle_edu.svg",
    "-o", "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/rle_edu.png",
    "--width", str(width), "--height", str(height), "--bg", "#ffffff"
], check=True)

print("Rendered rle_edu.png!")
