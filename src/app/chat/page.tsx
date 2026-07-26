"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Bot,
  Sparkles,
  TrendingUp,
  Wallet,
  PiggyBank,
  Shield,
  Calculator,
  Trash2,
} from "lucide-react";
import { ChatMessage } from "@/components/chat-message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "arthaai-chat-history";
const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm **ArthaAI** — your financial wisdom assistant. 🤖\n\nI can help you with:\n• Budgeting and saving strategies\n• Investment basics (SIP, mutual funds, stocks)\n• Tax planning and saving\n• Insurance guidance\n• Debt management\n• Retirement planning\n• Any money-related questions\n\nWhat would you like to know?",
};

const SUGGESTIONS = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "How do I start investing with ₹5,000/month?",
  },
  {
    icon: <Wallet className="h-4 w-4" />,
    text: "How much emergency fund should I have?",
  },
  {
    icon: <PiggyBank className="h-4 w-4" />,
    text: "What's the 50/30/20 budgeting rule?",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    text: "Do I need health insurance?",
  },
  {
    icon: <Calculator className="h-4 w-4" />,
    text: "Should I rent or buy a house?",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    text: "How do I save tax legally in India?",
  },
];

function loadHistory(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveHistory(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep last 50 messages
    const trimmed = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load history on mount
  useEffect(() => {
    const history = loadHistory();
    if (history.length > 0) {
      setMessages(history);
    }
    setIsLoaded(true);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text || input).trim();
      if (!content || isStreaming) return;

      const userMessage: Message = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);

      // Build conversation for API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        abortRef.current = new AbortController();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add empty assistant message
        setMessages([...newMessages, { role: "assistant", content: "" }]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;
            setMessages([
              ...newMessages,
              { role: "assistant", content: assistantContent },
            ]);
          }
        }

        // Save final history
        const finalMessages = [
          ...newMessages,
          { role: "assistant" as const, content: assistantContent },
        ];
        saveHistory(finalMessages);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Chat error:", err);
        const errorMessage: Message = {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again in a moment.",
        };
        setMessages([...newMessages, errorMessage]);
        saveHistory([...newMessages, errorMessage]);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [input, isStreaming, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const showWelcome = isLoaded && messages.length === 0;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="shrink-0 border-b border-border/50 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold">
                  <span className="text-on-surface">Artha</span>
                  <span className="text-primary">AI</span>
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  Wealth wisdom, powered by AI
                </p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted-foreground hover:text-rose-400"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {showWelcome && (
            <>
              {/* Welcome */}
              <ChatMessage
                role={WELCOME_MESSAGE.role}
                content={WELCOME_MESSAGE.content}
              />

              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-surface-container-high/50 hover:bg-surface-container-high hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      {s.icon}
                    </div>
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {!showWelcome &&
            messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border/50 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ArthaAI anything about money..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-surface-container-high px-4 py-3 pr-12 text-sm text-on-surface placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                style={{ maxHeight: "160px" }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            ArthaAI provides educational guidance only. Not regulated financial
            advice. Always verify with a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
}
