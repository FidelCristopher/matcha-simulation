import cv2
import numpy as np

orig_l = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_right_1795380679686.jpg")

for y in range(130, 145):
    diff_l = np.linalg.norm(orig_l[y, 400:500].astype(float) - orig_l[y, :20].mean(axis=0), axis=1)
    diff_r = np.linalg.norm(orig_r[y, 400:500].astype(float) - orig_r[y, :20].mean(axis=0), axis=1)
    print(f"y={y}: left max_diff={diff_l.max():.2f}, right max_diff={diff_r.max():.2f}")
