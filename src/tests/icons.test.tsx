import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { entityIcons, getEntityIcon, markUrl, FALLBACK_ICON } from "@/components/icons/iconMap";
import { EntityMark } from "@/components/icons/EntityIcon";
import Variants from "@/pages/Variants";
import EbomManager from "@/pages/EbomManager";
import MbomManager from "@/pages/MbomManager";
import ServiceBom from "@/pages/ServiceBom";
import SoftwareBom from "@/pages/SoftwareBom";
import Changes from "@/pages/Changes";
import PartMaster from "@/pages/PartMaster";
import SupplierIntel from "@/pages/SupplierIntel";
import FieldQuality from "@/pages/FieldQuality";
import Reports from "@/pages/Reports";

const ROOT = resolve(__dirname, "../..");
const ids = Object.keys(entityIcons);

const sheetIds: string[] = (JSON.parse(readFileSync(resolve(ROOT, "scripts/icon-sheets.json"), "utf-8")) as { ids: string[] }[]).flatMap(s => s.ids);

describe("icon mapping", () => {
  it("has exactly the ids listed in scripts/icon-sheets.json", () => {
    expect([...ids].sort()).toEqual([...sheetIds].sort());
    expect(new Set(sheetIds).size).toBe(sheetIds.length);
  });

  it.each(ids)("%s resolves to a lucide icon and a mark url", (id) => {
    const e = getEntityIcon(id);
    expect(e.lucide).toBeTruthy();
    expect(markUrl(id)?.endsWith(`icons/${id}.png`)).toBe(true);
  });

  it("falls back to the generic icon for unknown ids", () => {
    expect(getEntityIcon("nope")).toBe(FALLBACK_ICON);
    expect(markUrl("nope")).toBeNull();
    const { container } = render(<EntityMark id="nope" size={44} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("icon PNG files", () => {
  const readPng = (id: string) => {
    const buf = readFileSync(resolve(ROOT, "public/icons", `${id}.png`));
    return buf;
  };

  it.each(ids)("%s.png exists, is a 144x144 RGBA PNG", (id) => {
    expect(existsSync(resolve(ROOT, "public/icons", `${id}.png`))).toBe(true);
    const b = readPng(id);
    expect(b.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(b.readUInt32BE(16)).toBe(144);
    expect(b.readUInt32BE(20)).toBe(144);
    expect(b[25]).toBe(6); // colour type 6 = RGBA
  });

  it("source sheet is kept out of public/", () => {
    expect(existsSync(resolve(ROOT, "public/icons-sheet.jpg"))).toBe(false);
    expect(existsSync(resolve(ROOT, "design/icons-sheet.jpg"))).toBe(true);
  });
});

// Corner transparency is checked in a second block with a decoder-free approach:
// decode via the browser-like canvas is unavailable in jsdom, so use zlib on the raw IDAT.
import { inflateSync } from "node:zlib";
const alphaAt = (id: string, x: number, y: number) => {
  const b = readFileSync(resolve(ROOT, "public/icons", `${id}.png`));
  const idat: Buffer[] = [];
  for (let o = 8; o < b.length; ) {
    const len = b.readUInt32BE(o);
    if (b.subarray(o + 4, o + 8).toString() === "IDAT") idat.push(b.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const w = 144, bpp = 4, stride = w * bpp;
  const rows: Buffer[] = [];
  for (let r = 0; r < 144; r++) {
    const f = raw[r * (stride + 1)];
    const line = Buffer.from(raw.subarray(r * (stride + 1) + 1, (r + 1) * (stride + 1)));
    const prev = r ? rows[r - 1] : Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let add = 0;
      if (f === 1) add = a;
      else if (f === 2) add = up;
      else if (f === 3) add = (a + up) >> 1;
      else if (f === 4) {
        const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
      }
      line[i] = (line[i] + add) & 255;
    }
    rows.push(line);
  }
  return rows[y][x * bpp + 3];
};

describe("icon PNG transparency", () => {
  it.each(ids)("%s.png has fully transparent corners", (id) => {
    for (const [x, y] of [[0, 0], [143, 0], [0, 143], [143, 143]]) expect(alphaAt(id, x, y)).toBe(0);
  });
});

describe("page headers show their mark", () => {
  beforeEach(() => {
    window.localStorage.setItem("wayam_auth", "1");
  });

  const cases: [string, string, React.ReactElement][] = [
    ["/variants", "variant", <Variants />],
    ["/ebom", "ebom", <EbomManager />],
    ["/mbom", "mbom", <MbomManager />],
    ["/service", "service-kit", <ServiceBom />],
    ["/software", "software", <SoftwareBom />],
    ["/changes", "ecn", <Changes />],
    ["/parts", "part", <PartMaster />],
    ["/suppliers", "supplier", <SupplierIntel />],
    ["/field", "field-event", <FieldQuality />],
    ["/reports", "report", <Reports />],
  ];

  it.each(cases)("%s shows the %s mark in the header", (path, id, el) => {
    const { container } = render(
      <ThemeProvider>
        <TooltipProvider>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<AppShell />}>
                <Route path={path} element={el} />
              </Route>
            </Routes>
          </MemoryRouter>
        </TooltipProvider>
      </ThemeProvider>,
    );
    const header = container.querySelector("header.sticky");
    const img = header?.querySelector(`img[data-entity-mark="${id}"]`);
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("width", "44");
  });

  it("field-event mark appears nowhere except the Field Quality page", () => {
    for (const [path, id, el] of cases.filter(c => c[1] !== "field-event")) {
      const { container, unmount } = render(
        <ThemeProvider><TooltipProvider><MemoryRouter initialEntries={[path]}>
          <Routes><Route element={<AppShell />}><Route path={path} element={el} /></Route></Routes>
        </MemoryRouter></TooltipProvider></ThemeProvider>,
      );
      expect(container.querySelector('img[data-entity-mark="field-event"]'), `${path} (${id})`).toBeNull();
      unmount();
    }
  });
});
