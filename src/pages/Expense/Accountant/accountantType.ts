export type AccountantUser = {
  name: string;
  email: string;
  employeeId: string;
};

export type AccountantLocation = {
  id: number;
  unit: string;
  zone: string;
  location: string;
};

export type Accountant = {
  id: number;
  user: AccountantUser;
  selectedEmployee: string;
  isAdmin: boolean;
  userName: string;
  password: string;
  category: string;
  locations: AccountantLocation[];
};