export interface PaginationQuery {
  page?: unknown;
  limit?: unknown;
  cursor?: unknown;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const parseInteger = (
  value: unknown,
): number | null => {
  if (Array.isArray(value)) {
    return parseInteger(value[0]);
  }

  if (typeof value === "number") {
    return Number.isSafeInteger(value)
      ? value
      : null;
  }

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  const normalized = value.trim();

  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);

  return Number.isSafeInteger(parsed)
    ? parsed
    : null;
};

export function parsePagination(
  query:
    | PaginationQuery
    | Record<string, unknown>,
  maxLimit = 100,
  defaultLimit = 20,
): ParsedPagination {
  const safeMaxLimit =
    Number.isSafeInteger(maxLimit) &&
    maxLimit > 0
      ? maxLimit
      : 100;

  const safeDefaultLimit = Math.min(
    safeMaxLimit,
    Number.isSafeInteger(defaultLimit) &&
      defaultLimit > 0
      ? defaultLimit
      : 20,
  );

  const cursor = parseInteger(query.cursor);
  const parsedPage = parseInteger(query.page);
  const parsedLimit = parseInteger(query.limit);

  const limit = Math.min(
    safeMaxLimit,
    parsedLimit !== null && parsedLimit > 0
      ? parsedLimit
      : safeDefaultLimit,
  );

  const requestedPage =
    cursor !== null && cursor > 0
      ? cursor
      : parsedPage !== null && parsedPage > 0
        ? parsedPage
        : 1;

  const maximumSafePage =
    Math.floor(Number.MAX_SAFE_INTEGER / limit) + 1;

  const page = Math.min(
    requestedPage,
    maximumSafePage,
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

export function buildPaginationMetadata(
  page: number,
  limit: number,
  total: number,
): PaginationMetadata {
  const safePage =
    Number.isSafeInteger(page) && page > 0
      ? page
      : 1;

  const safeLimit =
    Number.isSafeInteger(limit) && limit > 0
      ? limit
      : 20;

  const safeTotal =
    Number.isSafeInteger(total) && total > 0
      ? total
      : 0;

  const totalPages =
    safeTotal === 0
      ? 0
      : Math.ceil(safeTotal / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages,
    hasNext:
      totalPages > 0 &&
      safePage < totalPages,
    hasPrevious:
      totalPages > 0 &&
      safePage > 1,
  };
}

// Additional pagination helpers for consistent { data, meta } envelope
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  next_page: number | null;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  items: T[];
  meta: PaginationMeta;
}

/** Build the pagination metadata for a known total (simpler format). */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const next_page = page * limit < total ? page + 1 : null;
  return {
    page,
    limit,
    total,
    next_page,
    has_more: next_page !== null,
  };
}

/** Wrap items + meta into the standard paginated envelope. */
export function paginate<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T> {
  return { success: true, data, items: data, meta: buildPaginationMeta(page, limit, total) };
}
