"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-on-surface-variant mb-8">Last updated: January 2026</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>RupeeMap is a client-side financial calculator tool. We do not collect, store, or transmit any personal data to our servers.</p>
            <p>All calculations are performed locally in your browser. Your inputs (income, expenses, portfolio allocations) never leave your device.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Local Storage</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>We may use browser local storage to remember your theme preference (dark/light mode) and recent calculator inputs for convenience.</p>
            <p>This data is stored entirely on your device and can be cleared at any time through your browser settings.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>We may use privacy-respecting analytics (such as Plausible or Umami) to understand aggregate usage patterns. These tools do not use cookies and do not track individual users.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>Our calculators use historical market data sourced from publicly available databases (Sensex, RBI, CPI). No third-party tracking scripts are loaded.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>Since all data processing happens client-side, there is no risk of server-side data breaches. Your financial data stays on your device.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>
              For questions about this Privacy Policy, contact us at{" "}
              <a href="mailto:support@rupeemap.in" className="text-primary hover:underline">
                support@rupeemap.in
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
