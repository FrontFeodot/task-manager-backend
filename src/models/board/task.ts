import mongoose, { Schema, Types } from "mongoose";

import { ITask } from "../../common/interfaces/models/ITaskSchema";

const TaskSchema = new Schema<ITask>({
  name: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  status: {
    type: String,
    enum: ["to-do", "in-progress", "done"],
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
  parentTask: { type: Schema.Types.ObjectId, ref: "Task", default: null },
  column: { type: Schema.Types.ObjectId, ref: "Column", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Task = mongoose.model<ITask>("Task", TaskSchema);
