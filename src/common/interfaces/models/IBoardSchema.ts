import { Types } from "mongoose";
import { ITask } from "./ITaskSchema";

export interface IBoard extends Document {
  name: string;
  columns: string[];
  tasks: ITask[];
  userId: string;
  createdAt: Date;
  _id: Types.ObjectId;
}
