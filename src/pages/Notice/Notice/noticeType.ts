export type Notice = {
  id: number;
  title: string;
  description: string;
  role: "Administrator" | "User";
  date: string;
  imageUrl?: string;
};