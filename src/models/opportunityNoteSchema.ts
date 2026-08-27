import { z } from 'zod';

export const opportunityNoteSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  content: z.string().max(2000, 'Note cannot exceed 2000 characters').optional().default(''),
  color: z.enum(['blue', 'emerald', 'purple', 'amber', 'rose', 'slate']).optional().default('blue'),
  isPinned: z.boolean().optional().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type OpportunityNote = z.infer<typeof opportunityNoteSchema>;
