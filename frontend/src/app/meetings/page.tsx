"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SlidersHorizontal, Mic2, ChevronDown, X, User, Tag } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import MeetingCard from "@/components/meetings/MeetingCard";
import CreateMeetingModal from "@/components/meetings/CreateMeetingModal";
import EditMeetingModal from "@/components/meetings/EditMeetingModal";
import { getMeetings, deleteMeeting } from "@/lib/api";
import type { Meeting } from "@/types";
import toast from "react-hot-toast";

const ALL_TAGS = ["Product", "Planning", "Q4", "AI", "Engineering", "Standup", "Sprint", "Customer Success", "Enterprise", "Integrations", "Design", "Accessibility", "Leadership", "Fundraising", "Strategy"];

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const [participant, setParticipant] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [participantInput, setParticipantInput] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMeetings({
        search: search || undefined,
        sort,
        participant: participant || undefined,
        tag: selectedTag || undefined,
      });
      setMeetings(data.meetings);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [search, sort, participant, selectedTag]);

  useEffect(() => {
    const t = setTimeout(fetchMeetings, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMeetings, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meeting and all its data?")) return;
    setDeleting(id);
    try {
      await deleteMeeting(id);
      toast.success("Meeting deleted");
      fetchMeetings();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const activeFilterCount = [participant, selectedTag].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Topbar breadcrumb="Meetings" onNewMeeting={() => setCreateOpen(true)} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">

          {/* Page header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Meetings</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? "Loading…" : `${total} meeting${total !== 1 ? "s" : ""}${activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active` : ""}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSort("recent")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sort === "recent"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSort("oldest")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sort === "oldest"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Oldest
                </button>
              </div>

              {/* Filter dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
                    activeFilterCount > 0
                      ? "bg-violet-50 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 w-4 h-4 bg-violet-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown size={12} className="text-gray-400" />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 w-72 z-20">
                    {/* Participant filter */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Filter by Participant
                    </p>
                    <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                        <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          value={participantInput}
                          onChange={(e) => setParticipantInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setParticipant(participantInput.trim());
                              setFilterOpen(false);
                            }
                          }}
                          placeholder="Name…"
                          autoFocus
                          className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                        />
                      </div>
                      <button
                        onClick={() => { setParticipant(participantInput.trim()); setFilterOpen(false); }}
                        className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Tag filter */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag size={11} />Filter by Tag
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_TAGS.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedTag(selectedTag === t ? "" : t);
                            setFilterOpen(false);
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            selectedTag === t
                              ? "bg-violet-600 text-white border-violet-600"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setParticipant(""); setParticipantInput(""); setSelectedTag("");
                          setFilterOpen(false);
                        }}
                        className="mt-3 text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {participant && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full border border-violet-100 dark:border-violet-800">
                  <User size={11} />Participant: {participant}
                  <button onClick={() => { setParticipant(""); setParticipantInput(""); }} className="ml-0.5 hover:text-violet-900">
                    <X size={10} />
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full border border-violet-100 dark:border-violet-800">
                  <Tag size={11} />Tag: {selectedTag}
                  <button onClick={() => setSelectedTag("")} className="ml-0.5 hover:text-violet-900">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <EmptyState onNew={() => setCreateOpen(true)} search={search} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {meetings.map((m) => (
                <div key={m.id} className={deleting === m.id ? "opacity-50 pointer-events-none" : ""}>
                  <MeetingCard
                    meeting={m}
                    onDelete={handleDelete}
                    onEdit={setEditMeeting}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchMeetings}
      />

      <EditMeetingModal
        meeting={editMeeting}
        onClose={() => setEditMeeting(null)}
        onUpdated={fetchMeetings}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onNew, search }: { onNew: () => void; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-200">
        <Mic2 size={28} className="text-white" />
      </div>
      {search ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No meetings found</h3>
          <p className="text-sm text-gray-500">No results for &ldquo;{search}&rdquo;</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No meetings yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Add your first meeting to get started with transcripts and AI summaries
          </p>
          <button
            onClick={onNew}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Add First Meeting
          </button>
        </>
      )}
    </div>
  );
}
