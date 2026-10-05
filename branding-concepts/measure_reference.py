import struct

with open('/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/ref_edu.bmp', 'rb') as f:
    f.seek(138)
    width, height = 398, 314
    rows = [f.read(width*4) for _ in range(height)]

# In ref_edu, let's find the centers of the circles for e, d, and u
# The outer circle of e:
# Leftmost x = 32. Rightmost of e circle ≈ 138.
# Center of e circle ≈ (32 + 138)/2 = 85.
# Top of e circle ≈ 126. Bottom of e circle ≈ 234.
# Center y ≈ (126 + 234)/2 = 180.
# Radius of e ≈ 54.
# Center of d bowl:
# Left of d bowl ≈ 126. Right of d bowl ≈ 232.
# Center x ≈ 179.
# Radius of d ≈ 53.
# Vertical stem of d:
# x from ~210 to ~234 (width ~24).
# Top of d ascender ≈ y=63. Angled cut from y=63 to y=81.
# Bottom of d stem ≈ y=234.
# u:
# Left stem/bowl of u ≈ x=210 to x=280.
# Right stem of u ≈ x=357 to x=381 (width ~24).
# Bottom of u cup ≈ y=234. Top of u stems ≈ y=126.

print("Reference measurements:")
print("e: center ~(85, 180), R ~ 54, r ~ 30, stroke ~ 24")
print("d bowl: center ~(179, 180), R ~ 53, r ~ 29, stroke ~ 24")
print("d ascender: x ~ [210, 234], y ~ [63, 234]")
print("u right stem: x ~ [357, 381], y ~ [126, 234]")
print("u bottom cup: center y ~ 180, bottom y ~ 234")
print("Diagonal ribbon connecting e, d, u: slope ~ 40 deg, stroke ~ 24")
