"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  PiggyBank,
  Percent,
  Landmark,
  Target,
  ArrowRight,
  Quote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { caseStudies, categories, type CaseStudy } from "@/lib/case-studies-data";

const categoryIcons: Record<string, React.ReactNode> = {
  sip: <PiggyBank className="h-4 w-4" />,
  tax: <Percent className="h-4 w-4" />,
  loan: <Landmark className="h-4 w-4" />,
  retirement: <TrendingUp className="h-4 w-4" />,
  goals: <Target className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  sip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  tax: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  loan: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  retirement: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  goals: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function CaseStudyCard({
  study,
  isExpanded,
  onToggle,
}: {
  study: CaseStudy;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl overflow-hidden border border-outline-variant/20"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[study.category]}`}
          >
            {categoryIcons[study.category]}
            {study.categoryLabel}
          </span>
          <div className="text-right">
            <div className="font-data text-2xl font-bold text-primary">
              {study.keyMetric}
            </div>
            <div className="text-xs text-muted-foreground">
              {study.keyMetricLabel}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-on-surface mb-3 leading-snug">
          {study.title}
        </h3>

        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          {study.summary}
        </p>

        {/* Quote */}
        <div className="relative pl-4 border-l-2 border-primary/30 mb-4">
          <Quote className="absolute -left-2.5 -top-1 h-4 w-4 text-primary/50 bg-surface-container" />
          <p className="text-sm italic text-on-surface-variant/80">
            &ldquo;{study.quote}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            &mdash; {study.quoteAuthor}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-surface-container/50">
            <div className="text-xs text-muted-foreground">Age</div>
            <div className="font-data text-sm font-medium text-on-surface">
              {study.age}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-surface-container/50">
            <div className="text-xs text-muted-foreground">City</div>
            <div className="font-data text-sm font-medium text-on-surface">
              {study.city}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-surface-container/50">
            <div className="text-xs text-muted-foreground">Role</div>
            <div className="font-data text-xs font-medium text-on-surface truncate">
              {study.occupation}
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-outline-variant/10"
      >
        {isExpanded ? "Show Less" : "Read Full Story"}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-outline-variant/10">
          {/* Story */}
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-semibold text-on-surface">The Story</h4>
            {study.story.map((paragraph, i) => (
              <p
                key={i}
                className="text-sm text-on-surface-variant leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Metrics Table */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-on-surface mb-3">
              Results at a Glance
            </h4>
            <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container/50">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      Metric
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      Before
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      After
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {study.metrics.map((m, i) => (
                    <tr
                      key={i}
                      className="border-t border-outline-variant/10"
                    >
                      <td className="px-4 py-2.5 text-on-surface-variant">
                        {m.label}
                      </td>
                      <td className="px-4 py-2.5 font-data text-on-surface-variant/60">
                        {m.before}
                      </td>
                      <td className="px-4 py-2.5 font-data font-medium text-primary">
                        {m.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={study.calculatorHref}
            className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl btn-primary-gradient text-sm font-semibold"
          >
            Try the {study.calculatorName}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function CaseStudiesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    activeCategory === "all"
      ? caseStudies
      : caseStudies.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-[1200px] mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-on-surface">Real People.</span>{" "}
              <span className="text-primary">Real Results.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              See how Indians just like you used RupeeMap to take control of
              their money and build lasting wealth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedId(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-on-surface-variant hover:bg-surface-hover border border-transparent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((study) => (
              <CaseStudyCard
                key={study.id}
                study={study}
                isExpanded={expandedId === study.id}
                onToggle={() =>
                  setExpandedId(expandedId === study.id ? null : study.id)
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl p-8 border border-outline-variant/20"
          >
            <h2 className="text-2xl font-bold text-on-surface mb-3">
              Start Your Success Story
            </h2>
            <p className="text-on-surface-variant mb-6">
              Use the same calculators that helped Ravi, Priya, and thousands
              of others achieve their financial goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sip-calculator"
                className="px-6 py-3 rounded-xl btn-primary-gradient font-semibold text-sm"
              >
                Start with SIP Calculator
              </Link>
              <Link
                href="/deterministic"
                className="px-6 py-3 rounded-xl border border-outline-variant/30 font-semibold text-sm text-on-surface hover:bg-surface-hover transition-colors"
              >
                Plan Retirement
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
