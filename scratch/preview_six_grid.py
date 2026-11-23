import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

menu_dir = "assets/images/menu"

# Let's inspect each of the 6 generated images
imgs = [
    ("ice-matcha-latte.jpg", "1. Ice Matcha Latte"),
    ("ice-matcharicano.jpg", "2. Ice Matcharicano"),
    ("ice-matcha-chocolate.jpg", "3. Ice Matcha Chocolate"),
    ("ice-matcha-vanilla-foam.jpg", "4. Ice Matcha Vanilla Foam"),
    ("ice-chocolate.jpg", "5. Ice Chocolate"),
    ("custom-drink.jpg", "6. Custom Drink")
]

# Create a grid preview of all 6
grid = Image.new("RGB", (1200, 800), (220, 218, 212))
for idx, (fn, title) in enumerate(imgs):
    p = os.path.join(menu_dir, fn)
    im = Image.open(p).resize((360, 360), Image.Resampling.LANCZOS)
    col = idx % 3
    row = idx // 3
    x = 30 + col * 390
    y = 30 + row * 390
    grid.paste(im, (x, y))
    
grid.save("scratch/menu_grid_6_preview.jpg", quality=90)
print("Saved scratch/menu_grid_6_preview.jpg")
