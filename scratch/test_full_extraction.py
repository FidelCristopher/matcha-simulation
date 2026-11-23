import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(f"{brain_dir}/matcha_cup_single_right_1795380679686.jpg")
seg_l = cv2.imread(f"{brain_dir}/segmented_left.png", cv2.IMREAD_UNCHANGED)
seg_r = cv2.imread(f"{brain_dir}/segmented_right.png", cv2.IMREAD_UNCHANGED)

def extract_full_cup(orig, seg, y_crop_top=132, y_blend_start=305, y_blend_end=325, thresh=7.0):
    h, w, _ = orig.shape
    
    # 1. Background color map based on outer borders
    bg_map = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        l_col = np.median(orig[y, :30], axis=0)
        r_col = np.median(orig[y, -30:], axis=0)
        bg_map[y] = np.linspace(l_col, r_col, w)
        
    diff = np.linalg.norm(orig.astype(np.float32) - bg_map, axis=2)
    is_bg = (diff < thresh).astype(np.uint8)
    
    # Flood fill from outside to mark true background
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
    
    # Zero out anything above y=138 (empty air)
    fg_mask[:138, :] = 0
    
    # Fill internal holes for each row in the lid area (138 to 330)
    for y in range(138, 330):
        xs = np.where(fg_mask[y] > 0)[0]
        if len(xs) > 1 and (xs.max() - xs.min()) > 15:
            fg_mask[y, xs.min():xs.max()+1] = 255
        elif len(xs) <= 15:
            fg_mask[y, :] = 0
            
    # Retain only the largest connected component to eliminate stray noise
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        main_c = max(contours, key=cv2.contourArea)
        solid_mask = np.zeros_like(fg_mask)
        cv2.drawContours(solid_mask, [main_c], -1, 255, -1)
        fg_mask = solid_mask
        
    # Now blend:
    # y < y_blend_start: use 100% fg_mask (PRISTINE LID & RIM)
    # y_blend_start <= y <= y_blend_end: linear blend
    # y > y_blend_end: use seg alpha (PRISTINE CUP BODY & BASE)
    final_mask = np.zeros((h, w), np.uint8)
    for y in range(h):
        if y < y_blend_start:
            final_mask[y] = fg_mask[y]
        elif y <= y_blend_end:
            t = (y - y_blend_start) / float(y_blend_end - y_blend_start)
            final_mask[y] = (fg_mask[y].astype(float) * (1 - t) + seg[y, :, 3].astype(float) * t).astype(np.uint8)
        else:
            final_mask[y] = seg[y, :, 3]
            
    # Antialias edges with subtle blur
    # Blur only along the outer boundary
    kernel = np.ones((3,3), np.uint8)
    eroded = cv2.erode(final_mask, kernel, iterations=1)
    boundary = (final_mask > 0) & (eroded < 255)
    
    smoothed = cv2.GaussianBlur(final_mask, (5, 5), 1.0)
    alpha = final_mask.copy()
    alpha[boundary] = smoothed[boundary]
    
    b, g, r = cv2.split(orig)
    rgba = cv2.merge([b, g, r, alpha])
    
    return rgba

test_l = extract_full_cup(orig_l, seg_l, thresh=6.8)
test_r = extract_full_cup(orig_r, seg_r, thresh=7.2)

# Check width profile of test_l and test_r from y=140 to 330
print("=== TEST LEFT CUP ===")
for y in range(140, 330, 15):
    xs = np.where(test_l[y, :, 3] > 50)[0]
    w = (xs.max() - xs.min() + 1) if len(xs) > 0 else 0
    print(f"y={y}: w={w:3d}, xs=[{xs.min() if len(xs) else 0}..{xs.max() if len(xs) else 0}]")

print("=== TEST RIGHT CUP ===")
for y in range(140, 330, 15):
    xs = np.where(test_r[y, :, 3] > 50)[0]
    w = (xs.max() - xs.min() + 1) if len(xs) > 0 else 0
    print(f"y={y}: w={w:3d}, xs=[{xs.min() if len(xs) else 0}..{xs.max() if len(xs) else 0}]")
