import glob
import os

brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4"
for pattern in ["*.jpg", "*.png"]:
    for f in sorted(glob.glob(os.path.join(brain_dir, pattern))):
        name = os.path.basename(f)
        if any(k in name for k in ["cup", "orig", "matcha", "lid", "single"]):
            print(name, os.path.getsize(f))
