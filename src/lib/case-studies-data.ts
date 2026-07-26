export type CaseStudy = {
  id: string;
  name: string;
  title: string;
  category: "retirement" | "sip" | "tax" | "loan" | "goals";
  categoryLabel: string;
  age: number;
  city: string;
  occupation: string;
  summary: string;
  quote: string;
  quoteAuthor: string;
  keyMetric: string;
  keyMetricLabel: string;
  story: string[];
  metrics: { label: string; before: string; after: string }[];
  calculatorHref: string;
  calculatorName: string;
};

export const caseStudies: CaseStudy[] = [
  {
    id: "ravi-sip",
    name: "Ravi",
    title: "How Ravi Built \u20b93.54 Crore with a \u20b910,000 SIP",
    category: "sip",
    categoryLabel: "SIP Investment",
    age: 55,
    city: "Bangalore",
    occupation: "Software Engineer",
    summary:
      "Ravi started a \u20b910,000 monthly SIP at age 25 in a diversified equity fund. After 30 years of consistent investing at 12% average returns, his total investment of \u20b936 lakh grew to \u20b93.54 crore \u2014 nearly 10x his investment.",
    quote:
      "I never thought \u20b910,000 a month could become crores. RupeeMap showed me the power of compounding and I just stayed the course.",
    quoteAuthor: "Ravi, 55, Bangalore",
    keyMetric: "\u20b93.54 Cr",
    keyMetricLabel: "Final Corpus",
    story: [
      "Ravi joined a software company in Bangalore at age 22 with a salary of \u20b925,000 per month. Like most fresh graduates, he spent most of his income on rent, food, and entertainment.",
      "At 25, a colleague introduced him to mutual fund SIPs. Skeptical but curious, Ravi used RupeeMap\u2019s SIP Calculator to see what \u20b910,000 monthly could become. The result shocked him \u2014 \u20b93.54 crore by age 55.",
      "He started his SIP in a diversified equity fund earning approximately 12% annually. The key was consistency \u2014 he never stopped, even during market crashes in 2008 and 2020.",
      "By age 45, his SIP had already grown to \u20b91.2 crore. By 55, it reached \u20b93.54 crore from a total investment of just \u20b936 lakh.",
      "Ravi now uses RupeeMap\u2019s SWP Calculator to plan his retirement withdrawals, ensuring his corpus lasts until age 85.",
    ],
    metrics: [
      { label: "Monthly SIP", before: "\u20b90", after: "\u20b910,000" },
      { label: "Total Invested", before: "\u20b90", after: "\u20b936 Lakh" },
      { label: "Final Corpus", before: "\u20b90", after: "\u20b93.54 Crore" },
      { label: "Returns Multiple", before: "\u2014", after: "9.8x" },
    ],
    calculatorHref: "/sip-calculator",
    calculatorName: "SIP Calculator",
  },
  {
    id: "priya-tax",
    name: "Priya",
    title: "How Priya Saved \u20b946,800/Year in Tax with ELSS",
    category: "tax",
    categoryLabel: "Tax Planning",
    age: 32,
    city: "Mumbai",
    occupation: "Product Manager",
    summary:
      "Priya was investing \u20b91.5 lakh in PPF for Section 80C but had no growth. She switched \u20b91 lakh to ELSS funds, saving the same tax while potentially earning 12\u201315% returns instead of 7.1%.",
    quote:
      "RupeeMap\u2019s tax calculator showed me I was leaving money on the table. Same tax benefit, but ELSS gives me market returns instead of PPF rates.",
    quoteAuthor: "Priya, 32, Mumbai",
    keyMetric: "\u20b946,800",
    keyMetricLabel: "Annual Tax Saved",
    story: [
      "Priya earned \u20b918 LPA as a product manager in Mumbai. She was diligently investing \u20b91.5 lakh per year in PPF to claim Section 80C deduction, but her money was locked at 7.1% returns.",
      "Using RupeeMap\u2019s Old vs New Regime Calculator, she realized she could get the same \u20b91.5 lakh deduction through ELSS mutual funds \u2014 with potentially 12\u201315% returns.",
      "She moved \u20b91 lakh from PPF to ELSS and kept \u20b950,000 in PPF for diversification. Her tax saving remained \u20b946,800 (30% bracket + cess), but her money was now working harder.",
      "After 3 years, her ELSS investment had grown 42% compared to 22% in PPF \u2014 the same tax benefit with significantly better wealth creation.",
    ],
    metrics: [
      { label: "Annual 80C Investment", before: "\u20b91.5L (PPF only)", after: "\u20b91L ELSS + \u20b950K PPF" },
      { label: "Tax Saved (30% bracket)", before: "\u20b946,800", after: "\u20b946,800" },
      { label: "3-Year Returns", before: "22% (PPF)", after: "42% (ELSS)" },
      { label: "Lock-in Period", before: "15 years", after: "3 years (ELSS)" },
    ],
    calculatorHref: "/old-vs-new-regime",
    calculatorName: "Old vs New Regime Calculator",
  },
  {
    id: "kumars-home-loan",
    name: "The Kumars",
    title: "The Kumars Paid Off Their Home Loan 7 Years Early",
    category: "loan",
    categoryLabel: "Loan Management",
    age: 40,
    city: "Pune",
    occupation: "Double Income Couple",
    summary:
      "The Kumars took a \u20b950 lakh home loan at 8.5% for 20 years. Using RupeeMap\u2019s Prepayment Calculator, they figured out that adding just \u20b915,000/month as prepayment would close the loan 7 years early and save \u20b912 lakh in interest.",
    quote:
      "We had no idea that \u20b915,000 extra per month would save us 7 years and \u20b912 lakh. The calculator made it so clear.",
    quoteAuthor: "Anita Kumar, 40, Pune",
    keyMetric: "\u20b912 Lakh",
    keyMetricLabel: "Interest Saved",
    story: [
      "The Kumars bought their dream home in Pune for \u20b965 lakh in 2018, taking a \u20b950 lakh loan at 8.5% for 20 years. Their EMI was \u20b943,391.",
      "After 2 years, they received annual bonuses and wondered whether to prepay the loan or invest. They used RupeeMap\u2019s Prepayment Calculator to compare scenarios.",
      "The calculator showed that adding \u20b915,000/month as prepayment would close the loan in 13 years instead of 20 \u2014 saving \u20b912.4 lakh in interest.",
      "They set up auto-debit for the prepayment and tracked progress on RupeeMap. By 2031, they were debt-free \u2014 7 years ahead of schedule.",
      "The freed-up EMI of \u20b943,391 now goes into their retirement SIP, accelerating their wealth building.",
    ],
    metrics: [
      { label: "Original Tenure", before: "20 years", after: "13 years" },
      { label: "Monthly Prepayment", before: "\u20b90", after: "\u20b915,000" },
      { label: "Interest Saved", before: "\u2014", after: "\u20b912.4 Lakh" },
      { label: "Loan Closed", before: "2038", after: "2031" },
    ],
    calculatorHref: "/prepayment",
    calculatorName: "Prepayment Calculator",
  },
  {
    id: "arjun-fire",
    name: "Arjun",
    title: "Arjun Retired at 35 Using SIP + SWP Strategy",
    category: "retirement",
    categoryLabel: "Early Retirement",
    age: 35,
    city: "Hyderabad",
    occupation: "IT Architect",
    summary:
      "Arjun saved aggressively from age 25, investing \u20b950,000/month in SIPs. By 35, he had built \u20b91.85 crore and used RupeeMap\u2019s SWP Calculator to plan monthly withdrawals of \u20b975,000 until traditional retirement age.",
    quote:
      "RupeeMap\u2019s stochastic calculator showed me the probability of my money lasting. That confidence let me take the leap.",
    quoteAuthor: "Arjun, 35, Hyderabad",
    keyMetric: "\u20b91.85 Cr",
    keyMetricLabel: "FIRE Corpus",
    story: [
      "Arjun worked as an IT architect in Hyderabad, earning \u20b935 LPA. From age 25, he lived below his means and invested \u20b950,000 monthly in a mix of equity and balanced funds.",
      "By 33, his corpus had crossed \u20b91.5 crore. He started questioning whether he could retire early. Using RupeeMap\u2019s What-if Calculator, he ran 10,000 simulations.",
      "The results showed an 87% success rate for his money lasting until age 65 with \u20b975,000 monthly withdrawals. He adjusted his plan \u2014 increasing corpus to \u20b91.85 crore for 92% success.",
      "At 35, Arjun resigned. He now uses RupeeMap\u2019s SWP Calculator to manage monthly withdrawals and rebalance between equity and debt as markets move.",
    ],
    metrics: [
      { label: "Monthly SIP", before: "\u20b950,000", after: "\u20b90 (retired)" },
      { label: "FIRE Corpus", before: "\u20b90", after: "\u20b91.85 Crore" },
      { label: "Monthly SWP", before: "\u2014", after: "\u20b975,000" },
      { label: "Success Probability", before: "\u2014", after: "92%" },
    ],
    calculatorHref: "/what-if",
    calculatorName: "What-if Calculator",
  },
  {
    id: "meera-tax-regime",
    name: "Meera",
    title: "How Meera Chose the Right Tax Regime",
    category: "tax",
    categoryLabel: "Tax Optimization",
    age: 28,
    city: "Chennai",
    occupation: "Data Analyst",
    summary:
      "Meera earned \u20b912 LPA and was confused about Old vs New tax regime. RupeeMap\u2019s calculator showed her that the New Regime saved her \u20b932,000 more because she had no major deductions under 80C or HRA.",
    quote:
      "I was blindly following my parents\u2019 advice to use the Old Regime. RupeeMap showed me the New Regime saves \u20b932,000 more with my situation.",
    quoteAuthor: "Meera, 28, Chennai",
    keyMetric: "\u20b932,000",
    keyMetricLabel: "Annual Savings",
    story: [
      "Meera was a data analyst in Chennai earning \u20b912 LPA. Her parents always told her to invest in PPF and claim HRA to benefit from the Old Tax Regime.",
      "But Meera lived with her parents (no HRA), had no home loan, and only \u20b950,000 in PPF. She used RupeeMap\u2019s Old vs New Regime Calculator to compare.",
      "The result was clear: New Regime saved her \u20b932,000 more per year because the lower tax rates outweighed her minimal deductions.",
      "She switched to the New Regime and invested the \u20b932,000 annual savings into an ELSS fund \u2014 getting both tax savings and market returns.",
    ],
    metrics: [
      { label: "Gross Income", before: "\u20b912 LPA", after: "\u20b912 LPA" },
      { label: "Old Regime Tax", before: "\u20b91,17,000", after: "\u2014" },
      { label: "New Regime Tax", before: "\u2014", after: "\u20b985,000" },
      { label: "Annual Savings", before: "\u2014", after: "\u20b932,000" },
    ],
    calculatorHref: "/old-vs-new-regime",
    calculatorName: "Old vs New Regime Calculator",
  },
  {
    id: "sharmas-education",
    name: "The Sharmas",
    title: "The Sharmas Built a \u20b92 Crore Education Fund",
    category: "goals",
    categoryLabel: "Goal Planning",
    age: 45,
    city: "Delhi",
    occupation: "Government Employee + Teacher",
    summary:
      "The Sharmas started planning for their two children\u2019s education when the kids were 5 and 8. Using RupeeMap\u2019s Goal Planner, they invested \u20b925,000/month and built a \u20b92 crore fund by the time the children turned 18 and 21.",
    quote:
      "We started small \u2014 just \u20b925,000/month. RupeeMap showed us exactly how much we needed and kept us on track for 13 years.",
    quoteAuthor: "Vikram Sharma, 45, Delhi",
    keyMetric: "\u20b92 Crore",
    keyMetricLabel: "Education Fund",
    story: [
      "Vikram, a government employee, and Sunita, a school teacher, earned a combined \u20b920 LPA in Delhi. They wanted both children to have the best education \u2014 including potential study abroad.",
      "Using RupeeMap\u2019s Goal Planner, they calculated they needed \u20b91.5 crore for the older child (MBA) and \u20b91 crore for the younger (engineering). Total: \u20b92 crore in 13 years.",
      "They started a \u20b925,000 monthly SIP split between equity (70%) and balanced funds (30%). RupeeMap\u2019s step-up SIP calculator showed that increasing by 10% annually would help them reach the goal.",
      "After 13 years, their corpus had grown to \u20b92.1 crore \u2014 exceeding their target. The older child went to a top MBA college, and the younger is pursuing engineering.",
    ],
    metrics: [
      { label: "Monthly SIP", before: "\u20b925,000", after: "\u20b925,000 (stepped up 10%/yr)" },
      { label: "Time Horizon", before: "13 years", after: "13 years" },
      { label: "Target Corpus", before: "\u20b92 Crore", after: "\u20b92.1 Crore" },
      { label: "Goal Status", before: "\u2014", after: "Achieved" },
    ],
    calculatorHref: "/goal-planner",
    calculatorName: "Goal Planner",
  },
];

export const categories = [
  { id: "all", label: "All Stories" },
  { id: "sip", label: "SIP Investment" },
  { id: "tax", label: "Tax Planning" },
  { id: "loan", label: "Loan Management" },
  { id: "retirement", label: "Early Retirement" },
  { id: "goals", label: "Goal Planning" },
] as const;
