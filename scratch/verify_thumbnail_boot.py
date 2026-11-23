with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('id="thumbnail-screen"')
print("index.html snippet around thumbnail-screen:")
print(html[idx-40:idx+120])

with open('pages/thumbnail/thumbnail.js', 'r', encoding='utf-8') as f:
    js = f.read()

idx_init = js.find('init() {')
print("\nthumbnail.js snippet around init():")
print(js[idx_init:idx_init+320])
