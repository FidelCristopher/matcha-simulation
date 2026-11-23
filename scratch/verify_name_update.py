files = ['pages/menu/menu.html', 'index.html', 'pages/customize/customize.js']
for p in files:
    with open(p, 'r', encoding='utf-8') as f:
        txt = f.read()
    if 'ICE MATCHA VANILLA CLOUD FOAM' in txt:
        print(f"[PASS] {p} contains 'ICE MATCHA VANILLA CLOUD FOAM'")
    else:
        print(f"[FAIL] {p} missing new name")
        
    # Check old exact occurrences
    if 'data-name="ICE MATCHA VANILLA FOAM"' in txt or 'name: \'ICE MATCHA VANILLA FOAM\'' in txt:
        print(f"[WARN] {p} still has old name in data-name/preset")
    else:
        print(f"[PASS] {p} old name completely updated")
