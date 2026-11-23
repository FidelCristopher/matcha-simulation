import re

with open("pages/thumbnail/thumbnail.html", "r", encoding="utf-8") as f:
    thumb_html = f.read()

svg_match = re.search(r'<svg[^>]*class="thumb-doodles-svg"[^>]*>.*?</svg>', thumb_html, re.DOTALL)
if not svg_match:
    print("Could not find SVG in thumbnail.html")
    exit(1)

new_svg = svg_match.group(0)

with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

index_svg_match = re.search(r'<svg[^>]*class="thumb-doodles-svg"[^>]*>.*?</svg>', index_html, re.DOTALL)
if not index_svg_match:
    print("Could not find SVG in index.html")
    exit(1)

updated_index = index_html[:index_svg_match.start()] + new_svg + index_html[index_svg_match.end():]
with open("index.html", "w", encoding="utf-8") as f:
    f.write(updated_index)

print("Successfully synced SVG with regex into index.html!")
