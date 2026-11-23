import cv2
import numpy as np

# Load preview_lids_fulllid.jpg
lids = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\preview_lids_fulllid.jpg")
print("Lids shape:", lids.shape)

# Let's save a visual inspection of the left lid and right lid
# To inspect how clean and realistic they look
cv2.imwrite("scratch/check_restored_lids.jpg", lids)
