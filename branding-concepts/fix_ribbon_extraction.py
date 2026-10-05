with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_edu.svg') as f:
    edu_svg_raw = f.read()

# Find the path element
p_tag = edu_svg_raw.find('<path')
d_start = edu_svg_raw.find('d="', p_tag) + 3
d_end = edu_svg_raw.find('"', d_start)
edu_path_d = edu_svg_raw[d_start:d_end]

print("Path d starts with:", edu_path_d[:50])
print("Path d length:", len(edu_path_d))

# Fix in build_ribbon_master_lockups.py
with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/build_ribbon_master_lockups.py') as f:
    code = f.read()

old_logic = """d_start = edu_svg_raw.find('d="') + 3
d_end = edu_svg_raw.find('"', d_start)
edu_path_d = edu_svg_raw[d_start:d_end]"""

new_logic = """p_tag = edu_svg_raw.find('<path')
d_start = edu_svg_raw.find('d="', p_tag) + 3
d_end = edu_svg_raw.find('"', d_start)
edu_path_d = edu_svg_raw[d_start:d_end]"""

code = code.replace(old_logic, new_logic)

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/build_ribbon_master_lockups.py', 'w') as f:
    f.write(code)

print("Updated build_ribbon_master_lockups.py successfully!")
