import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { EventWaitlist } from '../models/EventWaitlist';
import { Opportunity as Event } from '../models/Opportunity';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import crypto from 'crypto';

/**
 * BullMQ Worker for processing event waitlist promotions.
 * Listens for capacity changes and promotes the next user in line.
 */
export const eventWaitlistWorker = new Worker(
    'event_waitlist_promotion',
    async (job: Job) => {
        const { eventId } = job.data;
        logger.info(`Processing waitlist promotion for event: ${eventId}`);

        try {
            // 1. Find the next user in the waiting list for this event
            const nextInLine = await EventWaitlist.findOne({
                eventId,
                status: 'waiting',
            }).sort({ position: 1 });

            if (!nextInLine) {
                logger.info(`No users waiting for event: ${eventId}`);
                return { status: 'empty', eventId };
            }

            // 2. Generate a secure, time-limited claim token
            const claimToken = crypto.randomBytes(32).toString('hex');
            const claimExpiresAt = new Date();
            claimExpiresAt.setHours(claimExpiresAt.getHours() + 24); // 24-hour claim window

            // 3. Update the waitlist entry status
            nextInLine.status = 'promoted';
            nextInLine.claimToken = claimToken;
            nextInLine.claimExpiresAt = claimExpiresAt;
            nextInLine.notifiedAt = new Date();
            await nextInLine.save();

            // 4. Fetch user and event details for notification
            const user = await User.findById(nextInLine.userId);
            const event = await Event.findById(eventId);

            if (user && event) {
                logger.info(`Promoted user ${user.email} for event ${event.title}. Sending notification...`);
                // TODO: Integrate with actual email service (e.g., Nodemailer/SendGrid)
                // await sendEmail({
                //   to: user.email,
                //   subject: `Spot Available: ${event.title}`,
                //   html: `<p>A spot has opened up! Claim it here: ${process.env.FRONTEND_URL}/claim?token=${claimToken}</p>`
                // });
            }

            return { status: 'promoted', userId: nextInLine.userId, claimToken };
        } catch (error) {
            logger.error({ err: error }, `Waitlist promotion worker failed for event ${eventId}:`);
            throw error;
        }
    },
    { connection: redisClient }
);
