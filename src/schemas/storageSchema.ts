import { z } from "zod";

export const storageSignatureSchema = z.object({
  folder: z.string().min(1).max(100),
  fileName: z.string().min(1).max(255).optional(),
  type: z.enum(["image", "pdf", "video", "document", "other"]).optional().default("image")
});

export const storageSaveSchema = z.object({
  fileUrl: z.string().url(),
  referenceId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});
