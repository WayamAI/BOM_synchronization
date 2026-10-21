import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { entityIcons, getEntityIcon, markUrl } from "@/components/icons/iconMap";
import { EntityGlyph } from "@/components/icons/EntityIcon";

const ROOT = resolve(__dirname, "../..");
const ids = Object.keys(entityIcons);

const pngSize = (file: string) => {
  const b = readFileSync(file);
  return { sig: b.subarray(0, 8).toString("hex"), w: b.readUInt32BE(16), h: b.readUInt32BE(20), type: b[25] };
};

describe("icon registry v2", () => {
  it.each(ids)("%s has a lucide fallback and both PNG sizes (144 and 96)", (id) => {
    expect(getEntityIcon(id).lucide).toBeTruthy();
    const big = pngSize(resolve(ROOT, "public/icons", `${id}.png`));
    const small = pngSize(resolve(ROOT, "public/icons/sm", `${id}.png`));
    expect(big).toMatchObject({ sig: "89504e470d0a1a0a", w: 144, h: 144, type: 6 });
    expect(small).toMatchObject({ sig: "89504e470d0a1a0a", w: 96, h: 96, type: 6 });
  });

  it("every PNG in public/icons belongs to a registered id", () => {
    for (const dir of ["public/icons", "public/icons/sm"]) {
      const files = readdirSync(resolve(ROOT, dir)).filter(f => f.endsWith(".png"));
      expect(files.map(f => f.replace(/\.png$/, "")).sort()).toEqual([...ids].sort());
    }
  });

  it("markUrl picks the 96px cut up to 32px and the 144px cut above", () => {
    expect(markUrl("part", 20)).toMatch(/icons\/sm\/part\.png$/);
    expect(markUrl("part", 32)).toMatch(/icons\/sm\/part\.png$/);
    expect(markUrl("part", 36)).toMatch(/icons\/part\.png$/);
    expect(markUrl("part")).toMatch(/icons\/part\.png$/);
    expect(markUrl("nope", 20)).toBeNull();
  });

  it("EntityGlyph renders an aria-hidden image at its size", () => {
    const { container } = render(<EntityGlyph id="ai" size={20} />);
    const img = container.querySelector("img[data-entity-glyph='ai']");
    expect(img).toHaveAttribute("aria-hidden", "true");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("width", "20");
  });

  it("EntityGlyph falls back to a lucide svg for an unknown id", () => {
    const { container } = render(<EntityGlyph id="nope" size={24} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

// Brand-orange marks are identity only: they must never sit inside a status-toned badge or banner.
const STATUS_TONE = /\b(?:bg|text|border)-(?:error|warning|success)(?:-[a-z]+)?\b|\bbg-(?:error|warning|success)-(?:badge|surface)\b/;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(p) ? [p] : [];
  });

describe("marks are not used as status", () => {
  const files = [...walk(resolve(ROOT, "src/pages")), ...walk(resolve(ROOT, "src/components"))].filter(f => !f.includes("/ui/") && !f.includes("\\ui\\"));

  it("no EntityGlyph or EntityMark is rendered on a line with a status tone class", () => {
    const offenders: string[] = [];
    for (const f of files) {
      readFileSync(f, "utf-8").split("\n").forEach((line, i) => {
        if (/<Entity(?:Glyph|Mark)\b/.test(line) && STATUS_TONE.test(line)) offenders.push(`${f}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("no EntityGlyph or EntityMark is placed inside a Badge", () => {
    const offenders: string[] = [];
    for (const f of files) {
      readFileSync(f, "utf-8").split("\n").forEach((line, i) => {
        if (/<Badge\b[^>]*>.*<Entity(?:Glyph|Mark)\b/.test(line)) offenders.push(`${f}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("the helper script and the sheet list agree on 6 sheets", () => {
    const sheets = JSON.parse(readFileSync(resolve(ROOT, "scripts/icon-sheets.json"), "utf-8")) as { file: string; ids: string[] }[];
    expect(sheets).toHaveLength(6);
    for (const s of sheets) {
      expect(s.ids).toHaveLength(12);
      expect(existsSync(resolve(ROOT, s.file))).toBe(true);
    }
  });
});
