export type LoginDetail = {
  id: number;
  username: string;
  email: string;
  department: string;
  designation: string;
  loginUserType: "Admin" | "User" | "Manager"; // extend roles as needed
  loginTime: string; // ISO timestamp
};
