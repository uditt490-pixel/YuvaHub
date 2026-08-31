import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Interface representing a user's notification preferences across different channels.
 */
export interface INotificationPreference extends Document {
    userId: Types.ObjectId;
    preferences: {
        eventType: string;
        channels: {
            inApp: boolean;
            email: boolean;
            push: boolean;
        };
    }[];
    updatedAt: Date;
    createdAt: Date;
}

/**
 * Mongoose schema for NotificationPreference.
 * Allows granular control over which notification types are sent to which channels.
 */
const notificationPreferenceSchema = new Schema<INotificationPreference>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        preferences: [
            {
                eventType: {
                    type: String,
                    required: true,
                    enum: [
                        'new_match',
                        'event_reminder',
                        'waitlist_promoted',
                        'message_received',
                        'badge_earned',
                        'system_announcement',
                    ],
                },
                channels: {
                    inApp: { type: Boolean, default: true },
                    email: { type: Boolean, default: true },
                    push: { type: Boolean, default: false },
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Ensure all event types are initialized for new users
notificationPreferenceSchema.pre('save', function (next) {
    const defaultEventTypes = [
        'new_match', 'event_reminder', 'waitlist_promoted',
        'message_received', 'badge_earned', 'system_announcement'
    ];

    if (this.isNew) {
        this.preferences = defaultEventTypes.map(eventType => ({
            eventType,
            channels: { inApp: true, email: eventType === 'system_announcement', push: false },
        }));
    }
    next();
});

export const NotificationPreference = mongoose.model<INotificationPreference>(
    'NotificationPreference',
    notificationPreferenceSchema
);
