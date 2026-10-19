"""Cut design/icons-sheet.jpg into public/icons/<id>.png (144x144, transparent).

Icons are located by their non-background pixels (connected components), not by
fixed grid cells, then ordered into rows and columns. Fails if not exactly 12.

Usage: python scripts/cut-icons.py        (needs Pillow and numpy)
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design" / "icons-sheet.jpg"
OUT = ROOT / "public" / "icons"
IDS = ["part", "assembly", "variant", "ebom", "mbom", "service-kit",
       "fru", "software", "ecn", "supplier", "field-event", "report"]
COLS = 4
SIZE = 144
MARGIN = 0.06          # equal margin on every side, as a share of the square
FG_MAX = 225           # min(R,G,B) below this is icon; faint shadows sit above it
SCALE = 4              # detection runs on a downscaled, dilated mask


def components(mask):
    """4-connected labelling with an iterative flood fill (no scipy)."""
    h, w = mask.shape
    labels = np.zeros((h, w), np.int32)
    n = 0
    for y, x in zip(*np.nonzero(mask)):
        if labels[y, x]:
            continue
        n += 1
        stack = [(y, x)]
        labels[y, x] = n
        while stack:
            cy, cx = stack.pop()
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = n
                    stack.append((ny, nx))
    return labels, n


def main():
    img = Image.open(SRC).convert("RGB")
    rgb = np.asarray(img).astype(np.uint8)
    h, w, _ = rgb.shape
    fg = rgb.min(axis=2) < FG_MAX            # drops background, JPG noise and soft shadows

    # Detect: downscale, dilate to join the parts of one icon, label.
    small = Image.fromarray((fg * 255).astype(np.uint8)).resize((w // SCALE, h // SCALE), Image.BOX)
    small = small.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(9))
    labels, n = components(np.asarray(small) > 0)
    boxes = []
    for i in range(1, n + 1):
        ys, xs = np.nonzero(labels == i)
        if len(ys) < 400:                    # specks
            continue
        boxes.append((xs.min() * SCALE, ys.min() * SCALE, (xs.max() + 1) * SCALE, (ys.max() + 1) * SCALE))
    if len(boxes) != len(IDS):
        sys.exit(f"FAIL: found {len(boxes)} icons, expected {len(IDS)}")

    # Order: three rows by vertical centre, then left to right inside each row.
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows = [sorted(boxes[r * COLS:(r + 1) * COLS], key=lambda b: b[0]) for r in range(len(IDS) // COLS)]
    for r in range(len(rows) - 1):
        if max((b[1] + b[3]) / 2 for b in rows[r]) > min((b[1] + b[3]) / 2 for b in rows[r + 1]):
            sys.exit("FAIL: rows overlap, cannot order icons")
    ordered = [b for row in rows for b in row]

    OUT.mkdir(parents=True, exist_ok=True)
    pad = 8
    for id_, (x0, y0, x1, y1) in zip(IDS, ordered):
        x0, y0, x1, y1 = max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, w), min(y1 + pad, h)
        crop_fg = fg[y0:y1, x0:x1]
        crop = rgb[y0:y1, x0:x1]
        # Keep only this icon's own pixels (neighbours cannot reach into the crop, but be strict).
        lab, _ = components(crop_fg)
        if lab.max() > 1:
            sizes = np.bincount(lab.ravel())
            sizes[0] = 0
            keep = sizes >= max(60, sizes.max() * 0.002)
            crop_fg = keep[lab] & (lab > 0)

        # Defringe: shrink the solid mask 2px, then grow its colours outward over the edge band
        # so no white/grey blends from the JPG background survive.
        solid = Image.fromarray((crop_fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))
        solid = np.asarray(solid) > 0
        col = crop.copy()
        known = solid.copy()
        for _ in range(4):
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
                sh_known = np.roll(known, (dy, dx), (0, 1))
                sh_col = np.roll(col, (dy, dx), (0, 1))
                new = sh_known & ~known
                col[new] = sh_col[new]
                known |= new
        # Soft alpha: solid core plus a 1px antialiased edge, nothing outside the icon.
        a = Image.fromarray((np.asarray(Image.fromarray((crop_fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)))).astype(np.uint8))
        a = np.asarray(a.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
        a[~known] = 0
        a = np.clip((a - 0.15) / 0.7, 0, 1)

        # Trim to alpha bounds, pad to an equal-margin square.
        ys, xs = np.nonzero(a > 0.02)
        ty0, ty1, tx0, tx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        a, col = a[ty0:ty1, tx0:tx1], col[ty0:ty1, tx0:tx1]
        side = max(a.shape)
        sq = int(round(side / (1 - 2 * MARGIN)))
        canvas_a = np.zeros((sq, sq), np.float32)
        canvas_c = np.zeros((sq, sq, 3), np.float32)
        oy, ox = (sq - a.shape[0]) // 2, (sq - a.shape[1]) // 2
        canvas_a[oy:oy + a.shape[0], ox:ox + a.shape[1]] = a
        canvas_c[oy:oy + a.shape[0], ox:ox + a.shape[1]] = col

        # Resize premultiplied so edges stay clean, then un-premultiply.
        pm = np.dstack([canvas_c * canvas_a[..., None], canvas_a]) 
        chans = [np.asarray(Image.fromarray(pm[..., c], "F").resize((SIZE, SIZE), Image.LANCZOS)) for c in range(4)]
        ra = np.clip(chans[3], 0, 1)
        rc = np.stack(chans[:3], -1) / np.maximum(ra[..., None], 1e-3)
        out = np.dstack([np.clip(rc, 0, 255), ra * 255]).astype(np.uint8)
        out[out[..., 3] < 3] = 0
        Image.fromarray(out, "RGBA").save(OUT / f"{id_}.png", optimize=True)
        print(f"{id_}.png")
    print("OK: 12 icons")


if __name__ == "__main__":
    main()
