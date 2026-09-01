import { Request, Response } from 'express';
import { UserPreferences } from '../models/UserPreferences';

import mongoose from 'mongoose';

export const handleUnsubscribe = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).send('Invalid unsubscribe link.');
    }

    await UserPreferences.updateOne(
      { userId: new mongoose.Types.ObjectId(String(userId)) as any },
      { $set: { subscribedToNewsletter: false, unsubscribedAt: new Date() } }
    );

    return res.status(200).send('You have been successfully unsubscribed from YuvaHub newsletters.');
  } catch (error: any) {
    return res.status(500).send('Internal server error.');
  }
};
