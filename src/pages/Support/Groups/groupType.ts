export type Group = {
  id: number;
  title: string;
  description: string;
  members: GroupMember[];
};

export type GroupMember = {
  value: string;
  label: string;
  EmpID: string;
};