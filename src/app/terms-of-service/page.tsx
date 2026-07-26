"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-on-surface-variant mb-8">Last updated: January 2026</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>By accessing and using RupeeMap, you agree to be bound by these Terms of Service. If you do not agree, please do not use the tool.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Educational Purpose Only</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>RupeeMap is designed for educational and informational purposes only. It is not a substitute for professional financial advice.</p>
            <p>The calculations, simulations, and projections provided are based on historical data and mathematical models. Past performance does not guarantee future results.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. No Financial Advice</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>Nothing on RupeeMap constitutes financial, investment, tax, or legal advice. Always consult a qualified financial advisor before making investment decisions.</p>
            <p>The tools are meant to help you understand concepts and explore scenarios — not to make decisions for you.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Accuracy of Data</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>We strive to use accurate historical data, but we cannot guarantee the completeness or accuracy of all data sources.</p>
            <p>Monte Carlo simulations are inherently probabilistic. Results will vary between runs and should be interpreted as ranges, not fixed outcomes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>RupeeMap and its creators shall not be held liable for any financial losses, decisions made, or actions taken based on the use of this tool. Use at your own risk.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>The code, design, and methodology of RupeeMap are open-source. You are free to use, modify, and distribute the tool in accordance with the project&apos;s license.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>We reserve the right to update these terms at any time. Continued use of the tool after changes constitutes acceptance of the new terms.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
