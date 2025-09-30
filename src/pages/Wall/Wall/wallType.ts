export type Wall = {
  id: number;
  description: string;
  addedByEmployee: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'svg' | 'mp4';
};

export type Employee = {
  id: number;
  name: string;
};
