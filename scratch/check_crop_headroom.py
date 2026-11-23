import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
orig_r = cv2.imread(f"{brain_dir}/matcha_cup_single_right_1795380679686.jpg")

print("orig_l shape:", orig_l.shape if orig_l is not None else None)
print("orig_r shape:", orig_r.shape if orig_r is not None else None)

# In build_final_assets.py:
# crop_box for left: (135, 1067, 151, 747)
# crop_box for right: (135, 1067, 152, 749)
# y_lid_min: left was 140, right was 139
# Notice: y1 was 135! And y_lid_min was 140!
# Let's inspect rows 120 to 150 of orig_l and orig_r to see if the lid extends above 140!
for y in range(120, 150, 2):
    diff_l = np.linalg.norm(orig_l[y, 300:500].astype(float) - orig_l[y, :40].mean(axis=0), axis=1)
    diff_r = np.linalg.norm(orig_r[y, 300:500].astype(float) - orig_r[y, :40].mean(axis=0), axis=1)
    print(f"y={y:3d}: left max_diff={diff_l.max():.1f}, right max_diff={diff_r.max():.1f}")
