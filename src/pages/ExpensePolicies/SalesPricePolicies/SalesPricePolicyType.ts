export type DepartmentCategory = "Corporate" | "Sales";

export type CompetencyRank = 
  | "P6/Trainee" 
  | "P5" 
  | "P4" 
  | "P3B" 
  | "P3A" 
  | "P2" 
  | "P1" 
  | "L5-B & L5-A" 
  | "L4" 
  | "L3 & Above";

export type CityType = "Metro" | "Non Metro";

export type Designation = {
  id: number;
  name: string;
  department: string;
  category: DepartmentCategory;
  competencyRank: CompetencyRank;
};

export type SalesPricePolicy = {
  id: number;
  designation: Designation;
  cityType: CityType[];
  competencyRank: CompetencyRank;
  
  // HQ DA (upto 100 KMs)
  hqDaMetro: number;
  hqDaNonMetro: number;
  
  // Ex HQ DA (100-200 Kms)
  exHqDaMetro: number;
  exHqDaNonMetro: number;
  
  // Upcountry (>200 Kms) - Auto-calculated as half of HQ DA
  upcountryMetro: number;
  upcountryNonMetro: number;
  
  // Food Expenses
  foodExpensesHqDa: string;
  foodExpensesMetroOutstation: string;
  
  // Phone
  phoneCalls: number;
  phoneInternet?: number;
  
  // Courier & Stationary
  courier: string;
  stationary: number;
  
  // Lodging & Boarding (200 KMs & Above)
  lodgingBoardingMetro: number;
  lodgingBoardingNonMetro: number;
  lodgingBoardingWithoutBill: number;
  
  // Petrol Allowance
  petrolAllowanceMetro: string;
  petrolAllowanceNonMetro: string;
  
  // Toll & Parking
  tollParking: string;
  
  // Monthly Meetings
  monthlyMeetingsDescription: string;
  monthlyMeetingsEligibility: string;
  monthlyMeetingsHqDa: string;
  monthlyMeetingsExHqDa: string;
  monthlyMeetingsOutstation: string;
  
  // Max Days Limit
  maxDaysLimitHqDa: string;
  maxDaysLimitExHqDa: string;
  maxDaysLimitOutstation: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Metro cities as defined in the Excel
export const metroCities = [
  "Mumbai", "Delhi/NCR", "Kolkata", "Chennai", 
  "Bangalore", "Hyderabad", "Pune", "Ahmedabad"
];

// Default competency ranks from Excel
export const defaultCompetencyRanks: CompetencyRank[] = [
  "P6/Trainee", "P5", "P4", "P3B", "P3A", "P2", "P1", 
  "L5-B & L5-A", "L4", "L3 & Above"
];

// Designations from Excel
export const designations: Designation[] = [
  { id: 1, name: "Trainee", department: "Sales", category: "Sales", competencyRank: "P6/Trainee" },
  { id: 2, name: "Jr.Sales Executive", department: "Sales", category: "Sales", competencyRank: "P6/Trainee" },
  { id: 3, name: "Sr.Sales Executive", department: "Sales", category: "Sales", competencyRank: "P5" },
  { id: 4, name: "Territory Sales Executive", department: "Sales", category: "Sales", competencyRank: "P4" },
  { id: 5, name: "Area Sales Head - B", department: "Sales", category: "Sales", competencyRank: "P3B" },
  { id: 6, name: "Area Sales Head - A", department: "Sales", category: "Sales", competencyRank: "P3B" },
  { id: 7, name: "Area Sales Manager - A", department: "Sales", category: "Sales", competencyRank: "P3A" },
  { id: 8, name: "Area Sales Manager - B", department: "Sales", category: "Sales", competencyRank: "P3A" },
  { id: 9, name: "Sales Manager", department: "Sales", category: "Sales", competencyRank: "P2" },
  { id: 10, name: "Sr. Sales Manager", department: "Sales", category: "Sales", competencyRank: "P1" },
  { id: 11, name: "ZSM & RSM", department: "Sales", category: "Sales", competencyRank: "L5-B & L5-A" },
  { id: 12, name: "GM", department: "Sales", category: "Sales", competencyRank: "L4" },
  { id: 13, name: "VP & Above", department: "Sales", category: "Sales", competencyRank: "L3 & Above" },
];

// Policy notes from Excel
export const policyNotes = [
  "DA shouldn't be charged if employee is attending Monthly Meetings, Training, Conferences, Leave or Non confirmation on working day from Supervisor.",
  "SM & Above can claim conveyance based on actuals as per Bills in more than 200 km Town",
  "Parking and Toll will be extra (over and above Petrol Allowance)",
  "Courier cost - to be on actual on submission of bills",
  "No Own Stay Allowed"
];

// Default values for new policies
export const getDefaultPolicyValues = (): Omit<SalesPricePolicy, 'id' | 'designation' | 'cityType' | 'competencyRank' | 'createdAt' | 'updatedAt'> => ({
  hqDaMetro: 0,
  hqDaNonMetro: 0,
  exHqDaMetro: 0,
  exHqDaNonMetro: 0,
  upcountryMetro: 0,
  upcountryNonMetro: 0,
  foodExpensesHqDa: "NIL",
  foodExpensesMetroOutstation: "NIL",
  phoneCalls: 0,
  courier: "Actual",
  stationary: 0,
  lodgingBoardingMetro: 0,
  lodgingBoardingNonMetro: 0,
  lodgingBoardingWithoutBill: 0,
  petrolAllowanceMetro: "NA",
  petrolAllowanceNonMetro: "NA",
  tollParking: "On Actual",
  monthlyMeetingsDescription: "",
  monthlyMeetingsEligibility: "",
  monthlyMeetingsHqDa: "NA",
  monthlyMeetingsExHqDa: "NA",
  monthlyMeetingsOutstation: "NA",
  maxDaysLimitHqDa: "NA",
  maxDaysLimitExHqDa: "NA",
  maxDaysLimitOutstation: "NA",
  isActive: true,
});