import re

with open("index.html", "r", encoding="utf-8") as f:
    c = f.read()

for m in re.finditer(r'<img[^>]+matcha_cup[^>]+>', c):
    print("img in index.html:", m.group(0))

for m in re.finditer(r'<source[^>]+matcha_cup[^>]+>', c):
    print("source in index.html:", m.group(0))
