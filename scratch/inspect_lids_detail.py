import cv2
import numpy as np

ref = cv2.imread(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795384985575_38f84a11.jpg")
cl = cv2.imread("assets/images/matcha_cup_left.png", cv2.IMREAD_UNCHANGED)
cr = cv2.imread("assets/images/matcha_cup_right.png", cv2.IMREAD_UNCHANGED)

# Let's crop the left lid from ref
# In ref (297, 1024):
# left lid roughly: y from 40 to 180, x from 120 to 510
ref_lid_l = ref[30:175, 120:510]
ref_lid_r = ref[35:180, 520:910]

# In cl and cr (height ~1000):
# top 250 rows
cl_lid = cl[:250, :, :]
cr_lid = cr[:250, :, :]

# Composite cl_lid and cr_lid on white
al = cl_lid[:, :, 3:4] / 255.0
comp_l = (cl_lid[:, :, :3] * al + 255 * (1 - al)).astype(np.uint8)

ar = cr_lid[:, :, 3:4] / 255.0
comp_r = (cr_lid[:, :, :3] * ar + 255 * (1 - ar)).astype(np.uint8)

# Resize to match ref lid width
comp_l_res = cv2.resize(comp_l, (ref_lid_l.shape[1], int(comp_l.shape[0] * ref_lid_l.shape[1] / comp_l.shape[1])))
comp_r_res = cv2.resize(comp_r, (ref_lid_r.shape[1], int(comp_r.shape[0] * ref_lid_r.shape[1] / comp_r.shape[1])))

# Save crops
cv2.imwrite("scratch/ref_lid_l.jpg", ref_lid_l)
cv2.imwrite("scratch/ref_lid_r.jpg", ref_lid_r)
cv2.imwrite("scratch/comp_lid_l.jpg", comp_l_res)
cv2.imwrite("scratch/comp_lid_r.jpg", comp_r_res)

print("Saved individual lid crops.")
