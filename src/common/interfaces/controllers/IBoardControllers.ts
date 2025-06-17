
export interface IManageMembers {
  type: 'share' | 'leave' | 'kick';
  boardId: string;
  memberEmail: string;
}
