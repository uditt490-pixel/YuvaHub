export type DigestDeliveryStatus = "queued" | "failed";

export interface DigestDelivery {
  dedupeKey: string;
  userId: string;
  isoYear: number;
  isoWeek: number;
  queuedAt?: Date;
  status: DigestDeliveryStatus;
  queueJobId?: string;
  updatedAt: Date;
}

/**
 * Creates the unique index required for cross-instance idempotency.
 * The unique key is the complete weekly digest identity.
 */
export async function ensureDigestDeliveryIndexes(db: any): Promise<void> {
  await db.collection("digestDeliveries").createIndex(
    { dedupeKey: 1 },
    { unique: true, name: "digest_delivery_dedupe_key_unique" },
  );
}
