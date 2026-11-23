import glob
import os
from PIL import Image

for f in sorted(glob.glob("assets/images/menu/*.jpg")):
    if "_card" not in f:
        im = Image.open(f)
        print(os.path.basename(f), im.size)
