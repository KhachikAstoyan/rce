import { describe, expect, it } from "vitest";
import { capitalize, formatDate, formatMillisecondsString } from "./utils";

describe("capitalize", () => {
  it("should capitalize the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("Hello")).toBe("Hello");
  });
});

describe("formatDate", () => {
  it("should format the date", () => {
    expect(formatDate("2021-10-10T10:00:00")).toBe("Oct 10, 2021 10:00");
    expect(formatDate("2021-10-10T22:00:00")).toBe("Oct 10, 2021 22:00");
  });
});

describe("formatMillisecondsString", () => {
  it("should format the milliseconds string", () => {
    expect(formatMillisecondsString("1000")).toBe("1000.00 ms");
    expect(formatMillisecondsString("1000.123")).toBe("1000.12 ms");
  });
});
