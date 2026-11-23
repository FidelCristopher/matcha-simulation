import cv2
import numpy as np

img = cv2.imread("assets/images/matcha_cups_original.jpg")
print("matcha_cups_original.jpg shape:", img.shape)

# Let's save a thumbnail to scratch to inspect it
cv2.imwrite("scratch/matcha_cups_original_thumb.jpg", img)
print("Saved scratch/matcha_cups_original_thumb.jpg")
