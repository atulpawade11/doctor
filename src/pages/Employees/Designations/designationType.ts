export type DepartmentCategory = "Corporate" | "Sales";

export type Designation = {
  id: number;
  name: string;
  department: string;
  category: DepartmentCategory;
};

export type Department = {
  id: number;
  name: string;
  category: DepartmentCategory;
};
