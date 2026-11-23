import cv2
import numpy as np
import shutil

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"

# 1. User reference
p_ref = f"{brain_dir}/.user_uploaded/media_1795384985575_38f84a11.jpg"
ref = cv2.imread(p_ref)

# 2. Previous broken
p_broken = f"{brain_dir}/.user_uploaded/media_1795384968748_d4689fa6.jpg"
broken = cv2.imread(p_broken)

# 3. New restored cups lid zoom
new_lids = cv2.imread("scratch/verified_lids_zoom.jpg")

# Resize all to width 1100
w_target = 1100
def to_w(img, w):
    h = int(img.shape[0] * w / img.shape[1])
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_LANCZOS4)

r_ref = to_w(ref, w_target)
r_broken = to_w(broken, w_target)
r_new = to_w(new_lids, w_target)

# Add banner labels
def add_banner(img, title, color_bg, color_txt):
    h, w, _ = img.shape
    banner = np.zeros((48, w, 3), dtype=np.uint8)
    banner[:] = color_bg
    cv2.putText(banner, title, (24, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.85, color_txt, 2, cv2.LINE_AA)
    return np.vstack([banner, img])

b1 = add_banner(r_ref, "[ACUAN ASLI] Foto Referensi Kedua (Kubah Bulat + Sip Cap Sempurna)", (16, 55, 19), (255, 253, 245))
b2 = add_banner(r_broken, "[SEBELUM] Gambar Pertama Website (Tutup Terpotong / Miring)", (30, 30, 90), (200, 200, 255))
b3 = add_banner(r_new, "[HASIL PERBAIKAN] Kedua Gelas Menggunakan Tutup Kubah Utuh & Bening Sesuai Referensi", (35, 110, 50), (255, 255, 255))

# Space between sections
spacer = np.full((12, w_target, 3), (230, 225, 215), dtype=np.uint8)

final_comp = np.vstack([b1, spacer, b2, spacer, b3])

cv2.imwrite("scratch/lid_comparison_final.jpg", final_comp)
cv2.imwrite(f"{brain_dir}/lid_comparison_final.jpg", final_comp)

# Also copy verified_cups_fulldome.jpg to artifact dir
shutil.copy("scratch/verified_cups_fulldome.jpg", f"{brain_dir}/verified_cups_fulldome.jpg")

print("Created lid_comparison_final.jpg successfully!")
