import mongoose, { Schema, Types } from "mongoose";

import { ITask } from "../../common/interfaces/models/ITaskSchema";

export const TaskSchema = new Schema<ITask>({
  taskId: { type: Number, required: true, default: 0 },
  title: { type: String, required: true },
  userId: { type: String, /* ref: "User", */ required: true },
  status: {
    type: String,
    enum: ["to do", "in progress", "done"],
    default: "to-do",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  description: { type: String, default: "" },
  customFields: { type: Map, of: String },
  type: { type: String, enum: ["task", "story"], default: "task" },
  parentTask: { type: Number, ref: "Task", default: null },
  columnId: { type: String, /* ref: "Board", */ required: true },
  boardId: { type: String /* , ref: "Board" */, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  order: { type: Number, required: true },
});

export const Task = mongoose.model<ITask>("Task", TaskSchema);
