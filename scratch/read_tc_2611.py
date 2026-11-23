import json

transcript_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\db1a435d-2d57-455b-bc0c-b035800d00d4\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if 2611 <= idx <= 2635:
            d = json.loads(line)
            tc_list = d.get("tool_calls") or []
            for tc in tc_list:
                name = tc.get("name")
                args = tc.get("args", {})
                print(f"[{idx}] {name}")
                if name == "write_file":
                    print("   Path:", args.get("Path"))
                    print("   Content excerpt:\n", str(args.get("Content"))[:300])
                elif name == "run_command":
                    print("   Cmd:", args.get("CommandLine"))
                elif name == "edit_file":
                    print("   Target:", str(args.get("Target"))[:60])
                    print("   Replacement:", str(args.get("Replacement"))[:60])
