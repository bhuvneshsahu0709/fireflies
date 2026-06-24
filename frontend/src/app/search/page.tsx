"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Clock, ArrowRight, Loader2 } from "lucide-react";
import { search as searchAPI } from "@/lib/api";
import type { SearchResponse } from "@/types";
import { formatDate, formatTimestamp, speakerColor } from "@/lib/utils";
import Topbar from "@/components/layout/Topbar";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    searchAPI(q)
      .then(setResults)
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar />

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Search bar */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all meetings and transcripts…"
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 text-base bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
              />
            </div>
          </form>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-purple-600" />
            </div>
          )}

          {!loading && q && results && (
            <>
              {/* Meeting title matches */}
              {results.meetings.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Meetings ({results.meetings.length})
                  </h2>
                  <div className="space-y-2">
                    {results.meetings.map((m) => (
                      <Link
                        key={m.id}
                        href={`/meetings/${m.id}`}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-700">
                            {m.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(m.date)} · {m.participants.slice(0, 3).join(", ")}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Transcript matches */}
              {results.transcript_matches.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Transcript Matches ({results.transcript_matches.length})
                  </h2>
                  <div className="space-y-2">
                    {results.transcript_matches.map((match, i) => {
                      const color = speakerColor(match.speaker);
                      const highlighted = match.text.replace(
                        new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                        '<mark>$1</mark>'
                      );
                      return (
                        <Link
                          key={i}
                          href={`/meetings/${match.meeting_id}`}
                          className="block p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                              style={{ background: color }}
                            >
                              {match.speaker[0]}
                            </div>
                            <span className="text-xs font-semibold" style={{ color }}>
                              {match.speaker}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs font-mono text-slate-400">
                              <Clock size={11} />
                              {formatTimestamp(match.start_time)}
                            </span>
                            <span className="ml-auto text-xs text-slate-500 group-hover:text-purple-600 truncate max-w-[180px]">
                              {match.meeting_title}
                            </span>
                          </div>
                          <p
                            className="text-sm text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {results.meetings.length === 0 && results.transcript_matches.length === 0 && (
                <div className="text-center py-16">
                  <Search size={40} className="mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No results</h3>
                  <p className="text-sm text-slate-500">
                    No meetings or transcripts match &ldquo;{q}&rdquo;
                  </p>
                </div>
              )}
            </>
          )}

          {!q && !loading && (
            <div className="text-center py-16">
              <Search size={40} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Search your meetings</h3>
              <p className="text-sm text-slate-500">
                Search by meeting title, speaker name, or any word in the transcript
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
