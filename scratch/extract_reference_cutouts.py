import os
import cv2
import numpy as np
from PIL import Image

menu_dir = "assets/images/menu"
ref_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.user_uploaded\media_1795414279280_5dc7fac5.jpg"
ref = cv2.imread(ref_path)

# Precise coordinates from the 3x3 poster:
drinks = {
    'hot-traditional': (78, 235, 102, 210, 66),
    'matcha-latte': (125, 252, 240, 332, 20),
    'iced-coconut-matcha': (125, 252, 370, 460, 20),
    'strawberry-matcha': (345, 475, 115, 195, 25),
    'mango-matcha-smoothie': (328, 478, 238, 334, 45),
    'matcha-lemonade': (342, 480, 370, 460, 25),
    'matcha-mocha': (568, 708, 108, 205, 30),
    'sparkling-matcha-ginger': (568, 712, 242, 332, 30),
    'matcha-spirulina-elixir': (555, 715, 355, 472, 42)
}

bg_grey = np.array([203, 207, 208], dtype=float)
bg_white = np.array([245, 245, 245], dtype=float)

for name, (y1, y2, x1, x2, card_top_offset) in drinks.items():
    crop = ref[y1:y2, x1:x2]
    h, w, _ = crop.shape
    
    # Calculate alpha mask:
    # Any pixel close to background grey (in upper section) or white card (in lower section) becomes transparent
    dist = np.zeros((h, w), dtype=float)
    for y in range(h):
        for x in range(w):
            pix = crop[y, x].astype(float)
            d_g = np.linalg.norm(pix - bg_grey)
            d_w = np.linalg.norm(pix - bg_white)
            
            # If near pure white
            if crop[y, x, 0] > 236 and crop[y, x, 1] > 236 and crop[y, x, 2] > 236:
                dist[y, x] = 0
            # If in top section and near grey
            elif y < card_top_offset and d_g < 16:
                dist[y, x] = 0
            else:
                dist[y, x] = max(d_g, d_w)
    
    # Soft alpha mapping
    alpha = np.clip(dist * 4.5, 0, 255).astype(np.uint8)
    
    # Smooth edges with bilateral / gaussian filter
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    
    rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha
    
    # Upscale 2x with Lanczos for razor-sharp rendering on modern displays
    pil_rgba = Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA))
    up_w, up_h = pil_rgba.size[0] * 2, pil_rgba.size[1] * 2
    pil_upscaled = pil_rgba.resize((up_w, up_h), Image.Resampling.LANCZOS)
    
    # Save .png, .webp, and .jpg fallback
    png_path = os.path.join(menu_dir, f"{name}.png")
    webp_path = os.path.join(menu_dir, f"{name}.webp")
    jpg_path = os.path.join(menu_dir, f"{name}.jpg")
    
    pil_upscaled.save(png_path, "PNG", optimize=True)
    pil_upscaled.save(webp_path, "WEBP", quality=95)
    
    white_bg = Image.new("RGB", pil_upscaled.size, (255, 255, 255))
    white_bg.paste(pil_upscaled, (0, 0), pil_upscaled)
    white_bg.save(jpg_path, "JPEG", quality=95)
    
    print(f"Extracted {name}: upscaled to {pil_upscaled.size}")

print("All 9 reference drinks extracted and saved with transparency!")
