import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

replacement = '''        <!-- PAGE 0: PANTONE SPECIMEN MENU (5 Signature Drinks + 1 Custom 3D Lab) -->
        <section id="menu-page" class="page">
          <div class="pantone-menu-wrapper" id="pantone-menu-root">

            <!-- Top Left Floating Back Button (Returns to Welcome Thumbnail Screen) -->
            <button
              class="pantone-float-back"
              id="pantone-back-btn"
              aria-label="Back to Welcome Screen"
              title="Return to Welcome Screen"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>

            <!-- Header & Category Filter Navigation Bar -->
            <header class="pantone-menu-header">
              <div class="pantone-brand-meta">
                <span class="pantone-brand-label">MATCHA<span style="color:#628B35;">TCIH.</span></span>
                <span class="pantone-sub-label">CURATED SPECIMEN PALETTE • UJI 2026</span>
              </div>

              <!-- Category Filter Pills -->
              <nav class="pantone-filter-bar" aria-label="Menu Categories">
                <button class="pantone-filter-btn active" data-category="all">ALL (6)</button>
                <button class="pantone-filter-btn" data-category="matcha">MATCHA</button>
                <button class="pantone-filter-btn" data-category="chocolate">CHOCOLATE</button>
                <button class="pantone-filter-btn" data-category="custom">CUSTOM</button>
              </nav>
            </header>

            <!-- Main Specimen 6-Card Grid (3 Columns x 2 Rows) -->
            <main class="pantone-grid-stage">
              <div class="pantone-grid" id="pantone-cards-grid">

                <!-- CARD 1: Ice Matcha Latte -->
                <article
                  class="pantone-card"
                  data-id="ice-matcha-latte"
                  data-category="matcha"
                  data-name="ICE MATCHA LATTE"
                  data-pantone="2270 C"
                  data-price="5.20"
                  tabindex="0"
                  role="button"
                  aria-label="ICE MATCHA LATTE, 2270 C, $5.20. Click to add to cart"
                >
                  <div class="pantone-card-visual">
                    <picture>
                      <source srcset="assets/images/menu/ice-matcha-latte.webp" type="image/webp">
                      <img
                        src="assets/images/menu/ice-matcha-latte.jpg"
                        alt="Ice Matcha Latte"
                        loading="eager"
                        draggable="false"
                      >
                    </picture>
                  </div>
                  <div class="pantone-card-info">
                    <h3 class="pantone-card-title">ICE MATCHA LATTE</h3>
                    <div class="pantone-code-row">
                      <span class="pantone-code">2270 C</span>
                      <span class="pantone-price">$5.20</span>
                    </div>
                    <div class="pantone-card-stamp" aria-hidden="true">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="3 3"/>
                        <path d="M 50 25 C 42 45 35 60 35 75 C 45 80 55 80 65 75 C 65 60 58 45 50 25 Z"/>
                        <line x1="50" y1="20" x2="50" y2="78"/>
                      </svg>
                    </div>
                  </div>
                </article>

                <!-- CARD 2: Ice Matcharicano -->
                <article
                  class="pantone-card"
                  data-id="ice-matcharicano"
                  data-category="matcha"
                  data-name="ICE MATCHARICANO"
                  data-pantone="0794 C"
                  data-price="4.50"
                  tabindex="0"
                  role="button"
                  aria-label="ICE MATCHARICANO, 0794 C, $4.50. Click to add to cart"
                >
                  <div class="pantone-card-visual">
                    <picture>
                      <source srcset="assets/images/menu/ice-matcharicano.webp" type="image/webp">
                      <img
                        src="assets/images/menu/ice-matcharicano.jpg"
                        alt="Ice Matcharicano"
                        loading="eager"
                        draggable="false"
                      >
                    </picture>
                  </div>
                  <div class="pantone-card-info">
                    <h3 class="pantone-card-title">ICE MATCHARICANO</h3>
                    <div class="pantone-code-row">
                      <span class="pantone-code">0794 C</span>
                      <span class="pantone-price">$4.50</span>
                    </div>
                    <div class="pantone-card-stamp" aria-hidden="true">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="3 3"/>
                        <path d="M 50 25 C 42 45 35 60 35 75 C 45 80 55 80 65 75 C 65 60 58 45 50 25 Z"/>
                        <line x1="50" y1="20" x2="50" y2="78"/>
                      </svg>
                    </div>
                  </div>
                </article>

                <!-- CARD 3: Ice Matcha Chocolate -->
                <article
                  class="pantone-card"
                  data-id="ice-matcha-chocolate"
                  data-category="matcha chocolate"
                  data-name="ICE MATCHA CHOCOLATE"
                  data-pantone="4975 C"
                  data-price="5.80"
                  tabindex="0"
                  role="button"
                  aria-label="ICE MATCHA CHOCOLATE, 4975 C, $5.80. Click to add to cart"
                >
                  <div class="pantone-card-visual">
                    <picture>
                      <source srcset="assets/images/menu/ice-matcha-chocolate.webp" type="image/webp">
                      <img
                        src="assets/images/menu/ice-matcha-chocolate.jpg"
                        alt="Ice Matcha Chocolate layered drink"
                        loading="eager"
                        draggable="false"
                      >
                    </picture>
                  </div>
                  <div class="pantone-card-info">
                    <h3 class="pantone-card-title">ICE MATCHA<br>CHOCOLATE</h3>
                    <div class="pantone-code-row">
                      <span class="pantone-code">4975 C</span>
                      <span class="pantone-price">$5.80</span>
                    </div>
                    <div class="pantone-card-stamp" aria-hidden="true">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="3 3"/>
                        <path d="M 50 25 C 42 45 35 60 35 75 C 45 80 55 80 65 75 C 65 60 58 45 50 25 Z"/>
                        <line x1="50" y1="20" x2="50" y2="78"/>
                      </svg>
                    </div>
                  </div>
                </article>

                <!-- CARD 4: Ice Matcha Vanilla Foam -->
                <article
                  class="pantone-card"
                  data-id="ice-matcha-vanilla-foam"
                  data-category="matcha"
                  data-name="ICE MATCHA VANILLA FOAM"
                  data-pantone="00997 C"
                  data-price="5.60"
                  tabindex="0"
                  role="button"
                  aria-label="ICE MATCHA VANILLA FOAM, 00997 C, $5.60. Click to add to cart"
                >
                  <div class="pantone-card-visual">
                    <picture>
                      <source srcset="assets/images/menu/ice-matcha-vanilla-foam.webp" type="image/webp">
                      <img
                        src="assets/images/menu/ice-matcha-vanilla-foam.jpg"
                        alt="Ice Matcha Vanilla Cloud Foam"
                        loading="lazy"
                        draggable="false"
                      >
                    </picture>
                  </div>
                  <div class="pantone-card-info">
                    <h3 class="pantone-card-title">ICE MATCHA<br>VANILLA FOAM</h3>
                    <div class="pantone-code-row">
                      <span class="pantone-code">00997 C</span>
                      <span class="pantone-price">$5.60</span>
                    </div>
                    <div class="pantone-card-stamp" aria-hidden="true">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="3 3"/>
                        <path d="M 50 25 C 42 45 35 60 35 75 C 45 80 55 80 65 75 C 65 60 58 45 50 25 Z"/>
                        <line x1="50" y1="20" x2="50" y2="78"/>
                      </svg>
                    </div>
                  </div>
                </article>

                <!-- CARD 5: Ice Chocolate -->
                <article
                  class="pantone-card"
                  data-id="ice-chocolate"
                  data-category="chocolate"
                  data-name="ICE CHOCOLATE"
                  data-pantone="4695 C"
                  data-price="4.80"
                  tabindex="0"
                  role="button"
                  aria-label="ICE CHOCOLATE, 4695 C, $4.80. Click to add to cart"
                >
                  <div class="pantone-card-visual">
                    <picture>
                      <source srcset="assets/images/menu/ice-chocolate.webp" type="image/webp">
                      <img
                        src="assets/images/menu/ice-chocolate.jpg"
                        alt="Ice Chocolate rich cocoa"
                        loading="lazy"
                        draggable="false"
                      >
                    </picture>
                  </div>
                  <div class="pantone-card-info">
                    <h3 class="pantone-card-title">ICE CHOCOLATE</h3>
                    <div class="pantone-code-row">
                      <span class="pantone-code">4695 C</span>
                      <span class="pantone-price">$4.80</span>
                    </div>
                    <div class="pantone-card-stamp" aria-hidden="true">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="3 3"/>
                        <path d="M 50 25 C 42 45 35 60 35 75 C 45 80 55 80 65 75 C 65 60 58 45 50 25 Z"/>
                        <line x1="50" y1="20" x2="50" y2="78"/>
                      </svg>
                    </div>
                  </div>
                </article>

                <!-- CARD 6: Custom Drink (3D Simulation Lab) -->
                <article
                  class="pantone-card card-custom-craft"
                  data-id="custom-drink"
                  data-category="custom"
                  data-name="CUSTOM DRINK"
                  data-pantone="3D LAB"
                  data-price="4.50"
                  tabindex="0"
                  role="button"
                  aria-label="CUSTOM DRINK, Interactive 3D Craft Lab, from $4.50. Click to customize"
                >
                  <div class="pantone-card-visual">
                    <picture>
                      <source srcset="assets/images/menu/custom-drink.webp" type="image/webp">
                      <img
                        src="assets/images/menu/custom-drink.jpg"
                        alt="Custom Drink Simulation Lab"
                        loading="lazy"
                        draggable="false"
                      >
                    </picture>
                    <div class="pantone-custom-badge">✨ 3D CRAFT LAB</div>
                  </div>
                  <div class="pantone-card-info">
                    <h3 class="pantone-card-title">CUSTOM DRINK</h3>
                    <div class="pantone-code-row">
                      <span class="pantone-code" style="color: #628B35; font-weight: 800;">3D LAB</span>
                      <span class="pantone-price">FROM $4.50</span>
                    </div>
                    <div class="pantone-card-stamp" aria-hidden="true">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="3 3"/>
                        <path d="M 50 25 C 42 45 35 60 35 75 C 45 80 55 80 65 75 C 65 60 58 45 50 25 Z"/>
                        <line x1="50" y1="20" x2="50" y2="78"/>
                      </svg>
                    </div>
                  </div>
                </article>

              </div>
            </main>

            <!-- Bottom Right Floating Controls (Grid density toggle & Cart trigger) -->
            <aside class="pantone-float-controls" aria-label="Quick Actions">
              <button
                class="pantone-float-action"
                id="pantone-toggle-grid-btn"
                aria-label="Toggle Grid Size"
                title="Toggle Grid Size"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>

              <button
                class="pantone-float-action pantone-cart-btn"
                id="pantone-cart-btn"
                aria-label="Open Cart"
                title="View Order Cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="pantone-cart-badge" id="pantone-cart-badge">0</span>
              </button>
            </aside>

            <!-- Minimalist Toast Notification for Cart Actions -->
            <div class="pantone-toast" id="pantone-toast" role="status" aria-live="polite">
              <span class="pantone-toast-icon">✓</span>
              <span class="pantone-toast-text">Added to cart</span>
            </div>

          </div>
        </section>'''

# Replace the section from <!-- PAGE 0: ... --> to </section>
pattern = r'<!-- PAGE 0:.*?<section id="menu-page" class="page">.*?</section>'
new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)

if count > 0:
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replaced menu-page in index.html!")
else:
    print("Pattern not matched!")
