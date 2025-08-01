import mongoose, { Schema } from 'mongoose';

import { IBoard, IColumn } from '@common/interfaces/models/IBoardSchema';

const ColumnSchema = new Schema<IColumn>({
  title: { type: String, required: true },
  columnId: { type: String, required: true },
  order: { type: Number, required: true },
});

const BoardSchema = new Schema<IBoard>({
  title: { type: String, required: true },
  boardId: { type: String, required: true },
  columns: {
    type: Map,
    of: ColumnSchema,
    required: true,
    default: {},
  },
  userId: { type: String, ref: 'User', required: true },
  ownerEmail: { type: String },
  members: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  doneColumn: { type: String, default: null },
});

BoardSchema.index({ userId: 1 });
BoardSchema.index({ members: 1 });

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
