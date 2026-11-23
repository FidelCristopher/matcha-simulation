import re

for fpath in ["index.html", "pages/thumbnail/thumbnail.html"]:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace ?v=... on matcha_cup_left and matcha_cup_right with ?v=perfectdome
    new_content = re.sub(r'(matcha_cup_(?:left|right)\.(?:png|webp))\?v=[a-zA-Z0-9_-]+', r'\1?v=perfectdome', content)
    
    if new_content != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated cachebusters in {fpath}")
    else:
        print(f"No changes in {fpath}")
