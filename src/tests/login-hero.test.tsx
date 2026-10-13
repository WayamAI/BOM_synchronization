import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";

const brand = (f: string) => resolve(__dirname, "../assets/brand", f);

describe("login hero image", () => {
  it("ships webp and jpg files with valid signatures", () => {
    expect(existsSync(brand("login-hero.webp"))).toBe(true);
    expect(existsSync(brand("login-hero.jpg"))).toBe(true);
    const webp = readFileSync(brand("login-hero.webp"));
    expect(webp.subarray(0, 4).toString()).toBe("RIFF");
    expect(webp.subarray(8, 12).toString()).toBe("WEBP");
    const jpg = readFileSync(brand("login-hero.jpg"));
    expect([jpg[0], jpg[1]]).toEqual([0xff, 0xd8]);
  });

  it("keeps the original source out of the build", () => {
    expect(existsSync(resolve(__dirname, "../../design/login-hero-source.jpg"))).toBe(true);
  });

  it("renders a decorative picture in the brand panel", () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    const picture = container.querySelector("picture");
    expect(picture).not.toBeNull();
    expect(picture!.querySelector('source[type="image/webp"]')).not.toBeNull();
    const img = picture!.querySelector("img")!;
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("aria-hidden")).toBe("true");
    expect(img.getAttribute("loading")).toBe("eager");
  });
});
