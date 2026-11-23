with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Line 542:", repr(lines[541])) # 0-indexed 541 is line 542
print("Line 543:", repr(lines[542]))
print("Line 805:", repr(lines[804]))
print("Line 806:", repr(lines[805]))
print("Line 807:", repr(lines[806]))
