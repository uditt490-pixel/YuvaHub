import { Request, Response } from 'express';
import { MatchingService } from '../services/matching.service';
import { screenerFormSchema } from '../schemas/screenerSchema';

export const screenScholarships = async (req: Request, res: Response) => {
  try {
    const validation = screenerFormSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.format() });
    }

    const matches = await MatchingService.findEligibleScholarships(validation.data);
    return res.status(200).json({ success: true, matches });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
