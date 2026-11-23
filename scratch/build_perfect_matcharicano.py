import cv2
import numpy as np
from PIL import Image, ImageEnhance

# 1. Load base_cup (matcha_cup_left.png)
base_cup = cv2.imread('assets/images/matcha_cup_left.png', cv2.IMREAD_UNCHANGED)
h, w, _ = base_cup.shape
base_alpha = base_cup[:, :, 3]

# 2. Load uploaded photo (media_1795422888200_c031f131.jpg)
p = r'C:/Users/Lenovo/.gemini/antigravity/brain/db1a435d-2d57-455b-bc0c-b035800d00d4/.user_uploaded/media_1795422888200_c031f131.jpg'
uploaded = cv2.imread(p)
inner = uploaded[57:563, 52:972]

# Left cup in inner:
# Cup body runs from y = 115 to y = 490, x from 135 to 455
raw_cup = inner[115:490, 135:455]

# In base_cup, the cup body corresponds to:
# y in [280, 955], x in [95, 585]
target_body_h = 955 - 280
target_body_w = 585 - 95
resized_raw = cv2.resize(raw_cup, (target_body_w, target_body_h), interpolation=cv2.INTER_LANCZOS4)

# Create Matcharicano cup based on base_cup
cano_cup = base_cup.copy().astype(float)

# We want:
# 1. Lid (y < 280): 100% identical pristine domed lid from base_cup (ZERO distortion, ZERO missing chunks)
# 2. Upper liquid transition (y in [280, 340]): smoothly blend into the rich ceremonial matcha green
# 3. Cup body (y in [340, 920]):
#    Take the Matcharicano liquid texture (translucent sparkling water with ice cubes at bottom, rich green on top)
#    Combine with base_cup's crisp condensation highlights, logo, and lighting
# 4. Base & contact shadow (y > 920): smoothly transition to base_cup's grounded rounded base and contact drop-shadow

for y in range(280, 955):
    body_y = y - 280
    # Blend weight for smooth vertical transitions at edges
    if y < 330:
        w_trans = (y - 280) / 50.0
    elif y > 910:
        w_trans = (955 - y) / 45.0
    else:
        w_trans = 1.0

    for x in range(95, 585):
        if base_alpha[y, x] > 20:
            body_x = x - 95
            b_pix = base_cup[y, x, :3].astype(float)
            r_pix = resized_raw[body_y, body_x].astype(float)
            
            # The cup interior should adopt the Matcharicano liquid and ice
            # In the lower area (milk in base_cup), replace opaque milk with sparkling iced water texture
            # Preserve luminance & condensation detail from base_cup
            # Luminance of base cup
            b_gray = 0.114 * b_pix[0] + 0.587 * b_pix[1] + 0.299 * b_pix[2]
            
            # Blend raw Matcharicano with base_cup specular details
            cano_blend = r_pix * 0.85 + b_pix * 0.15
            
            # Final pixel
            cano_cup[y, x, :3] = b_pix * (1.0 - w_trans) + cano_blend * w_trans

cano_cup = np.clip(cano_cup, 0, 255).astype(np.uint8)

# Convert to PIL Image
pil_cano = Image.fromarray(cv2.cvtColor(cano_cup, cv2.COLOR_BGRA2RGBA))

# Target size: identical to fit_cup_in_canvas in generate_all_menu_transparent_assets.py
# target_size = (320, 480), target_h = 450
target_size = (320, 480)
target_h = 450
w_cup, h_cup = pil_cano.size
aspect = w_cup / h_cup
target_w = int(target_h * aspect)
resized_cano = pil_cano.resize((target_w, target_h), Image.Resampling.LANCZOS)

final_canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
off_x = (target_size[0] - target_w) // 2
off_y = target_size[1] - target_h  # Rest on bottom, leaving 30px headroom at top
final_canvas.paste(resized_cano, (off_x, off_y), resized_cano)

# Save to assets/images/menu/
menu_dir = "assets/images/menu"
final_canvas.save(f"{menu_dir}/ice-matcharicano.png", "PNG", optimize=True)
final_canvas.save(f"{menu_dir}/ice-matcharicano.webp", "WEBP", quality=95)

# Fallback on pure white
white_bg = Image.new("RGB", target_size, (255, 255, 255))
white_bg.paste(final_canvas, (0, 0), final_canvas)
white_bg.save(f"{menu_dir}/ice-matcharicano.jpg", "JPEG", quality=95)

print("Generated perfected assets/images/menu/ice-matcharicano (.png, .webp, .jpg)!")
