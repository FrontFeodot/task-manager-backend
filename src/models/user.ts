import mongoose from 'mongoose';
import { IUser } from '../common/interfaces/models/IUserSchema';

const Schema = mongoose.Schema;

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

export const User = mongoose.model<IUser>('User', userSchema, 'users');
