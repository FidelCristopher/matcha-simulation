import subprocess
import time
import os
import sys

# Start python http server in background process
server_proc = subprocess.Popen([sys.executable, "-m", "http.server", "8099"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)

try:
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    out_img = os.path.abspath(r"scratch\menu_live_screenshot.png")
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1200,900",
        f"--screenshot={out_img}",
        "http://localhost:8099/index.html"
    ]
    subprocess.run(cmd, timeout=15)
    print("Screenshot saved to:", out_img)
    if os.path.exists(out_img):
        print("File size:", os.path.getsize(out_img), "bytes")
finally:
    server_proc.terminate()
    server_proc.wait()
