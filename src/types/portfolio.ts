export type InvestmentType =
  | "mutual_fund"
  | "mutual_fund_debt"
  | "stock"
  | "fd"
  | "ppf"
  | "epf"
  | "nps"
  | "gold"
  | "real_estate"
  | "other";

export type AssetCategory = "equity" | "debt" | "gold" | "real_estate" | "other";

export type RiskProfile = "conservative" | "moderate" | "aggressive";

export type InvestmentGoal =
  | "retirement"
  | "child_education"
  | "house"
  | "wealth_creation"
  | "emergency_fund"
  | "other";

export interface Investment {
  id: string;
  type: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  category: AssetCategory;
  annualReturn?: number;
}

export interface PortfolioReviewRequest {
  investments: Investment[];
  age: number;
  riskProfile: RiskProfile;
  goal: InvestmentGoal;
}

export interface AssetAllocation {
  equity: number;
  debt: number;
  gold: number;
  realEstate: number;
  cash: number;
}

export interface PortfolioAnalysis {
  totalInvested: number;
  totalCurrent: number;
  totalReturns: number;
  returnsPercentage: number;
  assetAllocation: AssetAllocation;
  aiRecommendations: string[];
  projectedValue10Years: number;
  riskScore: "low" | "medium" | "high";
}

export const investmentTypes: {
  value: InvestmentType;
  label: string;
  category: AssetCategory;
}[] = [
  { value: "mutual_fund", label: "Mutual Fund (Equity)", category: "equity" },
  { value: "mutual_fund_debt", label: "Mutual Fund (Debt)", category: "debt" },
  { value: "stock", label: "Stock", category: "equity" },
  { value: "fd", label: "Fixed Deposit", category: "debt" },
  { value: "ppf", label: "PPF", category: "debt" },
  { value: "epf", label: "EPF", category: "debt" },
  { value: "nps", label: "NPS", category: "debt" },
  { value: "gold", label: "Gold (SGB/ETF)", category: "gold" },
  { value: "real_estate", label: "Real Estate", category: "real_estate" },
  { value: "other", label: "Other", category: "other" },
];

export const investmentTemplates: {
  type: InvestmentType;
  name: string;
  category: AssetCategory;
}[] = [
  { type: "mutual_fund", name: "HDFC Flexi Cap Fund", category: "equity" },
  { type: "mutual_fund", name: "SBI Small Cap Fund", category: "equity" },
  { type: "mutual_fund", name: "ICICI Prudential Bluechip Fund", category: "equity" },
  { type: "mutual_fund", name: "Axis Midcap Fund", category: "equity" },
  { type: "mutual_fund", name: "Parag Parikh Flexi Cap Fund", category: "equity" },
  { type: "mutual_fund", name: "HDFC Short Term Debt Fund", category: "debt" },
  { type: "mutual_fund", name: "ICICI Prudential Debt Fund", category: "debt" },
  { type: "stock", name: "Reliance Industries", category: "equity" },
  { type: "stock", name: "TCS", category: "equity" },
  { type: "stock", name: "HDFC Bank", category: "equity" },
  { type: "stock", name: "Infosys", category: "equity" },
  { type: "stock", name: "ITC", category: "equity" },
  { type: "fd", name: "SBI Fixed Deposit", category: "debt" },
  { type: "fd", name: "HDFC Bank FD", category: "debt" },
  { type: "fd", name: "Post Office FD", category: "debt" },
  { type: "ppf", name: "Public Provident Fund", category: "debt" },
  { type: "epf", name: "Employee Provident Fund", category: "debt" },
  { type: "nps", name: "National Pension System", category: "debt" },
  { type: "gold", name: "Sovereign Gold Bond (SGB)", category: "gold" },
  { type: "gold", name: "Gold ETF", category: "gold" },
  { type: "real_estate", name: "Residential Property", category: "real_estate" },
];

export const riskProfiles: { value: RiskProfile; label: string; description: string }[] = [
  { value: "conservative", label: "Conservative", description: "Prefer safety over high returns" },
  { value: "moderate", label: "Moderate", description: "Balanced approach with some risk" },
  { value: "aggressive", label: "Aggressive", description: "Willing to take higher risk for returns" },
];

export const investmentGoals: { value: InvestmentGoal; label: string }[] = [
  { value: "retirement", label: "Retirement" },
  { value: "child_education", label: "Child's Education" },
  { value: "house", label: "Buy a House" },
  { value: "wealth_creation", label: "Wealth Creation" },
  { value: "emergency_fund", label: "Emergency Fund" },
  { value: "other", label: "Other" },
];
