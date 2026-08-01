import { AdapterError, toAdapterError } from "../adapterError";
import type { IOpportunityAdapter, NormalizedOpportunity } from "../types";

export abstract class BaseOpportunityAdapter implements IOpportunityAdapter {
  abstract readonly sourceName: string;

  protected abstract normalizeItem(
    item: Record<string, unknown>,
    index: number,
  ): NormalizedOpportunity;

  normalize(rawPayload: unknown): NormalizedOpportunity[] {
    const items = Array.isArray(rawPayload)
      ? rawPayload
      : rawPayload && typeof rawPayload === "object"
        ? [rawPayload]
        : [];

    if (items.length === 0) {
      throw new AdapterError({
        source: this.sourceName,
        stage: "normalize",
        code: "INVALID_PAYLOAD",
        message: "Adapter payload must contain at least one object.",
      });
    }

    return items.map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new AdapterError({
          source: this.sourceName,
          stage: "normalize",
          code: "INVALID_PAYLOAD",
          message: `Payload item ${index} is not an object.`,
        });
      }

      try {
        const normalized = this.normalizeItem(
          item as Record<string, unknown>,
          index,
        );

        this.assertNormalized(normalized, index);
        return normalized;
      } catch (error) {
        throw toAdapterError(
          this.sourceName,
          "normalize",
          error,
          "NORMALIZATION_FAILED",
        );
      }
    });
  }

  private assertNormalized(
    opportunity: NormalizedOpportunity,
    index: number,
  ): void {
    if (!opportunity.title.trim()) {
      throw new Error(`Payload item ${index} has no title.`);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(opportunity.url);
    } catch {
      throw new Error(`Payload item ${index} has an invalid URL.`);
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error(
        `Payload item ${index} uses an unsupported URL protocol.`,
      );
    }
  }

  protected stringValue(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  protected stringArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) return fallback;

    const values = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    return values.length > 0 ? values : fallback;
  }
}
