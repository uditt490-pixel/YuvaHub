import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ObjectId } from "mongodb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize an Express route param (which may be `string`, `string[]`,
 * `undefined`, or any other type coming from `req.params` / `req.body`)
 * into a single string.
 *
 * Express types `req.params.<name>` as `string` by default, but in practice
 * — when the same param appears multiple times in a request, or when a
 * middleware rewrites `req.params` — it can be `string[]`. Constructing a
 * MongoDB `ObjectId` directly from such a value either throws (sync) or
 * silently builds a wrong query filter, which is the bug tracked in #285.
 *
 * Behavior:
 *   - `string` → returned as-is.
 *   - `string[]` → returns the first element (or `undefined` if empty).
 *   - `undefined` / `null` / other types → returns `undefined`.
 *
 * Use this in every route handler that consumes an `:id` / `:postId` /
 * `:commentId` param before passing it to `safeObjectId` or any string API.
 *
 * @example
 * const idStr = normalizeParam(req.params.id);
 * if (!idStr) return res.status(400).json({ error: "Missing id" });
 * const oid = safeObjectId(idStr);
 */
export function normalizeParam(param: unknown): string | undefined {
  if (typeof param === "string") return param;
  if (Array.isArray(param)) {
    const first = param[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

/**
 * Safely parse a route param (which may be `string | string[]` per Express's
 * runtime behavior — see issue #285) into a MongoDB ObjectId.
 *
 * Returns `null` for any invalid input (array, wrong length, non-hex chars,
 * etc.) instead of throwing a synchronous exception.
 *
 * The function internally normalizes arrays via {@link normalizeParam}, so
 * callers can pass `req.params.id` directly without an extra guard.
 *
 * @example
 * const oid = safeObjectId(req.params.id);
 * if (!oid) return res.status(400).json({ error: "Invalid ID format" });
 * const doc = await collection.findOne({ _id: oid });
 */
export function safeObjectId(id: unknown): ObjectId | null {
  const idStr = normalizeParam(id);
  if (!idStr) return null;
  if (idStr.length !== 24) return null;
  // Quick hex check before attempting the constructor
  if (!/^[a-fA-F0-9]{24}$/.test(idStr)) return null;
  try {
    return new ObjectId(idStr);
  } catch {
    return null;
  }
}

export { parsePagination, buildPaginationMetadata } from "./pagination.js";

