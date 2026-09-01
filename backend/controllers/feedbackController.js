import express from 'express';
import CoffeeChatPairing from '../models/CoffeeChatPairing.js';
import { User } from '../../src/models/User.js';

const router = express.Router();

router.post('/api/mentorship/feedback', async (req, res) => {
  const { pairingId, userId, score, comments } = req.body;

  if (!pairingId || !userId || !score) {
    return res.status(400).json({ error: 'Missing pairingId, userId, or score rating query fields.' });
  }

  try {
    const pairing = await CoffeeChatPairing.findById(pairingId);
    if (!pairing) return res.status(404).json({ error: 'Pairing record entity context not found.' });

    // Map score vectors to respective participant paths
    const isTargetMentor = pairing.mentorId.toString() === userId;
    if (isTargetMentor) {
      pairing.mentorFeedbackScore = score;
    } else {
      pairing.studentFeedbackScore = score;
    }
    await pairing.save();

    // Safety Constraint Check: Auto-remove user from active lottery pool if score drops heavily
    if (score <= 2) {
      const problematicUserId = isTargetMentor ? pairing.mentorId : pairing.studentId;
      await User.findByIdAndUpdate(problematicUserId, {
        $set: { optInCoffeeChat: false, restrictionNotice: 'Flagged for community review' }
      });
      console.warn(`[SAFETY] User ${problematicUserId} auto-removed from future lotteries due to low score (${score}).`);
    }

    res.json({ message: 'Feedback logged successfully. Thank you for protecting community health standards.' });
  } catch (err) {
    console.error('Error logging mentorship feedback:', err);
    res.status(500).json({ error: 'Internal pipeline error logging safety feedback scores' });
  }
});

export default router;
