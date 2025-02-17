export interface IColumn extends Document {
  name: string;
  items: string[];
  userId: string;
  createdAt: Date;
}

export type IColumnDefault = "day" | "week" | "month" | "quarter" | "year";
