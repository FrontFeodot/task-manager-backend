import { Document, Types } from "mongoose";

export interface ITask extends Document {
  taskId: number;
  title: string;
  userId: string;
  isDone: boolean;
  status?: "to do" | "in progress" | "done";
  priority?: "low" | "medium" | "high";
  description?: string;
  customFields?: Record<string, string>;
  type?: "task" | "story";
  parentTask?: number;
  columnId: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}
