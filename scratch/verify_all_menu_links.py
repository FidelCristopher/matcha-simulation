import re
import os
from PIL import Image

def verify_menu(file_path):
    print(f"=== Verifying {file_path} ===")
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    cards = re.findall(r'<article[^>]+class="[^"]*pantone-card[^"]*"[^>]*>', html)
    print(f"Total Pantone cards found: {len(cards)}")
    
    # Extract IDs and titles
    card_blocks = re.findall(r'<article[^>]+class="[^"]*pantone-card[^"]*"[^>]*>.*?</article>', html, re.DOTALL)
    for idx, block in enumerate(card_blocks):
        id_m = re.search(r'data-id="([^"]+)"', block)
        name_m = re.search(r'data-name="([^"]+)"', block)
        price_m = re.search(r'data-price="([^"]+)"', block)
        cat_m = re.search(r'data-category="([^"]+)"', block)
        pantone_m = re.search(r'data-pantone="([^"]+)"', block)
        
        imgs = re.findall(r'(?:src|srcset)="([^"]+)"', block)
        
        card_id = id_m.group(1) if id_m else "N/A"
        name = name_m.group(1) if name_m else "N/A"
        price = price_m.group(1) if price_m else "N/A"
        cat = cat_m.group(1) if cat_m else "N/A"
        pantone = pantone_m.group(1) if pantone_m else "N/A"
        
        print(f"[{idx+1}] ID: {card_id:24s} | Name: {name:25s} | Price: ${price} | Cat: {cat:15s} | Pantone: {pantone}")
        
        # Verify image paths exist
        for img_rel in imgs:
            # resolve path
            if file_path.startswith("pages/"):
                img_path = os.path.normpath(os.path.join(os.path.dirname(file_path), img_rel))
            else:
                img_path = os.path.normpath(img_rel)
            
            # strip query string
            img_path_clean = img_path.split("?")[0]
            exists = os.path.exists(img_path_clean)
            size = os.path.getsize(img_path_clean) if exists else 0
            if not exists or size == 0:
                print(f"   ERROR: Image missing {img_path_clean} (exists={exists}, size={size})")
            else:
                pass

verify_menu("pages/menu/menu.html")
verify_menu("index.html")
