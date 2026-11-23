import cv2
import numpy as np
from PIL import Image

# 1. Load base cup
base = cv2.imread('assets/images/matcha_cup_left.png', cv2.IMREAD_UNCHANGED)
h_base, w_base, _ = base.shape
alpha_base = base[:, :, 3]

# 2. Load photo
p = r'C:/Users/Lenovo/.gemini/antigravity/brain/db1a435d-2d57-455b-bc0c-b035800d00d4/.user_uploaded/media_1795422888200_c031f131.jpg'
photo = cv2.imread(p).astype(float)
h_p, w_p, _ = photo.shape

# 3. Find base cup horizontal spans per row
base_lefts = np.zeros(h_base, dtype=int)
base_rights = np.zeros(h_base, dtype=int)

for y in range(h_base):
    cols = np.where(alpha_base[y] > 40)[0]
    if len(cols) > 0:
        base_lefts[y] = cols[0]
        base_rights[y] = cols[-1]

# 4. Create new cup array
new_cup = base.copy().astype(float)

# In photo: left cup body runs from y=230 to y=555
# At y=230: left=208, right=492
# At y=555: left=278, right=438
# Add 3px safety margin to be strictly inside the cup
y_p_top = 230.0
y_p_bot = 552.0

lx_p_top = 210.0
rx_p_top = 490.0

lx_p_bot = 280.0
rx_p_bot = 436.0

y_b_start = 280
y_b_end = 930

for y in range(y_b_start, y_b_end):
    lx_b = base_lefts[y]
    rx_b = base_rights[y]
    w_b = rx_b - lx_b
    if w_b <= 0:
        continue

    # Vertical interpolation factor
    t_y = (y - y_b_start) / float(y_b_end - y_b_start)
    
    # Vertical weight
    if y < 330:
        w_vert = (y - y_b_start) / 50.0
    elif y > 900:
        w_vert = (y_b_end - y) / 30.0
    else:
        w_vert = 1.0

    # Corresponding row in photo
    y_p = y_p_top + t_y * (y_p_bot - y_p_top)
    
    # Left and right in photo at y_p
    lx_p = lx_p_top + t_y * (lx_p_bot - lx_p_top)
    rx_p = rx_p_top + t_y * (rx_p_bot - rx_p_top)

    for x in range(lx_b, rx_b + 1):
        if alpha_base[y, x] <= 20:
            continue

        u = (x - lx_b) / float(w_b)
        u = np.clip(u, 0.0, 1.0)

        # Horizontal rim edge feathering (keep base cup's clean plastic edge)
        rim_feather = 0.06
        if u < rim_feather:
            w_horiz = u / rim_feather
        elif u > (1.0 - rim_feather):
            w_horiz = (1.0 - u) / rim_feather
        else:
            w_horiz = 1.0

        weight = w_vert * w_horiz

        # Corresponding x in photo (strictly inside cup interior)
        x_p = lx_p + u * (rx_p - lx_p)

        # Bilinear interpolation of photo at (y_p, x_p)
        y0 = int(np.floor(y_p))
        y1 = min(y0 + 1, h_p - 1)
        fy = y_p - y0

        x0 = int(np.floor(x_p))
        x1 = min(x0 + 1, w_p - 1)
        fx = x_p - x0

        p00 = photo[y0, x0, :3]
        p01 = photo[y0, x1, :3]
        p10 = photo[y1, x0, :3]
        p11 = photo[y1, x1, :3]

        p_sample = (1 - fx) * (1 - fy) * p00 + fx * (1 - fy) * p01 + (1 - fx) * fy * p10 + fx * fy * p11

        b_pix = base[y, x, :3].astype(float)

        # Blend: sample adopts rich liquid and ice, while base contributes specular highlights
        blend_liquid = p_sample * 0.90 + b_pix * 0.10

        new_cup[y, x, :3] = b_pix * (1.0 - weight) + blend_liquid * weight

new_cup = np.clip(new_cup, 0, 255).astype(np.uint8)

# Format into standard 320x480 menu visual
pil_cup = Image.fromarray(cv2.cvtColor(new_cup, cv2.COLOR_BGRA2RGBA))
target_size = (320, 480)
target_h = 450
w_cup, h_cup = pil_cup.size
aspect = w_cup / h_cup
target_w = int(target_h * aspect)
resized_cup = pil_cup.resize((target_w, target_h), Image.Resampling.LANCZOS)

final_canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
off_x = (target_size[0] - target_w) // 2
off_y = target_size[1] - target_h
final_canvas.paste(resized_cup, (off_x, off_y), resized_cup)

# Save test renders
final_canvas.save('scratch/clean_matcharicano_canvas.png')

# Composite on white background for preview
white_bg = Image.new("RGB", target_size, (255, 255, 255))
white_bg.paste(final_canvas, (0, 0), final_canvas)
white_bg.save('scratch/clean_matcharicano_white.jpg')

# Side by side comparison with Latte
latte_img = Image.open('assets/images/menu/ice-matcha-latte.png')
side_by_side = Image.new('RGB', (660, 480), (245, 243, 238))
side_by_side.paste(latte_img, (10, 0), latte_img)
side_by_side.paste(final_canvas, (330, 0), final_canvas)
side_by_side.save('scratch/side_by_side_preview.jpg')

print("Clean Matcharicano rendered successfully!")
