import cv2
import numpy as np

# Load test_l and test_r from test_full_extraction
from test_full_extraction import test_l, test_r

# Inspect bottom 150 rows where alpha > 0
def inspect_base(img, name):
    print(f"=== {name} Base Profile ===")
    ys, xs = np.where(img[:, :, 3] > 0)
    y_max = ys.max()
    for y in range(y_max - 50, y_max + 1, 5):
        row_xs = np.where(img[y, :, 3] > 30)[0]
        w = (row_xs.max() - row_xs.min() + 1) if len(row_xs) > 0 else 0
        print(f"y={y}: w={w:3d}, xs=[{row_xs.min() if len(row_xs) else 0}..{row_xs.max() if len(row_xs) else 0}]")

inspect_base(test_l, "Left Cup")
inspect_base(test_r, "Right Cup")
