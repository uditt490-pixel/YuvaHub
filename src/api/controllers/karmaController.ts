import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";

export const getKarmaBalance = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbQuery) return res.status(503).json({ error: "Database not available" });
    const txs = await dbQuery.collection("transactions").find({ userId: user.uid }).toArray();
    let balance = txs.reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);

    if (balance === 0 && process.env.NODE_ENV === "development") {
      if (dbCommand) {
        await dbCommand.collection("transactions").insertOne({
          userId: user.uid,
          amount: 1000,
          type: 'debug_grant',
          timestamp: Date.now()
        });
        balance = 1000;
      }
    }

    res.json({ balance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const awardKarma = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });
    const { type, metadata } = req.body;
    let amount = 0;
    if (type === 'daily_login') amount = 10;
    else if (type === 'profile_setup') amount = 50;
    else if (type === 'expired_report') amount = 5;

    if (amount > 0) {
      if (type === 'daily_login') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const existing = await dbCommand.collection("transactions").findOne({
          userId: user.uid,
          type: 'daily_login',
          timestamp: { $gte: startOfDay.getTime() }
        });
        if (existing) return res.status(400).json({ error: "Daily login already claimed" });
      }

      await dbCommand.collection("transactions").insertOne({
        userId: user.uid,
        amount,
        type,
        timestamp: Date.now(),
        metadata
      });
    }
    res.json({ success: true, awarded: amount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
