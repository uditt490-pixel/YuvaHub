import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getKarmaBalance = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) {
    // In offline / mock mode, return default initial karma balance
    return sendSuccess(res, { balance: 1000 });
  }
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
    } else {
      balance = 1000;
    }
  }

  return sendSuccess(res, { balance });
};

export const awardKarma = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) {
    return sendSuccess(res, { awarded: 10, note: "Mock mode award" });
  }
  const { type, metadata } = req.body;
  let amount = 0;
  if (type === 'daily_login') amount = 10;
  else if (type === 'profile_setup') amount = 50;
  else if (type === 'expired_report') amount = 5;

  if (amount > 0) {
    if (type === 'daily_login') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const result = await dbCommand.collection("transactions").findOneAndUpdate(
        {
          userId: user.uid,
          type: 'daily_login',
          timestamp: { $gte: startOfDay.getTime() }
        },
        {
          $setOnInsert: {
            userId: user.uid,
            amount,
            type: 'daily_login',
            timestamp: Date.now(),
            metadata
          }
        },
        { upsert: true, returnDocument: 'before' }
      );
      if (result?.value) throw AppError.badRequest("Daily login already claimed");
    } else {
      await dbCommand.collection("transactions").insertOne({
        userId: user.uid,
        amount,
        type,
        timestamp: Date.now(),
        metadata
      });
    }
  }
  return sendSuccess(res, { awarded: amount });
};
