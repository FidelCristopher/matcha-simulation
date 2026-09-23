# Arsitektur Aplikasi (Architecture Overview)

Dokumen ini menjelaskan struktur teknis, pemisahan modul (*separation of concerns*), dan alur data dari website interaktif **Artisan Sparkling Matcha**.

---

## 1. Diagram Struktur Folder

```text
matcha-showcase/
├── assets/                       # Seluruh aset visual statis lokal
│   ├── models/                   # File 3D format GLB / glTF
│   │   ├── matcha.glb            # Model produk utama (matcha beverage)
│   │   ├── leaves.glb            # Model daun teh untuk background
│   │   ├── cherry.glb            # Model botanical ceri (flavor classic)
│   │   └── blueberry.glb         # Model botanical blueberry (flavor yuzu)
│   ├── textures/                 # Tekstur surface/label produk
│   │   └── texture_20250901.png  # PBR diffuse texture kemasan matcha
│   └── images/                   # Gambar pendukung & partikel
│       └── bubble.png            # Partikel mikro-karbonasi
│
├── css/                          # Modular styling terpisah per domain
│   ├── variables.css             # Design tokens: warna, gradients, font, spring curves
│   ├── base.css                  # Reset CSS & root typography
│   ├── components.css            # Komponen: Navigasi, tombol, kartu rasa, award badge
│   ├── hero.css                  # Layout hero, layering Z-index, dan positioning 3D
│   ├── menu.css                  # Layout & kartu menu racikan matcha (iPad optimized)
│   ├── simulation.css            # Workbench lab simulasi racikan matcha (sensory analytics)
│   └── animations.css            # Keyframes CSS: floating loop, bubble ascent, shine
│
├── js/                           # JavaScript ES Modules (ESM)
│   ├── config.js                 # Central single-source-of-truth konfigurasi & preset rasa
│   ├── bubbles.js                # Generator partikel mikro-karbonasi dinamis
│   ├── model-controller.js       # Kontroler 3D: orientasi kamera, shader, tinting
│   ├── interactions.js           # Fisika pointer, tolakan magnetik, transisi GSAP
│   ├── page-navigation.js        # Controller navigasi 3-halaman (Menu <-> Showcase <-> Simulation)
│   ├── matcha-simulation.js      # Engine sandbox simulasi racikan & sensory gauges
│   └── main.js                   # Application bootstrap & orchestrator
│
├── docs/                         # Dokumentasi developer & panduan update
│   ├── ARCHITECTURE.md           # Arsitektur modul dan Z-index hierarchy
│   ├── WORKFLOW.md               # Alur kerja update konten, styling, dan rasa
│   └── ASSET_GUIDELINES.md       # Spesifikasi dan standar optimasi aset 3D
│
├── index.html                    # Semantic HTML entry point
├── package.json                  # NPM scripts & task automation
├── .gitignore                    # Exclusion list untuk VCS
└── README.md                     # Panduan komprehensif proyek
```

---

## 2. Layering & Z-Index Hierarchy

Web ini mengandalkan efek visual *depth of field* bertingkat menggunakan Z-Index untuk memisahkan latar belakang, elemen 3D, konten teks, dan elemen interaktif:

| Layer / Container | CSS Selector | Z-Index | Deskripsi |
|---|---|---|---|
| **Micro-bubbles** | `#bubbles-container` | `0` | Partikel gelembung naik dari dasar layar |
| **Far BG Leaves** | `.leaves-container` | `-1` | Daun teh 3D melayang halus di latar belakang jauh |
| **Behind Can Botanicals** | `.berries-container-bg` | `0` | Elemen botanical di belakang kaleng/botol |
| **Product Model (3D Three.js)** | `#matcha-canvas-container` | `50` | Simulasi 3 layer (Topping, Isi, Base) dengan kontrol pinch/drag |
| **Layer Annotations** | `.layer-annotation` | `115` | Label mengambang penjelas komposisi per layer |
| **Simulation HUD** | `.simulation-hud` | `120` | Tombol toggle split & slider rentang pemisahan |
| **Hero Content & UI** | `.hero-left`, `.hero-right` | `100` | Headline, tombol CTA, kartu rasa, teks penghargaan |
| **Foreground Botanicals** | `.berries-container` | `110` | Elemen botanical di depan teks dan model |
| **Header Navigation** | `.header` | `100` | Glassmorphism bar yang fixed di bagian atas |

---

## 3. Alur Komunikasi Modul JavaScript

```
[main.js]
   ├──> initBubbles() [bubbles.js] ───────────> Generasi partikel berkala (DOM loop)
   │
   ├──> new ModelController() [model-controller.js]
   │       └──> Warm-up shader & expose API tilt / tint
   │
   └──> new InteractionManager() [interactions.js]
           ├──> Event: mousemove ─────────────> Interpolasi lerp (smoothing)
           │       ├──> ModelController.updateTilt()
           │       ├──> Parallax shift (FG / BG / Leaves)
           │       └──> Force field repulsion kalkulasi jarak (Euclidean)
           │
           └──> Event: flavor card click ─────> GSAP Timeline:
                   ├──> Background radial gradient morph
                   ├──> Model 360° spin + blur 14px
                   ├──> Peak: applyFlavorTone() & switch classes
                   ├──> Model 720° settle (back.out easing)
                   └──> Implosion & explosion botanical models
```

---

## 4. Keunggulan Arsitektur Ini
1. **Fully Local & Offline-Ready**: Tidak ada ketergantungan model 3D atau gambar ke server eksternal/CDN luar.
2. **Zero-Build Dependency**: Tetap dapat dijalankan langsung dengan web server statis sederhana tanpa harus compile Webpack/Vite.
3. **Konfigurasi Terpusat (`config.js`)**: Menambah rasa baru atau mengubah warna hanya butuh mengedit 1 file config.
