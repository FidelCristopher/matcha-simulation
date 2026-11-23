import json

transcript_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if 2606 <= idx <= 2625:
            d = json.loads(line)
            tool_calls = d.get("tool_calls")
            if tool_calls:
                for tc in tool_calls:
                    print(f"[{idx}] tool_call: {tc.get('function', {}).get('name')}")
                    args = tc.get('function', {}).get('arguments', {})
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            pass
                    if isinstance(args, dict):
                        for k, v in args.items():
                            print(f"     {k}: {str(v)[:200]}")
            cnt = d.get("content")
            if cnt:
                print(f"[{idx}] content: {str(cnt)[:200]}")
