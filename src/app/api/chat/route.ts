import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import researchChunks from "@/data/research-chunks.json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Free-tier Groq limits tokens per day per model. If the primary model is
// rate-limited (429), fall back to another model with its own quota.
const CHAT_MODELS = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
];

async function createStream(
  messages: { role: string; content: string }[]
): Promise<AsyncIterable<Groq.Chat.Completions.ChatCompletionChunk>> {
  let lastError: unknown = null;
  for (const model of CHAT_MODELS) {
    try {
      return await groq.chat.completions.create({
        model,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
        messages,
      });
    } catch (err) {
      lastError = err;
      const msg = (err as Error)?.message ?? "";
      const isRateLimit =
        (err as { status?: number })?.status === 429 || /rate.?limit/i.test(msg);
      const isBadModel =
        (err as { status?: number })?.status === 404 && /does not exist/i.test(msg);
      if (!isRateLimit && !isBadModel) throw err;
      console.warn(`Groq failed on ${model}, trying fallback model...`);
    }
  }
  throw lastError;
}

// RAG: Keyword-based search for relevant research chunks
function searchResearchChunks(query: string, topK: number = 4): string {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryWords.length === 0) return "";

  // Score each chunk based on keyword matches
  const scored = researchChunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      // Exact word match
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    }

    // Bonus for section header matches
    const sectionLower = chunk.section.toLowerCase();
    for (const word of queryWords) {
      if (sectionLower.includes(word)) {
        score += 3;
      }
    }

    return { ...chunk, score };
  });

  // Sort by score and return top K with score > 0
  const relevant = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (relevant.length === 0) return "";

  // Combine relevant chunks into a context block
  const context = relevant
    .map(
      (c, i) =>
        `[Reference ${i + 1} — Section: "${c.section}"]\n${c.content}`
    )
    .join("\n\n---\n\n");

  return context;
}

// Check if the query is research-related
function isResearchQuery(query: string): boolean {
  const researchKeywords = [
    "withdrawal",
    "withdraw",
    "retirement income",
    "dynamic",
    "safety first",
    "bucket",
    "sustainable",
    "drawdown",
    "sequence of returns",
    "longevity",
    "annuity",
    "guardrails",
    "ceiling floor",
    "spending rule",
    "research",
    "paper",
    "study",
    "ssrn",
    "ravi saraogi",
    "dynamic withdrawal",
    "retirement strategy",
    "withdrawal rate",
    "4% rule",
    "trinity study",
  ];

  const queryLower = query.toLowerCase();
  return researchKeywords.some((kw) => queryLower.includes(kw));
}

const SYSTEM_PROMPT = `You are ArthaAI, an AI-powered financial planning and guidance assistant.

Role:
- Act as an expert financial planner, investment assistant, and money guidance helper.
- Help users with budgeting, saving, investing basics, goal planning, debt management, tax awareness, and general personal finance education.
- Explain concepts clearly, practically, and in simple language.

Behavior:
- Ask clarifying questions when the user's goal, time horizon, risk tolerance, country, income, or constraints are unclear.
- Give actionable steps, examples, and structured advice.
- When suitable, present answers as bullet points, checklists, or step-by-step plans.
- If the user asks for recommendations, provide options with pros and cons.
- If the user asks about markets or investments, include risks and the need for diversification.
- Be concise by default, but expand when the topic is complex.
- Maintain a friendly, trustworthy, professional tone.
- Avoid jargon unless you explain it.

Financial safety and accuracy:
- Do not claim certainty about future market performance.
- Do not present yourself as a licensed financial advisor or lawyer.
- Add a brief caution when needed that information is educational and not personalized regulated advice.
- Encourage users to verify important decisions with a qualified professional for large, tax-sensitive, or regulated matters.
- Never request or store sensitive credentials, OTPs, passwords, or account logins.

Response style:
- Start directly with the answer.
- Use a clean structure with headings when helpful.
- Prefer practical guidance over theory.
- If the user asks for calculations, compute clearly and show the formula or logic.
- Keep responses focused and actionable. Don't ramble.

Brand voice:
- ArthaAI means wisdom for wealth and financial well-being.
- Emphasize clarity, confidence, discipline, and long-term thinking.

Indian context (CRITICAL):
- Always use Indian Rupees (₹) in all financial examples, calculations, and recommendations.
- Reference Indian financial products: PPF, EPF, NPS, ELSS, Nifty 50, Sensex, Sukanya Samriddhi, SCSS, NSC, RD, FD.
- Use Indian tax slabs (Old/New Regime FY 2024-25), Section 80C, 80D, HRA, GST.
- Reference Indian platforms: Groww, Zerodha, Kuvera, Paytm Money, PhonePe, Google Pay.
- Use Indian context for salary ranges, cost of living, real estate prices, and investment amounts.
- Default to Indian mutual fund categories: equity, debt, hybrid, index funds tracking Nifty/Sensex.
- When discussing loans, use Indian home loan rates (8-9%), education loan rates (10-12%), personal loan rates (12-18%).
- Reference Indian market hours (9:15 AM - 3:30 PM IST), settlement cycles (T+1), and SEBI regulations.
- Always assume the user is based in India unless they explicitly state otherwise.

Topic handling:
- Answer finance, money, budgeting, investing, tax, insurance, debt, retirement, and general personal finance questions thoroughly.
- If the question is related to money or has a financial angle, answer it fully.
- If the question is unrelated to finance, respond briefly and humbly: "I'm ArthaAI, a finance-focused assistant. I'd love to help you with budgeting, investing, taxes, or any money-related questions!"
- Never pretend to be something you're not.

Stock queries:
- When the user asks about a specific stock (by name or ticker, e.g. TCS, Reliance, AAPL), the app automatically displays a live price card and historical price chart alongside your reply.
- Refer to the displayed chart naturally when relevant (e.g. "The chart above shows...") instead of describing numbers that may change.
- Keep stock commentary educational: discuss trends, fundamentals, and risk briefly, and avoid price predictions.`;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const { messages, stockNews, stockQuote } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    // Limit conversation history
    const trimmedMessages = messages.slice(-20);

    // RAG: Check if the latest user message is research-related
    const lastUserMessage = trimmedMessages
      .filter((m: { role: string }) => m.role === "user")
      .pop()?.content || "";

    let systemPrompt = SYSTEM_PROMPT;

    if (isResearchQuery(lastUserMessage)) {
      const context = searchResearchChunks(lastUserMessage, 4);
      if (context) {
        systemPrompt += `\n\n--- RESEARCH CONTEXT ---\nThe following excerpts are from a research paper on dynamic withdrawal strategies for retirement income. Use this information to provide accurate, evidence-based answers when relevant.\n\n${context}\n\n--- END RESEARCH CONTEXT ---`;
      }
    }

    // Latest stock news context (fetched at send time, so it is more recent
    // than your training data)
    if (Array.isArray(stockNews) && stockNews.length > 0) {
      const headlines = stockNews
        .slice(0, 3)
        .map((h: string, i: number) => `${i + 1}. ${h}`)
        .join("\n");
      systemPrompt += `\n\n--- LATEST STOCK NEWS ---\nThe user asked about a stock, and these are its most recent news headlines (provided by Google News at the time of this conversation):\n${headlines}\n\nGuidelines:\n- Use these headlines to answer questions about recent results, earnings, and company news.\n- Treat them as recent and reliable enough to summarize, but attribute specifics to "recent news" and avoid fabricating numbers not stated in the headlines.\n- If the user asks for figures the headlines do not contain, say the news summary is limited and point them to the news card in the UI.\n--- END LATEST STOCK NEWS ---`;
    }

    // Live stock quote (fetched at send time from the exchange data feed,
    // so ArthaAI can answer price questions instead of citing a training cutoff)
    const quote = stockQuote as
      | {
          symbol?: string;
          companyName?: string;
          lastPrice?: number;
          change?: number;
          percentChange?: number;
          previousClose?: number;
          currency?: string;
        }
      | undefined;

    if (quote?.lastPrice != null) {
      const fmt = (n: number) =>
        n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
      const changeText =
        quote.change != null
          ? ` (${quote.change > 0 ? "+" : ""}${fmt(quote.change)} / ${quote.percentChange != null ? (quote.percentChange > 0 ? "+" : "") + fmt(quote.percentChange) + "%" : "—"} today)`
          : "";
      systemPrompt += `\n\n--- CURRENT STOCK QUOTE ---\nThe user asked about ${quote.companyName ?? quote.symbol ?? "a stock"} (${quote.symbol ?? "unknown"}). This is its live quote fetched at the time of this conversation:\n- Current price: ₹${fmt(quote.lastPrice)}${changeText}\n${quote.previousClose != null ? `- Previous close: ₹${fmt(quote.previousClose)}\n` : ""}\nGuidelines:\n- If the user asks for the current share price or today's change, answer directly with the numbers above. NEVER say you lack access to real-time data or current market prices when a quote is provided.\n- The live price card and chart shown to the user in the UI reflect the same data.\n- For details not present above (P/E ratio, market cap, etc.), say you don't have that specific figure.\n--- END CURRENT STOCK QUOTE ---`;
    }

    const stream = await createStream([
      { role: "system", content: systemPrompt },
      ...trimmedMessages,
    ]);

    // Convert Groq stream to ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
