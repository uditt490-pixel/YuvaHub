import { Request, Response } from "express";
import { db } from "../utils/firebaseAdmin";
import { logger } from "../utils/logger";
import { FieldValue } from "firebase-admin/firestore";

export const getExpiryStats = async (req: Request, res: Response) => {
  try {
    const activeQuery = await db.collection("opportunities").where("status", "==", "active").count().get();
    const expiredQuery = await db.collection("opportunities").where("status", "==", "closed").count().get();
    const archivedQuery = await db.collection("archivedOpportunities").count().get();

    res.json({
      active: activeQuery.data().count,
      expired: expiredQuery.data().count,
      archived: archivedQuery.data().count,
    });
  } catch (error) {
    logger.error({ err: error }, "Error fetching expiry stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getExpiredOpportunities = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("opportunities")
      .where("status", "==", "closed")
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();
      
    const opportunities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(opportunities);
  } catch (error) {
    logger.error({ err: error }, "Error fetching expired opportunities");
    res.status(500).json({ error: "Failed to fetch expired opportunities" });
  }
};

export const reactivateOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newDeadline } = req.body;
    
    if (!newDeadline) {
      return res.status(400).json({ error: "newDeadline is required" });
    }

    const docRef = db.collection("opportunities").doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    await docRef.update({
      status: "active",
      deadline: newDeadline,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: "Opportunity reactivated" });
  } catch (error) {
    logger.error({ err: error }, "Error reactivating opportunity");
    res.status(500).json({ error: "Failed to reactivate opportunity" });
  }
};

export const archiveOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const docRef = db.collection("opportunities").doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    const data = doc.data();
    const archiveRef = db.collection("archivedOpportunities").doc(id as string);
    
    const batch = db.batch();
    batch.set(archiveRef, { ...data, archivedAt: FieldValue.serverTimestamp() });
    batch.delete(docRef);
    
    await batch.commit();

    res.json({ success: true, message: "Opportunity archived manually" });
  } catch (error) {
    logger.error({ err: error }, "Error archiving opportunity");
    res.status(500).json({ error: "Failed to archive opportunity" });
  }
};
