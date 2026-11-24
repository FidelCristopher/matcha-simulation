import os
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

os.makedirs('scratch', exist_ok=True)

latte = Image.open('assets/images/menu/ice-matcha-latte.png').convert('RGBA')
w_t, h_t = latte.size # 320, 480
latte_np = np.array(latte, dtype=np.float32)
A_latte = latte_np[:, :, 3]

# Find bounding box of matte in ice-matcha-latte (excluding subtle bottom floor shadow if needed, let's check alpha > 30)
y_l, x_l = np.where(A_latte > 30)
print(f"ice-matcha-latte bbox (A>30): x=[{x_l.min()}, {x_l.max()}], y=[{y_l.min()}, {y_l.max()}]")

cup_left = Image.open('assets/images/matcha_cup_left.png').convert('RGBA')
cl_np = np.array(cup_left)
y_cl, x_cl = np.where(cl_np[:, :, 3] > 30)
print(f"matcha_cup_left ({cup_left.size}) bbox (A>30): x=[{x_cl.min()}, {x_cl.max()}], y=[{y_cl.min()}, {y_cl.max()}]")

for label, path in [
    ('choco', r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_chocolate_gen_1795540468249.jpg'),
    ('matcha_choco', r'C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\ice_matcha_chocolate_gen_1795540538965.jpg'),
]:
    im = Image.open(path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    # Detect non-white foreground (any channel < 240)
    fg = np.any(arr < 240, axis=2)
    ys, xs = np.where(fg)
    print(f"{label} ({im.size}) bbox (<240): x=[{xs.min()}, {xs.max()}], y=[{ys.min()}, {ys.max()}]")
