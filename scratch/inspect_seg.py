import cv2
import numpy as np

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
seg_l = cv2.imread(f"{brain_dir}/segmented_left.png", cv2.IMREAD_UNCHANGED)
seg_r = cv2.imread(f"{brain_dir}/segmented_right.png", cv2.IMREAD_UNCHANGED)

print("seg_l shape:", seg_l.shape)
print("seg_r shape:", seg_r.shape)

for y in range(210, 280, 5):
    xsl = np.where(seg_l[y, :, 3] > 50)[0]
    xsr = np.where(seg_r[y, :, 3] > 50)[0]
    wl = (xsl.max() - xsl.min() + 1) if len(xsl) > 0 else 0
    wr = (xsr.max() - xsr.min() + 1) if len(xsr) > 0 else 0
    print(f"y={y}: seg_l width={wl} xs=[{xsl.min() if len(xsl) else 0}..{xsl.max() if len(xsl) else 0}], seg_r width={wr} xs=[{xsr.min() if len(xsr) else 0}..{xsr.max() if len(xsr) else 0}]")
