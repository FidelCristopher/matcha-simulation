import json

transcript_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for line_idx, line in enumerate(f):
        if "fulllid" in line:
            d = json.loads(line)
            print(f"Match at line {line_idx}: type={d.get('type')}, step_index={d.get('step_index')}")
            content = str(d)[:300]
            print("  ", content)
