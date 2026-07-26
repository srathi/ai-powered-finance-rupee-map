import { LucideIcon } from "lucide-react";

export interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  category: CalculatorCategory;
  href: string;
  icon: LucideIcon;
  tags: string[];
}

export type CalculatorCategory =
  | "investment"
  | "loans"
  | "retirement"
  | "tax"
  | "savings"
  | "insurance"
  | "business"
  | "general";

export interface CategoryConfig {
  id: CalculatorCategory;
  name: string;
  description: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "investment", name: "Investment", description: "SIP, Lumpsum, SWP, Returns & more" },
  { id: "loans", name: "Loans", description: "EMI, Home Loan, Car Loan & more" },
  { id: "retirement", name: "Retirement", description: "Corpus, Pension, FIRE & more" },
  { id: "tax", name: "Tax", description: "Income Tax, HRA, Gratuity & more" },
  { id: "savings", name: "Savings", description: "FD, RD, PPF, EPF, NPS & more" },
  { id: "insurance", name: "Insurance", description: "Life, Term, Health & more" },
  { id: "business", name: "Business", description: "GST, Break-even, Profit & more" },
  { id: "general", name: "General Finance", description: "Inflation, Interest, Rule of 72 & more" },
];
