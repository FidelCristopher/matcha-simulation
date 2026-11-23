import cv2
import numpy as np

cr = cv2.imread("assets/images/matcha_cup_right.png", cv2.IMREAD_UNCHANGED)
for y in range(0, 350, 10):
    xs = np.where(cr[y, :, 3] > 50)[0]
    if len(xs) > 0:
        w = xs.max() - xs.min() + 1
        print(f"cr y={y:3d}: width={w:3d}, xs=[{xs.min()}..{xs.max()}]")
