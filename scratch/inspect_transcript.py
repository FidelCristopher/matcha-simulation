import json

with open(r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript.jsonl", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(len(lines)-25, len(lines)):
    d = json.loads(lines[i])
    print(f"[{i}] keys: {list(d.keys())}")
    for k in ["type", "role", "tool_name", "toolSummary"]:
        if k in d:
            print(f"   {k}: {d[k]}")
    if "content" in d:
        print(f"   content: {str(d['content'])[:120]}")
    if "tool_calls" in d:
        print(f"   tool_calls: {[tc.get('function', {}).get('name') for tc in d['tool_calls']]}")
