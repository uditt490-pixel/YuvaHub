import { Request, Response } from 'express';
import { EventWaitlist } from '../../models/EventWaitlist';
import { Opportunity as Event } from '../../models/Opportunity';
import { addWaitlistPromotionJob } from '../../queues/eventWaitlistQueue';
import { logger } from '../../utils/logger';

/**
 * Adds a user to the waitlist for a specific event.
 */
export const joinWaitlist = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const userId = (req as any).user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is already registered or waiting
        const existingEntry = await EventWaitlist.findOne({ eventId: eventId as string, userId: userId as string });
        if (existingEntry) {
            return res.status(400).json({ error: 'Already in waitlist or registered' });
        }

        // Calculate position
        const waitingCount = await EventWaitlist.countDocuments({ eventId, status: 'waiting' });
        const newPosition = waitingCount + 1;

        const newEntry = await EventWaitlist.create({
            eventId: eventId as string,
            userId: userId as string,
            position: newPosition,
            status: 'waiting',
        });

        res.status(201).json({
            message: 'Successfully joined waitlist',
            data: { position: newPosition, eventId }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error joining waitlist:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Handles a user claiming a promoted waitlist spot.
 */
export const claimWaitlistSpot = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const userId = (req as any).user?.uid;

        const entry = await EventWaitlist.findOne({ claimToken: token, userId });

        if (!entry) {
            return res.status(404).json({ error: 'Invalid or expired claim token' });
        }

        if (entry.status !== 'promoted') {
            return res.status(400).json({ error: 'Spot has already been claimed or expired' });
        }

        if (entry.claimExpiresAt && new Date() > entry.claimExpiresAt) {
            entry.status = 'expired';
            await entry.save();
            // Trigger promotion for the next person
            await addWaitlistPromotionJob(entry.eventId.toString());
            return res.status(400).json({ error: 'Claim window has expired' });
        }

        // Register the user for the event (mocked logic)
        entry.status = 'claimed';
        await entry.save();

        // Decrement positions of remaining waiting users
        await EventWaitlist.updateMany(
            { eventId: entry.eventId, status: 'waiting' },
            { $inc: { position: -1 } }
        );

        res.status(200).json({ message: 'Spot successfully claimed!' });
    } catch (error) {
        logger.error({ err: error }, 'Error claiming waitlist spot:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches the current waitlist status for a user and event.
 */
export const getWaitlistStatus = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const userId = (req as any).user?.uid;

        const entry = await EventWaitlist.findOne({ eventId, userId });

        if (!entry) {
            return res.status(404).json({ error: 'Not in waitlist' });
        }

        res.status(200).json({
            data: {
                position: entry.position,
                status: entry.status,
                estimatedWaitTime: entry.position * 2, // Mock estimation: 2 hours per position
            }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching waitlist status:');
        res.status(500).json({ error: 'Internal server error' });
    }
};
