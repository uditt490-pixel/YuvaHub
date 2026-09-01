import { z } from "zod";

export const authSyncSchema = z.object({
  uid: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  photoURL: z.string().url().optional().nullable(),
  college: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  field: z.string().optional().nullable(),
  country: z.string().optional().nullable()
});
