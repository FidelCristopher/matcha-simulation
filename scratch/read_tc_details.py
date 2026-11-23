import json

transcript_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if 2605 <= idx <= 2635:
            d = json.loads(line)
            # check tool_calls in message or directly in d
            tc_list = d.get("tool_calls") or d.get("message", {}).get("tool_calls", [])
            for tc in tc_list:
                name = tc.get("function", {}).get("name")
                args = tc.get("function", {}).get("arguments")
                print(f"[{idx}] {name}")
                if name == "write_file":
                    try:
                        parsed = json.loads(args) if isinstance(args, str) else args
                        print("   Path:", parsed.get("Path"))
                        print("   Content excerpt:\n", str(parsed.get("Content"))[:400])
                    except Exception as e:
                        print("   args err:", e)
                elif name == "run_command":
                    try:
                        parsed = json.loads(args) if isinstance(args, str) else args
                        print("   Cmd:", parsed.get("CommandLine"))
                    except Exception as e:
                        print("   args err:", e)
