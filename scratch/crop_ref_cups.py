import cv2
import numpy as np

ref = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg")
h, w, _ = ref.shape

# Let's crop cup 1 and cup 2 from ref
# In ref, where are the two lids?
# Left cup lid center is around x=310, right cup lid center is around x=710
cv2.imwrite("scratch/ref_cup1_top.jpg", ref[:250, 110:510])
cv2.imwrite("scratch/ref_cup2_top.jpg", ref[:250, 510:910])
print("Saved ref_cup1_top.jpg and ref_cup2_top.jpg")
