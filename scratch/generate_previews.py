from PIL import Image
import numpy as np

# Composite cups on cream background (#FFFDF5) and dark green (#103713)
cl = Image.open("assets/images/matcha_cup_left.png")
cr = Image.open("assets/images/matcha_cup_right.png")

w = cl.width + cr.width + 100
h = max(cl.height, cr.height) + 100

for name, color in [("cream", (255, 253, 245, 255)), ("dark", (16, 55, 19, 255)), ("red", (200, 50, 50, 255))]:
    canvas = Image.new("RGBA", (w, h), color)
    canvas.paste(cl, (30, 50), cl)
    canvas.paste(cr, (cl.width + 70, 50), cr)
    canvas.convert("RGB").save(f"scratch/preview_both_{name}.jpg", quality=95)

# Also zoom in on the lid area (top 350px)
lid_w = cl.width + cr.width + 60
lid_h = 350
for name, color in [("cream", (255, 253, 245, 255)), ("dark", (16, 55, 19, 255))]:
    canvas = Image.new("RGBA", (lid_w, lid_h), color)
    canvas.paste(cl.crop((0, 0, cl.width, 350)), (20, 0), cl.crop((0, 0, cl.width, 350)))
    canvas.paste(cr.crop((0, 0, cr.width, 350)), (cl.width + 40, 0), cr.crop((0, 0, cr.width, 350)))
    canvas.convert("RGB").save(f"scratch/preview_lids_{name}.jpg", quality=95)

print("Previews saved.")
