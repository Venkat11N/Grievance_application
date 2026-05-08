import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>('Notification', notificationSchema);