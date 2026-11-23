import cv2
import numpy as np
from PIL import Image, ImageEnhance
import os

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(f"{brain_dir}/matcha_cup_single_right_1795380679686.jpg")
seg_l = cv2.imread(f"{brain_dir}/segmented_left.png", cv2.IMREAD_UNCHANGED)
seg_r = cv2.imread(f"{brain_dir}/segmented_right.png", cv2.IMREAD_UNCHANGED)

def process_cup_lid_perfect(orig, seg, thresh=7.0, target_size=(680, 1002)):
    h, w, _ = orig.shape
    
    # 1. Background map estimation from outer margins
    bg_map = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        l_col = np.median(orig[y, :30], axis=0)
        r_col = np.median(orig[y, -30:], axis=0)
        bg_map[y] = np.linspace(l_col, r_col, w)
        
    diff = np.linalg.norm(orig.astype(np.float32) - bg_map, axis=2)
    is_bg = (diff < thresh).astype(np.uint8)
    
    # Flood-fill from outer image border
    flood_mask = np.zeros((h + 2, w + 2), np.uint8)
    flood_img = is_bg.copy()
    
    for x in range(0, w, 10):
        if flood_img[0, x] == 1: cv2.floodFill(flood_img, flood_mask, (x, 0), 2)
        if flood_img[h-1, x] == 1: cv2.floodFill(flood_img, flood_mask, (x, h-1), 2)
    for y in range(0, h, 10):
        if flood_img[y, 0] == 1: cv2.floodFill(flood_img, flood_mask, (0, y), 2)
        if flood_img[y, w-1] == 1: cv2.floodFill(flood_img, flood_mask, (w-1, y), 2)
            
    ext_bg = (flood_img == 2)
    fg_mask = (~ext_bg).astype(np.uint8) * 255
    
    # Air above sip cap (y < 140 is clear air)
    fg_mask[:140, :] = 0
    
    # Zero out background noise outside the cup cylinder bounds
    fg_mask[:, :120] = 0
    fg_mask[:, 780:] = 0
    
    # Fill internal holes for each row in the lid area (140 to 310)
    for y in range(140, 310):
        xs = np.where(fg_mask[y] > 0)[0]
        if len(xs) > 1 and (xs.max() - xs.min()) > 15:
            fg_mask[y, xs.min():xs.max()+1] = 255
        elif len(xs) <= 15:
            fg_mask[y, :] = 0
            
    # Retain only the main contiguous cup contour
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        main_c = max(contours, key=cv2.contourArea)
        solid_mask = np.zeros_like(fg_mask)
        cv2.drawContours(solid_mask, [main_c], -1, 255, -1)
        fg_mask = solid_mask
        
    # Seamless transition:
    # y < 305: 100% pristine lid
    # y in [305..325]: smooth cosine blend
    # y > 325: seg (cup body & rounded base)
    final_mask = np.zeros((h, w), np.uint8)
    for y in range(h):
        if y < 305:
            final_mask[y] = fg_mask[y]
        elif y <= 325:
            t = (y - 305) / 20.0
            # smoothstep / cosine blend
            blend_w = 0.5 * (1 - np.cos(t * np.pi))
            final_mask[y] = (fg_mask[y].astype(float) * (1 - blend_w) + seg[y, :, 3].astype(float) * blend_w).astype(np.uint8)
        else:
            final_mask[y] = seg[y, :, 3]
            
    # Clean boundary antialiasing
    kernel = np.ones((3,3), np.uint8)
    eroded = cv2.erode(final_mask, kernel, iterations=1)
    boundary = (final_mask > 0) & (eroded < 255)
    
    smoothed = cv2.GaussianBlur(final_mask, (5, 5), 1.0)
    alpha = final_mask.copy()
    alpha[boundary] = smoothed[boundary]
    
    # Crop to the cup bounds with 6px margin
    ys, xs = np.where(alpha > 0)
    y1 = max(0, ys.min() - 6)
    y2 = min(h, ys.max() + 7)
    x1 = max(0, xs.min() - 6)
    x2 = min(w, xs.max() + 7)
    
    b, g, r = cv2.split(orig)
    rgba = cv2.merge([b, g, r, alpha])
    cropped = rgba[y1:y2, x1:x2]
    
    # High quality resize
    pil_img = Image.fromarray(cv2.cvtColor(cropped, cv2.COLOR_BGRA2RGBA))
    pil_hd = pil_img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Subtle sharpness enhancement for crisp ice/droplets
    enhancer = ImageEnhance.Sharpness(pil_hd)
    pil_hd = enhancer.enhance(1.08)
    
    final_rgba = np.array(pil_hd)
    final_bgra = cv2.cvtColor(final_rgba, cv2.COLOR_RGBA2BGRA)
    return final_bgra, pil_hd

print("Processing left cup...")
final_l_bgra, pil_l = process_cup_lid_perfect(orig_l, seg_l, thresh=6.8, target_size=(680, 1002))

print("Processing right cup...")
final_r_bgra, pil_r = process_cup_lid_perfect(orig_r, seg_r, thresh=7.2, target_size=(650, 995))

# Export PNG
cv2.imwrite("assets/images/matcha_cup_left.png", final_l_bgra)
cv2.imwrite("assets/images/matcha_cup_right.png", final_r_bgra)

# Export WebP
pil_l.save("assets/images/matcha_cup_left.webp", "WEBP", quality=95, method=6)
pil_r.save("assets/images/matcha_cup_right.webp", "WEBP", quality=95, method=6)

print("Saved production assets in assets/images/!")

# Generate side-by-side verification preview on cream background
bg_color = (245, 253, 255) # BGR for #FFFDF5
h_canvas = max(final_l_bgra.shape[0], final_r_bgra.shape[0]) + 60
w_canvas = final_l_bgra.shape[1] + final_r_bgra.shape[1] + 80
canvas = np.full((h_canvas, w_canvas, 3), bg_color, dtype=np.uint8)

al = final_l_bgra[:, :, 3:4] / 255.0
comp_l = (final_l_bgra[:, :, :3] * al + bg_color * (1 - al)).astype(np.uint8)
canvas[30:30+final_l_bgra.shape[0], 20:20+final_l_bgra.shape[1]] = comp_l

ar = final_r_bgra[:, :, 3:4] / 255.0
comp_r = (final_r_bgra[:, :, :3] * ar + bg_color * (1 - ar)).astype(np.uint8)
x2 = 20 + final_l_bgra.shape[1] + 40
canvas[30:30+final_r_bgra.shape[0], x2:x2+final_r_bgra.shape[1]] = comp_r

cv2.imwrite("scratch/verified_cups_fulldome.jpg", canvas)
cv2.imwrite(f"{brain_dir}/verified_cups_fulldome.jpg", canvas)

# Also save lid zoom (top 320px)
lid_zoom = canvas[20:340, 10:w_canvas-10]
cv2.imwrite("scratch/verified_lids_zoom.jpg", lid_zoom)
cv2.imwrite(f"{brain_dir}/verified_lids_zoom.jpg", lid_zoom)

print("Saved verification previews!")
