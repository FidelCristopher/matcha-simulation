import cv2
import numpy as np

cl = cv2.imread("assets/images/matcha_cup_left.png", cv2.IMREAD_UNCHANGED)
cr = cv2.imread("assets/images/matcha_cup_right.png", cv2.IMREAD_UNCHANGED)

print("Left cup shape:", cl.shape)
print("Right cup shape:", cr.shape)

def check_profile(img, name):
    print(f"=== {name} Full Lid Profile (y=0 to 250) ===")
    for y in range(0, 250, 15):
        xs = np.where(img[y, :, 3] > 40)[0]
        if len(xs) > 0:
            w = xs.max() - xs.min() + 1
            print(f"y={y:3d}: w={w:3d}, center={(xs.min()+xs.max())/2:.1f}, xs=[{xs.min():3d}..{xs.max():3d}]")
        else:
            print(f"y={y:3d}: empty")

check_profile(cl, "Left Cup (matcha_cup_left.png)")
check_profile(cr, "Right Cup (matcha_cup_right.png)")
