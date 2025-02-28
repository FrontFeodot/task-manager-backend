import mongoose, { Schema } from "mongoose";
import { IBoard } from "../../common/interfaces/models/IBoardSchema";
import { ITask } from "../../common/interfaces/models/ITaskSchema";
import { TaskSchema } from "./task";

const BoardSchema = new Schema<IBoard>({
  name: { type: String, required: true },
  columns: { type: [String], required: true },
  tasks: { type: [TaskSchema], required: true, ref: "Task" },
  userId: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Board = mongoose.model<IBoard>("Board", BoardSchema);
