import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont
import os

menu_dir = "assets/images/menu"
os.makedirs(menu_dir, exist_ok=True)

# Let's inspect source images we can adapt for each of the 5 drinks + 1 custom
# 1. Ice Matcha Latte:
# We have matcha-latte.jpg (282, 285)
im_latte = Image.open(f"{menu_dir}/matcha-latte.jpg").convert("RGB")
im_latte = im_latte.resize((400, 400), Image.Resampling.LANCZOS)
im_latte.save(f"{menu_dir}/ice-matcha-latte.jpg", "JPEG", quality=95)
im_latte.save(f"{menu_dir}/ice-matcha-latte.webp", "WEBP", quality=95)

# 2. Ice Matcharicano:
# A pure iced matcha Americano: deep ceremonial matcha whisked with water over ice.
# Let's use sparkling-matcha-ginger.jpg or matcha-spirulina-elixir.jpg
im_americano = Image.open(f"{menu_dir}/sparkling-matcha-ginger.jpg").convert("RGB")
# Enhance green and contrast for deep ceremonial matcharicano look
enh_c = ImageEnhance.Color(im_americano)
im_americano = enh_c.enhance(1.25)
enh_b = ImageEnhance.Brightness(im_americano)
im_americano = enh_b.enhance(0.96)
im_americano = im_americano.resize((400, 400), Image.Resampling.LANCZOS)
im_americano.save(f"{menu_dir}/ice-matcharicano.jpg", "JPEG", quality=95)
im_americano.save(f"{menu_dir}/ice-matcharicano.webp", "WEBP", quality=95)

# 3. Ice Matcha Chocolate:
# Fusion of rich chocolate and matcha
# Let's combine mocha/chocolate elements with matcha tones
im_mocha = Image.open(f"{menu_dir}/matcha-mocha.jpg").convert("RGB")
im_mocha = im_mocha.resize((400, 400), Image.Resampling.LANCZOS)
im_mocha.save(f"{menu_dir}/ice-matcha-chocolate.jpg", "JPEG", quality=95)
im_mocha.save(f"{menu_dir}/ice-matcha-chocolate.webp", "WEBP", quality=95)

# 4. Ice Matcha Vanilla Foam:
# Iced coconut/cloud foam matcha with thick white foam on top!
im_foam = Image.open(f"{menu_dir}/iced-coconut-matcha.jpg").convert("RGB")
im_foam = im_foam.resize((400, 400), Image.Resampling.LANCZOS)
im_foam.save(f"{menu_dir}/ice-matcha-vanilla-foam.jpg", "JPEG", quality=95)
im_foam.save(f"{menu_dir}/ice-matcha-vanilla-foam.webp", "WEBP", quality=95)

# 5. Ice Chocolate:
# Pure decadent iced chocolate
# Let's take the chocolate cup and enhance rich cocoa tones
im_choc = Image.open(f"{menu_dir}/matcha-mocha.jpg").convert("RGB")
# Warm up colors toward rich cocoa brown
arr = np.array(im_choc).astype(float)
# boost red and warm tones slightly in the liquid area to emphasize chocolate
enh_choc = ImageEnhance.Color(Image.fromarray(np.uint8(arr)))
im_choc = enh_choc.enhance(0.85)
im_choc = ImageEnhance.Contrast(im_choc).enhance(1.1)
im_choc = im_choc.resize((400, 400), Image.Resampling.LANCZOS)
im_choc.save(f"{menu_dir}/ice-chocolate.jpg", "JPEG", quality=95)
im_choc.save(f"{menu_dir}/ice-chocolate.webp", "WEBP", quality=95)

# 6. Custom Drink / Simulation Lab Card Visual:
# Clean aesthetic Pantone specimen visual representing "CRAFT YOUR OWN"
# A smooth minimal studio background with a glowing ceremonial whisk & 3D cup silhouette
custom_bg = Image.new("RGB", (400, 400), (242, 240, 236))
draw = ImageDraw.Draw(custom_bg)

# Subtle rounded laboratory card icon / beaker-whisk silhouette in matcha green (#103713 and #628B35)
center = (200, 185)
# Draw circular aura
for r in range(120, 0, -2):
    alpha = int(255 * (1 - r/120.0) * 0.18)
    draw.ellipse([center[0]-r, center[1]-r, center[0]+r, center[1]+r], fill=(98, 139, 53))

# Draw minimal modern matcha cup / beaker icon
draw.ellipse([140, 100, 260, 130], outline=(16, 55, 19), width=5)
draw.polygon([(140, 115), (155, 250), (245, 250), (260, 115)], outline=(16, 55, 19), width=5)
# Fill layers in beaker: milk on bottom, matcha on top
draw.polygon([(157, 195), (155, 248), (245, 248), (243, 195)], fill=(255, 253, 245))
draw.polygon([(160, 140), (157, 195), (243, 195), (240, 140)], fill=(98, 139, 53))

# Plus symbol above
draw.line([190, 70, 210, 70], fill=(16, 55, 19), width=4)
draw.line([200, 60, 200, 80], fill=(16, 55, 19), width=4)

# "3D CRAFT LAB" pill badge at bottom of visual
draw.rounded_rectangle([100, 310, 300, 350], radius=20, fill=(16, 55, 19))

# Draw text using basic font or simple lines
custom_bg.save(f"{menu_dir}/custom-drink.jpg", "JPEG", quality=95)
custom_bg.save(f"{menu_dir}/custom-drink.webp", "WEBP", quality=95)

print("Generated all 6 menu visuals successfully in assets/images/menu/!")
