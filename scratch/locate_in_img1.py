import cv2
import numpy as np

img1 = cv2.imread("assets/images/matcha_cups_original.jpg")
img2 = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg")

# Find the best offset (dy, dx) and scale
# Let's check dimensions of img1: (601, 1024, 3)
# img2: (297, 1024, 3)
# Let's inspect where the cups are in img1:
print("img1 shape:", img1.shape)
# Where are the two cups in img1?
# Let's find the cups in img1:
# Left cup center, right cup center, top of lids, bottom of cups
cv2.imwrite("scratch/img1_full.jpg", img1)
