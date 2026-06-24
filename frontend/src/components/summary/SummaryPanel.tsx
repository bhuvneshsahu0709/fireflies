"use client";

import { useState } from "react";
import { FileText, CheckSquare, Tag, ChevronDown, ChevronUp, BookOpen, Sparkles } from "lucide-react";
import type { Summary, ActionItem, Chapter } from "@/types";
import { cn, formatTimestamp } from "@/lib/utils";
import ActionItemsPanel from "./ActionItemsPanel";
import ChatPanel from "@/components/chat/ChatPanel";

interface Props {
  summary: Summary | undefined;
  actionItems: ActionItem[];
  meetingId: string;
  meetingTitle: string;
  onTimeSeek: (t: number) => void;
  onActionItemsChange: () => void;
}

type Tab = "summary" | "actions" | "topics" | "ask";

export default function SummaryPanel({
  summary, actionItems, meetingId, meetingTitle, onTimeSeek, onActionItemsChange
}: Props) {
  const [tab, setTab] = useState<Tab>("summary");

  const tabs: { id: Tab; label: string; icon: typeof FileText; count?: number }[] = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "actions", label: "Actions", icon: CheckSquare, count: actionItems.filter((a) => !a.completed).length },
    { id: "topics", label: "Topics", icon: Tag },
    { id: "ask", label: "AskFred", icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-full dark:bg-gray-900">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 px-2 shrink-0 bg-white dark:bg-gray-900 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
              tab === id
                ? "border-violet-600 text-violet-700 dark:text-violet-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Icon size={14} />
            {label}
            {count !== undefined && count > 0 && (
              <span className="ml-0.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "summary" && <SummaryTab summary={summary} onTimeSeek={onTimeSeek} />}
        {tab === "actions" && (
          <div className="overflow-y-auto h-full">
            <ActionItemsPanel meetingId={meetingId} actionItems={actionItems} onChange={onActionItemsChange} />
          </div>
        )}
        {tab === "topics" && <TopicsTab summary={summary} onTimeSeek={onTimeSeek} />}
        {tab === "ask" && <ChatPanel meetingId={meetingId} meetingTitle={meetingTitle} />}
      </div>
    </div>
  );
}

function SummaryTab({ summary, onTimeSeek }: { summary?: Summary; onTimeSeek: (t: number) => void }) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  if (!summary) {
    return (
      <div className="overflow-y-auto h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No summary available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-5 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Overview</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary.overview}</p>
        </div>

        {summary.chapters.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen size={13} />Chapters
            </h3>
            <div className="space-y-2">
              {summary.chapters.map((ch, i) => (
                <ChapterCard
                  key={i}
                  chapter={ch}
                  expanded={expandedChapter === i}
                  onToggle={() => setExpandedChapter(expandedChapter === i ? null : i)}
                  onTimeSeek={onTimeSeek}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterCard({
  chapter, expanded, onToggle, onTimeSeek
}: {
  chapter: Chapter;
  expanded: boolean;
  onToggle: () => void;
  onTimeSeek: (t: number) => void;
}) {
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); onTimeSeek(chapter.start_time); }}
            className="text-xs font-mono text-violet-600 bg-violet-50 dark:bg-violet-900/40 hover:bg-violet-100 px-2 py-0.5 rounded transition-colors shrink-0"
          >
            {formatTimestamp(chapter.start_time)}
          </button>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{chapter.title}</span>
        </div>
        {expanded
          ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
          : <ChevronDown size={15} className="text-gray-400 shrink-0" />
        }
      </div>
      {expanded && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{chapter.summary}</p>
        </div>
      )}
    </div>
  );
}

function TopicsTab({ summary, onTimeSeek }: { summary?: Summary; onTimeSeek: (t: number) => void }) {
  if (!summary) {
    return (
      <div className="overflow-y-auto h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Tag size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No topics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-5 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Topics</h3>
          <div className="flex flex-wrap gap-2">
            {summary.key_topics.map((topic) => (
              <span key={topic} className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-full border border-violet-100 dark:border-violet-800">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Meeting Outline</h3>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-4 pl-8">
              {summary.chapters.map((ch, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-violet-400" />
                  <button onClick={() => onTimeSeek(ch.start_time)} className="text-xs font-mono text-violet-600 hover:underline">
                    {formatTimestamp(ch.start_time)}
                  </button>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{ch.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
