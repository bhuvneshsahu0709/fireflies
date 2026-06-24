"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Mic, Bell, Video, Upload, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  breadcrumb?: string;
  onNewMeeting?: () => void;
}

export default function Topbar({ breadcrumb = "Home", onNewMeeting }: TopbarProps) {
  const [query, setQuery] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="flex items-center gap-4 px-5 py-2.5 bg-white border-b border-gray-200 shrink-0 h-[52px]">
      {/* Breadcrumb */}
      <span className="text-[13.5px] font-medium text-gray-700 shrink-0 w-24">{breadcrumb}</span>

      {/* Search — centered */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or keyword"
            className="w-full pl-9 pr-16 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all placeholder:text-gray-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-medium">Ctrl</span>
            <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-medium">K</span>
          </div>
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Unlimited meetings badge */}
        <span className="text-xs text-gray-500 font-medium hidden lg:block">Unlimited Meetings</span>

        {/* Upgrade */}
        <button className="px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
          Upgrade
        </button>

        {/* Capture button with dropdown */}
        <div className="relative">
          <div className="flex items-center rounded-lg overflow-hidden border border-violet-600 bg-violet-600">
            <button
              onClick={onNewMeeting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
            >
              <Video size={13} />
              Capture
            </button>
            <div className="w-px h-5 bg-violet-500" />
            <button
              onClick={() => setCaptureOpen(!captureOpen)}
              className="px-2 py-1.5 text-white hover:bg-violet-700 transition-colors"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          {captureOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-48 z-20">
              <button
                onClick={() => { setCaptureOpen(false); onNewMeeting?.(); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Video size={15} className="text-violet-500" />
                Capture Meeting
              </button>
              <button
                onClick={() => setCaptureOpen(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload size={15} className="text-violet-500" />
                Upload File
              </button>
              <button
                onClick={() => setCaptureOpen(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Calendar size={15} className="text-violet-500" />
                Schedule
              </button>
            </div>
          )}
        </div>

        {/* Mic */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
          <Mic size={17} />
        </button>

        {/* Bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          B
        </div>
      </div>
    </header>
  );
}
