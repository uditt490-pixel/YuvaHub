import { Router } from 'express';
import { randomUUID } from 'crypto';
import { ReferralLinkSchema, TrackConversionSchema } from '../../shared/schemas/referral';

const router = Router();
const referralDb = new Map<string, any>(); // Replace with DB model in production

// POST /api/referrals/generate
router.post('/api/referrals/generate', async (req, res) => {
  try {
    const { opportunityId, platform } = req.body;
    const referrerId = req.user?.id;
    const code = Math.random().toString(36).substring(2, 8);

   const newReferral = {
  id: randomUUID(),
  code,
  opportunityId,
  referrerId,
  platform: platform || 'copy_link',
  clicks: 0,
  conversions: 0,
  createdAt: new Date(),
};

    referralDb.set(code, newReferral);
    const referralUrl = `${req.protocol}://${req.get('host')}/r/${code}`;

    return res.status(201).json({ success: true, code, referralUrl });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /r/:code (Public Redirect & Click Tracker)
router.get('/r/:code', async (req, res) => {
  const { code } = req.params;
  const record = referralDb.get(code);

  if (!record) {
    return res.redirect('/opportunities');
  }

  record.clicks += 1;
  referralDb.set(code, record);

  // Set cookie for conversion tracking
  res.cookie('ref_code', code, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
  return res.redirect(`/opportunities/${record.opportunityId}?ref=${code}`);
});

// POST /api/referrals/conversion
router.post('/api/referrals/conversion', async (req, res) => {
  const parse = TrackConversionSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);

  const { referralCode } = parse.data;
  const record = referralDb.get(referralCode);

  if (record) {
    record.conversions += 1;
    referralDb.set(referralCode, record);
  }

  return res.status(200).json({ success: true });
});

// GET /api/admin/analytics/sharing
router.get('/api/admin/analytics/sharing', async (req, res) => {
  const records = Array.from(referralDb.values());
  const totalShares = records.length;
  const totalClicks = records.reduce((acc, r) => acc + r.clicks, 0);
  const totalConversions = records.reduce((acc, r) => acc + r.conversions, 0);

  return res.status(200).json({
    totalShares,
    totalClicks,
    totalConversions,
    records,
  });
});

export default router;
