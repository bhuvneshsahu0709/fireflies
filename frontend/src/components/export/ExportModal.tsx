"use client";

import { useState } from "react";
import { Download, FileText, Code, Printer, Check, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { MeetingDetail } from "@/types";
import { formatDateTime, formatDuration, formatTimestamp } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  meeting: MeetingDetail;
}

type Format = "markdown" | "txt" | "pdf";

const FORMATS: { id: Format; label: string; desc: string; icon: typeof FileText }[] = [
  { id: "markdown", label: "Markdown", desc: "Best for Notion, GitHub, Obsidian", icon: Code },
  { id: "txt", label: "Plain Text", desc: "Universal — opens anywhere", icon: FileText },
  { id: "pdf", label: "PDF", desc: "Print-ready via browser dialog", icon: Printer },
];

export default function ExportModal({ open, onClose, meeting }: Props) {
  const [format, setFormat] = useState<Format>("markdown");
  const [section, setSection] = useState<"transcript" | "summary" | "all">("all");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // brief UX delay

    if (format === "pdf") {
      exportPDF(meeting, section);
    } else {
      const content =
        format === "markdown"
          ? buildMarkdown(meeting, section)
          : buildText(meeting, section);
      downloadFile(
        content,
        `${meeting.title.replace(/[^a-z0-9]/gi, "_")}.${format === "markdown" ? "md" : "txt"}`,
        "text/plain"
      );
    }

    setLoading(false);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1200);
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Meeting" size="md">
      <div className="space-y-5">
        {/* Format picker */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Format</p>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFormat(id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                  format === id
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <Icon size={20} className={format === id ? "text-violet-600" : "text-gray-400"} />
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section picker */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Include</p>
          <div className="flex gap-2">
            {(["all", "transcript", "summary"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                  section === s
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "Everything" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Preview snippet */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 max-h-36 overflow-y-auto">
          <pre className="text-[11px] text-gray-500 font-mono whitespace-pre-wrap leading-relaxed">
            {format === "markdown"
              ? buildMarkdown(meeting, section).slice(0, 500) + "…"
              : buildText(meeting, section).slice(0, 500) + "…"}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || done}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-70 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Exporting…</>
            ) : done ? (
              <><Check size={15} /> Done!</>
            ) : (
              <><Download size={15} /> Export {format.toUpperCase()}</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Builders ──────────────────────────────────────────────────────────────────

function buildMarkdown(meeting: MeetingDetail, section: string): string {
  const lines: string[] = [];
  lines.push(`# ${meeting.title}`);
  lines.push(`**Date:** ${formatDateTime(meeting.date)}`);
  lines.push(`**Duration:** ${formatDuration(meeting.duration)}`);
  lines.push(`**Participants:** ${meeting.participants.join(", ")}`);
  if (meeting.tags?.length) lines.push(`**Tags:** ${meeting.tags.join(", ")}`);
  lines.push("");

  if (section !== "transcript" && meeting.summary) {
    lines.push("## Summary");
    lines.push(meeting.summary.overview);
    lines.push("");
    if (meeting.summary.key_topics.length) {
      lines.push("### Key Topics");
      meeting.summary.key_topics.forEach((t) => lines.push(`- ${t}`));
      lines.push("");
    }
    if (meeting.summary.chapters.length) {
      lines.push("### Chapters");
      meeting.summary.chapters.forEach((ch) => {
        lines.push(`#### ${ch.title} (${formatTimestamp(ch.start_time)})`);
        lines.push(ch.summary);
        lines.push("");
      });
    }
  }

  if (section !== "transcript" && meeting.action_items.length) {
    lines.push("## Action Items");
    meeting.action_items.forEach((ai) => {
      const checkbox = ai.completed ? "- [x]" : "- [ ]";
      const assignee = ai.assignee ? ` *(${ai.assignee})*` : "";
      lines.push(`${checkbox} ${ai.text}${assignee}`);
    });
    lines.push("");
  }

  if (section !== "summary" && meeting.transcript) {
    lines.push("## Transcript");
    meeting.transcript.segments.forEach((seg) => {
      lines.push(`**[${formatTimestamp(seg.start_time)}] ${seg.speaker}:** ${seg.text}`);
    });
  }

  return lines.join("\n");
}

function buildText(meeting: MeetingDetail, section: string): string {
  const lines: string[] = [];
  lines.push(meeting.title.toUpperCase());
  lines.push("=".repeat(meeting.title.length));
  lines.push(`Date: ${formatDateTime(meeting.date)}`);
  lines.push(`Duration: ${formatDuration(meeting.duration)}`);
  lines.push(`Participants: ${meeting.participants.join(", ")}`);
  if (meeting.tags?.length) lines.push(`Tags: ${meeting.tags.join(", ")}`);
  lines.push("");

  if (section !== "transcript" && meeting.summary) {
    lines.push("SUMMARY");
    lines.push("-------");
    lines.push(meeting.summary.overview);
    lines.push("");
    if (meeting.action_items.length) {
      lines.push("ACTION ITEMS");
      lines.push("------------");
      meeting.action_items.forEach((ai) => {
        const status = ai.completed ? "[x]" : "[ ]";
        lines.push(`${status} ${ai.text}${ai.assignee ? ` (${ai.assignee})` : ""}`);
      });
      lines.push("");
    }
  }

  if (section !== "summary" && meeting.transcript) {
    lines.push("TRANSCRIPT");
    lines.push("----------");
    meeting.transcript.segments.forEach((seg) => {
      lines.push(`[${formatTimestamp(seg.start_time)}] ${seg.speaker}: ${seg.text}`);
    });
  }

  return lines.join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(meeting: MeetingDetail, section: string) {
  const content = buildMarkdown(meeting, section)
    .replace(/^# (.+)$/m, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$3</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- \[x\] (.+)$/gm, '<li style="text-decoration:line-through;color:#aaa">$1</li>')
    .replace(/^- \[ \] (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n/g, "<br>");

  const win = window.open("", "_blank")!;
  win.document.write(`
    <html><head><title>${meeting.title}</title>
    <style>
      body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #1a1a1a; }
      h1 { font-size: 24px; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; }
      h2 { font-size: 18px; color: #7c3aed; margin-top: 24px; }
      li { margin: 4px 0; }
    </style></head>
    <body>${content}</body></html>
  `);
  win.document.close();
  win.print();
}
