import { NotificationPreference } from '../models/NotificationPreference';
import { logger } from '../utils/logger';

/**
 * Evaluates user preferences and notification urgency to determine delivery channels.
 * 
 * @param userId - The target user's ID.
 * @param eventType - The type of notification.
 * @param isCritical - Whether the notification is critical (bypasses some preferences).
 * @returns An array of approved delivery channels.
 */
export const getApprovedChannels = async (
    userId: string,
    eventType: string,
    isCritical: boolean = false
): Promise<('inApp' | 'email' | 'push')[]> => {
    try {
        let prefs = await NotificationPreference.findOne({ userId });

        if (!prefs) {
            // Create default preferences if none exist
            prefs = await NotificationPreference.create({ userId });
        }

        const eventPref = prefs.preferences.find(p => p.eventType === eventType);

        if (!eventPref) {
            logger.warn(`No preference found for eventType: ${eventType}. Defaulting to inApp only.`);
            return ['inApp'];
        }

        const channels: ('inApp' | 'email' | 'push')[] = [];

        if (eventPref.channels.inApp) channels.push('inApp');
        if (eventPref.channels.email) channels.push('email');
        if (eventPref.channels.push) channels.push('push');

        // Critical notifications (e.g., security, waitlist promotion) force in-app at minimum
        if (isCritical && channels.length === 0) {
            channels.push('inApp');
        }

        return channels;
    } catch (error) {
        logger.error({ err: error }, `Error fetching notification preferences for user ${userId}`);
        // Fallback to safe default
        return ['inApp'];
    }
};

/**
 * Mock email dispatcher. In production, integrate with Nodemailer/SendGrid.
 */
export const dispatchEmail = async (email: string, subject: string, html: string) => {
    logger.info(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
    // await nodemailer.sendMail({ to: email, subject, html });
};

/**
 * Mock push notification dispatcher. In production, integrate with Firebase Cloud Messaging.
 */
export const dispatchPush = async (userId: string, title: string, body: string) => {
    logger.info(`[MOCK PUSH] To User: ${userId} | Title: ${title}`);
    // await fcm.send({ token: user.fcmToken, notification: { title, body } });
};
