# Alur Kerja Pengembangan & Pembaruan (Developer Workflow)

Panduan ini ditujukan untuk memandu Anda saat melakukan update, penambahan varian rasa, modifikasi gaya, atau penggantian aset 3D di masa mendatang.

---

## 1. Menjalankan Project di Lingkungan Lokal

Karena project menggunakan modul JavaScript (`type="module"`) dan Google `<model-viewer>` yang memuat aset GLB, project harus dijalankan melalui protokol HTTP/HTTPS lokal (bukan `file:///`).

### Cara 1: Menggunakan Python (Tanpa Install Package Apapun)
Jalankan di terminal di dalam folder project:
```bash
python3 -m http.server 3000
```
Buka browser di: `http://localhost:3000`

### Cara 2: Menggunakan NPM / Node.js
```bash
npm run dev
# atau
npx serve .
```

---

## 2. Cara Menambah atau Mengubah Varian Rasa Baru

Semua data rasa disimpan di `js/config.js` di dalam objek `APP_CONFIG.flavors`.

### Langkah A: Daftarkan Data Rasa Baru di `js/config.js`
```javascript
export const APP_CONFIG = {
    // ...
    flavors: {
        // Rasa yang sudah ada:
        classic: { ... },
        yuzu: { ... },

        // Tambah varian baru (misal: Sakura Matcha):
        sakura: {
            id: 'sakura',
            name: 'Sakura Matcha',
            price: '$3.79',
            themeClass: 'sakura-theme',
            colors: {
                inner: '#5e1f3a',
                mid: '#370c22',
                outer: '#120309'
            },
            modelBaseColorFactor: [1.0, 0.85, 0.95, 1.0], // PBR tinting
            botanicalModel: 'assets/models/cherry.glb'
        }
    }
};
```

### Langkah B: Tambahkan Styling Tema di `css/variables.css`
```css
body.sakura-theme {
    --bg-inner: #5e1f3a;
    --bg-mid: #370c22;
    --bg-outer: #120309;
}
```

### Langkah C: Tambahkan Kartu Rasa di `index.html`
Cari elemen `.carousel-cards` dan tambahkan elemen `.card`:
```html
<div class="card" data-flavor="sakura">
    <img src="assets/textures/texture_sakura.png" alt="Sakura Matcha">
    <div class="card-info">
        <span>Sakura Matcha</span>
        <span>$3.79</span>
    </div>
</div>
```

---

## 3. Cara Mengubah Teks & Copywriting

- **Judul Utama & Deskripsi**: Buka `index.html`, edit elemen `.hero-left` (`.main-title` dan `.description`).
- **Badge Penghargaan**: Edit elemen `.award-badge`.
- **Judul Kolom Kanan**: Edit elemen `.side-title`.

---

## 4. Cara Menyesuaikan Parameter Fisika & Gerakan

Buka `js/config.js` dan sesuaikan nilai konstanta:
- **Jarak & Sudut Kemiringan Kamera 3D**: Ubah `APP_CONFIG.camera` (`tiltFactorX`, `tiltFactorY`, `lerpFactor`).
- **Kekuatan Tolakan Kursor (Force Field Repulsion)**:
  - `radius`: Jarak maksimal kursor yang memicu tolakan (default: `400` piksel).
  - `strength`: Besaran dorongan tolakan (default: `-80`).
- **Frekuensi Gelembung**:
  - `spawnIntervalMs`: Kecepatan munculnya gelembung baru (default: `400` ms).

---

## 5. Checklist Sebelum Deploy ke Production

1. [ ] Pastikan seluruh file 3D di `assets/models/` sudah teroptimasi ukurannya (lihat `docs/ASSET_GUIDELINES.md`).
2. [ ] Jalankan local test di browser mobile (atau mode responsive DevTools F12).
3. [ ] Periksa konsol browser (F12 Console) untuk memastikan tidak ada error 404 pada aset model dan tekstur.
4. [ ] Verifikasi transisi antar kartu rasa berjalan lancar 60 FPS tanpa frame drop.
