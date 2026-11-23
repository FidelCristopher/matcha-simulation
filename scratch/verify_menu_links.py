import os
import re

for filename in ['index.html', 'pages/menu/menu.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find all image sources in menu cards
    srcs = re.findall(r'src=["\']([^"\']+)["\']', html)
    menu_srcs = [s for s in srcs if 'menu/' in s]
    print(f'=== {filename}: {len(menu_srcs)} menu drink images ===')
    
    missing = 0
    base_dir = '.' if filename == 'index.html' else 'pages/menu'
    for s in menu_srcs:
        # resolve relative path
        resolved = os.path.normpath(os.path.join(base_dir, s.split('?')[0]))
        exists = os.path.exists(resolved)
        if not exists:
            print(f'  MISSING: {s} -> {resolved}')
            missing += 1
        else:
            sz = os.path.getsize(resolved)
            # print(f'  OK: {s} ({sz} bytes)')
    if missing == 0:
        print(f'  ALL {len(menu_srcs)} images verified successfully!')
