#!/usr/bin/env python3
"""
Builds a single self-contained HTML file suitable for publishing as a
Claude Artifact (or anywhere else a one-file build is useful).

Why this exists: Claude Artifacts reject very large <script> tags containing
dense, unique code (a Vite bundle with base64-inlined images trips this) even
though the same bytes are fine inside <style> or a non-executable
<script type="application/json"> tag. So this script:
  1. Builds the app with `vite.artifact.config.ts`, which keeps images as
     separate hashed files instead of inlining them into the JS (fonts stay
     inlined via CSS url() - that path has no size issue).
  2. Base64-encodes every image/svg the bundle references and stores them in
     a `<script type="application/json">` data island instead of inline JS.
  3. Rewrites the bundle's `` `/assets/xxx.ext` `` string literals to
     `window.__A[`/assets/xxx.ext`]`, a runtime lookup into that data island.
  4. Stitches title + CSS + data island + bootstrap + app JS into one file.

Usage:
    cd app
    npx vite build --config vite.artifact.config.ts
    python3 scripts/build-artifact.py

Output: dist-artifact/tripup-standalone.html — publish this file's contents
with the Artifact tool (or open it directly, it has zero external deps
besides the page itself).
"""

import base64
import glob
import json
import mimetypes
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(ROOT, "dist-artifact", "assets")
OUT_PATH = os.path.join(ROOT, "dist-artifact", "tripup-standalone.html")


def find_built_file(suffix):
    matches = glob.glob(os.path.join(ASSETS_DIR, f"index-*{suffix}")) or glob.glob(
        os.path.join(ASSETS_DIR, f"style-*{suffix}")
    )
    if not matches:
        raise SystemExit(
            f"No built *{suffix} found in {ASSETS_DIR} — run "
            "`npx vite build --config vite.artifact.config.ts` first."
        )
    return matches[0]


def main():
    js_path = find_built_file(".js")
    css_path = find_built_file(".css")

    js = open(js_path, encoding="utf-8").read()
    css = open(css_path, encoding="utf-8").read()

    refs = sorted(set(re.findall(r"`(/assets/[^`]+\.(?:png|jpg|jpeg|svg))`", js)))

    asset_map = {}
    for ref in refs:
        fname = ref.split("/")[-1]
        fpath = os.path.join(ASSETS_DIR, fname)
        mime = mimetypes.guess_type(fpath)[0]
        if fname.endswith(".svg"):
            raw = open(fpath, encoding="utf-8").read().encode("utf-8")
        else:
            raw = open(fpath, "rb").read()
        asset_map[ref] = f"data:{mime};base64,{base64.b64encode(raw).decode()}"
        js = js.replace(f"`{ref}`", f"window.__A[`{ref}`]")

    payload = json.dumps(asset_map)

    html = f"""<meta charset="utf-8">
<title>TripUp</title>
<style>
{css}
</style>
<script type="application/json" id="tripup-assets">{payload}</script>
<div id="root"></div>
<script>
window.__A = JSON.parse(document.getElementById('tripup-assets').textContent);
{js}
</script>
"""

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"wrote {OUT_PATH} ({os.path.getsize(OUT_PATH) / 1024 / 1024:.2f} MB)")
    print(f"  {len(refs)} images/icons inlined into a JSON data island")
    print(f"  JS bundle: {len(js) / 1024:.0f} KB (kept small on purpose, see module docstring)")


if __name__ == "__main__":
    main()
