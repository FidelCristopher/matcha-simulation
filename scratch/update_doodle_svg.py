# Script to update SVG in thumbnail.html and index.html with lively animated groups

old_left_wing = """    <!-- 3. Floating Ceremonial Matcha Leaves (Far Left) -->
    <g transform="translate(140, 110) rotate(-32) scale(1.2)">
        <path d="M 0 0 C 35 -30, 85 -30, 115 0 C 85 35, 35 35, 0 0 Z" fill="#628B35" opacity="0.95"/>
        <line x1="0" y1="0" x2="115" y2="0" stroke="#103713" stroke-width="2.5"/>
        <line x1="25" y1="0" x2="40" y2="-15" stroke="#103713" stroke-width="1.8"/>
        <line x1="30" y1="0" x2="48" y2="16" stroke="#103713" stroke-width="1.8"/>
        <line x1="55" y1="0" x2="72" y2="-14" stroke="#103713" stroke-width="1.8"/>
        <line x1="62" y1="0" x2="78" y2="15" stroke="#103713" stroke-width="1.8"/>
    </g>
    <g transform="translate(60, 340) rotate(18) scale(1.1)">
        <path d="M 0 0 C 30 -24, 75 -24, 100 0 C 75 30, 30 30, 0 0 Z" fill="#103713" opacity="0.9"/>
        <line x1="0" y1="0" x2="100" y2="0" stroke="#628B35" stroke-width="2.2"/>
        <line x1="25" y1="0" x2="38" y2="-12" stroke="#628B35" stroke-width="1.5"/>
        <line x1="30" y1="0" x2="44" y2="14" stroke="#628B35" stroke-width="1.5"/>
        <line x1="55" y1="0" x2="70" y2="-11" stroke="#628B35" stroke-width="1.5"/>
    </g>
    <g transform="translate(220, 520) rotate(35) scale(0.95)">
        <path d="M 0 0 C 25 -20, 60 -20, 80 0 C 60 25, 25 25, 0 0 Z" fill="#628B35" opacity="0.92"/>
        <line x1="0" y1="0" x2="80" y2="0" stroke="#103713" stroke-width="2"/>
    </g>

    <!-- 4. Japanese Tea Whisk (Chasen) Vector Line Art (Left Wing) -->
    <g transform="translate(260, 240) scale(0.95)">
        <rect x="-10" y="-48" width="20" height="34" rx="4" stroke="#103713" stroke-width="2.5" fill="rgba(226, 219, 208, 0.4)"/>
        <line x1="-10" y1="-24" x2="10" y2="-24" stroke="#628B35" stroke-width="3"/>
        <circle cx="0" cy="-14" r="11" stroke="#103713" stroke-width="2.5" fill="none"/>
        <path d="M -12 -14 C -24 14, -28 34, -26 48 C -14 50, -4 48, 0 44 C 4 48, 14 50, 26 48 C 28 34, 24 14, 12 -14" stroke="#628B35" stroke-width="2.5" fill="none"/>
        <path d="M -5 -14 C -11 14, -14 34, -11 46" stroke="#628B35" stroke-width="1.8" fill="none"/>
        <path d="M 5 -14 C 11 14, 14 34, 11 46" stroke="#628B35" stroke-width="1.8" fill="none"/>
        <line x1="0" y1="-14" x2="0" y2="44" stroke="#103713" stroke-width="2"/>
    </g>

    <!-- 5. Radiant Citrus Sunburst (Top-Left) -->
    <g transform="translate(180, 130)">
        <circle cx="0" cy="0" r="36" stroke="#103713" stroke-width="3" stroke-dasharray="6 4" opacity="0.5"/>
        <circle cx="0" cy="0" r="24" stroke="#628B35" stroke-width="4" opacity="0.9"/>
        <line x1="0" y1="-24" x2="0" y2="24" stroke="#628B35" stroke-width="3"/>
        <line x1="-24" y1="0" x2="24" y2="0" stroke="#628B35" stroke-width="3"/>
        <line x1="-17" y1="-17" x2="17" y2="17" stroke="#628B35" stroke-width="3"/>
        <line x1="-17" y1="17" x2="17" y2="-17" stroke="#628B35" stroke-width="3"/>
        <line x1="0" y1="-42" x2="0" y2="-52" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="-30" x2="36" y2="-36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
        <line x1="42" y1="0" x2="52" y2="0" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="30" x2="36" y2="36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
        <line x1="0" y1="42" x2="0" y2="52" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="-30" y1="30" x2="-36" y2="36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
        <line x1="-42" y1="0" x2="-52" y2="0" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="-30" y1="-30" x2="-36" y2="-36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
    </g>

    <!-- 6. Zen Wavy Streamers (Left Wing) -->
    <path d="M 140 340 Q 170 325 200 340 T 260 340 T 320 340 T 380 340" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M 140 358 Q 170 343 200 358 T 260 358 T 320 358 T 380 358" stroke="#103713" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 140 376 Q 170 361 200 376 T 260 376 T 320 376 T 380 376" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>

    <!-- 7. Concentric Rainbow Arches (Bottom Left Wing) -->
    <path d="M 100 620 A 90 90 0 0 1 280 620" stroke="#628B35" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 120 620 A 70 70 0 0 1 260 620" stroke="#103713" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
    <path d="M 140 620 A 50 50 0 0 1 240 620" stroke="#628B35" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <path d="M 160 620 A 30 30 0 0 1 220 620" stroke="#E2DBD0" stroke-width="4" stroke-linecap="round" opacity="0.9"/>

    <!-- Sparkle Stars Left -->
    <path d="M 380 110 L 385 125 L 400 130 L 385 135 L 380 150 L 375 135 L 360 130 L 375 125 Z" fill="#628B35" opacity="0.85"/>
    <path d="M 100 230 L 103 239 L 112 242 L 103 245 L 100 254 L 97 245 L 88 242 L 97 239 Z" fill="#628B35" opacity="0.8"/>
    <path d="M 320 500 L 324 512 L 336 516 L 324 520 L 320 532 L 316 520 L 304 516 L 316 512 Z" fill="#103713" opacity="0.8"/>"""

new_left_wing = """    <!-- 3. Floating Ceremonial Matcha Leaves (Far Left) - Lively Wind Rustle -->
    <g transform="translate(140, 110) rotate(-32) scale(1.2)">
      <g class="doodle-leaf-anim">
        <path d="M 0 0 C 35 -30, 85 -30, 115 0 C 85 35, 35 35, 0 0 Z" fill="#628B35" opacity="0.95"/>
        <line x1="0" y1="0" x2="115" y2="0" stroke="#103713" stroke-width="2.5"/>
        <line x1="25" y1="0" x2="40" y2="-15" stroke="#103713" stroke-width="1.8"/>
        <line x1="30" y1="0" x2="48" y2="16" stroke="#103713" stroke-width="1.8"/>
        <line x1="55" y1="0" x2="72" y2="-14" stroke="#103713" stroke-width="1.8"/>
        <line x1="62" y1="0" x2="78" y2="15" stroke="#103713" stroke-width="1.8"/>
      </g>
    </g>
    <g transform="translate(60, 340) rotate(18) scale(1.1)">
      <g class="doodle-leaf-anim-alt">
        <path d="M 0 0 C 30 -24, 75 -24, 100 0 C 75 30, 30 30, 0 0 Z" fill="#103713" opacity="0.9"/>
        <line x1="0" y1="0" x2="100" y2="0" stroke="#628B35" stroke-width="2.2"/>
        <line x1="25" y1="0" x2="38" y2="-12" stroke="#628B35" stroke-width="1.5"/>
        <line x1="30" y1="0" x2="44" y2="14" stroke="#628B35" stroke-width="1.5"/>
        <line x1="55" y1="0" x2="70" y2="-11" stroke="#628B35" stroke-width="1.5"/>
      </g>
    </g>
    <g transform="translate(220, 520) rotate(35) scale(0.95)">
      <g class="doodle-leaf-anim">
        <path d="M 0 0 C 25 -20, 60 -20, 80 0 C 60 25, 25 25, 0 0 Z" fill="#628B35" opacity="0.92"/>
        <line x1="0" y1="0" x2="80" y2="0" stroke="#103713" stroke-width="2"/>
      </g>
    </g>

    <!-- 4. Japanese Tea Whisk (Chasen) Vector Line Art - Lively Stirring Sway -->
    <g transform="translate(260, 240) scale(0.95)">
      <g class="doodle-chasen-anim">
        <rect x="-10" y="-48" width="20" height="34" rx="4" stroke="#103713" stroke-width="2.5" fill="rgba(226, 219, 208, 0.4)"/>
        <line x1="-10" y1="-24" x2="10" y2="-24" stroke="#628B35" stroke-width="3"/>
        <circle cx="0" cy="-14" r="11" stroke="#103713" stroke-width="2.5" fill="none"/>
        <path d="M -12 -14 C -24 14, -28 34, -26 48 C -14 50, -4 48, 0 44 C 4 48, 14 50, 26 48 C 28 34, 24 14, 12 -14" stroke="#628B35" stroke-width="2.5" fill="none"/>
        <path d="M -5 -14 C -11 14, -14 34, -11 46" stroke="#628B35" stroke-width="1.8" fill="none"/>
        <path d="M 5 -14 C 11 14, 14 34, 11 46" stroke="#628B35" stroke-width="1.8" fill="none"/>
        <line x1="0" y1="-14" x2="0" y2="44" stroke="#103713" stroke-width="2"/>
      </g>
    </g>

    <!-- 5. Radiant Citrus Sunburst (Top-Left) - Slow Hypnotic Rotation -->
    <g transform="translate(180, 130)">
      <g class="doodle-sunburst-anim">
        <circle cx="0" cy="0" r="36" stroke="#103713" stroke-width="3" stroke-dasharray="6 4" opacity="0.5"/>
        <circle cx="0" cy="0" r="24" stroke="#628B35" stroke-width="4" opacity="0.9"/>
        <line x1="0" y1="-24" x2="0" y2="24" stroke="#628B35" stroke-width="3"/>
        <line x1="-24" y1="0" x2="24" y2="0" stroke="#628B35" stroke-width="3"/>
        <line x1="-17" y1="-17" x2="17" y2="17" stroke="#628B35" stroke-width="3"/>
        <line x1="-17" y1="17" x2="17" y2="-17" stroke="#628B35" stroke-width="3"/>
        <line x1="0" y1="-42" x2="0" y2="-52" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="-30" x2="36" y2="-36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
        <line x1="42" y1="0" x2="52" y2="0" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="30" x2="36" y2="36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
        <line x1="0" y1="42" x2="0" y2="52" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="-30" y1="30" x2="-36" y2="36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
        <line x1="-42" y1="0" x2="-52" y2="0" stroke="#628B35" stroke-width="3" stroke-linecap="round"/>
        <line x1="-30" y1="-30" x2="-36" y2="-36" stroke="#103713" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>

    <!-- 6. Zen Wavy Streamers (Left Wing) - Continuous Flowing Currents -->
    <g class="doodle-waves-anim-left">
      <path d="M 140 340 Q 170 325 200 340 T 260 340 T 320 340 T 380 340" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>
      <path d="M 140 358 Q 170 343 200 358 T 260 358 T 320 358 T 380 358" stroke="#103713" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.6"/>
      <path d="M 140 376 Q 170 361 200 376 T 260 376 T 320 376 T 380 376" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>
    </g>

    <!-- 7. Concentric Rainbow Arches (Bottom Left Wing) - Gentle Aura Ripple -->
    <g class="doodle-arches-anim">
      <path d="M 100 620 A 90 90 0 0 1 280 620" stroke="#628B35" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
      <path d="M 120 620 A 70 70 0 0 1 260 620" stroke="#103713" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
      <path d="M 140 620 A 50 50 0 0 1 240 620" stroke="#628B35" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
      <path d="M 160 620 A 30 30 0 0 1 220 620" stroke="#E2DBD0" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
    </g>

    <!-- Sparkle Stars Left - Twinkling Pulse -->
    <path class="doodle-star doodle-star-1" d="M 380 110 L 385 125 L 400 130 L 385 135 L 380 150 L 375 135 L 360 130 L 375 125 Z" fill="#628B35" opacity="0.85"/>
    <path class="doodle-star doodle-star-2" d="M 100 230 L 103 239 L 112 242 L 103 245 L 100 254 L 97 245 L 88 242 L 97 239 Z" fill="#628B35" opacity="0.8"/>
    <path class="doodle-star doodle-star-3" d="M 320 500 L 324 512 L 336 516 L 324 520 L 320 532 L 316 520 L 304 516 L 316 512 Z" fill="#103713" opacity="0.8"/>"""

old_right_wing = """    <!-- 3. Floating Ceremonial Matcha Leaves (Far Right) -->
    <g transform="translate(1560, 110) rotate(32) scale(1.2)">
        <path d="M 0 0 C -35 -30, -85 -30, -115 0 C -85 35, -35 35, 0 0 Z" fill="#628B35" opacity="0.95"/>
        <line x1="0" y1="0" x2="-115" y2="0" stroke="#103713" stroke-width="2.5"/>
        <line x1="-25" y1="0" x2="-40" y2="-15" stroke="#103713" stroke-width="1.8"/>
        <line x1="-30" y1="0" x2="-48" y2="16" stroke="#103713" stroke-width="1.8"/>
        <line x1="-55" y1="0" x2="-72" y2="-14" stroke="#103713" stroke-width="1.8"/>
        <line x1="-62" y1="0" x2="-78" y2="15" stroke="#103713" stroke-width="1.8"/>
    </g>
    <g transform="translate(1640, 340) rotate(-18) scale(1.1)">
        <path d="M 0 0 C -30 -24, -75 -24, -100 0 C -75 30, -30 30, 0 0 Z" fill="#103713" opacity="0.9"/>
        <line x1="0" y1="0" x2="-100" y2="0" stroke="#628B35" stroke-width="2.2"/>
        <line x1="-25" y1="0" x2="-38" y2="-12" stroke="#628B35" stroke-width="1.5"/>
        <line x1="-30" y1="0" x2="-44" y2="14" stroke="#628B35" stroke-width="1.5"/>
        <line x1="-55" y1="0" x2="-70" y2="-11" stroke="#628B35" stroke-width="1.5"/>
    </g>
    <g transform="translate(1480, 520) rotate(-35) scale(0.95)">
        <path d="M 0 0 C -25 -20, -60 -20, -80 0 C -60 25, -25 25, 0 0 Z" fill="#628B35" opacity="0.92"/>
        <line x1="0" y1="0" x2="-80" y2="0" stroke="#103713" stroke-width="2"/>
    </g>

    <!-- 4. Ceremonial Matcha Bowl (Chawan) with Steam Vapor (Right Wing) -->
    <g transform="translate(1440, 240) scale(0.95)">
        <path d="M -42 -10 C -42 24, -28 42, 0 42 C 28 42, 42 24, 42 -10 Z" stroke="#103713" stroke-width="2.5" fill="rgba(226, 219, 208, 0.4)"/>
        <ellipse cx="0" cy="-10" rx="42" ry="9" stroke="#103713" stroke-width="2.5" fill="rgba(98, 139, 53, 0.25)"/>
        <line x1="-18" y1="42" x2="18" y2="42" stroke="#103713" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M -14 -24 C -18 -36, -9 -45, -15 -56" stroke="#628B35" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M 0 -24 C -4 -38, 5 -47, 2 -60" stroke="#103713" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M 14 -24 C 9 -36, 18 -45, 15 -56" stroke="#628B35" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </g>

    <!-- 5. Berry / Tea Blossom Cluster (Top-Right) -->
    <g transform="translate(1520, 130)">
        <circle cx="0" cy="0" r="14" fill="#628B35" opacity="0.9"/>
        <circle cx="-16" cy="12" r="11" fill="#103713" opacity="0.85"/>
        <circle cx="16" cy="12" r="11" fill="#628B35" opacity="0.85"/>
        <circle cx="-10" cy="28" r="10" fill="#103713" opacity="0.75"/>
        <circle cx="10" cy="28" r="10" fill="#628B35" opacity="0.75"/>
        <circle cx="0" cy="40" r="8" fill="#103713" opacity="0.8"/>
        <path d="M 0 0 C 0 -25, 20 -40, 45 -48" stroke="#628B35" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>

    <!-- 6. Zen Wavy Streamers (Right Wing) -->
    <path d="M 1320 340 Q 1350 325 1380 340 T 1440 340 T 1500 340 T 1560 340" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M 1320 358 Q 1350 343 1380 358 T 1440 358 T 1500 358 T 1560 358" stroke="#103713" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 1320 376 Q 1350 361 1380 376 T 1440 376 T 1500 376 T 1560 376" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>

    <!-- 7. Concentric Rainbow Arches (Bottom Right Wing) -->
    <path d="M 1420 620 A 90 90 0 0 1 1600 620" stroke="#628B35" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 1440 620 A 70 70 0 0 1 1580 620" stroke="#103713" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
    <path d="M 1460 620 A 50 50 0 0 1 1560 620" stroke="#628B35" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <path d="M 1480 620 A 30 30 0 0 1 1540 620" stroke="#E2DBD0" stroke-width="4" stroke-linecap="round" opacity="0.9"/>

    <!-- Sparkle Stars Right -->
    <path d="M 1320 110 L 1325 125 L 1340 130 L 1325 135 L 1320 150 L 1315 135 L 1300 130 L 1315 125 Z" fill="#103713" opacity="0.75"/>
    <path d="M 1600 230 L 1603 239 L 1612 242 L 1603 245 L 1600 254 L 1597 245 L 1588 242 L 1597 239 Z" fill="#628B35" opacity="0.8"/>
    <path d="M 1380 500 L 1384 512 L 1396 516 L 1384 520 L 1380 532 L 1376 520 L 1364 516 L 1376 512 Z" fill="#628B35" opacity="0.8"/>"""

new_right_wing = """    <!-- 3. Floating Ceremonial Matcha Leaves (Far Right) - Lively Wind Rustle -->
    <g transform="translate(1560, 110) rotate(32) scale(1.2)">
      <g class="doodle-leaf-anim">
        <path d="M 0 0 C -35 -30, -85 -30, -115 0 C -85 35, -35 35, 0 0 Z" fill="#628B35" opacity="0.95"/>
        <line x1="0" y1="0" x2="-115" y2="0" stroke="#103713" stroke-width="2.5"/>
        <line x1="-25" y1="0" x2="-40" y2="-15" stroke="#103713" stroke-width="1.8"/>
        <line x1="-30" y1="0" x2="-48" y2="16" stroke="#103713" stroke-width="1.8"/>
        <line x1="-55" y1="0" x2="-72" y2="-14" stroke="#103713" stroke-width="1.8"/>
        <line x1="-62" y1="0" x2="-78" y2="15" stroke="#103713" stroke-width="1.8"/>
      </g>
    </g>
    <g transform="translate(1640, 340) rotate(-18) scale(1.1)">
      <g class="doodle-leaf-anim-alt">
        <path d="M 0 0 C -30 -24, -75 -24, -100 0 C -75 30, -30 30, 0 0 Z" fill="#103713" opacity="0.9"/>
        <line x1="0" y1="0" x2="-100" y2="0" stroke="#628B35" stroke-width="2.2"/>
        <line x1="-25" y1="0" x2="-38" y2="-12" stroke="#628B35" stroke-width="1.5"/>
        <line x1="-30" y1="0" x2="-44" y2="14" stroke="#628B35" stroke-width="1.5"/>
        <line x1="-55" y1="0" x2="-70" y2="-11" stroke="#628B35" stroke-width="1.5"/>
      </g>
    </g>
    <g transform="translate(1480, 520) rotate(-35) scale(0.95)">
      <g class="doodle-leaf-anim">
        <path d="M 0 0 C -25 -20, -60 -20, -80 0 C -60 25, -25 25, 0 0 Z" fill="#628B35" opacity="0.92"/>
        <line x1="0" y1="0" x2="-80" y2="0" stroke="#103713" stroke-width="2"/>
      </g>
    </g>

    <!-- 4. Ceremonial Matcha Bowl (Chawan) with Rising Steam Vapor (Right Wing) -->
    <g transform="translate(1440, 240) scale(0.95)">
        <path d="M -42 -10 C -42 24, -28 42, 0 42 C 28 42, 42 24, 42 -10 Z" stroke="#103713" stroke-width="2.5" fill="rgba(226, 219, 208, 0.4)"/>
        <ellipse cx="0" cy="-10" rx="42" ry="9" stroke="#103713" stroke-width="2.5" fill="rgba(98, 139, 53, 0.25)"/>
        <line x1="-18" y1="42" x2="18" y2="42" stroke="#103713" stroke-width="3.5" stroke-linecap="round"/>
        <g class="doodle-steam-anim">
          <path d="M -14 -24 C -18 -36, -9 -45, -15 -56" stroke="#628B35" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <path d="M 0 -24 C -4 -38, 5 -47, 2 -60" stroke="#103713" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <path d="M 14 -24 C 9 -36, 18 -45, 15 -56" stroke="#628B35" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </g>
    </g>

    <!-- 5. Berry / Tea Blossom Cluster (Top-Right) - Hanging Bob -->
    <g transform="translate(1520, 130)">
      <g class="doodle-berries-anim">
        <circle cx="0" cy="0" r="14" fill="#628B35" opacity="0.9"/>
        <circle cx="-16" cy="12" r="11" fill="#103713" opacity="0.85"/>
        <circle cx="16" cy="12" r="11" fill="#628B35" opacity="0.85"/>
        <circle cx="-10" cy="28" r="10" fill="#103713" opacity="0.75"/>
        <circle cx="10" cy="28" r="10" fill="#628B35" opacity="0.75"/>
        <circle cx="0" cy="40" r="8" fill="#103713" opacity="0.8"/>
        <path d="M 0 0 C 0 -25, 20 -40, 45 -48" stroke="#628B35" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>
    </g>

    <!-- 6. Zen Wavy Streamers (Right Wing) - Continuous Flowing Currents -->
    <g class="doodle-waves-anim-right">
      <path d="M 1320 340 Q 1350 325 1380 340 T 1440 340 T 1500 340 T 1560 340" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>
      <path d="M 1320 358 Q 1350 343 1380 358 T 1440 358 T 1500 358 T 1560 358" stroke="#103713" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.6"/>
      <path d="M 1320 376 Q 1350 361 1380 376 T 1440 376 T 1500 376 T 1560 376" stroke="#628B35" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.85"/>
    </g>

    <!-- 7. Concentric Rainbow Arches (Bottom Right Wing) - Gentle Aura Ripple -->
    <g class="doodle-arches-anim">
      <path d="M 1420 620 A 90 90 0 0 1 1600 620" stroke="#628B35" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
      <path d="M 1440 620 A 70 70 0 0 1 1580 620" stroke="#103713" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
      <path d="M 1460 620 A 50 50 0 0 1 1560 620" stroke="#628B35" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
      <path d="M 1480 620 A 30 30 0 0 1 1540 620" stroke="#E2DBD0" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
    </g>

    <!-- Sparkle Stars Right - Twinkling Pulse -->
    <path class="doodle-star doodle-star-4" d="M 1320 110 L 1325 125 L 1340 130 L 1325 135 L 1320 150 L 1315 135 L 1300 130 L 1315 125 Z" fill="#103713" opacity="0.75"/>
    <path class="doodle-star doodle-star-5" d="M 1600 230 L 1603 239 L 1612 242 L 1603 245 L 1600 254 L 1597 245 L 1588 242 L 1597 239 Z" fill="#628B35" opacity="0.8"/>
    <path class="doodle-star doodle-star-6" d="M 1380 500 L 1384 512 L 1396 516 L 1384 520 L 1380 532 L 1376 520 L 1364 516 L 1376 512 Z" fill="#628B35" opacity="0.8"/>"""

for filepath in ["pages/thumbnail/thumbnail.html", "index.html"]:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Normalize line endings
    content_norm = content.replace("\r\n", "\n")
    old_l_norm = old_left_wing.replace("\r\n", "\n")
    old_r_norm = old_right_wing.replace("\r\n", "\n")

    if old_l_norm not in content_norm:
        print(f"Warning: old_left_wing not found in {filepath}")
    else:
        content_norm = content_norm.replace(old_l_norm, new_left_wing.replace("\r\n", "\n"))
        print(f"Replaced left wing in {filepath}")

    if old_r_norm not in content_norm:
        print(f"Warning: old_right_wing not found in {filepath}")
    else:
        content_norm = content_norm.replace(old_r_norm, new_right_wing.replace("\r\n", "\n"))
        print(f"Replaced right wing in {filepath}")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content_norm)

print("Done updating SVG files!")
