import os
from PIL import Image

menu_dir = "assets/images/menu"
files = [
    "matcha-latte.jpg",
    "hot-traditional.jpg",
    "matcha-mocha.jpg",
    "iced-coconut-matcha.jpg",
    "strawberry-matcha.jpg",
    "sparkling-matcha-ginger.jpg",
    "matcha-lemonade.jpg"
]

for fn in files:
    p = os.path.join(menu_dir, fn)
    if os.path.exists(p):
        im = Image.open(p)
        print(f"{fn}: size={im.size}, mode={im.mode}")
