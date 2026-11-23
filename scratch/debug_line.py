import json

transcript_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 2607:
            d = json.loads(line)
            print("Line 2607 keys:", d.keys())
            print("tool_calls:", d.get("tool_calls"))
