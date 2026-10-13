"""Prepare the Login page hero image (Pillow only).

Source: design/login-hero-source.jpg (AI-generated with Google Flow). The
generator's sparkle mark sits in the bottom-right corner, so it is removed by
cropping (no painting/blurring). The mark's top edge is ~138px above the bottom
of the 2752x1536 source; we trim 160px from the bottom. The car stays fully in
frame.

Usage: python scripts/prepare-login-hero.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design" / "login-hero-source.jpg"
OUT = ROOT / "src" / "assets" / "brand"
MAX_W = 2400
TRIM_BOTTOM = 160  # px, source resolution

img = Image.open(SRC).convert("RGB")
w, h = img.size
box = (0, 0, w, h - TRIM_BOTTOM)
img = img.crop(box)
if img.width > MAX_W:
    img = img.resize((MAX_W, round(img.height * MAX_W / img.width)), Image.LANCZOS)

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / "login-hero.webp", "WEBP", quality=80, method=6)
img.save(OUT / "login-hero.jpg", "JPEG", quality=82, optimize=True, progressive=True)
print("crop box:", box, "->", img.size)
for ext in ("webp", "jpg"):
    p = OUT / f"login-hero.{ext}"
    print(p.name, p.stat().st_size // 1024, "KB")
