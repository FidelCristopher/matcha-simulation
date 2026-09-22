# Panduan Standar Aset 3D & Media (Asset Guidelines)

Untuk memastikan website tetap berjalan ringan di 60 FPS pada semua perangkat (desktop & mobile), ikuti panduan standar format aset berikut.

---

## 1. Format Model 3D

- **Format Wajib**: **Binary glTF (`.glb`)**.
- **Alasan**: File GLB mengemas geometri mesh, UV map, material PBR, dan tekstur ke dalam satu file biner yang cepat di-parse oleh browser.
- **Konversi dari OBJ / FBX ke GLB**:
  Jika Anda memiliki file `.obj` + `.mtl` + file tekstur `.png`, konversi dengan perintah:
  ```bash
  npx obj2gltf -i model.obj -o model.glb -b
  ```

---

## 2. Batasan Poligon & Ukuran File

| Tipe Aset | Batasan Polycount (Triangles) | Batas Ukuran File | Target Penggunaan |
|---|---|---|---|
| **Model Produk Utama (`matcha.glb`)** | 20.000 – 60.000 Tris | < 12 MB | Objek fokus tengah layar |
| **Model Sekunder / Daun (`leaves.glb`)** | 1.000 – 5.000 Tris | < 500 KB | Latar belakang berulang |
| **Model Botanical (`cherry.glb`, `blueberry.glb`)** | 3.000 – 10.000 Tris | < 2 MB | Elemen interaktif melayang |

---

## 3. Konfigurasi Material & Tekstur

- **Workflow**: PBR Metallic Roughness standar glTF 2.0.
- **Dimensi Tekstur**:
  - Model Utama: Maksimal **2048 x 2048** (atau 4096 x 4096 jika detail label sangat penting).
  - Model Latar Belakang: Cukup **1024 x 1024** atau **512 x 512**.
- **Format Gambar**: PNG atau WebP (untuk transparansi dan kompresi tinggi).

---

## 4. Bounding Box & Titik Pusat (Pivot Point)

- **Pivot Point (Origin 0, 0, 0)**:
  Wajib berada tepat di **tengah massa (center of geometry)** model 3D, bukan di dasar atau di tepi.
  Jika pivot tidak di tengah, model akan bergoyang tidak seimbang saat animasi putaran 720° berlangsung.
- **Satuan Skala**: Meter standar WebGL (dimensi bounding box ideal ~1 unit tinggi).
