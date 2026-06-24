"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Clock, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types";
import { askMeeting } from "@/lib/api";
import { formatTimestamp, cn } from "@/lib/utils";

interface Props {
  meetingId: string;
  meetingTitle: string;
}

const SUGGESTED = [
  "What were the main decisions made?",
  "Who are the action item owners?",
  "What blockers were mentioned?",
  "Summarize the key takeaways.",
];

export default function ChatPanel({ meetingId, meetingTitle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askMeeting(meetingId, question);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.answer,
        sources: res.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that question. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex flex-col h-full dark:bg-gray-900">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AskFred</h3>
            <p className="text-xs text-gray-500">Ask anything about this meeting</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-4">
              <Bot size={24} className="text-violet-600" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hi! I&apos;m Fred, your AI assistant.
            </p>
            <p className="text-xs text-gray-500 mb-5 max-w-xs">
              Ask me anything about &ldquo;{meetingTitle}&rdquo; — decisions, action items, blockers, or key moments.
            </p>
            <div className="space-y-2 w-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggested questions</p>
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="w-full text-left text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "user"
                  ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                  : "bg-violet-100 dark:bg-violet-900/50"
              )}>
                {msg.role === "user"
                  ? <User size={14} className="text-white" />
                  : <Bot size={14} className="text-violet-600" />
                }
              </div>

              <div className={cn("flex-1 max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                )}>
                  {msg.content}
                </div>

                {/* Source segments */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-gray-400 pl-1">Sources from transcript:</p>
                    {msg.sources.slice(0, 2).map((src) => (
                      <div
                        key={src.id}
                        className="flex items-start gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl px-3 py-2"
                      >
                        <Clock size={11} className="text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-violet-600">{src.speaker} · {formatTimestamp(src.start_time)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">{src.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-violet-600" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-violet-400/30 focus-within:border-violet-400 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this meeting…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-200 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
          >
            {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
      </form>
    </div>
  );
}
