"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Highlighter, Trash2, MessageSquare } from "lucide-react";
import type { TranscriptSegment, SegmentComment } from "@/types";
import { formatTimestamp, speakerColor, getInitials, cn, highlightText } from "@/lib/utils";
import { createComment, deleteComment } from "@/lib/api";
import toast from "react-hot-toast";

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a", text: "#713f12" },
  { label: "Green",  value: "#bbf7d0", text: "#14532d" },
  { label: "Blue",   value: "#bfdbfe", text: "#1e3a5f" },
  { label: "Pink",   value: "#fbcfe8", text: "#831843" },
  { label: "Orange", value: "#fed7aa", text: "#7c2d12" },
];

interface Props {
  segments: TranscriptSegment[];
  comments: SegmentComment[];
  meetingId: string;
  currentTime: number;
  onSeek: (t: number) => void;
  onCommentsChange: () => void;
}

export default function TranscriptViewer({
  segments, comments, meetingId, currentTime, onSeek, onCommentsChange
}: Props) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [highlightingId, setHighlightingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [savingComment, setSavingComment] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // sync active segment to player
  useEffect(() => {
    let best = 0;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].start_time <= currentTime) best = i;
      else break;
    }
    setActiveIdx(best);
  }, [currentTime, segments]);

  // auto-scroll active segment
  useEffect(() => {
    if (!query && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIdx, query]);

  const commentsBySegment = comments.reduce<Record<string, SegmentComment>>((acc, c) => {
    acc[c.segment_id] = c;
    return acc;
  }, {});

  const filtered = query
    ? segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : segments;

  const saveComment = async (segmentId: string) => {
    setSavingComment(true);
    try {
      await createComment(meetingId, { segment_id: segmentId, text: commentText, color: selectedColor });
      toast.success("Highlight saved");
      onCommentsChange();
      setHighlightingId(null);
      setCommentText("");
    } catch {
      toast.error("Failed to save highlight");
    } finally {
      setSavingComment(false);
    }
  };

  const removeComment = async (comment: SegmentComment) => {
    try {
      await deleteComment(meetingId, comment.id);
      toast.success("Highlight removed");
      onCommentsChange();
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="flex flex-col h-full dark:bg-gray-900">
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript…"
            className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 placeholder:text-gray-400 dark:text-gray-200"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
        {query && (
          <p className="text-xs text-gray-500 mt-1.5 pl-1">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Segments */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          filtered.map((seg) => {
            const origIdx = segments.indexOf(seg);
            const isActive = origIdx === activeIdx && !query;
            const color = speakerColor(seg.speaker);
            const comment = commentsBySegment[seg.id];
            const isHighlighting = highlightingId === seg.id;

            return (
              <div key={seg.id}>
                <div
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onSeek(seg.start_time)}
                  className={cn(
                    "group flex gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                    comment ? "ring-1" : "",
                    isActive
                      ? "bg-violet-50 dark:bg-violet-950/40 ring-1 ring-violet-200 dark:ring-violet-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  style={comment ? { background: comment.color + "40" } : {}}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: color }}
                  >
                    {getInitials(seg.speaker)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color }}>
                        {seg.speaker}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSeek(seg.start_time); }}
                        className={cn(
                          "text-xs font-mono px-1.5 py-0.5 rounded transition-colors",
                          isActive
                            ? "text-violet-600 bg-violet-100 dark:bg-violet-900/50"
                            : "text-gray-400 bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100"
                        )}
                      >
                        {formatTimestamp(seg.start_time)}
                      </button>
                    </div>
                    <p
                      className={cn("text-sm leading-relaxed dark:text-gray-300", isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-600")}
                      dangerouslySetInnerHTML={{ __html: query ? highlightText(seg.text, query) : seg.text }}
                    />
                    {comment && (
                      <div
                        className="mt-1.5 flex items-start gap-1.5 text-xs rounded-lg px-2 py-1"
                        style={{ background: comment.color + "60" }}
                      >
                        <MessageSquare size={11} className="shrink-0 mt-0.5 opacity-60" />
                        <span className="flex-1 opacity-80">{comment.text}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeComment(comment); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Highlight button */}
                  {!comment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHighlightingId(isHighlighting ? null : seg.id);
                        setCommentText("");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all shrink-0 mt-0.5"
                      title="Add highlight"
                    >
                      <Highlighter size={14} />
                    </button>
                  )}
                </div>

                {/* Inline highlight form */}
                {isHighlighting && (
                  <div
                    className="mx-3 mb-2 p-3 rounded-xl border border-violet-200 bg-violet-50 dark:bg-violet-950/30 space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Color picker */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 mr-1">Color:</span>
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setSelectedColor(c.value)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 transition-transform",
                            selectedColor === c.value ? "border-gray-700 scale-110" : "border-transparent"
                          )}
                          style={{ background: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a note (optional)…"
                      autoFocus
                      className="w-full px-2.5 py-1.5 text-xs border border-violet-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30 bg-white dark:bg-gray-800"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHighlightingId(null)}
                        className="flex-1 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveComment(seg.id)}
                        disabled={savingComment}
                        className="flex-1 py-1.5 text-xs text-white bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60"
                      >
                        <Highlighter size={12} />
                        Highlight
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
