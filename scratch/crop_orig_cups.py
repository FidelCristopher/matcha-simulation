import cv2

img = cv2.imread("assets/images/matcha_cups_original.jpg")
# Where are the two cups?
# Let's crop cup left and cup right from img1:
# In img1: height is 601, width is 1024
# Let's crop left cup and right cup:
cup_l_orig = img[100:580, 220:560]
cup_r_orig = img[100:580, 520:860]

cv2.imwrite("scratch/cup_l_from_matcha_cups_original.jpg", cup_l_orig)
cv2.imwrite("scratch/cup_r_from_matcha_cups_original.jpg", cup_r_orig)
print("Saved cup_l_from_matcha_cups_original and cup_r_from_matcha_cups_original")
