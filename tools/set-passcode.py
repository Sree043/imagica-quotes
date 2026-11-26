#!/usr/bin/env python3
"""Set (or change) the Imagica Quotes team passcode.

Run from the website folder:   python3 tools/set-passcode.py
You type the passcode privately (nothing is shown). Only a salted PBKDF2-SHA256
hash is written into js/config.js; the passcode itself is never saved anywhere.
Afterwards, upload js/config.js to GitHub (or ask Claude to publish it).
"""
import getpass
import hashlib
import json
import os
import re
import secrets
import sys

ITERATIONS = 210_000
CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "js", "config.js")


def main() -> int:
    print("Set the Imagica Quotes team passcode")
    print("(at least 4 characters; longer is safer; typing is hidden)\n")
    while True:
        first = getpass.getpass("New passcode: ").strip()
        if len(first) < 4:
            print("Please use at least 4 characters.\n")
            continue
        second = getpass.getpass("Type it again: ").strip()
        if first != second:
            print("Those didn't match — let's try again.\n")
            continue
        break

    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", first.encode("utf-8"), bytes.fromhex(salt), ITERATIONS).hex()
    line = "window.IMAGICA_AUTH = " + json.dumps({"salt": salt, "iterations": ITERATIONS, "hash": digest}) + ";"

    with open(CONFIG, encoding="utf-8") as f:
        text = f.read()
    new_text, count = re.subn(r"^window\.IMAGICA_AUTH = .*;$", line, text, flags=re.M)
    if count != 1:
        print("Couldn't find the passcode line in js/config.js — nothing was changed.")
        return 1
    with open(CONFIG, "w", encoding="utf-8") as f:
        f.write(new_text)

    print("\n✓ Team passcode saved (as a secure hash) in js/config.js.")
    print("  Everyone will need the new passcode to open the quote builder.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
