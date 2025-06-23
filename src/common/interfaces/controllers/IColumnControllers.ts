export interface IManageColumn {
  title: string;
  boardId: string;
  order?: number;
  columnId?: string;
  isDelete?: boolean;
  tasksPath?: string;
}
