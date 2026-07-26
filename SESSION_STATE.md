# RupeeMap — Session State

## Project Overview
- **Name**: RupeeMap (formerly RetireWise)
- **Stack**: Next.js 16, React 19, TypeScript, TailwindCSS 4, shadcn/ui (base-nova), Framer Motion, Recharts, Zustand
- **Location**: `/Users/sandesh/Desktop/myProjects/AIFinanceRupeeMap`

## What's Done

### Core Functionality
- 58 calculator pages across 8 categories (Retirement, Investment, Loan, Tax, Savings, Insurance, Business, General)
- Financial engine: `math.ts`, `loan.ts`, `tax.ts`, `savings.ts`, `gst.ts`, `insurance.ts`
- Retirement engine: `retirement.ts`, `stochastic.ts`, `inflation.ts`, `compound.ts`
- Historical data: 564 monthly records (1979–2025) in `src/data/historical-returns.ts`
- SWR formula coefficients: a=3.7719, b=0.0506, c=-0.000416, d=-0.0452, e=0.000509, f=0.000134

### Tax Calculations (Fixed)
- New Regime FY 2024-25: 0-3L=0%, 3-7L=5%, 7-10L=10%, 10-12L=15%, 12-15L=20%, 15L+=30%
- Standard deduction ₹75,000, Section 87A rebate for ≤₹7L, surcharge, 4% cess
- Old Regime: 0-3L=0%, 3-6L=5%, 6-9L=10%, 9-12L=15%, 12-15L=20%, 15L+=30%
- Different surcharge rules for old vs new regime

### Rebranding (Complete)
- RetireWise → RupeeMap across package.json, layout.tsx, navbar, footer, landing page
- Logo: `public/logo.png` (from RMapLogo.png)
- Sidebar text: "Rupee" in white, "Map" in blue

### Stitch Design System (Implemented)
- Dark-first design with glassmorphism
- Colors: Deep navy `#0d1320` bg, Cyan `#89ceff` primary, Emerald `#4edea3` secondary, Amber `#ffb95f` tertiary
- Fixed sidebar navigation (w-72) with expandable categories
- Glass-effect cards, gradient buttons, glowing sliders
- JetBrains Mono for data, Geist for narrative
- Landing page: hero with gradient text, stats bar, category grid, features section
- Calculator layout: 12-column grid (4-col inputs, 8-col results)

### Bug Fixes
- Binary search inversion in deterministic calculator (fixed)
- Pie label types in 6 files (fixed)
- Missing Label import in returns-calculator (fixed)
- `yInvestment` typo in insurance.ts (fixed)
- `tenureMonths` missing in loan.ts (fixed)
- Route mismatches for investment calculators (7 directories renamed)
- Input fields not editable — removed glass-effect wrapper from CalculatorLayout
- Copyright year updated to 2026

### Pages Created
- `/privacy-policy` — Privacy Policy page
- `/terms-of-service` — Terms of Service page
- `/cookie-policy` — Cookie Policy page
- All three linked in footer

### What-if Calculator (Rewritten)
- Runs 10,000 Monte Carlo simulations
- Shows percentile bands (P10, P25, P50, P75, P90) in area chart
- Break-even withdrawal rate calculation fixed
- Removed "Median Final Corpus (P50)" card

### Landing Page Background
- Logo as subtle background watermark at 20% opacity
- Positioned to left side, 37.5% width

## What's Pending / Known Issues

### Stochastic Calculator
- Results differ from reference (~₹3.03Cr vs ₹3.78Cr) due to different historical data
- This is expected behavior

### Test Adequacy
- Outputs ~19.6% failure rate vs reference's ~53% for ₹2.28Cr corpus
- Expected difference due to different simulation data

### Footer
- "Made in India" duplicate removed
- Credits: "Built by Sandesh Rathi" with "Made with love in India"
- Research paper linked: `public/research/ssrn-5381648-dynamic.pdf`

## Key Files
- `src/app/globals.css` — Stitch design system CSS variables
- `src/app/layout.tsx` — Root layout with sidebar
- `src/components/sidebar.tsx` — Fixed sidebar navigation
- `src/components/navbar.tsx` — Top navbar (used on some pages)
- `src/components/footer.tsx` — Footer with links
- `src/components/calculator-layout.tsx` — 12-column calculator layout
- `src/components/summary-cards.tsx` — Glass metric cards
- `src/components/input-controls.tsx` — InputField and SliderField
- `src/components/results-table.tsx` — Glass results table
- `src/lib/financial/tax.ts` — Tax calculations
- `src/lib/calculations/retirement.ts` — Deterministic calculator
- `src/lib/calculations/stochastic.ts` — Monte Carlo, SWR, test adequacy
- `src/app/page.tsx` — Landing page
- `src/app/what-if/page.tsx` — What-if calculator (10k sims)
- `DESIGN_BRIEF.md` — Design brief for Google Stitch
- `stitch_design_document_manager/` — Stitch design outputs

## Build Status
- `npm run build` passes clean (58 static pages)
- No TypeScript errors
- No broken links (all routes verified)
