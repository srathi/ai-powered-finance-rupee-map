import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface Investment {
  type: string;
  name: string;
  investedAmount: number;
  currentValue: number;
  category: string;
}

interface PortfolioRequest {
  investments: Investment[];
  age: number;
  riskProfile: string;
  goal: string;
}

function calculateAllocation(investments: Investment[]) {
  const total = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  if (total === 0) return { equity: 0, debt: 0, gold: 0, realEstate: 0, other: 0 };

  const categoryTotals: Record<string, number> = {};
  for (const inv of investments) {
    categoryTotals[inv.category] = (categoryTotals[inv.category] || 0) + inv.currentValue;
  }

  return {
    equity: Math.round(((categoryTotals.equity || 0) / total) * 100),
    debt: Math.round(((categoryTotals.debt || 0) / total) * 100),
    gold: Math.round(((categoryTotals.gold || 0) / total) * 100),
    realEstate: Math.round(((categoryTotals.real_estate || 0) / total) * 100),
    other: Math.round(((categoryTotals.other || 0) / total) * 100),
  };
}

function calculateRiskScore(allocation: ReturnType<typeof calculateAllocation>, age: number): "low" | "medium" | "high" {
  const equityPlusGold = allocation.equity + allocation.gold;
  if (age < 40 && equityPlusGold >= 60) return "medium";
  if (age < 40 && equityPlusGold >= 80) return "high";
  if (age >= 40 && equityPlusGold <= 30) return "low";
  if (age >= 40 && equityPlusGold >= 60) return "high";
  return "medium";
}

function estimateProjectedValue(totalCurrent: number, allocation: ReturnType<typeof calculateAllocation>): number {
  const weightedReturn =
    allocation.equity * 0.12 +
    allocation.debt * 0.07 +
    allocation.gold * 0.1 +
    allocation.realEstate * 0.08 +
    allocation.other * 0.04;
  const annualRate = weightedReturn / 100;
  return Math.round(totalCurrent * Math.pow(1 + annualRate, 10));
}

function formatInvestmentsList(investments: Investment[]): string {
  return investments
    .map(
      (inv, i) =>
        `${i + 1}. ${inv.name} (${inv.type}) — Invested: ₹${inv.investedAmount.toLocaleString("en-IN")}, Current: ₹${inv.currentValue.toLocaleString("en-IN")}`
    )
    .join("\n");
}

const SYSTEM_PROMPT = `You are an expert Indian financial advisor analyzing a client's investment portfolio.

Analyze the portfolio and provide:
1. Asset Allocation Assessment — Is the split appropriate for the client's age and risk profile?
2. Diversification Analysis — Is the portfolio well-diversified or too concentrated?
3. Risk Evaluation — What is the overall risk level?
4. Specific Recommendations — 3-5 actionable suggestions for improvement
5. Tax Optimization — Any tax-saving opportunities under Section 80C, 80D, etc.?

Context about the client:
- Age: {age}
- Risk Profile: {riskProfile}
- Investment Goal: {goal}

Indian market context:
- Use Indian Rupees (₹)
- Reference Indian financial products (PPF, NPS, ELSS, SGB, etc.)
- Consider Indian tax rules (Section 80C limit ₹1.5L, LTCG tax, etc.)
- Reference popular Indian mutual fund categories
- Use realistic Indian market return expectations (equity: 12-14%, debt: 6-8%)

Format your response as a JSON object with this structure:
{
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Provide exactly 4-5 recommendations. Each recommendation should be specific and actionable.`;

export async function POST(request: NextRequest) {
  try {
    const body: PortfolioRequest = await request.json();
    const { investments, age, riskProfile, goal } = body;

    if (!investments || investments.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one investment." },
        { status: 400 }
      );
    }

    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturns = totalCurrent - totalInvested;
    const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const allocation = calculateAllocation(investments);
    const riskScore = calculateRiskScore(allocation, age);
    const projectedValue = estimateProjectedValue(totalCurrent, allocation);

    const userPrompt = `Analyze this portfolio:

Client Profile:
- Age: ${age}
- Risk Profile: ${riskProfile}
- Goal: ${goal}

Portfolio Summary:
- Total Invested: ₹${totalInvested.toLocaleString("en-IN")}
- Current Value: ₹${totalCurrent.toLocaleString("en-IN")}
- Total Returns: ₹${totalReturns.toLocaleString("en-IN")} (${returnsPercentage.toFixed(1)}%)

Asset Allocation:
- Equity: ${allocation.equity}%
- Debt: ${allocation.debt}%
- Gold: ${allocation.gold}%
- Real Estate: ${allocation.realEstate}%
- Other: ${allocation.other}%

Investments:
${formatInvestmentsList(investments)}

Please analyze and provide recommendations as JSON.`;

    const systemPrompt = SYSTEM_PROMPT
      .replace("{age}", age.toString())
      .replace("{riskProfile}", riskProfile)
      .replace("{goal}", goal);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let recommendations: string[];
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      } else {
        recommendations = responseText
          .split("\n")
          .filter((line) => line.trim().length > 10)
          .slice(0, 5);
      }
    } catch {
      recommendations = responseText
        .split("\n")
        .filter((line) => line.trim().length > 10)
        .slice(0, 5);
    }

    if (recommendations.length === 0) {
      recommendations = [
        "Consider diversifying your portfolio across more asset classes",
        "Review your asset allocation based on your age and risk profile",
        "Ensure you are maximizing your Section 80C tax benefits",
      ];
    }

    return NextResponse.json({
      analysis: {
        totalInvested,
        totalCurrent,
        totalReturns,
        returnsPercentage: Math.round(returnsPercentage * 10) / 10,
        assetAllocation: allocation,
        aiRecommendations: recommendations,
        projectedValue10Years: projectedValue,
        riskScore,
      },
    });
  } catch (err) {
    console.error("Portfolio review error:", err);
    return NextResponse.json(
      { error: "Failed to analyze portfolio. Please try again." },
      { status: 500 }
    );
  }
}
