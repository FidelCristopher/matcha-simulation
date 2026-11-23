import glob
import os
from PIL import Image

for f in sorted(glob.glob("assets/images/*.*")):
    im = Image.open(f)
    print(f, im.size, im.mode)
