import cv2
import numpy as np

# Let's inspect the shapes and details in scratch/lid_comparison_vs_ref.jpg
comp = cv2.imread("scratch/lid_comparison_vs_ref.jpg")
print("Comp shape:", comp.shape)

# Let's also check if there is any cutoff at the top or edges of matcha_cup_left.png and matcha_cup_right.png
cl = cv2.imread("assets/images/matcha_cup_left.png", cv2.IMREAD_UNCHANGED)
cr = cv2.imread("assets/images/matcha_cup_right.png", cv2.IMREAD_UNCHANGED)

# Let's print the top 20 rows of alpha for cl and cr to see where the lid starts and what shape it has
def print_top_profile(img, name):
    print(f"=== {name} Top Profile ===")
    for y in range(0, 30, 2):
        xs = np.where(img[y, :, 3] > 20)[0]
        if len(xs) > 0:
            width = xs.max() - xs.min() + 1
            print(f"y={y:2d}: x=[{xs.min():3d}..{xs.max():3d}], width={width:3d}, center={(xs.min()+xs.max())/2:.1f}, max_alpha={img[y, xs, 3].max()}")
        else:
            print(f"y={y:2d}: empty")

print_top_profile(cl, "matcha_cup_left.png")
print_top_profile(cr, "matcha_cup_right.png")
