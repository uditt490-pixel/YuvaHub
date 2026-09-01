import { describe, expect, it } from "vitest";
import { generateDedupeHash } from "../src/services/dnl/deduplicator";

describe("generateDedupeHash", () => {
  it("generates the same hash for identical stable inputs", () => {
    const hash1 = generateDedupeHash(
      "https://example.com/job",
      "Software Engineer",
      "Example Inc"
    );

    const hash2 = generateDedupeHash(
      "https://example.com/job",
      "Software Engineer",
      "Example Inc"
    );

    expect(hash1).toBe(hash2);
  });

  it("generates different hashes when stable identifiers change", () => {
    const hash1 = generateDedupeHash(
      "https://example.com/job1",
      "Software Engineer",
      "Example Inc"
    );

    const hash2 = generateDedupeHash(
      "https://example.com/job2",
      "Software Engineer",
      "Example Inc"
    );

    expect(hash1).not.toBe(hash2);
  });

  // --- Object-signature coverage (issue #582: stable, deterministic hashing) ---

  const base = {
    source: "Devpost",
    url: "https://spaceapps.devpost.com/",
    title: "NASA Space Apps Challenge 2026",
    company: "NASA",
  };

  it("is stable across repeated calls over time (no timestamp)", () => {
    const first = generateDedupeHash(base);
    const busyUntil = Date.now() + 5;
    while (Date.now() < busyUntil) {
      /* spin to let wall-clock advance */
    }
    expect(generateDedupeHash(base)).toBe(first);
  });

  it("produces a 64-char hex sha256 digest", () => {
    expect(generateDedupeHash(base)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("normalizes case and whitespace to the same hash", () => {
    const variant = {
      source: "  DEVPOST ",
      url: "https://spaceapps.devpost.com/",
      title: "NASA   Space Apps   Challenge 2026",
      company: "nasa",
    };
    expect(generateDedupeHash(variant)).toBe(generateDedupeHash(base));
  });

  it("changes when the source changes", () => {
    expect(generateDedupeHash({ ...base, source: "Internshala" })).not.toBe(
      generateDedupeHash(base)
    );
  });

  it("differentiates by externalId when present, and stays deterministic", () => {
    expect(generateDedupeHash({ ...base, externalId: "job-123" })).not.toBe(
      generateDedupeHash({ ...base, externalId: "job-456" })
    );
    expect(generateDedupeHash({ ...base, externalId: "job-123" })).toBe(
      generateDedupeHash({ ...base, externalId: "job-123" })
    );
  });

  it("prevents field-boundary collisions via the delimiter", () => {
    const a = { source: "s", url: "ab", title: "c", company: "d" };
    const b = { source: "s", url: "a", title: "bc", company: "d" };
    expect(generateDedupeHash(a)).not.toBe(generateDedupeHash(b));
  });

  it("handles missing/undefined fields without throwing", () => {
    const partial = { source: "Devpost", url: "", title: "Only Title", company: "" };
    expect(generateDedupeHash(partial)).toMatch(/^[a-f0-9]{64}$/);
  });
});