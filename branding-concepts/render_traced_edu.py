import subprocess
from extract_clean_svg import loops, width, height

# Generate SVG
path_d_list = []
for l in loops:
    d = "M " + " L ".join(f"{p[0]:.1f} {p[1]:.1f}" for p in l) + " Z"
    path_d_list.append(d)

full_path = " ".join(path_d_list)

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <path fill="#000000" fill-rule="evenodd" d="{full_path}" />
</svg>"""

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/traced_edu.svg", "w") as f:
    f.write(svg)

# Render to PNG
subprocess.run([
    "python3", "/Users/ugurugurlu/.agents/skills/logo-design/scripts/render_png.py",
    "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/traced_edu.svg",
    "-o", "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/traced_edu.png",
    "--width", str(width), "--height", str(height), "--bg", "#ffffff"
], check=True)

print("Rendered traced_edu.png successfully!")
