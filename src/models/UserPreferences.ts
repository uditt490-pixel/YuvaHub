import { Schema, model, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: Schema.Types.ObjectId;
  email: string;
  skills: string[];
  subscribedToNewsletter: boolean;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: { type: String, required: true },
    skills: [{ type: String }],
    subscribedToNewsletter: { type: Boolean, default: true },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserPreferences = model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
