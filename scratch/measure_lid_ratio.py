import cv2
import numpy as np

ref1 = cv2.imread("scratch/ref_cup1_top.jpg")
# In ref1, where is the rim flange?
# The rim flange is the outer horizontal lip around y=110..130
# The top of the sip cap is around y=45..55
# So lid height is approx 125 - 50 = 75px out of cup width ~340px (ratio = 75/340 = ~0.22)

# In matcha_cup_left.png:
cl = cv2.imread("assets/images/matcha_cup_left.png", cv2.IMREAD_UNCHANGED)
# In cl, width is 680
# Where is the rim flange?
# The rim flange is the widest part of the lid near the top of the cup:
# Let's find the width of the cup at each row y:
for y in range(0, 350, 10):
    xs = np.where(cl[y, :, 3] > 50)[0]
    if len(xs) > 0:
        w = xs.max() - xs.min() + 1
        print(f"cl y={y:3d}: width={w:3d}, xs=[{xs.min()}..{xs.max()}]")
