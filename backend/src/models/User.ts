import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  mobile?: string;
  password?: string;          
  name: string;
  role: 'seafarer' | 'official';
  isVerified: boolean;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  password: { type: String },
  name: { type: String, required: true },
  role: { type: String, enum: ['seafarer', 'official'], required: true },
  isVerified: { type: Boolean, default: false },
});

export default mongoose.model<IUser>('User', userSchema);