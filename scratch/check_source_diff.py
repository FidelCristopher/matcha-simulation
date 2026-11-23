import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
orig_l = cv2.imread(f"{brain_dir}/matcha_cup_single_left_1795380633248.jpg")
ref = cv2.imread(f"{brain_dir}/.user_uploaded/media_1795384985575_38f84a11.jpg")

print("orig_l shape:", orig_l.shape if orig_l is not None else None)
print("ref shape:", ref.shape if ref is not None else None)

# In ref, the background is DARK (wooden table, dark bokeh background)
# In orig_l, what is the background?
print("orig_l corner (0,0) BGR:", orig_l[0, 0] if orig_l is not None else None)
print("ref corner (0,0) BGR:", ref[0, 0] if ref is not None else None)
