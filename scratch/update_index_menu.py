import sys

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = '<!-- PAGE 0: MENU RACIKAN MATCHA (Left Page) -->'
end_marker = '<!-- PAGE 1: 3D LANDING SHOWCASE (Right Page) -->'

if start_marker not in content or end_marker not in content:
    print("Markers not found!")
    sys.exit(1)

with open("pages/menu/menu.html", "r", encoding="utf-8") as f:
    menu_html = f.read()

# Extract inner part of menu.html
menu_inner_start = '<div class="pantone-menu-wrapper" id="pantone-menu-root">'
menu_inner_end = '</div>\n\n  <script'

idx1 = menu_html.find(menu_inner_start)
idx2 = menu_html.rfind('</div>')
if idx1 == -1 or idx2 == -1:
    print("Inner menu tags not found")
    sys.exit(1)

extracted_menu = menu_html[idx1:idx2+6]

replacement = f"""<!-- PAGE 0: MENU RACIKAN MATCHA (Left Page - Pantone Specimen Swatch Grid) -->
        <section id="menu-page" class="page">
          {extracted_menu}
        </section>

        """

pos1 = content.find(start_marker)
pos2 = content.find(end_marker)

new_content = content[:pos1] + replacement + content[pos2:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully replaced #menu-page in index.html!")
