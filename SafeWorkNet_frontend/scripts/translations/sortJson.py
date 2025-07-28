#!/usr/bin/env python3

import sys
import json

def save_sort_json():
    files = sys.argv[1:]
    for file_path in files:
        with open(file_path, "r+", encoding="utf-8") as file:
            data = json.load(file)
            file.seek(0)
            file.write(json.dumps(data, sort_keys=True, indent=2, separators=(',', ': '), ensure_ascii=False))
            file.truncate()
save_sort_json()