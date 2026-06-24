"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video, Upload, Calendar, Play, ArrowRight,
  X, ChevronRight
} from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import CreateMeetingModal from "@/components/meetings/CreateMeetingModal";
import { useRouter } from "next/navigation";

const INTEGRATIONS = [
  { name: "HubSpot", color: "#ff5722", abbr: "H" },
  { name: "Notion", color: "#000000", abbr: "N" },
  { name: "Salesforce", color: "#00a1e0", abbr: "S" },
  { name: "Slack", color: "#4a154b", abbr: "Sl" },
  { name: "Jira", color: "#0052cc", abbr: "J" },
];

const QUICK_STARTS = [
  {
    icon: Video,
    label: "Capture Meeting",
    desc: "Record your next meeting",
    color: "#7c3aed",
    bg: "bg-violet-50",
  },
  {
    icon: Upload,
    label: "Upload File",
    desc: "Import an existing transcript",
    color: "#ea580c",
    bg: "bg-orange-50",
  },
  {
    icon: Calendar,
    label: "Schedule",
    desc: "Plan a future meeting",
    color: "#0ea5e9",
    bg: "bg-sky-50",
  },
];

export default function HomePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <Topbar breadcrumb="Home" onNewMeeting={() => setCreateOpen(true)} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

          {/* Welcome hero */}
          <div
            className="relative rounded-2xl overflow-hidden p-8 min-h-[280px] flex flex-col items-center justify-center text-center"
            style={{
              background: "linear-gradient(135deg, #bfdbfe 0%, #a5f3fc 30%, #fde68a 60%, #fca5a5 100%)",
            }}
          >
            {/* Mock app preview thumbnail */}
            <div className="mb-6 relative">
              <div className="w-48 h-32 rounded-xl bg-white/80 backdrop-blur shadow-xl overflow-hidden border border-white/60 mx-auto">
                <div className="h-5 bg-gray-800/90 flex items-center gap-1 px-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="p-2 space-y-1">
                  {["Q4 Roadmap Planning", "Engineering Standup", "TechCorp Review"].map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-violet-200" />
                      <div className="h-2 bg-gray-200 rounded flex-1" />
                      <div className="text-[6px] text-gray-400">{i === 0 ? "2h" : i === 1 ? "45m" : "1h"}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Play button overlay */}
              <button className="absolute inset-0 flex items-center justify-center group">
                <div className="w-12 h-12 rounded-full bg-violet-600 shadow-lg shadow-violet-400/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play size={20} className="text-white ml-0.5" />
                </div>
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Aboard, Bhuvnesh Sahu!
            </h1>
            <p className="text-sm text-gray-700 max-w-sm">
              Fireflies is now ready to automate your meetings and streamline your workflows.
            </p>
          </div>

          {/* 0 Upcoming badge (top right absolute on hero isn't feasible, show as separate row) */}
          <div className="flex justify-end -mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <Calendar size={13} className="text-violet-500" />
              0 Upcoming
            </div>
          </div>

          {/* Connect Slack & Email banner */}
          <div className="flex items-center gap-4 bg-violet-50 border border-violet-100 rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#4a154b] flex items-center justify-center">
                <span className="text-white text-xs font-bold">Sl</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#ea4335] flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 flex-1">
              <span className="font-semibold">Connect Slack and Email</span>
              {" "}&mdash; get richer insights with full context.{" "}
              <button className="text-violet-600 font-semibold hover:underline inline-flex items-center gap-0.5">
                Connect <ArrowRight size={12} />
              </button>
            </p>
            <button className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Get to Know Fireflies */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Calendar size={14} className="text-gray-400" />
              <span className="font-medium">Get to Know Fireflies</span>
            </div>
            <Link
              href="/meetings"
              className="flex items-center justify-between bg-white border border-gray-100 hover:border-violet-200 hover:shadow-sm rounded-xl px-5 py-4 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Video size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    Fireflies AI Platform Quick Overview
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Aug 08 2024, 3:52 PM · 5 meetings loaded</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
            </Link>
          </div>

          {/* Quick Start */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Quick Start</h2>
            <p className="text-sm text-gray-500 mb-4">See Fireflies in action with your first meeting.</p>
            <div className="grid grid-cols-3 gap-4">
              {QUICK_STARTS.map(({ icon: Icon, label, desc, color, bg }) => (
                <button
                  key={label}
                  onClick={label === "Capture Meeting" ? () => setCreateOpen(true) : undefined}
                  className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 hover:border-violet-200 hover:shadow-sm rounded-xl transition-all group text-center"
                >
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-700 transition-colors">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Try More */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Try More</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Integrations */}
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Connect your work apps</h3>
                <p className="text-xs text-gray-500 mb-4">Auto-log meeting notes and action items to your work apps.</p>
                <div className="space-y-2.5">
                  {INTEGRATIONS.slice(0, 3).map((int) => (
                    <div
                      key={int.name}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: int.color }}
                        >
                          {int.abbr}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{int.name}</span>
                      </div>
                      <button className="text-xs text-violet-600 font-semibold hover:underline">Connect</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile app */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Get Fireflies Mobile App</h3>
                <p className="text-xs text-gray-500 mb-4 flex-1">
                  Transcribe and summarize in-person conversations with mobile app.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    Google Play
                  </button>
                  <button className="flex-1 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    App Store
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); router.push("/meetings"); }}
      />
    </div>
  );
}
