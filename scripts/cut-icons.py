"""Cut every sheet listed in scripts/icon-sheets.json into transparent PNGs:
public/icons/<id>.png (144x144, headers/cards/empty states) and
public/icons/sm/<id>.png (96x96, 20 to 32px glyphs).

Icons are located by their non-background pixels (connected components), not by
fixed grid cells, then ordered into rows and columns. Stray marks far smaller than
the median icon (for example a corner watermark) are ignored and reported. Fails if
a sheet does not yield exactly its declared number of icon-sized components (12 unless the
entry has "count"), or if an id repeats. Ids listed in an entry's "candidates" are cut to
design/candidates/<id>.png (144px only) and are not part of the registry (alternates and retired icons).

Usage: python scripts/cut-icons.py        (needs Pillow and numpy)
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SHEETS = json.loads((ROOT / "scripts" / "icon-sheets.json").read_text(encoding="utf-8"))
OUT = ROOT / "public" / "icons"
COLS = 4
SIZES = {OUT: 144, OUT / "sm": 96}
CANDIDATE_SIZES = {ROOT / "design" / "candidates": 144}
FILL_HOLES = {"system-body"}   # pale glass would key out as a hole; other icons have real holes (rings, gears)
STRAY = 0.10           # a component below this share of the median icon area is a stray mark
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


def fill_holes(mask):
    """Mark every background pixel that cannot reach the crop border as foreground."""
    outside, _ = components(~mask)
    border = set(np.unique(np.concatenate([outside[0], outside[-1], outside[:, 0], outside[:, -1]])))
    border.discard(0)
    reach = np.isin(outside, list(border))
    return mask | (~mask & ~reach)


def cut_sheet(src, IDS, cands):
    print(f"== {src.name}")
    img = Image.open(src).convert("RGB")
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
        boxes.append((xs.min() * SCALE, ys.min() * SCALE, (xs.max() + 1) * SCALE, (ys.max() + 1) * SCALE, len(ys)))
    if boxes:
        median = float(np.median([b[4] for b in boxes]))
        for b in [b for b in boxes if b[4] < STRAY * median]:
            print(f"  ignored stray mark at x={b[0]}..{b[2]}, y={b[1]}..{b[3]} ({b[4]} px vs median {median:.0f})")
        boxes = [b[:4] for b in boxes if b[4] >= STRAY * median]
    if len(boxes) != len(IDS):
        sys.exit(f"FAIL: {src.name}: found {len(boxes)} icons, expected {len(IDS)}")

    # Order: three rows by vertical centre, then left to right inside each row.
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows = [sorted(boxes[r * COLS:(r + 1) * COLS], key=lambda b: b[0]) for r in range(len(IDS) // COLS)]
    for r in range(len(rows) - 1):
        if max((b[1] + b[3]) / 2 for b in rows[r]) > min((b[1] + b[3]) / 2 for b in rows[r + 1]):
            sys.exit("FAIL: rows overlap, cannot order icons")
    ordered = [b for row in rows for b in row]

    for d in {**SIZES, **CANDIDATE_SIZES}:
        d.mkdir(parents=True, exist_ok=True)
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

        if id_ in FILL_HOLES:
            crop_fg = fill_holes(crop_fg)

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
        for folder, size in (CANDIDATE_SIZES if id_ in cands else SIZES).items():
            chans = [np.asarray(Image.fromarray(pm[..., c], "F").resize((size, size), Image.LANCZOS)) for c in range(4)]
            ra = np.clip(chans[3], 0, 1)
            rc = np.stack(chans[:3], -1) / np.maximum(ra[..., None], 1e-3)
            out = np.dstack([np.clip(rc, 0, 255), ra * 255]).astype(np.uint8)
            out[out[..., 3] < 3] = 0
            Image.fromarray(out, "RGBA").save(folder / f"{id_}.png", optimize=True)
        print(f"  {id_}")


def main():
    seen = set()
    for sheet in SHEETS:
        ids = sheet["ids"]
        want = sheet.get("count", 12)
        if len(ids) != want:
            sys.exit(f"FAIL: {sheet['file']} lists {len(ids)} ids, expected {want}")
        dup = seen & set(ids)
        if dup or len(set(ids)) != len(ids):
            sys.exit(f"FAIL: duplicate ids {sorted(dup) or ids}")
        seen |= set(ids)
    for sheet in SHEETS:
        cut_sheet(ROOT / sheet["file"], sheet["ids"], set(sheet.get("candidates", [])))
    print(f"OK: {len(seen)} icons from {len(SHEETS)} sheets")


if __name__ == "__main__":
    main()
