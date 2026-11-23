import re

for fpath in ["pages/thumbnail/thumbnail.css", "css/style.css"]:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"=== {fpath} ===")
    for m in re.finditer(r'(\.thumb-cup[^{]*\{[^}]+\})', content):
        print(m.group(1)[:200])
