#!/usr/bin/env python3
"""
translate_html_site.py

Recursively translates HTML files in a local directory using Google Translate via deep-translator.
Does not require any Google Translation API keys.

Requirements:
    pip install deep-translator beautifulsoup4

Usage:
    python3 translate_html_site.py --src <source_dir> --dest <dest_dir> --target en
"""

import os
import sys
import argparse

# Check requirements and import safely
try:
    from bs4 import BeautifulSoup, Comment
    import bs4
except ImportError:
    print("Error: 'beautifulsoup4' is required. Install it using: pip install beautifulsoup4", file=sys.stderr)
    sys.exit(1)

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Error: 'deep-translator' is required. Install it using: pip install deep-translator", file=sys.stderr)
    sys.exit(1)


def translate_html_file(file_path, dest_path, source_lang, target_lang):
    """
    Parses an HTML file, translates its text content, and writes the translated version.
    """
    print(f"Processing: {file_path}")
    
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            html_content = f.read()
            
        soup = BeautifulSoup(html_content, "html.parser")
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        
        # Identify text elements to translate, skipping non-visible/technical tags
        ignored_tags = ['script', 'style', 'head', 'meta', 'link', 'code', 'pre']
        text_elements = [
            element for element in soup.find_all(string=True)
            if element.parent.name not in ignored_tags and not isinstance(element, Comment)
        ]
        
        # Track translation success
        success_count = 0
        fail_count = 0
        
        for element in text_elements:
            text = element.strip()
            # Only translate substantial text blocks to avoid unnecessary API requests
            if text and len(text) > 1 and not text.isnumeric():
                try:
                    translated = translator.translate(text)
                    if translated:
                        # Preserve original leading and trailing spacing/newlines
                        leading_spaces = len(element) - len(element.lstrip())
                        trailing_spaces = len(element) - len(element.rstrip())
                        new_text = " " * leading_spaces + translated + " " * trailing_spaces
                        element.replace_with(new_text)
                        success_count += 1
                except Exception as e:
                    fail_count += 1
                    # Quietly log warnings for minor translation failures to keep output clean
                    if fail_count <= 5:
                        print(f"  [Warning] Failed to translate: '{text[:25]}...' ({e})")
                    elif fail_count == 6:
                        print("  [Warning] Additional failures suppressed...")
                        
        # Translate the title tag specifically if available
        if soup.title and soup.title.string:
            title_text = soup.title.string.strip()
            if title_text and not title_text.isnumeric():
                try:
                    translated_title = translator.translate(title_text)
                    if translated_title:
                        soup.title.string.replace_with(translated_title)
                except Exception:
                    pass
                    
        # Save translated content to the destination folder
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(str(soup))
            
        print(f"  [Success] Saved to {dest_path} (Translated nodes: {success_count})")
        
    except Exception as e:
        print(f"  [Error] Failed to process file {file_path}: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Recursively translate offline HTML websites using Google Translate."
    )
    parser.add_argument(
        "--src", "-s",
        required=True,
        help="Path to the source directory containing downloaded HTML files."
    )
    parser.add_argument(
        "--dest", "-d",
        required=True,
        help="Path to the destination directory where translated files will be saved."
    )
    parser.add_argument(
        "--target", "-t",
        default="en",
        help="Target language code (default: 'en')."
    )
    parser.add_argument(
        "--source",
        default="auto",
        help="Source language code (default: 'auto')."
    )
    
    args = parser.parse_args()
    
    # Resolve absolute paths
    src_dir = os.path.abspath(args.src)
    dest_dir = os.path.abspath(args.dest)
    
    if not os.path.isdir(src_dir):
        print(f"Error: Source directory '{src_dir}' does not exist.", file=sys.stderr)
        sys.exit(1)
        
    if src_dir == dest_dir:
        print("Warning: Source and destination directories are identical.", file=sys.stderr)
        confirm = input("Are you sure you want to translate in-place and overwrite your source? (y/N): ")
        if confirm.lower() != 'y':
            print("Operation aborted.")
            sys.exit(0)
            
    print("=" * 60)
    print(f"Starting Offline Site Translation")
    print(f"Source Directory : {src_dir}")
    print(f"Dest Directory   : {dest_dir}")
    print(f"Target Language  : {args.target}")
    print(f"Source Language  : {args.source}")
    print("=" * 60)
    
    html_files_found = []
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".html", ".htm")):
                html_files_found.append(os.path.join(root, file))
                
    if not html_files_found:
        print("No HTML files found in the source directory.")
        sys.exit(0)
        
    print(f"Found {len(html_files_found)} HTML files to translate.")
    
    for file_path in html_files_found:
        # Calculate relative path to maintain directory structure
        rel_path = os.path.relpath(file_path, src_dir)
        dest_path = os.path.join(dest_dir, rel_path)
        
        translate_html_file(file_path, dest_path, args.source, args.target)
        
    print("\nSite translation task completed successfully!")


if __name__ == "__main__":
    main()
