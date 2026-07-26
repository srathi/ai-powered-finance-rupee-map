"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiePolicyPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-on-surface-variant mb-8">Last updated: January 2026</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. What Are Cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>Cookies are small text files stored on your device when you visit a website. They are commonly used to remember preferences and improve user experience.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Our Cookie Usage</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>RupeeMap uses <strong>minimal cookies</strong>. Here&apos;s what we use:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Theme Preference:</strong> A single cookie to remember your dark/light mode choice.</li>
              <li><strong>Next.js Session:</strong> Standard framework cookie for server-side rendering (automatically managed).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. What We Don&apos;t Use</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <ul className="list-disc pl-6 space-y-2">
              <li>No advertising or tracking cookies</li>
              <li>No third-party analytics cookies</li>
              <li>No social media tracking pixels</li>
              <li>No cross-site tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Local Storage</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>In addition to cookies, we may use browser local storage to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remember your calculator inputs for convenience</li>
              <li>Store your theme preference</li>
            </ul>
            <p>Local storage is entirely client-side and can be cleared through your browser settings.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Managing Cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant space-y-3">
            <p>You can control and delete cookies through your browser settings:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-on-surface-variant">
            <p>We may update this Cookie Policy from time to time. Any changes will be reflected on this page with an updated revision date.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
