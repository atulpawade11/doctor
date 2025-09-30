export type DepartmentCategory = "Corporate" | "Sales";

export interface Department {
  id: number;
  name: string;
  category: DepartmentCategory;
}