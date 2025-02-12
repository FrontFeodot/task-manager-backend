import mongoose, { Schema } from "mongoose";
import { IColumn } from "../../common/interfaces/models/IColumnSchema";

const ColumnSchema = new Schema<IColumn>({
  name: { type: String, required: true },
  items: { type: [String], required: true },
  userId: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Column = mongoose.model<IColumn>("Column", ColumnSchema);
