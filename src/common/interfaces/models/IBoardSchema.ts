import { Types } from "mongoose";
import { ITask } from "./ITaskSchema";

export interface IBoard extends Document {
  title: string;
  boardId: string;
  columns: IColumn[];
  tasks: ITask[];
  userId: string;
  createdAt: Date;
  _id: Types.ObjectId;
}

export interface IColumn {
  title: string;
  columnId: string;
  order: number;
}
