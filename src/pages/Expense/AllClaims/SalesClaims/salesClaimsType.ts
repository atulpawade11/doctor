export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Processing";
export type Currency = "USD" | "INR" | "JPY";

export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  region?: string;
  image?: string;
};

export type SalesClaim = {
  id: number;
  claimNumber: string;
  claimTitle: string;
  employee: Employee;
  specialApproval: boolean;
  submittedOn: string; // ISO date
  claimAmount: number;
  currency: Currency;
  passedAmountSupervisor: number;
  passedAmountAuditor: number;
  deductionAmount: number;
  status: ClaimStatus;
};

// Currency symbols mapping
export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  JPY: "¥",
};

// Status badge colors
export const statusColors: Record<ClaimStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};