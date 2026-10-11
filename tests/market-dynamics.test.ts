import { describe, expect, it } from "vitest";
import { hash32, marketFactor, studentT4, rng, timeKernel, transmissionDraw } from "../lib/assets/market-dynamics";

const NOW = Date.parse("2026-10-11T12:00:00Z");

describe("market texture", () => {
  it("is deterministic: same key and time, same market", () => {
    expect(marketFactor("book-1", NOW, 0.2)).toBe(marketFactor("book-1", NOW, 0.2));
    expect(marketFactor("book-1", NOW, 0.2)).not.toBe(marketFactor("book-2", NOW, 0.2));
  });
  it("market price wanders around value with realistic scale and no news", () => {
    const f = Array.from({ length: 400 }, (_, k) => Math.log(marketFactor(`k${k}`, NOW, 0.2)));
    const m = f.reduce((a, b) => a + b, 0) / f.length;
    const sd = Math.sqrt(f.reduce((a, b) => a + (b - m) ** 2, 0) / (f.length - 1));
    expect(Math.abs(m)).toBeLessThan(0.01);
    expect(sd).toBeGreaterThan(0.015); // not flat
    expect(sd).toBeLessThan(0.06); // not wild
  });
  it("moves day to day, but continuously", () => {
    const a = marketFactor("book-9", NOW, 0.2);
    const b = marketFactor("book-9", NOW + 86_400_000, 0.2);
    expect(Math.abs(Math.log(b / a))).toBeLessThan(0.15);
    expect(a).not.toBe(b);
  });
  it("shocks have fat tails", () => {
    const r = rng(hash32("tails"));
    const xs = Array.from({ length: 20000 }, () => studentT4(r));
    const sd = Math.sqrt(xs.reduce((a, b) => a + b * b, 0) / xs.length);
    const tail = xs.filter((x) => Math.abs(x) > 3 * sd).length / xs.length;
    expect(sd).toBeGreaterThan(0.8);
    expect(sd).toBeLessThan(1.3);
    expect(tail).toBeGreaterThan(0.004); // a normal would give ~0.0027
  });
  it("transmission varies by node, can flip, and can be ignored", () => {
    const draws = Array.from({ length: 2000 }, (_, k) => transmissionDraw(`e${k}`, "gotham", "SCARE"));
    expect(draws.filter((d) => d < 0).length / draws.length).toBeGreaterThan(0.1); // fizzles
    expect(draws.filter((d) => Math.abs(d) < 0.1).length / draws.length).toBeGreaterThan(0.15); // ignored
    expect(Math.max(...draws)).toBeLessThan(1.81);
  });
  it("familiar events are ignored more often and land softer", () => {
    const fresh = Array.from({ length: 2000 }, (_, k) => transmissionDraw(`e${k}`, "gotham", "DAMAGE", 0));
    const jaded = Array.from({ length: 2000 }, (_, k) => transmissionDraw(`e${k}`, "gotham", "DAMAGE", 6));
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    expect(avg(jaded)).toBeLessThan(avg(fresh));
  });
  it("time shapes: scares overshoot then reverse, damage builds, hype runs up then fades", () => {
    expect(timeKernel("SCARE", 0)).toBeCloseTo(1, 6);
    expect(timeKernel("SCARE", 4)).toBeLessThan(0.25);
    expect(timeKernel("SCARE", 4)).toBeGreaterThan(-0.2);
    expect(timeKernel("DAMAGE", 3)).toBeGreaterThan(timeKernel("DAMAGE", 0));
    expect(timeKernel("HYPE", 2)).toBeGreaterThan(timeKernel("HYPE", 0));
    expect(timeKernel("HYPE", 20)).toBeLessThan(0.05);
  });
});
