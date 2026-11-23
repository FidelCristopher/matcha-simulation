import cv2
import numpy as np

ref_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg"
ref = cv2.imread(ref_path)

print("Ref size:", ref.shape) # (297, 1024, 3)
# Let's check the corners and center:
print("top-left (y=10, x=10):", ref[10, 10])
print("top-right (y=10, x=1010):", ref[10, 1010])
print("center (y=150, x=512):", ref[150, 512])
print("bottom-left (y=280, x=10):", ref[280, 10])
print("bottom-right (y=280, x=1010):", ref[280, 1010])
