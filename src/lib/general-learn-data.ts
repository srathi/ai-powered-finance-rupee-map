export interface ArticleSection {
  heading?: string;
  body: string;
}

export interface GeneralTopic {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  readTime: string;
  tags: string[];
  sections: ArticleSection[];
}

export const generalTopics: GeneralTopic[] = [
  {
    slug: "budgeting-101",
    title: "Budgeting 101",
    subtitle: "Take control of your money with a simple system",
    icon: "📊",
    readTime: "8 min read",
    tags: ["Personal Finance", "Beginner"],
    sections: [
      {
        heading: "Why Budgeting Matters",
        body: "A budget is simply a plan for your money. Without one, you might wonder where your salary went by the end of the month. With one, you know exactly where every rupee goes — and you stay in control.\n\nThink of it like a roadmap. You wouldn't drive to a new city without GPS. A budget is your financial GPS.",
      },
      {
        heading: "The 50/30/20 Rule",
        body: "The simplest budgeting framework is the 50/30/20 rule:\n\n• **50% for Needs** — Rent, groceries, electricity, school fees, transport. Things you MUST pay for.\n• **30% for Wants** — Dining out, movies, shopping, subscriptions. Things you enjoy but can live without.\n• **20% for Savings & Debt** — SIPs, FDs, emergency fund, or paying off loans.\n\n**Example:** If your take-home salary is ₹60,000:\n- Needs: ₹30,000 (rent ₹15,000, groceries ₹8,000, electricity ₹2,000, transport ₹5,000)\n- Wants: ₹18,000 (dining out ₹6,000, shopping ₹5,000, entertainment ₹4,000, subscriptions ₹3,000)\n- Savings: ₹12,000 (SIP ₹8,000, emergency fund ₹4,000)",
      },
      {
        heading: "Step-by-Step: Make Your First Budget",
        body: "**Step 1: Track everything for 30 days**\nWrite down every expense — every chai, every auto ride, every online order. Use a notes app or a simple notebook.\n\n**Step 2: Categorise**\nGroup your expenses into Needs, Wants, and Savings. Be honest — Netflix is a want, not a need!\n\n**Step 3: Set limits**\nDecide how much you'll spend in each category. If you overspend one month, adjust the next.\n\n**Step 4: Review monthly**\nAt the end of each month, compare what you planned vs what you actually spent. This is where the magic happens — you start seeing patterns.",
      },
      {
        heading: "Real-World Example: Rahul's Budget",
        body: "Rahul is a 28-year-old software engineer in Bangalore. His take-home is ₹75,000/month.\n\n**Before budgeting:**\n- He spent ₹12,000 on Swiggy/Zomato\n- ₹8,000 on impulse Amazon buys\n- ₹5,000 on Uber rides\n- Had ₹0 in savings after 3 years of working\n\n**After budgeting (50/30/20):**\n- Needs: ₹37,500 (rent ₹18,000, groceries ₹7,000, utilities ₹3,000, transport ₹5,000, phone ₹1,500, insurance ₹3,000)\n- Wants: ₹22,500 (food delivery ₹6,000, shopping ₹4,000, entertainment ₹5,000, outings ₹4,500, subscriptions ₹3,000)\n- Savings: ₹15,000 (emergency fund ₹5,000, SIP ₹10,000)\n\n**Result after 1 year:** ₹1,80,000 in savings + investment. He never felt deprived because his \"wants\" budget was still generous.",
      },
      {
        heading: "Common Mistakes to Avoid",
        body: "1. **Being too strict** — If your budget feels like a punishment, you'll quit. Allow some fun money.\n2. **Forgetting irregular expenses** — Diwali gifts, annual insurance, birthday parties. Budget for these monthly.\n3. **Not tracking small spends** — ₹50 chai × 30 days = ₹1,500/month. Small spends add up.\n4. **Giving up after one bad month** — Budgeting is a skill. It takes 3-4 months to get good at it.\n5. **Not involving your partner** — If you share finances, budget together.",
      },
    ],
  },
  {
    slug: "emergency-fund",
    title: "Emergency Fund",
    subtitle: "Your financial safety net for life's surprises",
    icon: "🛡️",
    readTime: "7 min read",
    tags: ["Savings", "Essential"],
    sections: [
      {
        heading: "What is an Emergency Fund?",
        body: "An emergency fund is money you set aside for unexpected events — job loss, medical emergency, car repair, or any unplanned expense. It's your financial buffer between you and disaster.\n\nWithout an emergency fund, you might have to:\n- Borrow money at high interest rates\n- Break your long-term investments\n- Panic-sell stocks at a loss\n- Depend on family or friends",
      },
      {
        heading: "How Much Do You Need?",
        body: "The standard rule: **3 to 6 months of essential expenses**.\n\nCalculate your monthly essential expenses:\n- Rent: ₹15,000\n- Groceries: ₹8,000\n- Utilities: ₹3,000\n- Transport: ₹4,000\n- Insurance: ₹3,000\n- EMI payments: ₹12,000\n- **Total: ₹45,000/month**\n\nYour emergency fund should be: ₹45,000 × 6 = **₹2,70,000**\n\n**When to aim for more:**\n- Freelancer or variable income → 9-12 months\n- Sole earner in family → 9-12 months\n- Dual income household → 3-4 months may suffice",
      },
      {
        heading: "Where to Keep It",
        body: "Your emergency fund needs to be **liquid** (accessible quickly) and **safe** (won't lose value). Best options:\n\n1. **High-yield savings account** — Earns 3-4% interest, instantly accessible. Best for the first 1-2 months' expenses.\n2. **Liquid mutual funds** — Earns 5-7%, redeemed within 24 hours. Good for the bulk of your fund.\n3. **Sweep-in fixed deposit** — Auto-sweeps excess into FD, earns more interest. Accessible within a day.\n\n**Avoid:**\n- Stocks (value can drop when you need it)\n- PPF/ELSS (locked in for years)\n- Under the mattress (no growth, theft risk)",
      },
      {
        heading: "How to Build It",
        body: "**Method 1: Auto-transfer**\nSet up an auto-debit of ₹5,000-10,000 to a separate savings account on salary day. Treat it like a bill you must pay.\n\n**Method 2: Windfall routing**\nGot a bonus? Tax refund? Birthday money from grandparents? Put 50% directly into your emergency fund.\n\n**Method 3: The 52-week challenge**\nWeek 1: Save ₹10. Week 2: ₹20. Week 3: ₹30. By week 52, you'll have ₹13,780!\n\n**Real example:** Priya, a teacher in Mumbai, built her ₹2 lakh emergency fund in 18 months by自动transferring ₹12,000/month and routing 50% of all bonuses. She says sleeping peacefully is worth every rupee.",
      },
      {
        heading: "When to Use It (and When Not To)",
        body: "**USE it for:**\n- Job loss (covers expenses while you search)\n- Medical emergency (hospital bills, medicines)\n- Major home/car repair\n- Essential travel (family emergency)\n\n**DON'T use it for:**\n- Vacations\n- Shopping sales\n- Down payment on a house\n- Investing opportunities\n- \"I just really want it\"\n\nThe rule: If it's not keeping a roof over your head, food on your table, or your family safe — it's not an emergency.",
      },
    ],
  },
  {
    slug: "power-of-sip",
    title: "The Power of SIP",
    subtitle: "How small, regular investments build serious wealth",
    icon: "📈",
    readTime: "9 min read",
    tags: ["Investing", "Beginner"],
    sections: [
      {
        heading: "What is a SIP?",
        body: "SIP stands for **Systematic Investment Plan**. It's a way to invest a fixed amount regularly (monthly or weekly) into mutual funds.\n\nInstead of trying to time the market (\"Should I invest now or wait?\"), you invest the same amount every month. When the market is high, your money buys fewer units. When it's low, it buys more. Over time, this averages out — and you don't have to stress about when to invest.",
      },
      {
        heading: "Why SIPs Work: The Math",
        body: "Let's say you invest ₹5,000/month in a SIP that earns 12% annually:\n\n| Year | You Invested | Value |\n|------|-------------|-------|\n| 1 | ₹60,000 | ₹63,000 |\n| 5 | ₹3,00,000 | ₹4,40,000 |\n| 10 | ₹6,00,000 | ₹11,60,000 |\n| 15 | ₹9,00,000 | ₹25,00,000 |\n| 20 | ₹12,00,000 | ₹49,00,000 |\n| 30 | ₹18,00,000 | ₹1,76,00,000 |\n\nYou invested ₹18 lakh over 30 years. You got ₹1.76 crore back. That's compounding doing the heavy lifting.",
      },
      {
        heading: "Real-World Example: Amit's Story",
        body: "Amit started a ₹3,000/month SIP when he was 25. His friend Rohan started a ₹10,000/month SIP at 35. Both invested until 60.\n\n**Amit:** ₹3,000 × 360 months = ₹10.8 lakh invested → **₹1.4 crore** (at 12% returns)\n**Rohan:** ₹10,000 × 300 months = ₹30 lakh invested → **₹85 lakh** (at 12% returns)\n\nAmit invested ONE-THIRD of what Rohan invested but ended up with 65% MORE money. The 10-year head start made all the difference.",
      },
      {
        heading: "How to Start a SIP",
        body: "**Step 1: Choose a fund**\nFor beginners, start with:\n- **Index fund** (Nifty 50 or Sensex) — low cost, tracks the market\n- **Large-cap fund** — invests in India's biggest companies\n- **Flexi-cap fund** — mix of large, mid, and small companies\n\n**Step 2: Choose an amount**\nStart with what you can afford — even ₹500/month is fine. You can increase later.\n\n**Step 3: Set up auto-debit**\nMost apps (Groww, Zerodha, Kuvera, Paytm Money) let you automate SIPs. Set it and forget it.\n\n**Step 4: Don't touch it**\nThe hardest part. Don't check daily. Don't panic during market crashes. Don't stop when the news is bad. Let it grow.",
      },
      {
        heading: "Step-Up SIP: The Secret Weapon",
        body: "A **step-up SIP** increases your investment by a fixed percentage each year. Even a 10% annual step-up dramatically changes your wealth.\n\n**Example:** ₹5,000/month SIP at 12% for 30 years:\n- Regular SIP: ₹1.76 crore\n- 10% step-up SIP: ₹5.6 crore\n\nYou only invested ₹25 lakh more (with the step-up) but got ₹3.84 crore more. That's the power of increasing your investments as your salary grows.\n\n**Practical tip:** Every time you get a raise, increase your SIP by at least half the raise amount. You won't miss the money, and your future self will thank you.",
      },
      {
        heading: "Common SIP Mistakes",
        body: "1. **Stopping during market crashes** — Crashes are when your SIP buys MORE units at cheaper prices. Stopping is the worst thing you can do.\n2. **Checking returns daily** — SIPs are long-term. Check quarterly at most.\n3. **Not increasing with salary** — A ₹5,000 SIP from 2015 is worth less today due to inflation. Step up annually.\n4. **Chasing last year's best fund** — Past performance doesn't guarantee future returns. Stick with a consistent approach.\n5. **Waiting for the \"right time\"** — The best time was yesterday. The second best time is today.",
      },
    ],
  },
  {
    slug: "understanding-taxes",
    title: "Understanding Income Tax",
    subtitle: "How tax actually works and how to plan smarter",
    icon: "🏛️",
    readTime: "10 min read",
    tags: ["Tax", "Intermediate"],
    sections: [
      {
        heading: "How Income Tax Works",
        body: "Income tax is what you pay to the government on your earnings. The more you earn, the higher the percentage — this is called a **progressive tax system**.\n\n**FY 2024-25 New Regime slabs:**\n- ₹0 - ₹3,00,000: **0%** (no tax)\n- ₹3,00,001 - ₹7,00,000: **5%**\n- ₹7,00,001 - ₹10,00,000: **10%**\n- ₹10,00,001 - ₹12,00,000: **15%**\n- ₹12,00,001 - ₹15,00,000: **20%**\n- Above ₹15,00,000: **30%**\n\nPlus **4% Health & Education Cess** on total tax.",
      },
      {
        heading: "Old vs New Regime",
        body: "You have two tax regimes to choose from:\n\n**New Regime (default from FY 2023-24):**\n- Lower tax rates\n- But you lose most deductions (80C, 80D, HRA, etc.)\n- Standard deduction of ₹75,000\n- Rebate up to ₹7 lakh (no tax if income ≤ ₹7 lakh)\n\n**Old Regime:**\n- Higher tax rates\n- But you get deductions: 80C (₹1.5 lakh), 80D (₹25K-1L), HRA, LTA, etc.\n- Better if you have high deductions\n\n**How to decide:** Calculate your tax under both regimes. Use our [Old vs New Regime Calculator](/old-vs-new-regime) to compare.",
      },
      {
        heading: "Real-World Example: Sneha's Tax",
        body: "Sneha earns ₹12,00,000 gross salary. Let's calculate her tax under both regimes.\n\n**New Regime:**\n- Standard deduction: ₹75,000\n- Taxable income: ₹11,25,000\n- Tax:\n  - First ₹3L: ₹0\n  - ₹3L-₹7L: ₹20,000 (5%)\n  - ₹7L-₹10L: ₹30,000 (10%)\n  - ₹10L-₹11.25L: ₹18,750 (15%)\n  - **Total tax: ₹68,750 + 4% cess = ₹71,500**\n\n**Old Regime (with deductions):**\n- 80C: ₹1,50,000 (EPF + PPF)\n- 80D: ₹25,000 (health insurance)\n- HRA: ₹1,50,000\n- Taxable income: ₹7,25,000\n- Tax:\n  - First ₹2.5L: ₹0\n  - ₹2.5L-₹5L: ₹12,500 (5%)\n  - ₹5L-₹7.25L: ₹22,500 (20%)\n  - **Total tax: ₹35,000 + 4% cess = ₹36,400**\n\nSneha saves ₹35,100 by choosing the old regime.",
      },
      {
        heading: "Section 80C: Your Best Friend",
        body: "Section 80C lets you reduce taxable income by up to ₹1,50,000. Popular options:\n\n| Investment | Lock-in | Returns | Risk |\n|-----------|---------|---------|------|\n| EPF | Until retirement | ~8.1% | Zero |\n| PPF | 15 years | ~7.1% | Zero |\n| ELSS | 3 years | 12-15% (avg) | Market-linked |\n| NSC | 5 years | ~7.7% | Zero |\n| Sukanya Samriddhi | Until 21 years | ~8.2% | Zero |\n| Tax-saver FD | 5 years | ~7% | Zero |\n\n**Pro tip:** ELSS (Equity Linked Savings Scheme) gives you the best of both worlds — tax saving + potential for higher returns. But it has market risk.",
      },
      {
        heading: "Smart Tax Planning Tips",
        body: "1. **Plan in April, not March** — Most people scramble in March. Start at the beginning of the financial year.\n\n2. **Use the right regime** — Don't blindly follow what your colleague does. Calculate for YOUR situation.\n\n3. **Don't invest just for tax saving** — Buying a random insurance policy or ELSS just to save tax is bad investing. Invest because it's good, tax saving is a bonus.\n\n4. **Keep documents ready** — Rent receipts, investment proofs, insurance policies. Organise them monthly.\n\n5. **Use HRA wisely** — If you pay rent to parents, you can claim HRA. But parents must show it as income.\n\n6. **Don't forget 80D** — Health insurance premiums are deductible (₹25K for self, ₹50K for parents).",
      },
    ],
  },
  {
    slug: "insurance-guide",
    title: "Insurance Decoded",
    subtitle: "What you actually need and what's a waste of money",
    icon: "🏥",
    readTime: "8 min read",
    tags: ["Insurance", "Essential"],
    sections: [
      {
        heading: "Insurance is Protection, Not Investment",
        body: "The biggest mistake Indians make with insurance is buying it for tax saving or returns. Insurance is NOT an investment. It's a safety net.\n\n**The rule:** Buy insurance to protect against financial disaster. Invest separately for wealth building.\n\n**What insurance does:** If something bad happens (death, illness, accident), the insurance company pays so your family doesn't go broke.\n\n**What insurance doesn't do:** Make you rich. Most insurance policies give terrible returns compared to mutual funds.",
      },
      {
        heading: "The 3 Must-Have Policies",
        body: "**1. Term Life Insurance** 🏠\n- What: If you die, your family gets a lump sum\n- How much: 10-15x your annual income\n- Cost: ₹500-800/month for a ₹1 crore cover (if you're 25-30)\n- When: As soon as you have dependents\n- Example: 28-year-old, ₹10L salary → ₹1-1.5 Cr term plan → ~₹700/month\n\n**2. Health Insurance** 🏥\n- What: Covers hospital bills\n- How much: ₹10-25 lakh minimum (₹50L+ in metros)\n- Cost: ₹8,000-15,000/year for family floater\n- When: Immediately — don't wait\n- Note: Don't rely only on employer health insurance. Get your own.\n\n**3. Motor Insurance (Third Party)** 🚗\n- What: Legally required. Covers damage you cause to others.\n- Cost: ₹2,000-5,000/year for cars\n- When: As soon as you buy a vehicle",
      },
      {
        heading: "Policies You Probably Don't Need",
        body: "1. **Money-back policies** — Low returns (3-4%), high premiums. You're better off buying term + investing the difference.\n\n2. **Endowment plans** — Same problem. The 'guaranteed returns' are actually lower than FD rates.\n\n3. **ULIPs (Unit Linked Insurance Plans)** — High charges (2-3% annually), lock-in of 5 years, mediocre returns. Insurance and investing should be separate.\n\n4. **Personal accident insurance** — Usually redundant if you have health insurance and term insurance.\n\n5. **Car insurance (comprehensive) for old cars** — If your car is 7+ years old, the premium may be higher than the car's value. Switch to third-party only.",
      },
      {
        heading: "Real-World Example: The Patel Family",
        body: "The Patels — both aged 32, two kids, combined income ₹18L/year. They were paying ₹45,000/year for a money-back policy and ₹12,000/year for a ULIP.\n\n**Our recommendation:**\n- Cancel money-back policy (surrender value: ₹60,000 — painful but necessary)\n- Cancel ULIP (after lock-in)\n- Buy: ₹1 Cr term insurance each → ₹14,000/year\n- Buy: ₹20L family floater health insurance → ₹15,000/year\n- Invest the savings in SIPs → ₹28,000/year\n\n**After 20 years:**\n- Old plan: ₹57,000/year × 20 = ₹11.4L invested → ~₹15L maturity\n- New plan: ₹29,000/year insurance + ₹28,000/year SIP → Insurance coverage + ~₹22L from SIPs\n\nBetter protection AND better returns.",
      },
      {
        heading: "How to Buy Smart",
        body: "1. **Buy early** — Premiums increase with age. A 25-year-old pays half what a 35-year-old pays.\n\n2. **Buy online** — Online policies are 20-30% cheaper than agent-sold ones.\n\n3. **Don't mix insurance and investment** — Buy term insurance for protection. Invest in mutual funds for growth.\n\n4. **Read the fine print** — What's excluded? What's the claim process? What documents are needed?\n\n5. **Review annually** — As your income grows, increase your term insurance cover.\n\n6. **Use our calculators:**\n- [Term Insurance Calculator](/term-insurance)\n- [Health Insurance Need](/health-insurance)\n- [Life Insurance Need](/life-insurance-need)",
      },
    ],
  },
  {
    slug: "managing-debt",
    title: "Managing Debt Wisely",
    subtitle: "Good debt, bad debt, and how to get out of the cycle",
    icon: "💳",
    readTime: "7 min read",
    tags: ["Debt", "Intermediate"],
    sections: [
      {
        heading: "Not All Debt is Equal",
        body: "Some debt helps you build wealth. Some debt destroys it.\n\n**Good Debt** (leverages your future earnings):\n- Education loan (10-12%) — increases your earning potential\n- Home loan (8-9%) — builds an asset, tax benefits\n- Business loan (10-15%) — can generate returns higher than interest\n\n**Bad Debt** (consumes without creating value):\n- Credit card debt (36-42% APR!) — the most expensive debt\n- Personal loans for consumption (12-18%) — borrowing to spend\n- Loans for depreciating assets (car loans for luxury cars)\n- Buy-now-pay-later (BNPL) — easy to overspend\n\n**The rule:** If the interest rate is above 15%, it's almost certainly bad debt. Pay it off ASAP.",
      },
      {
        heading: "The Debt Avalanche vs Snowball",
        body: "If you have multiple debts, two strategies help you pay them off:\n\n**Avalanche Method (mathematically optimal):**\n1. List all debts by interest rate (highest first)\n2. Pay minimum on all\n3. Put extra money toward the highest-interest debt\n4. When that's paid off, move to the next highest\n\n**Example:**\n- Credit card: ₹50,000 at 36%\n- Personal loan: ₹1,00,000 at 14%\n- Education loan: ₹3,00,000 at 11%\n\n→ Attack credit card first, then personal loan, then education loan.\n\n**Snowball Method (psychologically motivating):**\n1. List all debts by balance (smallest first)\n2. Pay minimum on all\n3. Put extra money toward the smallest balance\n4. When that's paid off, move to the next smallest\n\n→ Attack ₹50K credit card first (quick win), then ₹1L personal loan, then ₹3L education loan.",
      },
      {
        heading: "Real-World Example: Vikram's Debt Freedom",
        body: "Vikram, 30, had:\n- Credit card: ₹80,000 at 36%\n- Personal loan: ₹2,00,000 at 14%\n- Car loan: ₹4,00,000 at 9%\n\nHis salary: ₹65,000/month. He was paying ₹15,000/month just in EMIs.\n\n**His plan (avalanche method):**\n1. Minimum on car loan: ₹8,000\n2. Minimum on personal loan: ₹5,000\n3. Everything else (₹20,000) → credit card\n\n**Timeline:**\n- Month 1-5: Credit card paid off (saved ₹28,800 in interest)\n- Month 6-15: Personal loan paid off (saved ₹12,000 in interest)\n- Month 16-35: Car loan paid off\n\n**Result:** Debt-free in 35 months instead of 60+ months. Saved ₹40,000+ in interest. Now that ₹20,000 goes to SIPs.",
      },
      {
        heading: "Credit Card Rules",
        body: "Credit cards are useful tools if used correctly. Here's how:\n\n**DO:**\n- Pay the FULL amount every month (not just minimum)\n- Use the interest-free period (45-50 days)\n- Earn rewards/cashback on spending you'd do anyway\n- Set up auto-pay for full amount\n\n**DON'T:**\n- Pay only the minimum (2-3% of balance) — you'll pay 36%+ interest on the rest\n- Withdraw cash from credit card (2-5% fee + immediate interest)\n- Use credit card for EMI purchases unless 0% interest\n- Have more than 2-3 cards (hard to track)\n\n**Golden rule:** If you can't pay for something in cash, you can't afford it on credit card either.",
      },
      {
        heading: "When to Prepay a Loan",
        body: "Should you prepay your loan or invest the money? Compare:\n\n**Prepay if:**\n- Loan interest rate > expected investment returns\n- It's a high-interest loan (credit card, personal loan)\n- You want peace of mind (psychological benefit)\n- You're close to paying it off\n\n**Invest if:**\n- Loan interest rate < expected investment returns\n- It's a low-interest loan (home loan at 8%, education loan at 11%)\n- You're young and have time for compounding\n\n**Home loan special case:**\nHome loan at 8.5% with tax benefits effectively becomes ~6.5%. If your SIPs earn 12%, investing beats prepaying. But if you're risk-averse, prepaying gives guaranteed \"returns\" equal to your interest rate.",
      },
    ],
  },
  {
    slug: "real-estate-basics",
    title: "Real Estate Basics",
    subtitle: "Renting vs buying, and what nobody tells you",
    icon: "🏠",
    readTime: "9 min read",
    tags: ["Property", "Intermediate"],
    sections: [
      {
        heading: "Renting vs Buying: The Math",
        body: "In India, buying a house is considered a milestone. But is it always the right financial decision? Let's do the math.\n\n**Renting costs:**\n- Monthly rent: ₹20,000\n- Annual increase: 5%\n- 20-year total: ~₹65 lakh\n\n**Buying costs (₹60L flat, 20-year loan):**\n- Down payment: ₹15 lakh\n- EMI: ₹38,000/month (for 20 years at 8.5%)\n- Total EMI paid: ₹91 lakh\n- Interest paid: ₹31 lakh\n- Maintenance: ₹2-3 lakh/year = ₹40-60 lakh\n- Property tax: ₹50K-1L/year = ₹10-20 lakh\n- **Total: ₹1.9-2.4 crore**\n\n**But you also get:**\n- A house you own (worth ₹1.5-2 crore in 20 years)\n- Tax benefits on home loan\n- Emotional satisfaction\n\n**The verdict:** Renting is often cheaper mathematically, but buying builds an asset and gives stability. The right choice depends on your priorities, city, and how long you'll stay.",
      },
      {
        heading: "Hidden Costs of Buying",
        body: "The sticker price is just the beginning:\n\n1. **Stamp duty & registration:** 5-7% of property value (₹3-4.2L on a ₹60L flat)\n2. **GST:** 5% on under-construction, 0% on ready-to-move\n3. **Legal fees:** ₹20,000-50,000\n4. **Home inspection:** ₹5,000-15,000\n5. **Interior work:** ₹3-10 lakh (bare minimum)\n6. **Maintenance:** ₹3-5/sq ft/month (₹2,000-5,000/month for a 2BHK)\n7. **Property tax:** ₹5,000-20,000/year\n8. **Insurance:** ₹5,000-10,000/year\n\n**Total hidden costs:** ₹8-15 lakh upfront + ₹3-5 lakh/year ongoing\n\nA ₹60L flat actually costs ₹70-75L in year one.",
      },
      {
        heading: "Home Loan Tips",
        body: "1. **Keep EMI under 40% of take-home** — Banks may approve 50-60%, but that's risky. If one spouse stops working or you face a pay cut, you'll struggle.\n\n2. **Down payment: 20% minimum** — Try for 30% to reduce EMI and interest. Don't drain your emergency fund.\n\n3. **Choose the right tenure:**\n   - 15 years: Higher EMI, less total interest\n   - 20 years: Balanced\n   - 30 years: Lower EMI, but you pay almost double in interest\n\n4. **Prepay when possible** — Even one extra EMI per year reduces tenure by 2-3 years.\n\n5. **Compare rates** — SBI, HDFC, ICICI, LIC HFL, Bank of Baroda. Rate difference of 0.5% = ₹3-5 lakh savings over 20 years.\n\n6. **Floating vs fixed:** Floating rates are usually lower and跟着市场走. Fixed rates are predictable but higher.",
      },
      {
        heading: "Real-World Example: The Mumbai Dilemma",
        body: "Meera, 32, earns ₹18L/year. She's deciding between:\n\n**Option A: Buy 1BHK in Thane**\n- Price: ₹65 lakh\n- Down payment: ₹15 lakh (from savings + parents)\n- EMI: ₹42,000/month for 20 years\n- Commute: 1.5 hours each way\n\n**Option B: Rent 2BHK near office (Andheri)**\n- Rent: ₹28,000/month\n- Invest the EMI difference (₹14,000/month) in SIPs\n- Commute: 20 minutes\n\n**After 20 years (assuming 12% SIP returns):**\n- Option A: Owns a flat worth ₹1.5-2 crore (net of loan cost)\n- Option B: Has ₹1.4 crore in investments + flexibility to move\n\n**Our take:** If she plans to stay in Mumbai long-term and values owning a home, Option A is fine. If she values flexibility and location, Option B is financially strong too. There's no single right answer.",
      },
      {
        heading: "Red Flags When Buying",
        body: "1. **Builder reputation** — Check past projects. Visit them. Talk to residents. Google \"[Builder name] complaints.\"\n\n2. **RERA registration** — Every project must be RERA registered. Check the RERA website.\n\n3. **Possession date** — If the builder has a history of delays (most do), add 1-2 years to the promised date.\n\n4. **Maintenance costs** — Some societies charge ₹5-10/sq ft. That's ₹5,000-10,000/month for a 2BHK.\n\n5. **Resale value** — Not all properties appreciate. Check historical prices in the area.\n\n6. **Loan approval** — Get pre-approved before you shortlist. It shows sellers you're serious and tells you exactly what you can afford.\n\n7. **Don't stretch** — If you need to borrow from parents or take a 30-year loan, the property might be too expensive for your income.",
      },
    ],
  },
];

export function getGeneralTopic(slug: string): GeneralTopic | undefined {
  return generalTopics.find((t) => t.slug === slug);
}
