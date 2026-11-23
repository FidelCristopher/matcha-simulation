import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_r = cv2.imread(f"{brain_dir}/matcha_cup_single_right_1795380679686.jpg")
seg_r = cv2.imread(f"{brain_dir}/segmented_right.png", cv2.IMREAD_UNCHANGED)

for y in range(250, 450, 20):
    bg_l = orig_r[y, :20].mean(axis=0)
    bg_r = orig_r[y, -20:].mean(axis=0)
    bg_row = np.linspace(bg_l, bg_r, orig_r.shape[1])
    diff = np.linalg.norm(orig_r[y].astype(float) - bg_row, axis=1)
    fg_orig = np.where(diff > 8.0)[0]
    
    fg_seg = np.where(seg_r[y, :, 3] > 50)[0]
    
    print(f"y={y}: orig=[{fg_orig.min()}..{fg_orig.max()}] (w={fg_orig.max()-fg_orig.min()+1}), seg=[{fg_seg.min()}..{fg_seg.max()}] (w={fg_seg.max()-fg_seg.min()+1})")
