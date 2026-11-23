import cv2
import numpy as np

# Let's inspect the width and height of lids in ref vs current
# In ref:
# Cup left rim width, cup right rim width
ref = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg")
broken = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384968748_d4689fa6.jpg")
curr = cv2.imread("scratch/current_production_lids.jpg")

# Let's create an overview image combining all 3 vertically:
# 1. Reference photo (dark background)
# 2. Previous Broken version (from user upload 1)
# 3. Current Restored version
w_target = 1000

def resize_to_w(img, w):
    h = int(img.shape[0] * w / img.shape[1])
    return cv2.resize(img, (w, h))

r1 = resize_to_w(ref, w_target)
r2 = resize_to_w(broken, w_target)
r3 = resize_to_w(curr, w_target)

# Add titles onto each image
def add_title(img, text, bg_c=(0,0,0), text_c=(255,255,255)):
    out = img.copy()
    cv2.rectangle(out, (10, 10), (10 + len(text)*14, 45), bg_c, -1)
    cv2.putText(out, text, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, text_c, 2)
    return out

t1 = add_title(r1, "1. USER REFERENCE (Target Lid)", (0,0,0), (0, 255, 128))
t2 = add_title(r2, "2. PREVIOUS BROKEN / CUTOFF (Before)", (0,0,0), (0, 100, 255))
t3 = add_title(r3, "3. CURRENT RESTORED (Full Dome & Sip Cap)", (0,0,0), (255, 255, 0))

combined = np.vstack([t1, t2, t3])
cv2.imwrite("scratch/full_lid_verification_report.jpg", combined)
print("Saved scratch/full_lid_verification_report.jpg!")
