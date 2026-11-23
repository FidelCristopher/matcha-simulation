import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

menu_dir = "assets/images/menu"
os.makedirs(menu_dir, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. GENERATE THE 6 MENU DRINK ASSETS (HIGH-RES TRANSPARENT RGBA)
# -----------------------------------------------------------------------------

# Load high-res transparent cup sources
im_left = Image.open("assets/images/matcha_cup_left.png").convert("RGBA")
im_right = Image.open("assets/images/matcha_cup_right.png").convert("RGBA")

# Standard target size for card visuals: (320, 480)
# This gives crisp resolution, perfect proportions, and headroom for the pop-out.
target_size = (320, 480)

def fit_cup_in_canvas(cup_img, target_h=450):
    w, h = cup_img.size
    aspect = w / h
    new_w = int(target_h * aspect)
    resized = cup_img.resize((new_w, target_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    offset_x = (target_size[0] - new_w) // 2
    offset_y = target_size[1] - target_h  # Rest on bottom, leaving headroom at top
    canvas.paste(resized, (offset_x, offset_y), resized)
    return canvas

def save_dual_formats(img_rgba, base_name):
    # Save transparent PNG
    png_path = os.path.join(menu_dir, f"{base_name}.png")
    img_rgba.save(png_path, "PNG", optimize=True)
    
    # Save transparent WebP
    webp_path = os.path.join(menu_dir, f"{base_name}.webp")
    img_rgba.save(webp_path, "WEBP", quality=95, lossless=False)
    
    # Also save fallback JPEG on clean pure white (for backwards compatibility)
    white_bg = Image.new("RGB", img_rgba.size, (255, 255, 255))
    white_bg.paste(img_rgba, (0, 0), img_rgba)
    jpg_path = os.path.join(menu_dir, f"{base_name}.jpg")
    white_bg.save(jpg_path, "JPEG", quality=95)
    print(f"Saved {base_name}: .png, .webp, .jpg")

# 1.1 ICE MATCHA LATTE (Signature iced matcha with fresh milk, green swirl, domed lid)
cup_latte = fit_cup_in_canvas(im_left)
save_dual_formats(cup_latte, "ice-matcha-latte")

# 1.2 ICE MATCHA VANILLA FOAM (Signature iced matcha with thick vanilla cloud foam)
cup_foam = fit_cup_in_canvas(im_right)
save_dual_formats(cup_foam, "ice-matcha-vanilla-foam")

# 1.3 ICE MATCHARICANO (Deep ceremonial green throughout, clear ice cubes, water, mint)
arr_cano = np.array(im_left).astype(float)
h_c, w_c, _ = arr_cano.shape
alpha_c = arr_cano[:, :, 3]
# Turn lower white milk into deep translucent ceremonial green
milk_mask = (arr_cano[:, :, 0] > 170) & (arr_cano[:, :, 1] > 170) & (arr_cano[:, :, 2] > 170) & (np.arange(h_c)[:, None] > 540) & (alpha_c > 200)
arr_cano[milk_mask, 0] = arr_cano[milk_mask, 0] * 0.35 + 20
arr_cano[milk_mask, 1] = arr_cano[milk_mask, 1] * 0.55 + 50
arr_cano[milk_mask, 2] = arr_cano[milk_mask, 2] * 0.25 + 15
im_cano_raw = Image.fromarray(np.clip(arr_cano, 0, 255).astype(np.uint8))
cup_cano = fit_cup_in_canvas(im_cano_raw)
save_dual_formats(cup_cano, "ice-matcharicano")

# 1.4 ICE MATCHA CHOCOLATE (3-layers: dark chocolate ganache at bottom, white milk, ceremonial matcha on top)
arr_mc = np.array(im_left).astype(float)
alpha_mc = arr_mc[:, :, 3]
choc_mask = (arr_mc[:, :, 0] > 160) & (arr_mc[:, :, 1] > 160) & (arr_mc[:, :, 2] > 160) & (np.arange(h_c)[:, None] > 720) & (alpha_mc > 200)
arr_mc[choc_mask, 0] = arr_mc[choc_mask, 0] * 0.35 + 30
arr_mc[choc_mask, 1] = arr_mc[choc_mask, 1] * 0.22 + 15
arr_mc[choc_mask, 2] = arr_mc[choc_mask, 2] * 0.15 + 10
im_mc_raw = Image.fromarray(np.clip(arr_mc, 0, 255).astype(np.uint8))
cup_mc = fit_cup_in_canvas(im_mc_raw)
save_dual_formats(cup_mc, "ice-matcha-chocolate")

# 1.5 ICE CHOCOLATE (Rich decadent dark iced chocolate)
arr_ic = np.array(im_left).astype(float)
alpha_ic = arr_ic[:, :, 3]
# Green matcha area -> rich chocolate
green_mask = (arr_ic[:, :, 1] > arr_ic[:, :, 0] + 15) & (arr_ic[:, :, 1] > arr_ic[:, :, 2] + 15) & (alpha_ic > 200) & (np.arange(h_c)[:, None] > 320)
arr_ic[green_mask, 0] = arr_ic[green_mask, 1] * 0.70 + 35
arr_ic[green_mask, 2] = arr_ic[green_mask, 1] * 0.25 + 15
arr_ic[green_mask, 1] = arr_ic[green_mask, 1] * 0.40 + 20
# Milk area -> creamy chocolate milk
milk_mask_ic = (arr_ic[:, :, 0] > 160) & (arr_ic[:, :, 1] > 160) & (arr_ic[:, :, 2] > 160) & (alpha_ic > 200) & (np.arange(h_c)[:, None] > 550)
arr_ic[milk_mask_ic, 0] = arr_ic[milk_mask_ic, 0] * 0.45 + 50
arr_ic[milk_mask_ic, 1] = arr_ic[milk_mask_ic, 1] * 0.32 + 30
arr_ic[milk_mask_ic, 2] = arr_ic[milk_mask_ic, 2] * 0.22 + 20
im_ic_raw = Image.fromarray(np.clip(arr_ic, 0, 255).astype(np.uint8))
cup_ic = fit_cup_in_canvas(im_ic_raw)
save_dual_formats(cup_ic, "ice-chocolate")

# 1.6 CUSTOM DRINK (Craft Lab 3D Beaker with glowing ceremonial whisk & gradient layers)
custom_img = Image.new("RGBA", (400, 560), (0, 0, 0, 0))
draw = ImageDraw.Draw(custom_img)

# Subtle radiant aura in background
for r in range(160, 20, -4):
    a = int(60 * (1 - r / 160.0))
    draw.ellipse([200 - r, 240 - r, 200 + r, 240 + r], fill=(98, 139, 53, a))

# Glass beaker contours
beaker_pts = [(120, 150), (120, 190), (95, 430), (305, 430), (280, 190), (280, 150)]
# Fill layered ingredients:
# Layer 1: Dark chocolate / syrup (y: 380..425)
draw.polygon([(100, 380), (300, 380), (303, 425), (97, 425)], fill=(65, 38, 25, 240))
# Layer 2: Oat / Fresh milk (y: 295..380)
draw.polygon([(112, 295), (288, 295), (300, 380), (100, 380)], fill=(255, 252, 245, 245))
# Layer 3: Ceremonial matcha green (y: 215..295)
draw.polygon([(122, 215), (278, 215), (288, 295), (112, 295)], fill=(85, 128, 42, 245))
# Layer 4: Fluffy vanilla foam (y: 165..215)
draw.polygon([(122, 165), (278, 165), (278, 215), (122, 215)], fill=(245, 244, 238, 245))

# Beaker glass outline & rim
draw.polygon(beaker_pts, outline=(16, 55, 19, 255), width=6)
draw.ellipse([115, 140, 285, 160], outline=(16, 55, 19, 255), width=5)

# Measurement graduations on glass
for tick_y in [240, 280, 320, 360, 400]:
    draw.line([(115, tick_y), (140, tick_y)], fill=(16, 55, 19, 200), width=3)

# Floating bamboo whisk handle & bristles bursting out of top (y: 60..155)
# Whisk handle
draw.polygon([(193, 50), (207, 50), (205, 110), (195, 110)], fill=(215, 175, 120, 255), outline=(130, 95, 55, 255), width=2)
# Whisk tines spreading into foam
draw.arc([175, 105, 225, 155], 0, 180, fill=(130, 95, 55, 255), width=4)
for t_x in [182, 190, 198, 202, 210, 218]:
    draw.line([(200, 110), (t_x, 150)], fill=(160, 120, 70, 255), width=2)

# Floating golden craft sparkle stars
for sx, sy in [(140, 95), (260, 105), (110, 230), (295, 250)]:
    draw.line([(sx-8, sy), (sx+8, sy)], fill=(230, 180, 40, 240), width=3)
    draw.line([(sx, sy-8), (sx, sy+8)], fill=(230, 180, 40, 240), width=3)

# Shadow under beaker
draw.ellipse([85, 420, 315, 450], fill=(16, 55, 19, 50))

cup_custom = fit_cup_in_canvas(custom_img)
save_dual_formats(cup_custom, "custom-drink")

print("All 6 primary menu assets successfully created in assets/images/menu/!")
