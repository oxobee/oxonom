import struct

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    header = f.read(54)
    file_type, file_size, res1, res2, offset = struct.unpack('<2sIHHI', header[:14])
    header_size, width, raw_height, planes, bpp, comp = struct.unpack('<IiiHHI', header[14:34])
    
    top_down = raw_height < 0
    height = abs(raw_height)
    print(f"BMP: {width}x{height}, top_down={top_down}, bpp={bpp}, offset={offset}")
    
    f.seek(offset)
    row_size = ((bpp * width + 31) // 32) * 4
    
    rows = [f.read(row_size) for _ in range(height)]

min_x, max_x, min_y, max_y = width, 0, height, 0
dark_pixels = 0

for y in range(height):
    row_data = rows[y]
    for x in range(width):
        b, g, r = row_data[x*4 : x*4+3]
        gray = 0.299*r + 0.587*g + 0.114*b
        if gray < 160:
            dark_pixels += 1
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)

print(f"BBox: x: [{min_x}, {max_x}] w={max_x - min_x + 1}, y: [{min_y}, {max_y}] h={max_y - min_y + 1}")
print(f"Dark pixels: {dark_pixels}")
