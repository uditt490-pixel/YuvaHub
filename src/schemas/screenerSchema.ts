import { z } from 'zod';

export const screenerFormSchema = z.object({
  familyIncome: z.number().min(0, 'Income must be a positive number'),
  cgpa: z.number().min(0).max(10, 'CGPA must be between 0 and 10'),
  gender: z.enum(['Male', 'Female', 'Other']),
  category: z.string().min(1, 'Category is required'),
});

export type ScreenerFormData = z.infer<typeof screenerFormSchema>;
