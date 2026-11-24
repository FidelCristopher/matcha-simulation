import os
import numpy as np
from PIL import Image

os.makedirs('scratch', exist_ok=True)

latte = Image.open('assets/images/menu/ice-matcha-latte.png').convert('RGBA')
americano = Image.open('assets/images/menu/ice-matcharicano.png').convert('RGBA')
latte_np = np.array(latte, dtype=np.float32)
A_latte = latte_np[:, :, 3]

def get_cup_landmarks(rgb_or_rgba, is_alpha=False):
    arr = np.array(rgb_or_rgba, dtype=np.float32)
    h, w = arr.shape[:2]
    if is_alpha:
        fg = arr[:, :, 3] > 50
    else:
        # Foreground where not pure white (< 242)
        fg = np.any(arr[:, :, :3] < 242, axis=2)

    # Top of lid: first row with >= 10 foreground pixels
    row_counts = fg.sum(axis=1)
    top_y = np.where(row_counts >= 10)[0][0]

    # Widest lid row in top 25%
    lid_zone_y = int(top_y + h * 0.22)
    lid_widths = fg[top_y:lid_zone_y].sum(axis=1)
    widest_rel_y = np.argmax(lid_widths)
    lid_row = fg[top_y + widest_rel_y]
    lid_xs = np.where(lid_row)[0]
    lid_left, lid_right = lid_xs[0], lid_xs[-1]
    lid_cx = (lid_left + lid_right) / 2.0
    lid_w = lid_right - lid_left

    # Bottom of cup (check center column x +/- 15% of lid_w so we ignore bottom-left shadow!)
    cx = int(lid_cx)
    half_band = int(lid_w * 0.15)
    center_band = fg[:, max(0, cx - half_band):min(w, cx + half_band)]
    bot_ys = np.where(center_band.any(axis=1))[0]
    bot_y = bot_ys[-1]

    return {
        'top_y': int(top_y),
        'bot_y': int(bot_y),
        'lid_left': int(lid_left),
        'lid_right': int(lid_right),
        'lid_w': int(lid_w),
        'cup_h': int(bot_y - top_y),
        'cx': float(lid_cx)
    }

t_geo = get_cup_landmarks(latte, is_alpha=True)
print("Target (latte):", t_geo)

choco_path = r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_chocolate_gen_1795540468249.jpg'
matcha_choco_path = r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_matcha_chocolate_gen_1795540538965.jpg'

for name, path in [('choco', choco_path), ('matcha_choco', matcha_choco_path)]:
    im = Image.open(path).convert('RGB')
    s_geo = get_cup_landmarks(im, is_alpha=False)
    print(f"Source ({name}):", s_geo)

    # Crop exact cup box using s_geo
    # Note: width is lid_left .. lid_right, height is top_y .. bot_y
    cropped = im.crop((s_geo['lid_left'], s_geo['top_y'], s_geo['lid_right'], s_geo['bot_y']))
    resized = cropped.resize((t_geo['lid_w'], t_geo['cup_h']), Image.Resampling.LANCZOS)

    canvas = Image.new('RGB', (320, 480), (255, 255, 255))
    canvas.paste(resized, (t_geo['lid_left'], t_geo['top_y']))

    c_arr = np.array(canvas, dtype=np.float32)

    # Apply exact A_latte alpha mask and un-premultiply white studio background where 0 < A_latte < 250!
    a_norm = (A_latte / 255.0)[:, :, None]
    # Un-premultiply: color_fg = (color_comp - 255 * (1 - a)) / a
    # Clamp carefully to avoid division noise at very tiny alpha
    safe_a = np.maximum(a_norm, 0.18)
    defringed = np.where(
        (a_norm > 0.01) & (a_norm < 0.98),
        np.clip((c_arr - 255.0 * (1.0 - a_norm)) / safe_a, 0.0, 255.0),
        c_arr
    )

    # For very bottom floor shadow (y > 460 and alpha < 90), make it clean neutral shadow like latte
    y_grid = np.arange(480)[:, None]
    shadow_zone = (y_grid >= t_geo['bot_y'] - 4) & (A_latte < 120)
    defringed = np.where(shadow_zone[:, :, None], latte_np[:, :, :3], defringed)

    out_arr = np.dstack([defringed, A_latte]).astype(np.uint8)
    out_img = Image.fromarray(out_arr, 'RGBA')
    out_img.save(f'scratch/exact_{name}.png')

# Reload foam from before
foam_final = Image.open('scratch/final_ice_matcha_vanilla_foam.png').convert('RGBA')
choco_exact = Image.open('scratch/exact_choco.png').convert('RGBA')
matcha_choco_exact = Image.open('scratch/exact_matcha_choco.png').convert('RGBA')

# Compare all 5 on white AND dark green background
comp = Image.new('RGBA', (320 * 5, 480 * 2), (255, 255, 255, 255))
dark_row = Image.new('RGBA', (320 * 5, 480), (45, 65, 48, 255))
comp.paste(dark_row, (0, 480))

cups = [latte, americano, matcha_choco_exact, choco_exact, foam_final]
for i, cup in enumerate(cups):
    comp.paste(cup, (i * 320, 0), cup)
    comp.paste(cup, (i * 320, 480), cup)

comp.save('scratch/exact_5_cups_check.png')
print("Saved scratch/exact_5_cups_check.png")
