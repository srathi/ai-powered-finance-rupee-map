# RupeeMap

A production-ready financial calculator web application with 58+ calculators, AI-powered chatbot, portfolio analysis, and interactive financial literacy platform.

## Overview

RupeeMap is a comprehensive personal finance tool built with Next.js 16, featuring retirement planning calculators, investment tools, loan calculators, tax planning, insurance analysis, AI-powered portfolio review, a RAG-powered AI chatbot (ArthaAI), and **AI stock forecasting powered by Kronos** — an open-source financial foundation model — for financial guidance with Indian market context.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | TailwindCSS 4 |
| Components | shadcn/ui (base-nova with @base-ui/react) |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand |
| AI | Groq SDK (Llama 3.3 70B + GPT-OSS-20B + Llama 3.1 8B fallback) |
| AI Forecasting | Kronos financial foundation model (Python sidecar service) |
| PDF Parsing | unpdf |
| Forms | React Hook Form + Zod |
| Export | jsPDF, xlsx |

## Project Structure

```
AIFinanceRupeeMap/
├── public/
│   ├── logo.png                          # RupeeMap logo
│   └── research/
│       └── ssrn-5381648-dynamic.pdf      # Research paper for RAG
├── scripts/
│   └── parse-pdf.js                      # PDF → JSON chunks parser
├── kronos-service/                       # Python sidecar: Kronos forecasting API
├── src/
│   ├── app/                              # Next.js App Router pages
│   │   ├── api/                          # API routes
│   │   │   ├── chat/route.ts             # ArthaAI streaming endpoint
│   │   │   ├── portfolio-review/route.ts # AI portfolio analysis
│   │   │   ├── mutual-fund-search/route.ts # MFAPI search proxy
│   │   │   ├── mutual-fund-data/route.ts   # MFAPI NAV data proxy
│   │   │   ├── stock-price/route.ts      # Yahoo Finance price proxy
│   │   │   ├── stock-search/route.ts     # Yahoo Finance search proxy
│   │   │   └── stock-news/route.ts       # Google News RSS proxy
│   │   │   ├── stock-forecast/route.ts   # Kronos AI price forecast proxy
│   │   │   └── stock-scan/route.ts       # Kronos watchlist scanner proxy
│   │   ├── learn/                        # Financial literacy section
│   │   │   ├── [course]/[lesson]/        # Kids lessons with quizzes
│   │   │   └── general/[topic]/          # General finance articles
│   │   ├── chat/                         # ArthaAI chat interface
│   │   ├── portfolio-review/             # AI portfolio analysis page
│   │   ├── fund-compare/                 # Mutual fund comparison page
│   │   ├── deterministic/                # Retirement calculators
│   │   ├── stochastic/
│   │   ├── what-if/
│   │   ├── test-adequacy/
│   │   ├── withdrawal-rates/
│   │   ├── history/
│   │   ├── sip-calculator/               # Investment calculators
│   │   ├── lumpsum-calculator/
│   │   ├── stock-price/
│   │   ├── stock-forecast/               # Kronos AI price forecast page
│   │   ├── watchlist-forecast/           # Kronos watchlist scanner page
│   │   ├── ...                           # 58+ calculator pages
│   │   └── page.tsx                      # Landing page
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives
│   │   ├── sidebar.tsx                   # Fixed sidebar navigation
│   │   ├── footer.tsx                    # Site footer
│   │   ├── calculator-layout.tsx         # 12-col grid layout
│   │   ├── input-controls.tsx            # InputField, SliderField
│   │   ├── summary-cards.tsx             # Glass metric cards
│   │   ├── results-table.tsx             # Results display
│   │   ├── chart-components.tsx          # Recharts wrappers
│   │   ├── quiz-card.tsx                 # Quiz component
│   │   ├── lesson-layout.tsx             # Lesson page wrapper
│   │   ├── chat-message.tsx              # Chat bubble with markdown
│   │   ├── stock-snapshot.tsx             # Chat stock card + chart + news
│   │   ├── stock-chart.tsx                # Historical price chart (1D-5Y-Max)
│   │   ├── stock-card.tsx                 # Live quote card in chat
│   │   ├── portfolio-form.tsx             # Portfolio entry form
│   │   ├── portfolio-analysis.tsx        # Portfolio results display
│   │   └── fund-compare-card.tsx         # Fund comparison card
│   ├── types/
│   │   ├── portfolio.ts                  # Portfolio data types
│   │   └── mutual-fund.ts                # Mutual fund data types
│   ├── lib/
│   │   ├── calculations/                 # Core calculation engines
│   │   │   ├── math.ts                   # SWR formula, utility functions
│   │   │   ├── retirement.ts             # Deterministic calculator
│   │   │   ├── stochastic.ts             # Monte Carlo simulation
│   │   │   ├── inflation.ts              # Inflation adjustment
│   │   │   └── compound.ts              # Compound interest
│   │   ├── financial/                    # Financial modules
│   │   │   ├── tax.ts                    # Income tax (FY 2024-25)
│   │   │   ├── loan.ts                   # EMI, amortization
│   │   │   ├── savings.ts                # FD, RD, PPF, EPF
│   │   │   ├── gst.ts                    # GST calculations
│   │   │   └── insurance.ts             # Insurance needs
│   │   ├── learn-data.ts                 # Kids course content
│   │   ├── general-learn-data.ts         # General articles
│   │   ├── stock-detection.ts            # Stock mention detection & resolution
│   │   └── utils.ts                      # Utility functions
│   └── data/
│       ├── historical-returns.ts         # 564 monthly records (1979-2025)
│       └── research-chunks.json          # 51 RAG chunks from PDF
├── SESSION_STATE.md                       # Development state
├── DESIGN_BRIEF.md                        # Design specifications
└── package.json
```

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Browser] --> B[Next.js App Router]
    end

    subgraph "Presentation Layer"
        B --> C[Landing Page]
        B --> D[58+ Calculator Pages]
        B --> E[Learn Section]
        B --> F[ArthaAI Chat]
        B --> G[Stock Price Lookup]
        B --> H[Portfolio Review]
    end

    subgraph "Component Layer"
        C --> H[Sidebar Navigation]
        C --> I[Calculator Layout]
        C --> J[Input Controls]
        C --> K[Charts & Tables]
        C --> L[Quiz System]
    end

    subgraph "Business Logic Layer"
        I --> M[Retirement Engines]
        I --> N[Financial Modules]
        I --> O[Investment Calculators]
        M --> P[Deterministic]
        M --> Q[Stochastic Monte Carlo]
        M --> R[Test Adequacy]
        N --> S[Tax FY 2024-25]
        N --> T[Loan EMI]
        N --> U[Savings FD/RD/PPF]
    end

    subgraph "Data Layer"
        P --> V[Historical Returns 1979-2025]
        Q --> V
        R --> V
        F --> W[Research PDF Chunks]
        G --> X[Yahoo Finance API]
    end

    subgraph "AI Layer"
        F --> Y[ArthaAI Chat API]
        Y --> Z[Groq SDK]
        Z --> AA[Llama 3.3 70B]
        Y --> W
        H --> AB[Portfolio Review API]
        AB --> Z
    end
```

### Module Architecture

```mermaid
graph LR
    subgraph "Calculators"
        A[Retirement] --> A1[Deterministic]
        A --> A2[Stochastic]
        A --> A3[Test Adequacy]
        A --> A4[What-if]
        A --> A5[Withdrawal Rates]
        A --> A6[History Back-test]

        B[Investment] --> B1[SIP]
        B --> B2[Lumpsum]
        B --> B3[Step-up SIP]
        B --> B4[SWP]
        B --> B5[STP]
        B --> B6[Goal Planner]
        B --> B7[CAGR]
        B --> B8[XIRR]
        B --> B9[Stock Prices]
        B --> B10[Portfolio Review]

        C[Loan] --> C1[EMI]
        C --> C2[Home Loan]
        C --> C3[Car Loan]
        C --> C4[Personal Loan]
        C --> C5[Education Loan]
        C --> C6[Loan Comparison]
        C --> C7[Prepayment]

        D[Tax] --> D1[Income Tax]
        D --> D2[Old vs New Regime]
        D --> D3[HRA]
        D --> D4[Gratuity]
        D --> D5[Section 80C]

        E[Savings] --> E1[FD]
        E --> E2[RD]
        E --> E3[PPF]
        E --> E4[EPF]
        E --> E5[NPS]
        E --> E6[Sukanya]
        E --> E7[NSC]
        E --> E8[SCSS]
    end
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Calculator Page
    participant Engine as Calculation Engine
    participant Data as Historical Data
    participant Chart as Chart Component

    U->>UI: Enter parameters
    UI->>Engine: Calculate(values)
    Engine->>Data: Fetch historical returns
    Data-->>Engine: 564 monthly records
    Engine-->>UI: Results object
    UI->>Chart: Render visualization
    Chart-->>U: Display results
```

### ArthaAI RAG Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant Chat as Chat UI
    participant API as /api/chat
    participant Search as Keyword Search
    participant Chunks as Research Chunks JSON
    participant LLM as Groq/Llama 3.3

    U->>Chat: Type message
    Chat->>API: POST /api/chat
    API->>Search: isResearchQuery(message)
    
    alt Research-related query
        Search->>Chunks: searchResearchChunks(query)
        Chunks-->>Search: Top 4 relevant chunks
        Search-->>API: Context block
        API->>LLM: System prompt + context + messages
    else General query
        API->>LLM: System prompt + messages
    end
    
    LLM-->>API: Streaming response
    API-->>Chat: Text stream
    Chat-->>U: Rendered markdown
```

### Portfolio Review Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant Form as Portfolio Form
    participant API as /api/portfolio-review
    participant Calc as Allocation Calculator
    participant LLM as Groq/Llama 3.3
    participant Chart as Results Display

    U->>Form: Enter investments
    Form->>API: POST /api/portfolio-review
    API->>Calc: calculateAllocation(investments)
    Calc-->>API: { equity: 47%, debt: 53%, ... }
    API->>Calc: estimateProjectedValue(total, allocation)
    Calc-->>API: 10-year projection
    API->>LLM: System prompt + portfolio data
    LLM-->>API: 5 personalized recommendations
    API-->>Form: AnalysisResult object
    Form->>Chart: Render pie chart + metrics
    Chart-->>U: Display analysis
```

### Learn Section Architecture

```mermaid
graph TB
    subgraph "Kids Section"
        A[Money Basics] --> A1[What is Money]
        A --> A2[Saving vs Spending]
        A --> A3[How Banks Work]
        A --> A4[Magic of Compounding]
        A --> A5[Goals and Plans]

        B[Smart Money Habits] --> B1[Needs vs Wants]
        B --> B2[Budgeting Pocket Money]
        B --> B3[Sharing and Giving]
        B --> B4[Shopping Smart]
        B --> B5[Digital Money Safety]

        C[Real World Money] --> C1[What is Investing]
        C --> C2[Starting Small Business]
        C --> C3[Taxes Why We Pay]
        C --> C4[Loans and Borrowing]
        C --> C5[Careers and Earning]
    end

    subgraph "General Section"
        D[Budgeting 101]
        E[Emergency Fund]
        F[Power of SIP]
        G[Understanding Taxes]
        H[Insurance Guide]
        I[Managing Debt]
        J[Real Estate Basics]
    end

    subgraph "Progress System"
        K[localStorage] --> L[Course Progress]
        K --> M[Quiz Scores]
        K --> N[Badges Earned]
    end
```

### State Management

```mermaid
graph TB
    A[Zustand Store] --> B[Calculator State]
    A --> C[UI State]
    
    B --> B1[Input Values]
    B --> B2[Computed Results]
    B --> B3[Chart Data]
    
    C --> C1[Sidebar Expanded]
    C --> C2[Active Category]
    C --> C3[Mobile Menu]
    
    D[localStorage] --> E[Learn Progress]
    D --> F[Chat History]
    D --> G[Quiz Scores]
```

## Features

### 58+ Financial Calculators
- **Retirement**: Deterministic, Stochastic, Test Adequacy, What-if, Withdrawal Rates, History Back-test
- **Investment**: SIP, Lumpsum, Step-up SIP, SWP, STP, Goal Planner, CAGR, XIRR, Returns, Stock Prices, Fund Compare
- **Loan**: EMI, Home, Car, Personal, Education, Eligibility, Affordability, Balance, Comparison, Prepayment
- **Tax**: Income Tax, Old vs New Regime, HRA, Gratuity, Leave Encashment, Section 80C
- **Savings**: FD, RD, PPF, EPF, NPS, Sukanya, NSC, SCSS
- **Insurance**: Life Insurance Need, Term Insurance, Child Education, Health Insurance
- **Business**: GST, Discount, Break-even, Profit Margin
- **General**: Inflation, Purchasing Power, Rule of 72, Compound/Simple Interest, Future/Present Value

### ArthaAI Chatbot
- Streaming responses via Groq SDK (Llama 3.3 70B, auto-fallback to GPT-OSS-20B → Llama 3.1 8B on rate limits/404s)
- RAG-powered with 51 research paper chunks
- **Stock mention detection** (NSE/BSE): "what's the share price of TCS?" or "when is the next TCS results?" resolve the ticker via Yahoo Finance probe/search and show a live quote card, historical chart, and latest news right in the chat
- Live stock quote + latest headlines injected into the model context so answers never claim "no access to real-time data"
- Brand alias map (Policybazaar, Paytm, Nykaa, ...) for common Indian company names
- Indian financial context (₹, PPF, NPS, ELSS, Nifty 50, SEBI)
- Rate limiting (15 requests/minute)
- Chat history persistence (localStorage)
- Markdown rendering with tables, lists, code blocks

### Stock Price Lookup
- NSE/BSE live quotes via Yahoo Finance proxy (host failover + serve-stale caching)
- Historical price chart with range tabs (1D, 1M, 3M, 6M, 1Y, 5Y, Max)
- Latest news headlines from Google News RSS (5-minute cache)

### AI Stock Forecast (Kronos)
- Powered by **Kronos**, an open-source foundation model for financial K-lines pre-trained on 12B+ candles from 45 global exchanges (AAAI 2026)
- Single-ticker probabilistic forecast: 90% confidence band, median/expected prices, upside probability, risk score, and a fan/sampled-paths chart
- Watchlist scanner: batch-forecasts a list of tickers and ranks them by projected upside
- Served by a Python sidecar (`kronos-service/`) proxied through `/api/stock-forecast` and `/api/stock-scan`; falls back to a cached model or trend heuristic if the model is unavailable
- Forecasts are research-grade and probabilistic — not investment advice

### Withdrawal Rates (SWR)
- User-defined retirement corpus input (default ₹1 Cr, ₹0.5L–₹10 Cr range)
- Annual and monthly withdrawal amounts in ₹ alongside the SWR %
- 200-path Monte Carlo robustness check with shared-axis simulation chart, initial-corpus reference line, and survived/depleted path legend

### AI Portfolio Review
- Groq-powered portfolio analysis with personalized recommendations
- Investment entry form with templates (Moderate ₹50L, Aggressive ₹25L)
- Dynamic add/remove investments with category classification
- Asset allocation pie chart (equity, debt, gold, real estate, other)
- Risk score assessment (low/medium/high) based on age, profile, and allocation
- 10-year projected value based on weighted category returns
- AI-generated recommendations (rebalancing, tax optimization, diversification)

### Financial Literacy Platform
- **Kids Section**: 15 lessons across 3 courses with quizzes
- **General Section**: 7 in-depth articles with real-world Indian examples
- Progress tracking via localStorage
- Badge system for course completion

### Design System
- Dark-first glassmorphism (Google Stitch inspired)
- Colors: Deep navy `#0d1320` bg, Cyan `#89ceff` primary, Emerald `#4edea3` secondary
- Fixed sidebar navigation with expandable categories
- Responsive design (mobile + desktop)
- JetBrains Mono for data, Geist for narrative

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd AIFinanceRupeeMap
npm install
```

### Environment Variables

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | ArthaAI streaming chat (Groq SDK) |
| `/api/portfolio-review` | POST | AI portfolio analysis (Groq SDK) |
| `/api/stock-price` | GET | Yahoo Finance price proxy |
| `/api/stock-search` | GET | Yahoo Finance search proxy |
| `/api/stock-news` | GET | Latest news headlines proxy |

## Data Sources

- **Historical Returns**: 564 monthly records (1979-2025) for Indian equity and debt markets
- **Research Paper**: "Boosting Retirement Income through Dynamic Withdrawals" (SSRN 5381648) - parsed into 51 chunks for RAG
- **Stock Data**: Yahoo Finance API (free, no key required)

## Tax Calculations

### New Regime (FY 2024-25)
| Income Slab | Tax Rate |
|-------------|----------|
| 0 - 3,00,000 | 0% |
| 3,00,001 - 7,00,000 | 5% |
| 7,00,001 - 10,00,000 | 10% |
| 10,00,001 - 12,00,000 | 15% |
| 12,00,001 - 15,00,000 | 20% |
| Above 15,00,000 | 30% |

- Standard Deduction: ₹75,000
- Section 87A Rebate: For income ≤ ₹7,00,000
- Health & Education Cess: 4%

### Old Regime (FY 2024-25)
| Income Slab | Tax Rate |
|-------------|----------|
| 0 - 3,00,000 | 0% |
| 3,00,001 - 6,00,000 | 5% |
| 6,00,001 - 9,00,000 | 10% |
| 9,00,001 - 12,00,000 | 15% |
| 12,00,001 - 15,00,000 | 20% |
| Above 15,00,000 | 30% |

## Development History

See [SESSION_STATE.md](./SESSION_STATE.md) for detailed development state and history.

## License

MIT — see the [LICENSE](./LICENSE) file.
