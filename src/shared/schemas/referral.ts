import { z } from 'zod';

export const ReferralLinkSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(6),
  opportunityId: z.string(),
  referrerId: z.string().optional(),
  platform: z.enum(['whatsapp', 'linkedin', 'twitter', 'facebook', 'copy_link', 'native']),
  clicks: z.number().default(0),
  conversions: z.number().default(0),
  createdAt: z.date(),
});

export const TrackConversionSchema = z.object({
  referralCode: z.string(),
  conversionType: z.enum(['bookmark', 'application']),
  userId: z.string().optional(),
});

export type ReferralLink = z.infer<typeof ReferralLinkSchema>;
export type TrackConversion = z.infer<typeof TrackConversionSchema>;
