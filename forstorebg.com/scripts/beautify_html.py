#!/usr/bin/env python3
"""
Beautify and format HTML tags inside Markdown source files under `src/`.
Uses BeautifulSoup with html5lib to clean/repair HTML syntax, then runs Prettier to format.

Usage:
  python3 scripts/beautify_html.py         # Dry-run, checks formatting status
  python3 scripts/beautify_html.py --apply # Overwrites files with formatted HTML
"""

import argparse
import os
import subprocess
import sys

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: BeautifulSoup 4 is not installed. Run 'pip3 install beautifulsoup4 html5lib'")
    sys.exit(1)

try:
    import html5lib
except ImportError:
    print("Error: html5lib is not installed. Run 'pip3 install html5lib'")
    sys.exit(1)


def is_prettier_available():
    try:
        process = subprocess.Popen(["prettier", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process.communicate()
        return process.returncode == 0
    except FileNotFoundError:
        return False


def beautify_file(file_path: str, apply: bool = False):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    idx = content.find("<main")
    if idx == -1:
        return False, "skipped (no <main tag found)"

    header = content[:idx]
    body = content[idx:]

    # Parse with BeautifulSoup html5lib to auto-correct any unbalanced markup tags
    soup = BeautifulSoup(body, "html5lib")
    clean_html = "".join(str(c) for c in soup.body.contents)

    # Run prettier html parser
    process = subprocess.Popen(
        ["prettier", "--parser", "html"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate(input=clean_html)

    if process.returncode != 0:
        return False, f"Prettier formatting error: {stderr.strip()}"

    new_content = header.rstrip() + "\n\n" + stdout

    if new_content == content:
        return False, "already formatted"

    if apply:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True, "successfully beautified and updated"
    
    return True, "needs formatting (dry-run)"


def main():
    if not is_prettier_available():
        print("Error: Prettier CLI is not available in PATH. Please install Prettier globally: 'npm install -g prettier'")
        sys.exit(1)

    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Write beautified changes back to the files")
    ap.add_argument("--dir", default="src", help="Directory containing markdown files (default: src)")
    args = ap.parse_args()

    src_dir = args.dir
    if not os.path.exists(src_dir):
        # Try to locate src relative to scripts dir if run from there
        relative_src = os.path.join(os.path.dirname(__file__), "..", "src")
        if os.path.exists(relative_src):
            src_dir = relative_src
        else:
            print(f"Error: Directory '{src_dir}' does not exist.")
            sys.exit(1)

    print(f"Scanning markdown files in '{os.path.abspath(src_dir)}'...")
    
    modified_files = []
    skipped_count = 0
    formatted_count = 0
    error_files = []

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                changed, msg = beautify_file(file_path, apply=args.apply)
                rel_path = os.path.relpath(file_path, src_dir)
                
                if changed:
                    print(f"[CHANGE] {rel_path} - {msg}")
                    modified_files.append(rel_path)
                elif "error" in msg.lower():
                    print(f"[ERROR] {rel_path} - {msg}")
                    error_files.append((rel_path, msg))
                elif "skipped" in msg:
                    skipped_count += 1
                else:
                    formatted_count += 1

    print("\n--- Summary ---")
    print(f"Already formatted: {formatted_count}")
    print(f"Skipped (no <main): {skipped_count}")
    if error_files:
        print(f"Errors encountered: {len(error_files)}")
    
    if args.apply:
        print(f"Updated files: {len(modified_files)}")
    else:
        print(f"Files needing formatting: {len(modified_files)}")
        if modified_files:
            print("\nRun with '--apply' to format these files.")


if __name__ == "__main__":
    main()
