import cv2
import numpy as np

# Let's inspect the dimensions and appearance
c1 = cv2.imread("scratch/ref_cup1_top.jpg")
c2 = cv2.imread("scratch/comp_lid_l.jpg")
print("ref_cup1_top shape:", c1.shape)
print("comp_lid_l shape:", c2.shape)

# Let's inspect the lid shape in both
# In ref_cup1_top, where is the rim, dome, and sip cap?
# Let's print out some visual details
r_top = cv2.imread("scratch/ref_cup1_top.jpg")
c_top = cv2.imread("scratch/comp_lid_l.jpg")

# Put them side by side
# Resize c_top to match r_top height
h = min(r_top.shape[0], c_top.shape[0])
w1 = int(r_top.shape[1] * h / r_top.shape[0])
w2 = int(c_top.shape[1] * h / c_top.shape[0])
r_res = cv2.resize(r_top, (w1, h))
c_res = cv2.resize(c_top, (w2, h))

side_by_side = np.hstack([r_res, c_res])
cv2.imwrite("scratch/side_by_side_left_lid.jpg", side_by_side)
print("Saved scratch/side_by_side_left_lid.jpg")
