import mongoose, { Schema } from 'mongoose';

import { ITask } from '@common/interfaces/models/ITaskSchema';

export const TaskSchema = new Schema<ITask>({
  taskId: { type: Number, required: true, default: 0 },
  title: { type: String, required: true },
  userId: { type: String, required: true },
  isDone: { type: Boolean, required: true, default: false },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  description: { type: String, default: '' },
  customFields: { type: Map, of: String },
  type: { type: String, enum: ['task', 'story'], default: 'task' },
  parentTask: { type: Number, ref: 'Task', default: null },
  columnId: { type: String, required: true },
  boardId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  order: { type: Number, required: true },
});

TaskSchema.index({ boardId: 1 }, { unique: true });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
