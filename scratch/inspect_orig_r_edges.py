import cv2
import numpy as np

orig_r = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_right_1795380679686.jpg")

for y in range(140, 290, 10):
    bg_l = orig_r[y, :20].mean(axis=0)
    bg_r = orig_r[y, -20:].mean(axis=0)
    bg_row = np.linspace(bg_l, bg_r, orig_r.shape[1])
    diff = np.linalg.norm(orig_r[y].astype(float) - bg_row, axis=1)
    fg = np.where(diff > 8.0)[0]
    if len(fg) > 0:
        print(f"orig_r y={y}: fg=[{fg.min()}..{fg.max()}], width={fg.max()-fg.min()+1}")
    else:
        print(f"orig_r y={y}: empty")
