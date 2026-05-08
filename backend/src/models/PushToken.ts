import mongoose, { Document, Schema } from 'mongoose';

export interface IPushToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  device: string;
}

const pushTokenSchema = new Schema<IPushToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  device: { type: String },
});

export default mongoose.model<IPushToken>('PushToken', pushTokenSchema);