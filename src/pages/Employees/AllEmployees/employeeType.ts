// src/types/employee.ts
export type User = {
  image: string;
  name: string;
  role: string;
  email: string;
};

export type Employee = {
  id: number;
  user: User;
  department: string;
  joiningDate: string;
  status: "Active" | "Inactive";

  // Optional (for full details in AllEmployees.tsx)
  firstName?: string;
  lastName?: string;
  designation?: string;
  birthDate?: string;
  mobileNo?: string;
  mobileNoAlternative?: string;
  password?: string;
  category?: string;
  unit?: string;
  zone?: string;
  location?: string;
  state?: string;
  city?: string;
  supervisor?: string;
  bankAccountNo?: string;
  bankName?: string;
  IfscCode?: string;
  expenseDesignation?: string;
  userType?: string;
  ttmt?: string;
  secretary?: string;
};
