import cv2
import numpy as np

img = cv2.imread("assets/images/matcha_cups_original.jpg")
# Left cup:
# Top part (y: 250..350, x: 280..480)
print("Left cup middle BGR:", img[280:350, 300:460].mean(axis=(0,1)))
# Bottom part (y: 400..500, x: 280..480)
print("Left cup bottom BGR:", img[420:500, 320:440].mean(axis=(0,1)))

# Right cup:
print("Right cup middle BGR:", img[280:350, 600:760].mean(axis=(0,1)))
print("Right cup bottom BGR:", img[420:500, 620:740].mean(axis=(0,1)))
