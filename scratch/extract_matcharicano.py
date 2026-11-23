import cv2
import numpy as np
from PIL import Image

p = r"C:/Users/Lenovo/.gemini/antigravity/brain/db1a435d-2d57-455b-bc0c-b035800d00d4/.user_uploaded/media_1795422888200_c031f131.jpg"
im = cv2.imread(p)

# 1. Extract inner photo frame
inner = im[57:563, 52:972]
h_in, w_in, _ = inner.shape

# 2. Crop Cup 1 (left cup) with full headroom and base contact
# Plug top is at y = 42, base at y = 494
y1, y2 = 36, 502
x1, x2 = 115, 475
cup1_raw = inner[y1:y2, x1:x2].copy()
ch, cw, _ = cup1_raw.shape

print(f"cup1_raw shape: {cup1_raw.shape}")

# 3. Precision GrabCut with Definite Foreground/Background seeds
# Initialize mask: GC_BGD=0, GC_FGD=1, GC_PR_BGD=2, GC_PR_FGD=3
mask = np.full((ch, cw), cv2.GC_PR_BGD, dtype=np.uint8)

# Center of cup cylinder is definitely foreground
# Cup cylinder runs from y=125 to near base (ch - 15)
for y in range(130, ch - 15):
    t = (y - 130) / (ch - 15 - 130)
    cx_min = int(60 + t * 45)
    cx_max = int(300 - t * 45)
    mask[y, cx_min:cx_max] = cv2.GC_FGD

# Domed lid definite foreground
for y in range(10, 130):
    if y < 45:
        # plug
        mask[y, 160:200] = cv2.GC_FGD
    else:
        # dome
        t_dome = (y - 45) / (130 - 45)
        d_min = int(140 - t_dome * 90)
        d_max = int(220 + t_dome * 90)
        mask[y, d_min:d_max] = cv2.GC_FGD

# Definite Background: outer corners and top air
mask[:8, :] = cv2.GC_BGD
mask[:40, :150] = cv2.GC_BGD
mask[:40, 210:] = cv2.GC_BGD
mask[ch - 10:, :60] = cv2.GC_BGD
mask[ch - 10:, 300:] = cv2.GC_BGD
mask[:, :12] = cv2.GC_BGD
mask[:, 348:] = cv2.GC_BGD

# Run GrabCut
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)
cv2.grabCut(cup1_raw, mask, None, bgdModel, fgdModel, 6, cv2.GC_INIT_WITH_MASK)

# Binary foreground
fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

# Retain largest connected component (the cup)
contours, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
if contours:
    main_c = max(contours, key=cv2.contourArea)
    solid_mask = np.zeros_like(fg)
    cv2.drawContours(solid_mask, [main_c], -1, 255, -1)
    fg = solid_mask

# Edge anti-aliasing
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
eroded = cv2.erode(fg, kernel, iterations=1)
boundary = (fg > 0) & (eroded < 255)

smoothed = cv2.GaussianBlur(fg, (5, 5), 1.2)
alpha = fg.copy()
alpha[boundary] = smoothed[boundary]

# Create RGBA
rgba = cv2.cvtColor(cup1_raw, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = alpha

# Crop tightly to non-zero alpha
ys, xs = np.where(alpha > 0)
crop_y1, crop_y2 = max(0, ys.min() - 2), min(ch, ys.max() + 3)
crop_x1, crop_x2 = max(0, xs.min() - 2), min(cw, xs.max() + 3)
cup_isolated = rgba[crop_y1:crop_y2, crop_x1:crop_x2]

# Convert to PIL
pil_cup = Image.fromarray(cv2.cvtColor(cup_isolated, cv2.COLOR_BGRA2RGBA))
print(f"Isolated cup size: {pil_cup.size}")

# Standard menu canvas: (320, 480)
# Match proportions with ice-matcha-latte and ice-matcha-vanilla-foam
target_h = 440
aspect = pil_cup.size[0] / pil_cup.size[1]
target_w = int(target_h * aspect)
resized_cup = pil_cup.resize((target_w, target_h), Image.Resampling.LANCZOS)

menu_canvas = Image.new("RGBA", (320, 480), (0, 0, 0, 0))
off_x = (320 - target_w) // 2
off_y = 480 - target_h  # Leaves 40px headroom at top for 3D pop-out!
menu_canvas.paste(resized_cup, (off_x, off_y), resized_cup)

# Save test output
menu_canvas.save("scratch/test_matcharicano_canvas.png")

# Also composite on white to verify
white_preview = Image.new("RGB", (320, 480), (255, 255, 255))
white_preview.paste(menu_canvas, (0, 0), menu_canvas)
white_preview.save("scratch/test_matcharicano_white.jpg", quality=95)

print("Saved scratch/test_matcharicano_canvas.png and test_matcharicano_white.jpg successfully!")
