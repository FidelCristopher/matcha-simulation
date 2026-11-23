import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

assert 'id="landing-page"' not in html, 'landing-page should not be in index.html'
assert 'id="thumbnail-screen"' in html, 'thumbnail-screen missing'
assert 'id="menu-page"' in html, 'menu-page missing'
assert 'ICE MATCHA VANILLA CLOUD FOAM' in html, 'ICE MATCHA VANILLA CLOUD FOAM missing'
assert 'ICE MATCHARICANO' in html, 'ICE MATCHARICANO missing'
assert 'ICE MATCHA LATTE' in html, 'ICE MATCHA LATTE missing'
assert 'ICE MATCHA CHOCOLATE' in html, 'ICE MATCHA CHOCOLATE missing'
assert 'ICE CHOCOLATE' in html, 'ICE CHOCOLATE missing'
assert 'CUSTOM DRINK' in html, 'CUSTOM DRINK missing'
assert '<body class="menu-active">' in html, 'body menu-active missing'

print('[OK] index.html: Home page cleanly removed, menu and thumbnail verified.')

with open('js/page-navigation.js', 'r', encoding='utf-8') as f:
    nav_js = f.read()

assert "goToPage('landing')" not in nav_js, 'landing still referenced in page-navigation.js'
assert "this.activePage = 'menu'" in nav_js, 'default page is menu'

print('[OK] js/page-navigation.js: Navigation cleanly locked to menu.')

assert os.path.exists('scratch/landing-page-backup.html'), 'Backup file missing'
print(f'[OK] scratch/landing-page-backup.html: Preserved safely ({os.path.getsize("scratch/landing-page-backup.html")} bytes).')
