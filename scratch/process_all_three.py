import os
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

os.makedirs('scratch', exist_ok=True)

latte = Image.open('assets/images/menu/ice-matcha-latte.png').convert('RGBA')
americano = Image.open('assets/images/menu/ice-matcharicano.png').convert('RGBA')
latte_np = np.array(latte, dtype=np.float32)

def find_cup_geometry(rgba_arr, alpha_thresh=40):
    """Find top, bottom, and widest lid x-span."""
    a = rgba_arr[:, :, 3]
    # Lid widest span is in upper 30% of image
    h = rgba_arr.shape[0]
    ys_all, xs_all = np.where(a > alpha_thresh)
    top_y = ys_all.min()
    bot_y = ys_all.max()
    # Lid region: top 22% of cup height
    cup_h = bot_y - top_y
    lid_end = top_y + int(cup_h * 0.22)
    ys_lid, xs_lid = np.where(a[:lid_end, :] > alpha_thresh)
    return top_y, bot_y, xs_lid.min(), xs_lid.max()

def remove_white_bg_clean(rgb_pil):
    """
    Remove white studio background from a high-res product photo cleanly:
    1. Flood fill from all 4 borders where pixels are near-white (min_c > 236 and chroma < 18).
    2. Compute distance-feathered soft alpha around foreground boundary.
    3. Make clear plastic lid translucent where brightness is near-white inside lid region.
    4. Defringe / un-premultiply white halo at semi-transparent edges.
    """
    arr = np.array(rgb_pil.convert('RGB'), dtype=np.float32)
    h, w, _ = arr.shape
    min_c = arr.min(axis=2)
    max_c = arr.max(axis=2)
    chroma = max_c - min_c
    lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

    # Background candidate mask (white/very light neutral studio bg)
    bg_cand = (min_c >= 235) & (chroma <= 18)

    # Flood fill from edges to find exterior background only (never poke holes in white milk!)
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if bg_cand[0, x]:
            visited[0, x] = True; q.append((0, x))
        if bg_cand[h - 1, x]:
            visited[h - 1, x] = True; q.append((h - 1, x))
    for y in range(h):
        if bg_cand[y, 0] and not visited[y, 0]:
            visited[y, 0] = True; q.append((y, 0))
        if bg_cand[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True; q.append((y, w - 1))

    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and bg_cand[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

    # Alpha starts as 255 for foreground, 0 for exterior background
    alpha = np.where(visited, 0.0, 255.0)

    # Trim light outer floor shadow on bottom-left (keep tight cup silhouette like ice-matcha-latte)
    # Note: floor shadow has low contrast, neutral grey (chroma < 12) in bottom 12% and outside main body
    # Let's smooth alpha slightly using PIL blur on boundary only
    alpha_img = Image.fromarray(alpha.astype(np.uint8))
    blurred = np.array(alpha_img.filter(ImageFilter.GaussianBlur(radius=1.5)), dtype=np.float32)
    # Erode slightly by ~1px to eliminate white JPEG ringing halo along contour
    alpha_clean = np.clip((blurred - 110.0) * (255.0 / 145.0), 0.0, 255.0)

    # Handle bottom-left shadow cleanly: fade neutral light-grey pixels at bottom 8% if very bright
    bot_zone = np.arange(h)[:, None] > (h * 0.88)
    shadow_neutral = (chroma < 12) & (lum > 185) & bot_zone
    shadow_fade = np.where(shadow_neutral, np.clip((248.0 - lum) * 3.0, 0.0, 255.0), 255.0)
    alpha_clean = np.minimum(alpha_clean, shadow_fade)

    # Color decontamination on semi-transparent edges (un-premultiply white bg)
    a_norm = np.clip(alpha_clean / 255.0, 0.05, 1.0)[:, :, None]
    defringed = np.where(
        (alpha_clean[:, :, None] > 0) & (alpha_clean[:, :, None] < 245),
        np.clip((arr - 255.0 * (1.0 - a_norm)) / a_norm, 0.0, 255.0),
        arr
    )

    out = np.dstack([defringed, alpha_clean]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

def align_to_latte_canvas(src_rgba, is_cup_right=False):
    arr = np.array(src_rgba, dtype=np.float32)
    t_top, t_bot, t_left, t_right = find_cup_geometry(latte_np, alpha_thresh=40)
    s_top, s_bot, s_left, s_right = find_cup_geometry(arr, alpha_thresh=40)

    # Target cup box on 320x480
    target_w = t_right - t_left
    target_h = t_bot - t_top

    src_crop = src_rgba.crop((s_left, s_top, s_right, s_bot))
    resized = src_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (320, 480), (0, 0, 0, 0))
    canvas.paste(resized, (t_left, t_top), resized)
    return canvas

# Process generated images
choco_path = r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_chocolate_gen_1795540468249.jpg'
matcha_choco_path = r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_matcha_chocolate_gen_1795540538965.jpg'

choco_rgba_hr = remove_white_bg_clean(Image.open(choco_path))
matcha_choco_rgba_hr = remove_white_bg_clean(Image.open(matcha_choco_path))

choco_final = align_to_latte_canvas(choco_rgba_hr)
matcha_choco_final = align_to_latte_canvas(matcha_choco_rgba_hr)

# Process Vanilla Cloud Foam from matcha_cup_right.png + crisp dark green logo
cup_right = Image.open('assets/images/matcha_cup_right.png').convert('RGBA')
foam_final = align_to_latte_canvas(cup_right, is_cup_right=True)

# Overlay crisp logo aligned identically with latte's logo
A_latte = latte_np[:, :, 3]
logo_mask = (latte_np[:, :, 0] < 45) & (latte_np[:, :, 1] > 38) & (latte_np[:, :, 1] < 95) & (latte_np[:, :, 2] < 45) & (A_latte > 100)
y_grid, x_grid = np.ogrid[:480, :320]
center_zone = (y_grid >= 195) & (y_grid <= 350) & (x_grid >= 70) & (x_grid <= 250)
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

# Save scratch copies for inspection
choco_final.save('scratch/final_ice_chocolate.png')
matcha_choco_final.save('scratch/final_ice_matcha_chocolate.png')
foam_final.save('scratch/final_ice_matcha_vanilla_foam.png')

# Create comparison collage on WHITE card background AND CREAM background AND DARK background to catch any edge halo!
comp = Image.new('RGBA', (320 * 5, 480 * 2), (255, 255, 255, 255))
# Bottom row dark grey/green to inspect halos
dark_row = Image.new('RGBA', (320 * 5, 480), (45, 65, 48, 255))
comp.paste(dark_row, (0, 480))

cups = [latte, americano, matcha_choco_final, choco_final, foam_final]
for i, cup in enumerate(cups):
    comp.paste(cup, (i * 320, 0), cup)
    comp.paste(cup, (i * 320, 480), cup)

comp.save('scratch/final_5_cups_check.png')
print("Saved scratch/final_5_cups_check.png")
