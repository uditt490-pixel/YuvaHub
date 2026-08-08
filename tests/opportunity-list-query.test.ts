import { describe, expect, it } from "vitest";
import {
  OpportunityQueryError,
  buildOpportunityPagination,
  parseOpportunityListQuery,
} from "../src/lib/opportunityListQuery";

describe("parseOpportunityListQuery", () => {
  it("provides documented defaults", () => {
    expect(parseOpportunityListQuery({})).toEqual({
      page: 1,
      limit: 20,
      skills: "",
      country: "",
      field: "",
      type: "",
      source: "",
      location: "",
      search: "",
      status: "",
    });
  });

  it("parses supported parameters", () => {
    expect(
      parseOpportunityListQuery({
        page: "2",
        limit: "25",
        type: "internship",
        source: "Devpost",
        location: "Remote",
        q: "security",
        status: "open",
      }),
    ).toEqual(
      expect.objectContaining({
        page: 2,
        limit: 25,
        type: "internship",
        source: "Devpost",
        location: "Remote",
        search: "security",
        status: "open",
      }),
    );
  });

  it("uses cursor as a backward-compatible page alias", () => {
    expect(
      parseOpportunityListQuery({
        page: "2",
        cursor: "4",
        limit: "10",
      }).page,
    ).toBe(4);
  });

  it.each([
    [{ page: "abc" }, "page must be a positive integer."],
    [{ page: "-1" }, "page must be a positive integer."],
    [{ limit: "0" }, "limit must be a positive integer."],
    [{ limit: "101" }, "limit cannot exceed 100."],
    [{ page: ["1", "2"] }, "page must be provided only once."],
  ])("rejects invalid query %#", (query, message) => {
    expect(() => parseOpportunityListQuery(query)).toThrow(
      new OpportunityQueryError(message),
    );
  });
});

describe("buildOpportunityPagination", () => {
  it("returns consistent metadata", () => {
    expect(buildOpportunityPagination(2, 20, 55)).toEqual({
      page: 2,
      limit: 20,
      totalItems: 55,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("handles an empty result", () => {
    expect(buildOpportunityPagination(1, 20, 0)).toEqual({
      page: 1,
      limit: 20,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
