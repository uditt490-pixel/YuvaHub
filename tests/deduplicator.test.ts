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
});