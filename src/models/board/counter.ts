import mongoose, { Schema } from 'mongoose';

import { ICounterSchema } from '@common/interfaces/models/ICounterSchema';

const CounterSchema = new Schema<ICounterSchema>({
  name: String,
  seq: { type: Number, default: 0 },
});

CounterSchema.index({ name: 1 }, { unique: true });

export const Counter = mongoose.model<ICounterSchema>('Counter', CounterSchema);
