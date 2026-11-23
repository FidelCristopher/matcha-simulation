import os
import re

print("=== VERIFYING CLEAN 6-CARD MENU ===")

for filename in ['index.html', 'pages/menu/menu.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()

    # Verify back button is removed
    assert 'id="pantone-back-btn"' not in html, f"Back button must not be in {filename}"
    assert 'class="pantone-filter-bar"' not in html, f"Filter bar must not be in {filename}"
    print(f"[{filename}] Verified: No back button & no category filter bar!")

    # Verify 6 cards
    cards = re.findall(r'<article\s+class="pantone-card[^"]*"\s+data-id="([^"]+)"', html)
    print(f"[{filename}] Cards found ({len(cards)}): {cards}")
    assert len(cards) == 6, f"Expected exactly 6 cards in {filename}, found {len(cards)}"

    # Verify images
    srcs = re.findall(r'<img\s+src="([^"]+)"', html)
    menu_srcs = [s for s in srcs if 'menu/' in s]
    base_dir = '.' if filename == 'index.html' else 'pages/menu'
    for s in menu_srcs:
        p = os.path.normpath(os.path.join(base_dir, s))
        assert os.path.exists(p), f"Missing image {s} -> {p}"
    print(f"[{filename}] All {len(menu_srcs)} drink images verified!")

print("\nALL MENU CHECKS PASSED!")
