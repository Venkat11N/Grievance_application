import mongoose, { Document, Schema } from 'mongoose';

export interface IUserNotificationSeed extends Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const userNotificationSeedSchema = new Schema<IUserNotificationSeed>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUserNotificationSeed>('UserNotificationSeed', userNotificationSeedSchema);
