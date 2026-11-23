import cv2
import numpy as np

cl = cv2.imread("scratch/cup_l_from_matcha_cups_original.jpg")
cr = cv2.imread("scratch/cup_r_from_matcha_cups_original.jpg")

print("cl mean BGR:", cl.mean(axis=(0,1)))
print("cr mean BGR:", cr.mean(axis=(0,1)))

# Let's check where the top of the lids are in img
img = cv2.imread("assets/images/matcha_cups_original.jpg")
print("Full img size:", img.shape)

# Let's inspect rows 100 to 180 to find the lid tops:
# Save the top region of both cups:
lids_orig = img[100:250, 200:880]
cv2.imwrite("scratch/lids_orig.jpg", lids_orig)
print("Saved scratch/lids_orig.jpg!")
