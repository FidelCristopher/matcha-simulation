# MatchaTcih — Artisan Sparkling Matcha 3D Showcase & Crafting Atelier

Landing page interaktif generasi baru berbasis WebGL & 3D real-time untuk minuman seremonial **MatchaTcih**, mengusung estetika *editorial brutalist* modern (terinspirasi dari Golda Coffee) dengan performa tinggi, visual bebas *AI slop*, dan pengalaman pengguna yang imersif.

---

## ✨ Fitur Utama

- **Estetika Editorial Dark & Non-AI Slop**:
  - Palet warna mewah **Obsidian Dark Canvas** (`#040604` s/d `#0f1911`) dengan aksen **Electric Ceremonial Matcha Lime** (`#a3e635`) dan **Kyoto Bamboo Whisk Gold** (`#eab308`).
  - Tipografi editorial kelas atas memadukan **Grotesk Ultra-Bold (`Outfit` 900 tight-tracking)** dan **Editorial Italic Serif (`Newsreader`)** untuk highlight artistik (`Craft` *YOUR RITUAL*, *ritual of stillness*).
  - Tampilan navigasi capsule glass minimalis dengan wordmark **`MatchaTcih.`**

- **Real-time 3D Layer Simulation Stage**:
  - Kaleng 3D multi-layer dengan Three.js & Google `<model-viewer>`.
  - Fitur **Pinch / Split Layer** interaktif dengan slider dan tombol HUD neon lime.
  - Orbit daun Tencha, pengocok bambu *chasen*, dan elemen botanical yang melayang bebas tanpa menutupi tipografi utama.

- **Bento Grid Showcase ("The Matcha Standard")**:
  - Layout grid bento modern: ekstraksi dingin *First Flush*, terroir *Single Origin Uji*, cellular flow *L-Theanine 8H Focus*.
  - **Solid Accent Punch Card (`0g ADDED SUGAR / 100% PURE CEREMONIAL`)** dengan kontras visual tinggi.
  - Testimonial editorial 5 bintang emas (`★★★★★`), kutipan otentik sommelier teh, baris metrik angka raksasa (*80mg L-Theanine*, *0 Calories*, *0% Jitters*, *100% Satisfaction*), serta watermark tipografi raksasa **`MATCHA`** di latar belakang.

- **Matcha Crafting Atelier / Simulation Sandbox**:
  - Laboratorium formulasi interaktif: pilih base teh (*Uji Ceremonial*, *Roasted Hojicha*, *Mineral Soda*), sesuaikan konsentrasi bubuk teh (1.0g s/d 4.5g), dan tekstur busa (*Oat Milk Cloud*, *Vanilla Foam*, *Coconut Velvet*, *Pure Zero Milk*).
  - Visual cup preview dengan layer dinamis realistis dan tekstur busa susu oat krem/ivory alami.
  - Analitik sensori real-time (Umami, Sweetness, EGCG Antioxidants, dan estimasi Kafein).
  - Terintegrasi langsung dengan tombol **Add to Cart** dan **Reset Recipe**.

- **Navigasi 3-Halaman Horizontal (Kiosk & Desktop Mode)**:
  - **Menu Halaman Kiri (Page 0)**: Kurasi racikan signature, bento grid, cerita, dan testimonial.
  - **Beranda Halaman Tengah (Page 1)**: 3D showcase interaktif, flavor carousel, dan simulation HUD.
  - **Simulasi Halaman Kanan (Page 2)**: Crafting atelier dan sensory sandbox.
  - Dapat diakses via klik navigasi atas maupun gesture swipe / drag.

- **Sistem Keranjang & Checkout (Cart Pop-Up Modal)**:
  - Tombol indikator keranjang di header dengan badge jumlah pesanan dinamis.
  - Modal pop-up bertema obsidian dark glass untuk menambah/mengurangi porsi, menghitung total pesanan, dan checkout instan.

- **Kitchen Display System & Admin Order Monitor (`admin.html`)**:
  - Dashboard khusus barista/dapur real-time untuk memantau tiket pesanan kiosk.
  - Manajemen status pesanan (`Brewing` $\leftrightarrow$ `Completed`), penghapusan tiket individual, filter pencarian, dan analitik omset.
  - Fitur ekspor laporan dapur ke format dokumen **`.pdf`** dan spreadsheet **`.xlsx` (Excel)**.

- **Dukungan Multi-Bahasa Instan (Bilingual EN / ID)**:
  - Penggantian bahasa langsung di header (`EN` $\leftrightarrow$ `ID`) mencakup seluruh teks navigasi, hero editorial, menu, kartu bento, anotasi layer 3D, hingga modal keranjang.

---

## 📁 Struktur Proyek

```text
MatchaTcih/
├── assets/
│   ├── models/            # Model 3D (matcha.glb, leaves.glb, cherry.glb, chasen.glb, daun_matcha.glb)
│   ├── textures/          # Tekstur surface kaleng & material
│   └── images/            # Partikel mikro-karbonasi (bubble.png)
├── css/
│   ├── variables.css      # Design tokens (Obsidian Dark, Electric Lime, Bamboo Gold, tipografi)
│   ├── base.css           # Reset dasar, background radial editorial, text selection
│   ├── components.css     # Header MatchaTcih, capsule nav, CTA button, HUD slider, layer badges
│   ├── hero.css           # Layout 3-tier editorial title, komposisi 3D stage
│   ├── menu.css           # Bento standard grid, punch card 0g, testimonial, metrics row, watermark
│   ├── simulation.css     # Workbench atelier, custom range slider, cup preview, sensory meters
│   ├── cart.css           # Modal pop-up keranjang bertema dark luxury
│   ├── admin.css          # Styling dashboard Kitchen Display System (KDS)
│   └── animations.css     # Micro-animations, float keyframe, glow transitions
├── js/
│   ├── main.js            # Entry point aplikasi
│   ├── config.js          # Konfigurasi terpusat & data varian rasa
│   ├── bubbles.js         # Generator partikel mikro-karbonasi
│   ├── model-controller.js# Controller 3D Three.js & model-viewer
│   ├── interactions.js    # Fisika kursor mouse & transisi kaleng
│   ├── page-navigation.js # Slider navigasi 3-halaman horizontal
│   ├── matcha-simulation.js # Engine simulasi takaran & formula atelier
│   ├── cart.js            # Engine manajemen keranjang belanja & modal
│   ├── admin.js           # Engine KDS barista & ekspor PDF/Excel
│   └── i18n.js            # Engine translasi instan bilingual (EN / ID)
├── docs/
│   ├── ARCHITECTURE.md    # Penjelasan arsitektur teknis & layer visual
│   ├── WORKFLOW.md        # Panduan alur kerja update & penambahan fitur
│   ├── ASSET_GUIDELINES.md# Standar spesifikasi aset 3D
│   └── DRAG_AND_DROP_SPEC.md # Spesifikasi hierarki Chashaku & interaksi Drag-and-Drop
├── index.html             # Halaman utama MatchaTcih Showcase & Atelier
├── admin.html             # Dashboard Kitchen Display System (KDS)
└── package.json           # Konfigurasi proyek & dependency scripts
```

---

## 🚀 Cara Menjalankan di Local

Pastikan Anda berada di direktori project:
```bash
cd C:\Users\Pongo\matcha-showcase
# atau di WSL:
cd /mnt/c/Users/Pongo/matcha-showcase
```

Jalankan perintah berikut:

### Opsi 1 (Rekomendasi - Otomatis Buka Browser & Auto-Reload):
```bash
npm run dev
```

### Opsi 2 (Server Statis):
```bash
npm run serve
```

Buka di browser Anda:
👉 **`http://localhost:3000`**

Untuk mengakses Kitchen Display System (KDS):
👉 **`http://localhost:3000/admin.html`**

---

## 📜 Lisensi
MIT License © 2026 MatchaTcih. All rights reserved.
