import cv2
import numpy as np

p_broken = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384968748_d4689fa6.jpg"
p_ref = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg"

broken = cv2.imread(p_broken)
ref = cv2.imread(p_ref)

# Production cups
cl = cv2.imread("assets/images/matcha_cup_left.png", cv2.IMREAD_UNCHANGED)
cr = cv2.imread("assets/images/matcha_cup_right.png", cv2.IMREAD_UNCHANGED)

print("broken shape:", broken.shape if broken is not None else None)
print("ref shape:", ref.shape if ref is not None else None)
print("cl shape:", cl.shape)
print("cr shape:", cr.shape)

# Create a composite of the current production cups on white
bg_current = np.full((350, cl.shape[1] + cr.shape[1] + 60, 3), (255, 255, 255), dtype=np.uint8)
al = cl[:350, :, 3:4] / 255.0
bg_current[:350, :cl.shape[1]] = (cl[:350, :, :3] * al + 255 * (1 - al)).astype(np.uint8)
ar = cr[:350, :, 3:4] / 255.0
bg_current[:350, cl.shape[1]+60:] = (cr[:350, :, :3] * ar + 255 * (1 - ar)).astype(np.uint8)

cv2.imwrite("scratch/current_production_lids.jpg", bg_current)
print("Saved scratch/current_production_lids.jpg")
