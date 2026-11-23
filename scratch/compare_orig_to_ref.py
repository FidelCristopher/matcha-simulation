import cv2
import numpy as np

p1 = "assets/images/matcha_cups_original.jpg"
p2 = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg"

img1 = cv2.imread(p1)
img2 = cv2.imread(p2)

print("img1 (matcha_cups_original.jpg) shape:", img1.shape)
print("img2 (media_...38f84a11.jpg) shape:", img2.shape)

# Let's check if img2 is a crop of img1!
# img1 is (601, 1024, 3)
# img2 is (297, 1024, 3)
# Let's compare img1[:297, :] with img2:
diff = np.abs(img1[:297, :].astype(float) - img2.astype(float))
print("Diff img1 top 297 vs img2:", diff.mean(), diff.max())
