import { Document, Types } from "mongoose";

export interface ITask extends Document {
  taskId: number;
  name: string;
  userId: string;
  status?: "to-do" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  description?: string;
  customFields?: Record<string, string>;
  type?: "task" | "story";
  parentTask?: number;
  column: string;
  board: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
