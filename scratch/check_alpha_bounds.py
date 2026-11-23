import numpy as np
from PIL import Image

cl = Image.open("assets/images/matcha_cup_left.png")
cr = Image.open("assets/images/matcha_cup_right.png")

arr_l = np.array(cl)
arr_r = np.array(cr)

alpha_l = arr_l[:, :, 3]
alpha_r = arr_r[:, :, 3]

# Find min y and max y where alpha > 10
y_indices_l = np.where(alpha_l > 10)[0]
x_indices_l = np.where(alpha_l > 10)[1]
print("Left cup non-transparent area:")
print(f"  y_min={y_indices_l.min()}, y_max={y_indices_l.max()}")
print(f"  x_min={x_indices_l.min()}, x_max={x_indices_l.max()}")

y_indices_r = np.where(alpha_r > 10)[0]
x_indices_r = np.where(alpha_r > 10)[1]
print("Right cup non-transparent area:")
print(f"  y_min={y_indices_r.min()}, y_max={y_indices_r.max()}")
print(f"  x_min={x_indices_r.min()}, x_max={x_indices_r.max()}")

# Check what is at row 0 of left cup
print("Left cup row 0 alpha stats: max=", alpha_l[0].max(), "mean=", alpha_l[0].mean())
print("Right cup row 0 alpha stats: max=", alpha_r[0].max(), "mean=", alpha_r[0].mean())
