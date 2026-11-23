import cv2
import numpy as np

# Load the user's reference image
ref_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg"
ref = cv2.imread(ref_path)
print("Reference image shape:", ref.shape if ref is not None else None)

# Load current production cups
cl = cv2.imread("assets/images/matcha_cup_left.png", cv2.IMREAD_UNCHANGED)
cr = cv2.imread("assets/images/matcha_cup_right.png", cv2.IMREAD_UNCHANGED)

print("Left cup shape:", cl.shape)
print("Right cup shape:", cr.shape)

# Let's save a side-by-side comparison of the reference lids vs our restored lids
# The reference image has width 1024, height 297
# Let's crop the two cup lids in ref:
# In ref, left cup lid is roughly x in [100, 520], right cup lid is x in [520, 940]
# Let's resize our cl lid and cr lid to similar scale and place them side by side
h_ref, w_ref = ref.shape[:2]

# Let's composite cl on white/cream and cr on white/cream
bg = np.full((320, cl.shape[1] + cr.shape[1] + 40, 3), (245, 253, 255), dtype=np.uint8)

al = cl[:320, :, 3:4] / 255.0
comp_l = (cl[:320, :, :3] * al + (245, 253, 255) * (1 - al)).astype(np.uint8)
bg[:320, :cl.shape[1]] = comp_l

ar = cr[:320, :, 3:4] / 255.0
comp_r = (cr[:320, :, :3] * ar + (245, 253, 255) * (1 - ar)).astype(np.uint8)
bg[:320, cl.shape[1]+40:] = comp_r

# Resize bg to match ref width (1024)
bg_resized = cv2.resize(bg, (w_ref, int(bg.shape[0] * w_ref / bg.shape[1])))

# Stack ref on top and our lids on bottom
comparison = np.vstack([ref, bg_resized])
cv2.imwrite("scratch/lid_comparison_vs_ref.jpg", comparison)
print("Saved scratch/lid_comparison_vs_ref.jpg!")
