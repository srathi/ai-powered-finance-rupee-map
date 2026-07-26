export type RoadmapColumn = "ideas" | "coming-soon" | "in-progress" | "shipped";

export type RoadmapFeature = {
  id: string;
  title: string;
  description: string;
  category: string;
  column: RoadmapColumn;
};

export const roadmapFeatures: RoadmapFeature[] = [
  // Your Ideas
  {
    id: "idea-mf-compare",
    title: "Mutual Fund Comparison Tool",
    description: "Compare up to 3 mutual funds side by side with returns, risk, and overlap analysis.",
    category: "Investment",
    column: "ideas",
  },
  {
    id: "idea-tax-filing",
    title: "Tax Filing Integration",
    description: "Auto-populate tax data from calculators for ITR filing preparation.",
    category: "Tax",
    column: "ideas",
  },
  {
    id: "idea-multi-currency",
    title: "Multi-currency Support",
    description: "Support for NRI users with USD, EUR, GBP conversion and international tax rules.",
    category: "General",
    column: "ideas",
  },
  {
    id: "idea-family",
    title: "Family Account Sharing",
    description: "Share financial plans with spouse or family members with collaborative editing.",
    category: "General",
    column: "ideas",
  },
  {
    id: "idea-ai-recommendations",
    title: "AI-Powered Fund Recommendations",
    description: "ArthaAI suggests specific mutual funds based on your risk profile and goals.",
    category: "AI",
    column: "ideas",
  },

  // Coming Soon
  {
    id: "cs-step-up-sip",
    title: "Step-Up SIP Calculator",
    description: "Auto-increase your SIP annually with salary hikes to build wealth faster.",
    category: "Calculators",
    column: "coming-soon",
  },
  {
    id: "cs-tax-regime",
    title: "Tax Regime Comparator",
    description: "Detailed Old vs New regime comparison with break-even analysis and deductions.",
    category: "Tax",
    column: "coming-soon",
  },
  {
    id: "cs-home-prepay",
    title: "Home Loan Prepayment Analyzer",
    description: "See how prepayments, balance transfers, and EMI increases save lakhs.",
    category: "Loan",
    column: "coming-soon",
  },
  {
    id: "cs-fire-calc",
    title: "FIRE Number Calculator",
    description: "Calculate your Financial Independence number with Monte Carlo simulation.",
    category: "Retirement",
    column: "coming-soon",
  },
  {
    id: "cs-gold",
    title: "Gold Investment Calculator",
    description: "Compare SGB vs physical gold vs ETF with returns and tax implications.",
    category: "Investment",
    column: "coming-soon",
  },
  {
    id: "cs-child-edu",
    title: "Child Education Goal Planner",
    description: "Plan for engineering, MBA, or study abroad with inflation-adjusted projections.",
    category: "Goals",
    column: "coming-soon",
  },

  // In Progress
  {
    id: "ip-dark-mode",
    title: "Dark Mode Improvements",
    description: "Refined color palette and better contrast across all calculator pages.",
    category: "Design",
    column: "in-progress",
  },
  {
    id: "ip-mobile",
    title: "Mobile App Optimization",
    description: "Improved touch interactions, larger inputs, and faster load times on mobile.",
    category: "General",
    column: "in-progress",
  },
  {
    id: "ip-pdf-export",
    title: "Export to PDF for All Calculators",
    description: "Download calculation results as a professional PDF report with charts.",
    category: "General",
    column: "in-progress",
  },

  // Recently Shipped
  {
    id: "sh-arthaai",
    title: "ArthaAI Chatbot",
    description: "AI-powered financial assistant with RAG on research papers and Indian context.",
    category: "AI",
    column: "shipped",
  },
  {
    id: "sh-stock",
    title: "Stock Price Lookup",
    description: "Real-time NSE/BSE stock prices with autocomplete search.",
    category: "Investment",
    column: "shipped",
  },
  {
    id: "sh-kids-learn",
    title: "15 Kids Finance Lessons",
    description: "Interactive financial literacy courses with quizzes and badges for ages 8-15.",
    category: "Learn",
    column: "shipped",
  },
  {
    id: "sh-general-learn",
    title: "7 General Finance Articles",
    description: "In-depth guides on budgeting, SIPs, taxes, insurance, debt, and real estate.",
    category: "Learn",
    column: "shipped",
  },
];

export const roadmapCategories = [
  "All",
  "Calculators",
  "Tax",
  "Loan",
  "Investment",
  "Retirement",
  "Goals",
  "AI",
  "Learn",
  "Design",
  "General",
] as const;

export const columns: { id: RoadmapColumn; title: string; description: string }[] = [
  {
    id: "ideas",
    title: "Your Ideas",
    description: "Community-submitted features. Vote for what matters most.",
  },
  {
    id: "coming-soon",
    title: "Coming Soon",
    description: "Next up on our development queue.",
  },
  {
    id: "in-progress",
    title: "In Progress",
    description: "Currently being built and tested.",
  },
  {
    id: "shipped",
    title: "Recently Shipped",
    description: "What just launched in the latest updates.",
  },
];
