"use client";

import { Bot, User } from "lucide-react";
import { StockSnapshot } from "@/components/stock-snapshot";
import type { ResolvedStock } from "@/lib/stock-detection";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  stock?: ResolvedStock | null;
}

function processInlineMarkdown(text: string): string {
  // Bold
  let result = text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-on-surface font-semibold">$1</strong>'
  );
  // Inline code
  result = result.replace(
    /`(.*?)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-muted/50 text-primary text-xs font-data">$1</code>'
  );
  // Italic
  result = result.replace(
    /\*(.*?)\*/g,
    '<em>$1</em>'
  );
  return result;
}

function renderContent(text: string) {
  const blocks: React.ReactNode[] = [];
  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((paragraph, pIdx) => {
    const lines = paragraph.split("\n");
    const processedLines: React.ReactNode[] = [];

    lines.forEach((line, lIdx) => {
      const trimmed = line.trim();

      // Empty line skip
      if (!trimmed) return;

      // Heading
      const headingMatch = trimmed.match(/^#{1,3}\s+(.*)/);
      if (headingMatch) {
        processedLines.push(
          <div
            key={`h-${lIdx}`}
            className="text-on-surface font-bold mt-2 mb-1"
            dangerouslySetInnerHTML={{ __html: processInlineMarkdown(headingMatch[1]) }}
          />
        );
        return;
      }

      // Bullet point
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        const content = trimmed.slice(2);
        processedLines.push(
          <div key={`b-${lIdx}`} className="flex gap-2 ml-1">
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: processInlineMarkdown(content) }} />
          </div>
        );
        return;
      }

      // Numbered list
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        processedLines.push(
          <div key={`n-${lIdx}`} className="flex gap-2 ml-1">
            <span className="text-primary font-data font-semibold mt-0.5 shrink-0">
              {numMatch[1]}.
            </span>
            <span dangerouslySetInnerHTML={{ __html: processInlineMarkdown(numMatch[2]) }} />
          </div>
        );
        return;
      }

      // Table row (simple)
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const cells = trimmed
          .split("|")
          .filter((c) => c.trim())
          .map((c) => c.trim());
        // Skip separator row
        if (cells.every((c) => /^[-:]+$/.test(c))) return;
        processedLines.push(
          <div key={`t-${lIdx}`} className="flex gap-4 text-xs font-data py-1 border-b border-border/30">
            {cells.map((cell, cIdx) => (
              <span key={cIdx} className="flex-1" dangerouslySetInnerHTML={{ __html: processInlineMarkdown(cell) }} />
            ))}
          </div>
        );
        return;
      }

      // Regular line
      processedLines.push(
        <div
          key={`p-${lIdx}`}
          dangerouslySetInnerHTML={{ __html: processInlineMarkdown(trimmed) }}
        />
      );
    });

    if (processedLines.length > 0) {
      blocks.push(
        <div key={pIdx} className="mb-3 last:mb-0">
          {processedLines}
        </div>
      );
    }
  });

  return blocks;
}

export function ChatMessage({ role, content, isStreaming, stock }: ChatMessageProps) {
  const isUser = role === "user";

  const bubble = (
    <>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary/20"
            : "bg-gradient-to-br from-cyan-500/20 to-emerald-500/20"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Bot className="h-4 w-4 text-cyan-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary/10 border border-primary/20 text-on-surface rounded-tr-sm"
            : "bg-surface-container-high border border-border/50 text-on-surface-variant rounded-tl-sm"
        }`}
      >
        {renderContent(content)}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-primary/60 ml-0.5 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </>
  );

  // Assistant replies about a stock show the live snapshot side by side
  if (!isUser && stock) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className={`flex gap-3 flex-1 min-w-0 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          {bubble}
        </div>
        <div className="w-full lg:w-[50%] lg:max-w-md shrink-0">
          <StockSnapshot symbol={stock.symbol} companyName={stock.companyName} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {bubble}
    </div>
  );
}
