import re

for fpath in ["index.html", "pages/thumbnail/thumbnail.html"]:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"=== {fpath} ===")
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', content):
        if "matcha_cup" in m.group(1):
            print("  ", m.group(0))
