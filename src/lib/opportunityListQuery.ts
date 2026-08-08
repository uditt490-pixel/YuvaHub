export interface OpportunityListQuery {
  page: number;
  limit: number;
  skills: string;
  country: string;
  field: string;
  type: string;
  source: string;
  location: string;
  search: string;
  status: string;
}

export class OpportunityQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpportunityQueryError";
  }
}

const parseSingleString = (
  value: unknown,
  field: string,
  maximumLength = 120,
): string => {
  if (value === undefined || value === null || value === "") return "";

  if (Array.isArray(value)) {
    if (value.length !== 1) {
      throw new OpportunityQueryError(
        `${field} must be provided only once.`,
      );
    }

    return parseSingleString(value[0], field, maximumLength);
  }

  if (typeof value !== "string") {
    throw new OpportunityQueryError(`${field} must be a string.`);
  }

  const normalized = value.trim();

  if (normalized.length > maximumLength) {
    throw new OpportunityQueryError(
      `${field} cannot exceed ${maximumLength} characters.`,
    );
  }

  return normalized;
};

const parsePositiveInteger = (
  value: unknown,
  field: string,
  fallback: number,
  maximum: number,
): number => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    if (value.length !== 1) {
      throw new OpportunityQueryError(
        `${field} must be provided only once.`,
      );
    }

    return parsePositiveInteger(
      value[0],
      field,
      fallback,
      maximum,
    );
  }

  const text = String(value).trim();

  if (!/^\d+$/.test(text)) {
    throw new OpportunityQueryError(
      `${field} must be a positive integer.`,
    );
  }

  const parsed = Number.parseInt(text, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new OpportunityQueryError(
      `${field} must be a positive integer.`,
    );
  }

  if (parsed > maximum) {
    throw new OpportunityQueryError(
      `${field} cannot exceed ${maximum}.`,
    );
  }

  return parsed;
};

export function parseOpportunityListQuery(
  query: Record<string, unknown>,
): OpportunityListQuery {
  const cursor =
    query.cursor === undefined || query.cursor === ""
      ? undefined
      : query.cursor;

  const page = parsePositiveInteger(
    cursor ?? query.page,
    cursor !== undefined ? "cursor" : "page",
    1,
    100000,
  );

  return {
    page,
    limit: parsePositiveInteger(query.limit, "limit", 20, 100),
    skills: parseSingleString(query.skills, "skills", 500),
    country: parseSingleString(query.country, "country"),
    field: parseSingleString(query.field, "field"),
    type: parseSingleString(query.type, "type"),
    source: parseSingleString(query.source, "source"),
    location: parseSingleString(query.location, "location"),
    search: parseSingleString(query.search ?? query.q, "search", 200),
    status: parseSingleString(query.status, "status"),
  };
}

export function buildOpportunityPagination(
  page: number,
  limit: number,
  totalItems: number,
) {
  const safeTotal = Math.max(0, Math.trunc(totalItems));
  const totalPages =
    safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit);

  return {
    page,
    limit,
    totalItems: safeTotal,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: totalPages > 0 && page > 1,
  };
}
