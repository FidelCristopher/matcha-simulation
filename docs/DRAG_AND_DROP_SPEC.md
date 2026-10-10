# Spesifikasi Arsitektur Aset & Interaksi Drag-and-Drop Simulasi Matcha

Dokumen ini mendokumentasikan spesifikasi teknis hierarki model 3D, shader PBR, dan alur interaksi drag-and-drop untuk implementasi fitur simulasi meracik matcha di **MatchaTcih**.

---

## 1. Struktur Hierarki Dua Node Terpisah (Parent-Child)

Untuk memungkinkan interaksi menyendok, mengangkat, dan menuangkan bubuk teh secara dinamis, model sendok bambu (*Chashaku*) dirancang dengan dua node terpisah:

- **Parent Node (`Bamboo_Chashaku`)**:
  - Model sendok bambu utuh tradisional Jepang.
  - Memiliki anatomi lengkap:
    - Kelengkungan kepala sendok
    - Buku bambu (*fushi*)
    - Pangkal pegangan (*kitte*)
  - Berfungsi sebagai objek utama yang di-drag atau dikendalikan kursor/touch.

- **Child Node (`Matcha_Scoop_Heap`)**:
  - Gundukan bubuk matcha organik lembut yang menempel pas di cekungan kepala sendok.
  - Koordinat bounding vertikal: `Y ∈ [0.063, 0.088 m]`.
  - Dimensi: Tinggi puncak ≈ `5.0 mm`, volume takaran saji ≈ `1.8 g`.
  - Berfungsi sebagai objek yang dikendalikan skala/visibilitasnya secara independen.

### Contoh Kode Interaksi (Three.js / WebGL):
```javascript
// Mengambil referensi child node dari model Chashaku
const chashaku = scene.getObjectByName("Bamboo_Chashaku");
const matchaHeap = chashaku.getObjectByName("Matcha_Scoop_Heap");

// 1. Saat sendok masih kosong (belum mencelup ke kaleng teh / natsume):
matchaHeap.scale.set(0, 0, 0); // atau matchaHeap.visible = false;

// 2. Saat mencelup dan menyendok matcha keluar dari natsume:
gsap.to(matchaHeap.scale, { 
    x: 1, 
    y: 1, 
    z: 1, 
    duration: 0.4, 
    ease: "power2.out" 
});

// 3. Saat diketuk di bibir mangkuk Chawan / gelas tumbler (menuang):
gsap.to(matchaHeap.scale, { 
    x: 0, 
    y: 0, 
    z: 0, 
    duration: 0.3, 
    ease: "power1.in",
    onComplete: () => {
        // Trigger penambahan bubuk ke dalam mangkuk & kenaikan volume cairan
        triggerPowderPourPhysics();
    }
});
```

---

## 2. Shader & Finishing Tekstur PBR 2K

Kedua material menggunakan standar PBR Metallic-Roughness (2048 x 2048) untuk rendering fotorealistik di Three.js:

### A. Sendok Bambu (`Bamboo_Chashaku`)
- **Tampilan:** Serat bambu memanjang alami dengan kilau satin khas alat teh (*sadō*).
- **Roughness:** ≈ `0.36` (satin sheen halus).
- **Metallic:** `0.0` (non-metal dielektrik).
- **Peta Tekstur:** Albedo serat bambu alami, normal map guratan serat mikro bambu.

### B. Bubuk Matcha Ceremonial (`Matcha_Scoop_Heap`)
- **Tampilan:** Mengacu pada referensi gundukan bubuk teh ceremonial grade:
  - Tekstur partikel bubuk beludru matte: `Roughness = 0.92`, `Specular = 0.08`.
  - Kontur gundukan organik berbukit dengan puncak kerucut khas tepung teh yang disendok padat.
  - Warna hijau giok ceremonial (*vibrant jade green*) dengan bayangan hijau lumut di sela-sela butiran mikro.

---

## 3. Alur Interaksi Drag-and-Drop (Workflow State Machine)

```text
[IDLE: Sendok di Tatakan]
       │
       ▼ (User Drag)
[SCOOPING: Menuju Natsume/Kaleng] ──► Animasi Celup ──► matchaHeap.scale = 1
       │
       ▼ (Drag ke atas Gelas / Chawan)
[HOVER OVER VESSEL] ───────────────► Tampilkan Indikator Glow Drop Zone
       │
       ▼ (Tap / Drop)
[POURING / TAPPING] ───────────────► Rotasi Tilt ──► matchaHeap.scale = 0
                                     Partikel debu jatuh & Liquid layer naik
```
