import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

menu_dir = "assets/images/menu"

# Let's inspect the 9 original pantone drinks we have from the reference image:
# 1: hot traditional (green in glass cup)
# 2: matcha latte (ribbed faceted glass with green matcha latte art)
# 3: iced coconut matcha (tall glass, white milk on bottom, dark green matcha on top, coconut flakes)
# 4: strawberry matcha (3 layers: red strawberry puree, white milk, green matcha on top)
# 5: mango matcha smoothie (yellow mango drink)
# 6: matcha lemonade (green iced drink with lemon wheel & mint)
# 7: matcha mocha (white mug with hot chocolate and whipped cream)
# 8: sparkling matcha ginger (tall glass, green matcha layer with bubbles & ginger)
# 9: matcha spirulina elixir (green bottle with leaves)

# Look at how perfectly these map to the user's 5 drinks + custom:
# 1. Ice matcha latte -> We can use the faceted matcha latte glass (matcha-latte.jpg) OR our studio cup!
# 2. Ice matcharicano -> sparkling-matcha-ginger.jpg or matcha-lemonade.jpg (adjusted: clear iced glass with deep ceremonial matcha, ice cubes & water)!
# 3. Ice matcha chocolate -> We can take strawberry-matcha.jpg, but shift the red bottom layer (strawberry) into rich dark chocolate brown! 
#    A 3-layer drink: dark chocolate ganache at bottom, white milk in middle, vibrant green matcha on top! That IS Ice Matcha Chocolate!
# 4. Ice matcha vanila foam -> iced-coconut-matcha.jpg (white cloud foam on top, iced ceremonial matcha in middle, milk on bottom)!
# 5. Ice chocolate -> A rich iced chocolate drink! We can take the tall ribbed glass and tint it with deep decadent chocolate cocoa!
# 6. Custom -> Clean laboratory Pantone swatch with customizable matcha slider and beaker!

# Let's create Ice Matcha Chocolate by transforming the bottom layer of strawberry-matcha into deep rich chocolate:
im_straw = Image.open(f"{menu_dir}/strawberry-matcha.jpg").convert("RGB")
arr_straw = np.array(im_straw).astype(float)
h, w, _ = arr_straw.shape

# The red strawberry layer is roughly y in [180..260], x in [80..200]
# Where red is dominant (R > G + 30 and R > B + 30):
# Turn bright red strawberry puree into rich dark chocolate brown (R: 60..90, G: 35..55, B: 25..35)
mask_red = (arr_straw[:, :, 0] > arr_straw[:, :, 1] + 25) & (arr_straw[:, :, 0] > arr_straw[:, :, 2] + 25) & (np.arange(h)[:, None] > 170)
# Replace with chocolate tone
arr_straw[mask_red, 0] = arr_straw[mask_red, 0] * 0.45 + 25
arr_straw[mask_red, 1] = arr_straw[mask_red, 1] * 0.35 + 15
arr_straw[mask_red, 2] = arr_straw[mask_red, 2] * 0.30 + 10

im_choc_matcha = Image.fromarray(np.clip(arr_straw, 0, 255).astype(np.uint8))
im_choc_matcha = im_choc_matcha.resize((400, 400), Image.Resampling.LANCZOS)
im_choc_matcha.save(f"{menu_dir}/ice-matcha-chocolate.jpg", quality=95)
im_choc_matcha.save(f"{menu_dir}/ice-matcha-chocolate.webp", quality=95)

# Let's create Ice Matcharicano from sparkling-matcha-ginger.jpg:
im_spark = Image.open(f"{menu_dir}/sparkling-matcha-ginger.jpg").convert("RGB")
# Remove ginger slice and make deep ceremonial green throughout the liquid
arr_spark = np.array(im_spark).astype(float)
# The ginger slice is yellow (high R and high G, low B in upper right of glass: y in [80..150], x in [120..190])
# Blend the yellow slice into deep green
mask_ginger = (arr_spark[:, :, 0] > 140) & (arr_spark[:, :, 1] > 140) & (arr_spark[:, :, 2] < 120) & (np.arange(h)[:, None] < 160) & (np.arange(w)[None, :] > 115)
arr_spark[mask_ginger, 0] = arr_spark[mask_ginger, 0] * 0.4
arr_spark[mask_ginger, 1] = arr_spark[mask_ginger, 1] * 0.85
arr_spark[mask_ginger, 2] = arr_spark[mask_ginger, 2] * 0.5

im_cano = Image.fromarray(np.clip(arr_spark, 0, 255).astype(np.uint8))
# Enhance crispness
im_cano = ImageEnhance.Color(im_cano).enhance(1.2)
im_cano = im_cano.resize((400, 400), Image.Resampling.LANCZOS)
im_cano.save(f"{menu_dir}/ice-matcharicano.jpg", quality=95)
im_cano.save(f"{menu_dir}/ice-matcharicano.webp", quality=95)

# Let's create Ice Chocolate from iced-coconut-matcha:
# Convert the green matcha portion into deep iced chocolate!
im_coco = Image.open(f"{menu_dir}/iced-coconut-matcha.jpg").convert("RGB")
arr_coco = np.array(im_coco).astype(float)
# In iced coconut matcha, green is in middle-top y in [90..180] where G > R and G > B:
mask_green = (arr_coco[:, :, 1] > arr_coco[:, :, 0] + 10) & (arr_coco[:, :, 1] > arr_coco[:, :, 2] + 10) & (np.arange(h)[:, None] > 60) & (np.arange(h)[:, None] < 200)
# Turn into chocolate cocoa tone
arr_coco[mask_green, 0] = arr_coco[mask_green, 1] * 0.75 + 30
arr_coco[mask_green, 2] = arr_coco[mask_green, 2] * 0.4 + 15
arr_coco[mask_green, 1] = arr_coco[mask_green, 1] * 0.5 + 20

im_choc_drink = Image.fromarray(np.clip(arr_coco, 0, 255).astype(np.uint8))
im_choc_drink = ImageEnhance.Contrast(im_choc_drink).enhance(1.15)
im_choc_drink = im_choc_drink.resize((400, 400), Image.Resampling.LANCZOS)
im_choc_drink.save(f"{menu_dir}/ice-chocolate.jpg", quality=95)
im_choc_drink.save(f"{menu_dir}/ice-chocolate.webp", quality=95)

# Let's make Custom Drink card:
# Minimalist studio visual with a stylized 3D beaker, whisk, and rainbow ingredient gradient
custom_canvas = Image.new("RGB", (400, 400), (250, 248, 243))
draw = ImageDraw.Draw(custom_canvas)

# Elegant layered drink beaker
cx, cy = 200, 190
# Beaker outline
draw.polygon([(145, 100), (145, 130), (120, 260), (280, 260), (255, 130), (255, 100)], outline=(16, 55, 19), width=5)
# Fill layers in the beaker:
# Layer 1 (bottom): Chocolate ganache / syrup (y: 235..258)
draw.polygon([(124, 235), (276, 235), (278, 258), (122, 258)], fill=(75, 45, 30))
# Layer 2: Silky oat/dairy milk (y: 185..235)
draw.polygon([(135, 185), (265, 185), (276, 235), (124, 235)], fill=(255, 253, 245))
# Layer 3: Ceremonial matcha green (y: 135..185)
draw.polygon([(144, 135), (256, 135), (265, 185), (135, 185)], fill=(98, 139, 53))
# Layer 4 (top): Vanilla cloud foam with matcha dust (y: 108..135)
draw.polygon([(145, 108), (255, 108), (256, 135), (144, 135)], fill=(245, 243, 235))
# Matcha dust specks on foam
for speck_x in [160, 175, 190, 205, 220, 235]:
    draw.ellipse([speck_x, 115, speck_x+4, 119], fill=(16, 55, 19))

# Measurement tick lines on left side of beaker (100ml, 200ml, 300ml)
for ty in [140, 175, 210, 245]:
    draw.line([115, ty, 130, ty], fill=(16, 55, 19), width=3)

# Plus badge top right
draw.ellipse([270, 75, 315, 120], fill=(98, 139, 53))
draw.line([292, 85, 292, 110], fill=(255, 253, 245), width=4)
draw.line([280, 97, 305, 97], fill=(255, 253, 245), width=4)

# Bottom tag pill
draw.rounded_rectangle([95, 310, 305, 355], radius=22, fill=(16, 55, 19))

custom_canvas.save(f"{menu_dir}/custom-drink.jpg", quality=95)
custom_canvas.save(f"{menu_dir}/custom-drink.webp", quality=95)

print("Generated perfected visuals for all 6 drinks!")
