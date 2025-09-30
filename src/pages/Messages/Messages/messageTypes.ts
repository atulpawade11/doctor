export type Message = {
  id: number;
  title: string;
  quote: string;
  role: "Administrator" | "User";
  addedByEmployee: string;
};

export type Employee = {
  id: number;
  name: string;
};