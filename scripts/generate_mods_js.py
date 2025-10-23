#!/usr/bin/env python3
"""Utility to generate assets/mods.js from structured data.

Edit the JSON source (defaults to data/mods.json) and run this script to
synchronize the runtime JavaScript file.  This helps avoid manual edits to the
embedded object inside mods.js.

Usage:
    python scripts/generate_mods_js.py            # writes assets/mods.js
    python scripts/generate_mods_js.py --check    # exit non-zero if output differs
    python scripts/generate_mods_js.py --input other.json --output other.js
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DEFAULT_INPUT = Path("data/mods.json")
DEFAULT_OUTPUT = Path("assets/mods.js")


def build_js(data: object) -> str:
    serialized = json.dumps(data, ensure_ascii=False, indent=2)
    return f"const modData = {serialized};\n\nwindow.modData = modData;\n"


def read_json(path: Path) -> object:
    try:
        with path.open(encoding="utf-8") as fp:
            return json.load(fp)
    except FileNotFoundError as exc:
        raise SystemExit(f"Input file not found: {path}") from exc


def write_if_changed(path: Path, content: str) -> bool:
    if path.exists():
        existing = path.read_text(encoding="utf-8")
        if existing == content:
            return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="JSON source file")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="JavaScript file to write")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Only check whether the generated output matches the current file",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    data = read_json(args.input)
    output = build_js(data)

    if args.check:
        if args.output.exists() and args.output.read_text(encoding="utf-8") == output:
            return 0
        print("mods.js is out of date. Run without --check to update.", file=sys.stderr)
        return 1

    changed = write_if_changed(args.output, output)
    if changed:
        print(f"Wrote {args.output} from {args.input}")
    else:
        print(f"No changes required for {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
