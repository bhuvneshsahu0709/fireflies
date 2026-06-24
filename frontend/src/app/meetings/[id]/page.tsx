"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Users, Calendar, Clock, Loader2, Download } from "lucide-react";
import { getMeeting, deleteMeeting } from "@/lib/api";
import type { MeetingDetail } from "@/types";
import { formatDateTime, formatDuration, getInitials } from "@/lib/utils";
import AudioPlayer from "@/components/player/AudioPlayer";
import TranscriptViewer from "@/components/transcript/TranscriptViewer";
import SummaryPanel from "@/components/summary/SummaryPanel";
import EditMeetingModal from "@/components/meetings/EditMeetingModal";
import ExportModal from "@/components/export/ExportModal";
import toast from "react-hot-toast";

const AVATAR_COLORS = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#0891b2","#65a30d","#db2777"];
function getColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const fetchMeeting = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMeeting(id);
      setMeeting(data);
    } catch {
      toast.error("Meeting not found");
      router.push("/meetings");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchMeeting(); }, [fetchMeeting]);

  const handleDelete = async () => {
    if (!meeting || !confirm("Delete this meeting and all its data?")) return;
    try {
      await deleteMeeting(meeting.id);
      toast.success("Meeting deleted");
      router.push("/meetings");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full dark:bg-gray-900">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (!meeting) return null;

  const segments = meeting.transcript?.segments ?? [];
  const comments = meeting.segment_comments ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
        <Link
          href="/meetings"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          Meetings
        </Link>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{meeting.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-1"><Calendar size={11} />{formatDateTime(meeting.date)}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{formatDuration(meeting.duration)}</span>
            <span className="flex items-center gap-1"><Users size={11} />{meeting.participants.length} participants</span>
          </div>
        </div>

        {/* Tags */}
        {meeting.tags?.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {meeting.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full border border-violet-100 dark:border-violet-800">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Participant avatars */}
        <div className="flex items-center shrink-0">
          {meeting.participants.slice(0, 4).map((p, i) => (
            <div
              key={i} title={p}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-900"
              style={{ background: getColor(p), marginLeft: i > 0 ? "-4px" : "0" }}
            >
              {getInitials(p)}
            </div>
          ))}
          {meeting.participants.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900" style={{ marginLeft: "-4px" }}>
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Player */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <AudioPlayer
          duration={meeting.duration}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          onSeek={setCurrentTime}
        />
      </div>

      {/* Main 2-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Transcript */}
        <div className="flex flex-col w-[52%] shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Transcript</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {segments.length} segments · Click to seek · <span className="text-violet-600">✦ hover to highlight</span>
            </p>
          </div>
          {segments.length > 0 ? (
            <TranscriptViewer
              segments={segments}
              comments={comments}
              meetingId={meeting.id}
              currentTime={currentTime}
              onSeek={setCurrentTime}
              onCommentsChange={fetchMeeting}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-sm font-medium mb-1">No transcript available</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary + chat panel */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <SummaryPanel
            summary={meeting.summary}
            actionItems={meeting.action_items}
            meetingId={meeting.id}
            meetingTitle={meeting.title}
            onTimeSeek={setCurrentTime}
            onActionItemsChange={fetchMeeting}
          />
        </div>
      </div>

      <EditMeetingModal
        meeting={editOpen ? meeting : null}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchMeeting}
      />

      {exportOpen && (
        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          meeting={meeting}
        />
      )}
    </div>
  );
}
