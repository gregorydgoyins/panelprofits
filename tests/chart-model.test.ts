import { describe, it, expect } from "vitest";
import { monthlyCandles, rsi14, salesPerDay, dailyLastPoints } from "@/lib/comics/chart-model";

const t = (d: string) => Date.parse(`${d}T12:00:00Z`);

describe("chart-model", () => {
  it("builds candles only from observed prices", () => {
    const c = monthlyCandles([[t("2026-01-05"), 100], [t("2026-01-20"), 140], [t("2026-01-25"), 90], [t("2026-03-02"), 120]]);
    expect(c.length).toBe(2);
    expect(c[0].slice(1)).toEqual([100, 140, 90, 90]);
    expect(c[1].slice(1)).toEqual([120, 120, 120, 120]);
  });
  it("RSI is null until 15 prices exist", () => {
    expect(rsi14([1, 2, 3]).every((v) => v === null)).toBe(true);
    const r = rsi14(Array.from({ length: 20 }, (_, i) => 100 + i));
    expect(r[13]).toBeNull();
    expect(r[14]).toBe(100);
  });
  it("counts sales per day for one grade", () => {
    const p = salesPerDay([{ grade: "9.8", date: "2026-01-01" }, { grade: "9.8", date: "2026-01-01T10:00" }, { grade: "9.6", date: "2026-01-01" }], "9.8");
    expect(p).toEqual([[Date.parse("2026-01-01T00:00:00Z"), 2]]);
  });
  it("keeps last observation per day", () => {
    expect(dailyLastPoints([[t("2026-01-01"), 5], [t("2026-01-01") + 1000, 6]]).length).toBe(1);
  });
});
