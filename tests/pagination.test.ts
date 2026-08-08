import { describe, expect, it } from "vitest";
import {
  buildPaginationMetadata,
  parsePagination,
} from "../src/lib/pagination";

describe("parsePagination", () => {
      it("keeps skip within the safe integer range", () => {
  const result = parsePagination({
    page: String(Number.MAX_SAFE_INTEGER),
    limit: "100",
  });

  expect(Number.isSafeInteger(result.skip)).toBe(true);
  expect(result.skip).toBeLessThanOrEqual(
    Number.MAX_SAFE_INTEGER,
  );
});

it("handles unsafe numeric strings safely", () => {
  expect(
    parsePagination({
      page: "999999999999999999999999999",
      limit: "20",
    }),
  ).toEqual({
    page: 1,
    limit: 20,
    skip: 0,
  });
});

  it("returns safe defaults", () => {
    expect(parsePagination({})).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it("parses valid page and limit values", () => {
    expect(parsePagination({ page: "3", limit: "25" })).toEqual({
      page: 3,
      limit: 25,
      skip: 50,
    });
  });

  it("clamps invalid and negative values", () => {
    expect(
      parsePagination({ page: "-9", limit: "0" }),
    ).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it("caps oversized limits", () => {
    expect(parsePagination({ page: "2", limit: "500" }, 100)).toEqual({
      page: 2,
      limit: 100,
      skip: 100,
    });
  });

  it("does not partially parse malformed values", () => {
    expect(
      parsePagination({ page: "2abc", limit: "30px" }),
    ).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it("supports cursor as a backward-compatible page alias", () => {
    expect(
      parsePagination({ page: "2", cursor: "4", limit: "10" }),
    ).toEqual({
      page: 4,
      limit: 10,
      skip: 30,
    });
  });

  it("handles Express-style array query values", () => {
    expect(
      parsePagination({ page: ["2", "3"], limit: ["5"] }),
    ).toEqual({
      page: 2,
      limit: 5,
      skip: 5,
    });
  });
});

describe("buildPaginationMetadata", () => {
  it("returns consistent page metadata", () => {
    expect(buildPaginationMetadata(2, 20, 55)).toEqual({
      page: 2,
      limit: 20,
      total: 55,
      totalPages: 3,
      hasNext: true,
      hasPrevious: true,
    });
  });

  it("handles empty results", () => {
    expect(buildPaginationMetadata(1, 20, 0)).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    });
  });
});
