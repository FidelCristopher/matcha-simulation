import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(f"{brain_dir}/matcha_cup_single_right_1795380679686.jpg")
matcha_cups_orig = cv2.imread("assets/images/matcha_cups_original.jpg")

print("orig_l:", orig_l.shape if orig_l is not None else None)
print("orig_r:", orig_r.shape if orig_r is not None else None)
print("matcha_cups_orig:", matcha_cups_orig.shape)

# Let's save crops of orig_l and orig_r top lids:
# Where is the lid in orig_l and orig_r?
# Let's inspect rows 100 to 350, cols 100 to 800
cv2.imwrite("scratch/orig_l_top_raw.jpg", orig_l[100:350, 100:800])
cv2.imwrite("scratch/orig_r_top_raw.jpg", orig_r[100:350, 100:800])

# Also in matcha_cups_orig, where are the lids?
# Rows 100 to 280, cols 220 to 560 (left) and 520 to 860 (right)
cv2.imwrite("scratch/matcha_orig_l_lid.jpg", matcha_cups_orig[100:260, 220:560])
cv2.imwrite("scratch/matcha_orig_r_lid.jpg", matcha_cups_orig[100:260, 520:860])

print("Saved raw lid images.")
