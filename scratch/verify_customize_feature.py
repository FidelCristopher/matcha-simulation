import os
import re

print("=== VERIFYING CUSTOMIZE FEATURE ===")

# 1. Check file existence
files = [
    'pages/customize/customize.html',
    'pages/customize/customize.css',
    'pages/customize/customize.js'
]
for f in files:
    exists = os.path.exists(f)
    sz = os.path.getsize(f) if exists else 0
    print(f"File {f}: {'EXISTS' if exists else 'MISSING'} ({sz} bytes)")
    assert exists, f"File {f} must exist"

# 2. Check HTML elements
with open('pages/customize/customize.html', 'r', encoding='utf-8') as f:
    html = f.read()

required_ids = [
    'custom-back-btn',
    'custom-drink-title',
    'custom-mode-badge',
    'custom-total-price',
    'custom-reset-btn',
    'custom-add-cart-btn',
    'custom-glass-stage',
    'interactive-cup',
    'cup-chamber',
    'cup-empty-indicator',
    'visual-layer-matcha',
    'visual-layer-milk',
    'visual-layer-ice',
    'visual-layer-choco',
    'visual-layer-foam',
    'visual-layer-boba',
    'visual-layer-coconut'
]
for rid in required_ids:
    assert f'id="{rid}"' in html, f"Missing id={rid} in customize.html"
print(f"Verified {len(required_ids)} required DOM IDs in customize.html!")

# 3. Check JS Templates and Math logic
with open('pages/customize/customize.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Check that 3000 (3 rebu) per topping is present
assert '3000' in js, "Topping math must include 3000 (3 rebu)"
assert 'toppingCostPerItem = 3000' in js, "toppingCostPerItem must be 3000"

drinks = [
    'hot-traditional',
    'matcha-latte',
    'iced-coconut-matcha',
    'strawberry-matcha',
    'mango-matcha-smoothie',
    'matcha-lemonade',
    'matcha-mocha',
    'sparkling-matcha-ginger',
    'matcha-spirulina-elixir',
    'custom-drink'
]
for d in drinks:
    assert f"'{d}'" in js, f"Missing preset template for {d}"
print(f"Verified all {len(drinks)} drink presets in customize.js!")

# 4. Check menu card navigation in pages/menu/menu.js
with open('pages/menu/menu.js', 'r', encoding='utf-8') as f:
    menu_js = f.read()
assert 'pages/customize/customize.html?drink=' in menu_js, "Menu card click must route to customize.html"
print("Verified menu card click handler routes to customize.html!")

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
