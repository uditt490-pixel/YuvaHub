import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ObjectId } from "mongodb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse a string into a MongoDB ObjectId.
 * Returns `null` for any invalid input (wrong length, non-hex chars, etc.)
 * instead of throwing a synchronous exception.
 *
 * Use this in every route handler that accepts an `:id` parameter to
 * prevent crashes and avoid silently falling back to wrong query semantics.
 *
 * @example
 * const oid = safeObjectId(req.params.id);
 * if (!oid) return res.status(400).json({ error: "Invalid ID format" });
 * const doc = await collection.findOne({ _id: oid });
 */
export function safeObjectId(id: unknown): ObjectId | null {
  if (typeof id !== "string") return null;
  if (id.length !== 24) return null;
  // Quick hex check before attempting the constructor
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}
