export interface IUpdateTaskOrderItem {
  taskId: number;
  order: number;
  columnId: string;
  boardId: string;
  isDone: string | null;
}

export type IUpdateTaskOrder = IUpdateTaskOrderItem[];
