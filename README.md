# Artisan Sparkling Matcha — 3D Showcase

Landing page interaktif berbasis WebGL & 3D real-time untuk minuman seremonial **Artisan Sparkling Matcha**, dibuat dengan arsitektur modular yang rapi, performa tinggi, dan mudah di-update.

---

## Fitur Utama

- **Real-time 3D Viewport**: Menggunakan Google `<model-viewer>` dengan kemampuan tilt interaktif mengikuti kursor mouse.
- **Navigasi 3-Halaman Horizontal (iPad & Laptop Cursor Mode)**:
  - Swipe Kiri $\rightarrow$ Kanan: Masuk ke **Menu Racikan Matcha** (Page 0).
  - Halaman Tengah: **3D Showcase & Layer Pinch Simulation** (Page 1).
  - Swipe Kanan $\rightarrow$ Kiri: Masuk ke **Simulation Page / Matcha Crafting Lab** (Page 2).
- **Matcha Crafting Simulation Sandbox**: Workbench interaktif untuk meracik formula matcha (pilih base teh, atur gramatur bubuk teh 1g s/d 4.5g, jenis busa susu, serta metrik rasa umami & antioksidan EGCG real-time).
- **Aset 3D Otentik (Matcha, Chasen & Daun Matcha)**: Mengintegrasikan kaleng matcha 3-layer simulation, pengocok bambu *chasen*, dan daun teh matcha asli (*Tencha leaves*) yang melayang dalam orbit melingkar harmonis.
- **Fisika Tolakan (Force-Field Repulsion)**: Elemen botanical melayang bereaksi menjauh ketika didekati kursor pengguna.
- **Choreographed Flavor Transition**: Perubahan varian rasa memicu putaran kaleng 720° dengan efek motion blur, perubahan warna background dinamis, dan animasi implosi/eksplosi elemen botanical.
- **Partikel Mikro-Karbonasi**: Gelembung karbonasi naik perlahan tanpa henti dari bagian bawah layar.
- **Arsitektur Modular & Offline-Ready**: Seluruh file CSS, JS, dan aset 3D tersimpan secara lokal tanpa dependensi CDN pihak ketiga untuk media.

---

## Struktur Proyek

```text
matcha-showcase/
├── assets/
│   ├── models/            # File 3D (matcha.glb, leaves.glb, cherry.glb, blueberry.glb)
│   ├── textures/          # Tekstur surface produk
│   └── images/            # Partikel gelembung (bubble.png)
├── css/
│   ├── variables.css      # Design tokens (warna, gradient, font, spring)
│   ├── base.css           # Reset dasar dan body layout
│   ├── components.css     # Komponen UI (navbar, kartu, badge, tombol)
│   ├── hero.css           # Layout hero & layering Z-index
│   └── animations.css     # CSS Keyframe animasi
├── js/
│   ├── config.js          # Konfigurasi terpusat & data rasa
│   ├── bubbles.js         # Generator partikel gelembung
│   ├── model-controller.js# Controller 3D model-viewer
│   ├── interactions.js    # Logika fisika kursor & transisi rasa
│   └── main.js            # Entry point aplikasi
├── docs/
│   ├── ARCHITECTURE.md    # Penjelasan struktur teknis & layer visual
│   ├── WORKFLOW.md        # Panduan alur kerja update & penambahan fitur
│   └── ASSET_GUIDELINES.md# Standar spesifikasi aset 3D
├── index.html             # Halaman utama aplikasi
└── package.json           # Skrip development & konfigurasi
```

---

## Cara Menjalankan

Masuk ke folder proyek:
```bash
cd /mnt/c/Users/Pongo/matcha-showcase
```

Jalankan salah satu perintah server berikut:

### Opsi 1 (Python):
```bash
python3 -m http.server 3000
```

### Opsi 2 (Node.js / NPX):
```bash
npm run dev
# atau
npx serve .
```

Buka peramban di: **`http://localhost:3000`**

---

## Dokumentasi Lengkap
- [Arsitektur Teknis](docs/ARCHITECTURE.md)
- [Panduan Update & Tambah Rasa](docs/WORKFLOW.md)
- [Standar Optimasi Aset 3D](docs/ASSET_GUIDELINES.md)
