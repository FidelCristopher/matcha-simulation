import cv2
import numpy as np

img1 = cv2.imread("assets/images/matcha_cups_original.jpg")
img2 = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg")

# Template match a 50x50 patch from img2 in img1
patch = img2[100:150, 400:450]
res = cv2.matchTemplate(img1, patch, cv2.TM_CCOEFF_NORMED)
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
print("Match score:", max_val, "at location:", max_loc)

# Also let's check what img1 actually looks like:
# Save img1 as a small jpg in scratch
cv2.imwrite("scratch/what_is_img1.jpg", img1)
print("Saved scratch/what_is_img1.jpg")
