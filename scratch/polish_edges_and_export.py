import os
import numpy as np
from PIL import Image, ImageFilter

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
        fg = np.any(arr[:, :, :3] < 240, axis=2)

    row_counts = fg.sum(axis=1)
    top_y = np.where(row_counts >= 10)[0][0]

    lid_zone_y = int(top_y + h * 0.22)
    lid_widths = fg[top_y:lid_zone_y].sum(axis=1)
    widest_rel_y = np.argmax(lid_widths)
    lid_row = fg[top_y + widest_rel_y]
    lid_xs = np.where(lid_row)[0]
    lid_left, lid_right = lid_xs[0], lid_xs[-1]
    lid_cx = (lid_left + lid_right) / 2.0
    lid_w = lid_right - lid_left

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
    }

t_geo = get_cup_landmarks(latte, is_alpha=True)

# Compute distance-like edge band from A_latte == 0 using blur
alpha_mask_img = Image.fromarray((A_latte > 10).astype(np.uint8) * 255)
eroded_3px = np.array(alpha_mask_img.filter(ImageFilter.MinFilter(7)), dtype=np.float32) # 3px inward erosion
edge_band = (A_latte > 0) & (eroded_3px < 128)

def process_generated_cup(jpg_path, trim_white_in_body_y=125):
    im = Image.open(jpg_path).convert('RGB')
    s_geo = get_cup_landmarks(im, is_alpha=False)

    # Crop tight & expand horizontally slightly by 2px so cup walls fill latte silhouette cleanly
    cropped = im.crop((s_geo['lid_left'], s_geo['top_y'], s_geo['lid_right'], s_geo['bot_y']))
    resized = cropped.resize((t_geo['lid_w'], t_geo['cup_h']), Image.Resampling.LANCZOS)

    canvas = Image.new('RGB', (320, 480), (255, 255, 255))
    canvas.paste(resized, (t_geo['lid_left'], t_geo['top_y']))
    c_arr = np.array(canvas, dtype=np.float32)

    alpha = A_latte.copy()

    # Remove any white background peeking inside the 3px outer edge band along cup body (y > trim_white_in_body_y)
    y_grid = np.arange(480)[:, None]
    min_c = c_arr.min(axis=2)
    chroma = c_arr.max(axis=2) - min_c
    white_leak = edge_band & (y_grid >= trim_white_in_body_y) & (min_c > 215) & (chroma < 22)
    alpha = np.where(white_leak, 0.0, alpha)

    # Also bottom U-curve (y > 410): chocolate/cup bottom is dark, so any bright edge pixel > 175 is bg leak
    bot_leak = edge_band & (y_grid >= 410) & (min_c > 165) & (chroma < 28)
    alpha = np.where(bot_leak, 0.0, alpha)

    # Un-premultiply white studio background along semi-transparent lid & edges
    a_norm = (alpha / 255.0)[:, :, None]
    safe_a = np.maximum(a_norm, 0.22)
    defringed = np.where(
        (a_norm > 0.01) & (a_norm < 0.98),
        np.clip((c_arr - 255.0 * (1.0 - a_norm)) / safe_a, 0.0, 255.0),
        c_arr
    )

    # Clean bottom floor shadow from latte
    shadow_zone = (y_grid >= t_geo['bot_y'] - 5) & (A_latte < 130)
    defringed = np.where(shadow_zone[:, :, None], latte_np[:, :, :3], defringed)

    # Smooth alpha edge gently (0.4px)
    a_img = Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.4))
    out_arr = np.dstack([defringed, np.array(a_img)]).astype(np.uint8)
    return Image.fromarray(out_arr, 'RGBA')

choco_path = r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_chocolate_gen_1795540468249.jpg'
matcha_choco_path = r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_matcha_chocolate_gen_1795540538965.jpg'

# For Ice Chocolate: entire body y>=125 is cocoa, trim any white edge leak
choco_final = process_generated_cup(choco_path, trim_white_in_body_y=125)
# For Matcha Chocolate: middle milk (y: 260..340) is naturally white, so only trim white leak in bottom chocolate (y>=355) & top green (y:125..250)
matcha_choco_final = process_generated_cup(matcha_choco_path, trim_white_in_body_y=355)

# For Vanilla Cloud Foam: align matcha_cup_right.png to latte silhouette & clamp cleanly with A_latte
cup_right = Image.open('assets/images/matcha_cup_right.png').convert('RGBA')
s_geo_r = get_cup_landmarks(cup_right, is_alpha=True)
cropped_r = cup_right.crop((s_geo_r['lid_left'], s_geo_r['top_y'], s_geo_r['lid_right'], s_geo_r['bot_y']))
resized_r = cropped_r.resize((t_geo['lid_w'], t_geo['cup_h']), Image.Resampling.LANCZOS)
foam_canvas = Image.new('RGBA', (320, 480), (0, 0, 0, 0))
foam_canvas.paste(resized_r, (t_geo['lid_left'], t_geo['top_y']), resized_r)
foam_arr = np.array(foam_canvas, dtype=np.float32)
# Clamp outer alpha to A_latte so bottom shadow and edges match 100% cleanly!
foam_arr[:, :, 3] = np.minimum(foam_arr[:, :, 3], A_latte)
y_grid = np.arange(480)[:, None]
shadow_zone = (y_grid >= t_geo['bot_y'] - 6) & (A_latte < 140)
foam_arr[shadow_zone] = latte_np[shadow_zone]
foam_final = Image.fromarray(np.clip(foam_arr, 0, 255).astype(np.uint8), 'RGBA')

# Overlay crisp dark green logo on foam
logo_mask = (latte_np[:, :, 0] < 45) & (latte_np[:, :, 1] > 38) & (latte_np[:, :, 1] < 95) & (latte_np[:, :, 2] < 45) & (A_latte > 100)
y_g, x_g = np.ogrid[:480, :320]
center_zone = (y_g >= 195) & (y_g <= 350) & (x_g >= 70) & (x_g <= 250)
y_logo, x_logo = np.where(logo_mask & center_zone)

logo_img = Image.open('assets/images/logo.png').convert('RGBA')
logo_w = x_logo.max() - x_logo.min() + 8
logo_h = y_logo.max() - y_logo.min() + 8
logo_resized = logo_img.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
logo_np = np.array(logo_resized, dtype=np.float32)
logo_np[:, :, 0] = 16.0
logo_np[:, :, 1] = 55.0
logo_np[:, :, 2] = 19.0
logo_np[:, :, 3] = logo_np[:, :, 3] * 0.90
logo_green = Image.fromarray(logo_np.astype(np.uint8))
foam_final.paste(logo_green, (x_logo.min() - 4, y_logo.min() - 4), logo_green)

# Export directly to assets/images/menu/ (PNG + WEBP)
outputs = {
    'ice-chocolate': choco_final,
    'ice-matcha-chocolate': matcha_choco_final,
    'ice-matcha-vanilla-foam': foam_final,
}
for name, img in outputs.items():
    img.save(f'assets/images/menu/{name}.png', optimize=True)
    img.save(f'assets/images/menu/{name}.webp', format='WEBP', quality=92, method=6)
    print(f"Exported {name}.png and {name}.webp")

# Final 2-row verification collage
comp = Image.new('RGBA', (320 * 5, 480 * 2), (255, 255, 255, 255))
dark_row = Image.new('RGBA', (320 * 5, 480), (45, 65, 48, 255))
comp.paste(dark_row, (0, 480))
for i, cup in enumerate([latte, americano, matcha_choco_final, choco_final, foam_final]):
    comp.paste(cup, (i * 320, 0), cup)
    comp.paste(cup, (i * 320, 480), cup)
comp.save('scratch/polished_5_cups_check.png')
print("Saved scratch/polished_5_cups_check.png")
