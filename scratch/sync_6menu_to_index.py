import re

with open('pages/menu/menu.html', 'r', encoding='utf-8') as f:
    menu_html = f.read()

# Extract inner content of pantone-menu-root
start_marker = '<div class="pantone-menu-wrapper" id="pantone-menu-root">'
end_marker = '</div>\n\n  <!-- Modular Scripts -->'
idx1 = menu_html.find(start_marker)
idx2 = menu_html.find(end_marker)
if idx1 == -1 or idx2 == -1:
    print('Markers not found in menu.html!')
    exit(1)

inner_menu = menu_html[idx1:idx2+6]
# Replace relative paths ../../assets/ with assets/
inner_menu = inner_menu.replace('../../assets/', 'assets/')

# Now load index.html
with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

# Replace menu section
menu_sec_start = '<section id="menu-page" class="page">'
menu_sec_end = '</section>\n\n        <!-- PAGE 1: 3D LANDING SHOWCASE'

s_idx = idx_content.find(menu_sec_start)
e_idx = idx_content.find(menu_sec_end)
if s_idx == -1 or e_idx == -1:
    print('Menu page markers not found in index.html!')
    print(f's_idx={s_idx}, e_idx={e_idx}')
    exit(1)

new_menu_section = f'''<section id="menu-page" class="page">
          {inner_menu}
        </section>'''

idx_content = idx_content[:s_idx] + new_menu_section + idx_content[e_idx + len('</section>'):]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx_content)

print('Successfully synchronized index.html with clean 6-card menu (no back button, no filter bar)!')
