import re

expected_prices = {
    'ice-matcha-latte': 'Rp 25.000',
    'ice-matcharicano': 'Rp 22.000',
    'ice-matcha-chocolate': 'Rp 28.000',
    'ice-matcha-vanilla-foam': 'Rp 28.000',
    'ice-chocolate': 'Rp 25.000',
    'custom-drink': 'DARI RP 20K'
}

for filename in ['index.html', 'pages/menu/menu.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    
    matches = re.findall(r'data-id="([^"]+)".*?<span class="pantone-price">([^<]+)</span>', html, re.DOTALL)
    print(f"=== {filename} ===")
    assert len(matches) == 6, f"Expected 6 cards, got {len(matches)}"
    for cid, price in matches:
        expected = expected_prices.get(cid)
        print(f"  {cid:25s}: {price} (expected: {expected})")
        assert price == expected, f"Mismatch for {cid}: {price} != {expected}"

# Check customize.js
with open('pages/customize/customize.js', 'r', encoding='utf-8') as f:
    js = f.read()

assert "'ice-matcha-latte': {\n        name: 'ICE MATCHA LATTE',\n        pantone: 'SPECIMEN 2270 C',\n        basePrice: 25000" in js
assert "'ice-matcharicano': {\n        name: 'ICE MATCHARICANO',\n        pantone: 'SPECIMEN 0794 C',\n        basePrice: 22000" in js
assert "'ice-matcha-chocolate': {\n        name: 'ICE MATCHA CHOCOLATE',\n        pantone: 'SPECIMEN 4975 C',\n        basePrice: 28000" in js
assert "'ice-matcha-vanilla-foam': {\n        name: 'ICE MATCHA VANILLA FOAM',\n        pantone: 'SPECIMEN 00997 C',\n        basePrice: 28000" in js
assert "'ice-chocolate': {\n        name: 'ICE CHOCOLATE',\n        pantone: 'SPECIMEN 4695 C',\n        basePrice: 25000" in js

print("\nALL PRICES VERIFIED 100% ACCURATE!")
