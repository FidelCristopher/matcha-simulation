import cv2
import numpy as np
from PIL import Image

# 1. Load base_cup (matcha_cup_left.png)
base_cup = cv2.imread('assets/images/matcha_cup_left.png', cv2.IMREAD_UNCHANGED)
h, w, _ = base_cup.shape
base_alpha = base_cup[:, :, 3]

# 2. Load uploaded photo and crop left cup body
p = r'C:/Users/Lenovo/.gemini/antigravity/brain/db1a435d-2d57-455b-bc0c-b035800d00d4/.user_uploaded/media_1795422888200_c031f131.jpg'
uploaded = cv2.imread(p)
inner = uploaded[57:563, 52:972]

# Left cup in inner:
# Lid rim is at y = 120, base is at y = 490
# Cup width is from x = 140 to x = 450 at rim, x = 190 to x = 400 at base
raw_cup = inner[115:495, 135:455]
rh, rw, _ = raw_cup.shape

# In base_cup, the corresponding cup body runs from:
# y = 295 (just below the rim of the lid) to y = 955 (just above the base contact)
# x = 105 to x = 575
target_body_h = 955 - 295
target_body_w = 575 - 105

# Resize raw_cup to match the cup body dimensions
resized_body = cv2.resize(raw_cup, (target_body_w, target_body_h), interpolation=cv2.INTER_LANCZOS4)

# Create result image initialized with base_cup
res = base_cup.copy()

# Blend the Matcharicano liquid body into base_cup
# Only inside the cup silhouette (where base_alpha == 255)
# Between y = 295 and y = 955
for y in range(295, 955):
    body_y = y - 295
    # Calculate transition factor:
    # Near top (y in [295..340]): smoothly transition from base_cup lid rim into Matcharicano green
    # Near bottom (y in [920..955]): smoothly transition into base_cup rounded base
    weight = 1.0
    if y < 340:
        weight = (y - 295) / 45.0
    elif y > 920:
        weight = (955 - y) / 35.0
        
    for x in range(105, 575):
        if base_alpha[y, x] > 20:
            body_x = x - 105
            # Original pixel and matcharicano pixel
            orig_rgb = base_cup[y, x, :3].astype(float)
            cano_rgb = resized_body[body_y, body_x].astype(float)
            
            # Blend
            blended = orig_rgb * (1.0 - weight) + cano_rgb * weight
            res[y, x, :3] = np.clip(blended, 0, 255).astype(np.uint8)

cv2.imwrite('scratch/test_hybrid_cup.png', res)

# Standard menu canvas: (320, 480)
# Match proportions and positioning with ice-matcha-latte exactly!
pil_res = Image.open('scratch/test_hybrid_cup.png')
target_h = 420
aspect = pil_res.size[0] / pil_res.size[1]
target_w = int(target_h * aspect)
resized_for_menu = pil_res.resize((target_w, target_h), Image.Resampling.LANCZOS)

menu_canvas = Image.new('RGBA', (320, 480), (0, 0, 0, 0))
off_x = (320 - target_w) // 2
off_y = 480 - target_h  # Rest on bottom, leaving headroom at top
menu_canvas.paste(resized_for_menu, (off_x, off_y), resized_for_menu)
menu_canvas.save('scratch/hybrid_matcharicano_menu.png')

# Composite on white
white_bg = Image.new('RGB', (320, 480), (255, 255, 255))
white_bg.paste(menu_canvas, (0, 0), menu_canvas)
white_bg.save('scratch/hybrid_matcharicano_white.jpg', quality=95)

print("Saved scratch/hybrid_matcharicano_white.jpg successfully!")
