import { describe, expect, it } from "vitest";
import { ObjectId } from "mongodb";
import { normalizeParam, safeObjectId } from "../src/lib/utils";

// ---------------------------------------------------------------------
// normalizeParam — the core helper added for issue #285.
// Express types `req.params.<name>` as `string`, but at runtime the value
// can be `string[]` (multi-value params, rewritten params, etc.). This
// helper collapses any of those into a single string (or `undefined`).
// ---------------------------------------------------------------------

describe("normalizeParam", () => {
  it("returns the string as-is for a plain string input", () => {
    expect(normalizeParam("abc123")).toBe("abc123");
  });

  it("returns the first element for a string[] input", () => {
    expect(normalizeParam(["abc123", "def456"])).toBe("abc123");
  });

  it("returns the only element for a single-element string[]", () => {
    expect(normalizeParam(["only-one"])).toBe("only-one");
  });

  it("returns undefined for an empty array", () => {
    expect(normalizeParam([])).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(normalizeParam(undefined)).toBeUndefined();
  });

  it("returns undefined for null input", () => {
    expect(normalizeParam(null)).toBeUndefined();
  });

  it("returns undefined for non-string, non-array input", () => {
    expect(normalizeParam(123)).toBeUndefined();
    expect(normalizeParam({})).toBeUndefined();
    expect(normalizeParam(true)).toBeUndefined();
  });

  it("returns undefined when the first array element is not a string", () => {
    expect(normalizeParam([123, "abc"])).toBeUndefined();
    expect(normalizeParam([null, "abc"])).toBeUndefined();
    expect(normalizeParam([undefined, "abc"])).toBeUndefined();
  });
});

// ---------------------------------------------------------------------
// safeObjectId — must accept `string | string[]` (and any other type)
// without throwing. This is the regression guard for issue #285.
// ---------------------------------------------------------------------

describe("safeObjectId", () => {
  const VALID_HEX = "507f1f77bcf86cd799439011"; // 24-char hex, canonical example

  it("returns an ObjectId for a valid 24-char hex string", () => {
    const oid = safeObjectId(VALID_HEX);
    expect(oid).toBeInstanceOf(ObjectId);
    expect(oid?.toString()).toBe(VALID_HEX);
  });

  it("returns an ObjectId for the first element of a valid string[]", () => {
    // Issue #285 regression: previously this returned null because the
    // old guard rejected anything that wasn't a plain string.
    const oid = safeObjectId([VALID_HEX, "ignored-second-value"]);
    expect(oid).toBeInstanceOf(ObjectId);
    expect(oid?.toString()).toBe(VALID_HEX);
  });

  it("returns null for an empty array", () => {
    expect(safeObjectId([])).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(safeObjectId(undefined)).toBeNull();
  });

  it("returns null for null", () => {
    expect(safeObjectId(null)).toBeNull();
  });

  it("returns null for a non-string, non-array value", () => {
    expect(safeObjectId(123)).toBeNull();
    expect(safeObjectId({})).toBeNull();
    expect(safeObjectId(true)).toBeNull();
  });

  it("returns null for a string that is too short", () => {
    expect(safeObjectId("abc")).toBeNull();
  });

  it("returns null for a string that is too long", () => {
    expect(safeObjectId(VALID_HEX + "extra")).toBeNull();
  });

  it("returns null for a 24-char string with non-hex characters", () => {
    expect(safeObjectId("zzzzzzzzzzzzzzzzzzzzzzzz")).toBeNull();
  });

  it("returns null when the first array element is not a string", () => {
    expect(safeObjectId([123, VALID_HEX])).toBeNull();
    expect(safeObjectId([null, VALID_HEX])).toBeNull();
  });

  it("does not throw for any input type (defensive)", () => {
    // The whole point of safeObjectId is to NEVER throw synchronously.
    // Run a battery of weird inputs and confirm no exception escapes.
    const weirdInputs: unknown[] = [
      "",
      [],
      [""],
      ["valid-but-too-short"],
      [VALID_HEX],
      [VALID_HEX, VALID_HEX],
      0,
      false,
      {},
      NaN,
      Symbol("x"),
    ];
    for (const input of weirdInputs) {
      expect(() => safeObjectId(input)).not.toThrow();
    }
  });
});
