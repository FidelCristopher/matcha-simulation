import cv2
import numpy as np

# In orig_l and orig_r (width 896):
# Cup center cx is around 450
# Maximum half-width of cup rim is ~325 (x in [125, 775])
# Let's check:
for name, p in [("left", r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_left_1795380633248.jpg"),
               ("right", r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_right_1795380679686.jpg")]:
    orig = cv2.imread(p)
    print(f"=== {name} ===")
    for y in [140, 150, 160, 180, 200, 230, 260, 290]:
        bg_l = orig[y, :30].mean(axis=0)
        bg_r = orig[y, -30:].mean(axis=0)
        bg_row = np.linspace(bg_l, bg_r, orig.shape[1])
        diff = np.linalg.norm(orig[y].astype(float) - bg_row, axis=1)
        # Check within x in [110, 790]
        fg = np.where((diff > 8.0) & (np.arange(len(diff)) >= 110) & (np.arange(len(diff)) <= 790))[0]
        if len(fg) > 0:
            print(f"y={y}: center={(fg.min()+fg.max())/2:.1f}, w={fg.max()-fg.min()+1}, xs=[{fg.min()}..{fg.max()}]")
