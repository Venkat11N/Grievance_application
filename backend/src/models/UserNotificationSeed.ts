import mongoose, { Document, Schema } from 'mongoose';

export interface IUserNotificationSeed extends Document {
  userId: mongoose.Types.ObjectId;
  seeded: boolean;
  seeding: boolean;
  seedingAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userNotificationSeedSchema = new Schema<IUserNotificationSeed>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  seeded: { type: Boolean, default: false },
  seeding: { type: Boolean, default: false },
  seedingAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUserNotificationSeed>('UserNotificationSeed', userNotificationSeedSchema);
