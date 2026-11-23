import cv2
import numpy as np

orig_r = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4/matcha_cup_single_right_1795380679686.jpg")
print("orig_r[150, 70:120]:")
print(orig_r[150, 70:120])
bg = orig_r[150, :30].mean(axis=0)
diff = np.linalg.norm(orig_r[150, 70:120].astype(float) - bg, axis=1)
print("diff:", diff)
