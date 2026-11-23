import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
seg_l = cv2.imread(f"{brain_dir}/segmented_left.png", cv2.IMREAD_UNCHANGED)

# Let's inspect where seg_l and orig_l match
for y in range(250, 450, 20):
    bg_l = orig_l[y, :20].mean(axis=0)
    bg_r = orig_l[y, -20:].mean(axis=0)
    bg_row = np.linspace(bg_l, bg_r, orig_l.shape[1])
    diff = np.linalg.norm(orig_l[y].astype(float) - bg_row, axis=1)
    fg_orig = np.where(diff > 8.0)[0]
    
    fg_seg = np.where(seg_l[y, :, 3] > 50)[0]
    
    print(f"y={y}: orig=[{fg_orig.min()}..{fg_orig.max()}] (w={fg_orig.max()-fg_orig.min()+1}), seg=[{fg_seg.min()}..{fg_seg.max()}] (w={fg_seg.max()-fg_seg.min()+1})")
