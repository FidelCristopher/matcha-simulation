import os
from PIL import Image

# Let's check preview_cups_fulllid.jpg and preview_lids_fulllid.jpg
p1 = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\preview_cups_fulllid.jpg"
p2 = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\preview_lids_fulllid.jpg"

print("p1 exists:", os.path.exists(p1))
print("p2 exists:", os.path.exists(p2))

if os.path.exists(p1):
    im1 = Image.open(p1)
    print("im1 size:", im1.size)
if os.path.exists(p2):
    im2 = Image.open(p2)
    print("im2 size:", im2.size)

# Also let's inspect the top of matcha_cup_left.png and matcha_cup_right.png
cl = Image.open("assets/images/matcha_cup_left.png")
cr = Image.open("assets/images/matcha_cup_right.png")
print("cl size:", cl.size, "cr size:", cr.size)

# Let's crop the top 300px of both cups and save to scratch to inspect alpha and RGB
crop_l = cl.crop((0, 0, cl.width, 320))
crop_r = cr.crop((0, 0, cr.width, 320))
crop_l.save("scratch/crop_l_top.png")
crop_r.save("scratch/crop_r_top.png")

# Check bounding box of non-zero alpha in the top 300px
alpha_l = crop_l.split()[-1]
alpha_r = crop_r.split()[-1]
print("alpha_l bbox:", alpha_l.getbbox())
print("alpha_r bbox:", alpha_r.getbbox())
