import cv2
import numpy as np

from test_full_extraction import test_l, test_r

# Non-zero alpha bounds
ys_l, xs_l = np.where(test_l[:, :, 3] > 0)
ys_r, xs_r = np.where(test_r[:, :, 3] > 0)

print(f"test_l bounds: y=[{ys_l.min()}..{ys_l.max()}] (h={ys_l.max()-ys_l.min()+1}), x=[{xs_l.min()}..{xs_l.max()}] (w={xs_l.max()-xs_l.min()+1})")
print(f"test_r bounds: y=[{ys_r.min()}..{ys_r.max()}] (h={ys_r.max()-ys_r.min()+1}), x=[{xs_r.min()}..{xs_r.max()}] (w={xs_r.max()-xs_r.min()+1})")
