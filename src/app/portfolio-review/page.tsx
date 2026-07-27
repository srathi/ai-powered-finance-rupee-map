"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { PortfolioForm } from "@/components/portfolio-form";
import { PortfolioAnalysisResult } from "@/components/portfolio-analysis";
import {
  Investment,
  RiskProfile,
  InvestmentGoal,
} from "@/types/portfolio";

interface AnalysisResult {
  totalInvested: number;
  totalCurrent: number;
  totalReturns: number;
  returnsPercentage: number;
  assetAllocation: {
    equity: number;
    debt: number;
    gold: number;
    realEstate: number;
    other: number;
  };
  aiRecommendations: string[];
  projectedValue10Years: number;
  riskScore: "low" | "medium" | "high";
}

export default function PortfolioReviewPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    investments: Investment[];
    age: number;
    riskProfile: RiskProfile;
    goal: InvestmentGoal;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to analyze portfolio");
      }

      const result = await response.json();
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-[900px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
                AI Portfolio Review
              </h1>
            </div>
            <p className="text-on-surface-variant max-w-xl">
              Enter your investments and get personalized AI-powered analysis with
              recommendations to optimize your portfolio for growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-24">
        <div className="max-w-[900px] mx-auto">
          {analysis ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PortfolioAnalysisResult analysis={analysis} onReset={handleReset} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PortfolioForm onSubmit={handleSubmit} isLoading={isLoading} />

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
