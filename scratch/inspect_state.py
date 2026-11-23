import json
import os
import glob

# Check git status or file modifications
print("=== Modified image files ===")
for p in glob.glob("assets/images/matcha_cup*"):
    print(p, os.path.getsize(p), os.path.getmtime(p))

print("\n=== Checking transcript ===")
transcript_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript.jsonl"
if os.path.exists(transcript_path):
    with open(transcript_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    print("Total lines:", len(lines))
    for i in range(max(0, len(lines)-10), len(lines)):
        d = json.loads(lines[i])
        msg = d.get("message", {})
        role = msg.get("role")
        calls = [c.get("function", {}).get("name") for c in msg.get("tool_calls", [])]
        content = msg.get("content")
        print(f"Line {i}: role={role}, calls={calls}, content={repr(str(content)[:120]) if content else None}")
