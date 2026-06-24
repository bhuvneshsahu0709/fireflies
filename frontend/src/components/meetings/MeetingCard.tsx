"use client";

import Link from "next/link";
import { Clock, Users, Calendar, MoreVertical, Trash2, Edit2, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Meeting } from "@/types";
import { formatDate, formatDuration, formatRelative, getInitials } from "@/lib/utils";

interface MeetingCardProps {
  meeting: Meeting;
  onDelete: (id: string) => void;
  onEdit: (meeting: Meeting) => void;
}

const AVATAR_COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#d97706",
  "#dc2626", "#0891b2", "#65a30d", "#db2777",
];

function getColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function MeetingCard({ meeting, onDelete, onEdit }: MeetingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="group bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50 transition-all duration-200 overflow-hidden">
      <Link href={`/meetings/${meeting.id}`} className="block p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Meeting icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate group-hover:text-purple-700 transition-colors">
                {meeting.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{formatRelative(meeting.date)}</p>
            </div>
          </div>

          {/* Status badge */}
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle size={11} />
            Processed
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" />
            {formatDate(meeting.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            {formatDuration(meeting.duration)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} className="text-slate-400" />
            {meeting.participants.length} people
          </span>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-1.5">
          {meeting.participants.slice(0, 5).map((p, i) => (
            <div
              key={i}
              title={p}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white"
              style={{
                background: getColor(p),
                marginLeft: i > 0 ? "-6px" : "0",
              }}
            >
              {getInitials(p)}
            </div>
          ))}
          {meeting.participants.length > 5 && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-white bg-slate-100 text-slate-500"
              style={{ marginLeft: "-6px" }}
            >
              +{meeting.participants.length - 5}
            </div>
          )}
          <span className="ml-2 text-xs text-slate-400 truncate">
            {meeting.participants.slice(0, 2).join(", ")}
            {meeting.participants.length > 2 && ` & ${meeting.participants.length - 2} more`}
          </span>
        </div>
      </Link>

      {/* Actions */}
      <div className="border-t border-slate-50 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Transcript
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            AI Summary
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-44 z-10">
              <button
                onClick={(e) => { e.preventDefault(); onEdit(meeting); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 size={14} className="text-slate-400" />
                Edit meeting
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onDelete(meeting.id); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete meeting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
