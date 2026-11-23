import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(f"{brain_dir}/matcha_cup_single_right_1795380679686.jpg")

# In orig_l and orig_r, the cup has a white/light studio background
# Let's inspect rows 140 to 300 of orig_l and orig_r
# Where does the actual cup end on the left and right in orig_l and orig_r?
# Let's compute color difference from the background for each row:
for y in range(140, 300, 10):
    bg_l = np.mean(orig_l[y, :30], axis=0)
    diff_l = np.linalg.norm(orig_l[y].astype(float) - bg_l, axis=1)
    fg_l = np.where(diff_l > 8.0)[0]
    
    bg_r = np.mean(orig_r[y, :30], axis=0)
    diff_r = np.linalg.norm(orig_r[y].astype(float) - bg_r, axis=1)
    fg_r = np.where(diff_r > 8.0)[0]
    
    wl = (fg_l.max() - fg_l.min() + 1) if len(fg_l) > 0 else 0
    wr = (fg_r.max() - fg_r.min() + 1) if len(fg_r) > 0 else 0
    print(f"orig y={y}: left width={wl} xs=[{fg_l.min() if len(fg_l) else 0}..{fg_l.max() if len(fg_l) else 0}], right width={wr} xs=[{fg_r.min() if len(fg_r) else 0}..{fg_r.max() if len(fg_r) else 0}]")
