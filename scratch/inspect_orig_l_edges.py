import cv2
import numpy as np

# In orig_l:
orig_l = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_right_1795380679686.jpg")

# What is the background of orig_l and orig_r?
# It's an off-white studio background.
# Let's inspect the boundaries of the lid in orig_l and orig_r:
# At y=142 to y=280:
# Where are the edges of the lid in orig_l?
# Let's find the left edge and right edge of the lid at each y from 140 to 300:
for y in range(140, 290, 10):
    bg_l = orig_l[y, :20].mean(axis=0)
    bg_r = orig_l[y, -20:].mean(axis=0)
    # create gradient bg
    bg_row = np.linspace(bg_l, bg_r, orig_l.shape[1])
    diff = np.linalg.norm(orig_l[y].astype(float) - bg_row, axis=1)
    fg = np.where(diff > 8.0)[0]
    if len(fg) > 0:
        print(f"orig_l y={y}: fg=[{fg.min()}..{fg.max()}], width={fg.max()-fg.min()+1}")
    else:
        print(f"orig_l y={y}: empty")
