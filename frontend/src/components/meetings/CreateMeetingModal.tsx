"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { createMeeting } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateMeetingModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [transcriptText, setTranscriptText] = useState("");
  const [loading, setLoading] = useState(false);

  const addParticipant = () => {
    const name = participantInput.trim();
    if (name && !participants.includes(name)) {
      setParticipants([...participants, name]);
      setParticipantInput("");
    }
  };

  const removeParticipant = (p: string) => {
    setParticipants(participants.filter((x) => x !== p));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addParticipant();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");

    const duration = parseInt(hours) * 3600 + parseInt(minutes) * 60;
    setLoading(true);
    try {
      await createMeeting({
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration,
        participants: participants.length ? participants : ["Unknown"],
        transcript_text: transcriptText || undefined,
      });
      toast.success("Meeting created!");
      onCreated();
      onClose();
      // reset
      setTitle(""); setDate(new Date().toISOString().slice(0, 16));
      setHours("0"); setMinutes("30"); setParticipants([]); setTranscriptText("");
    } catch {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a New Meeting" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Meeting Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Product Sync"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
          />
        </div>

        {/* Date + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="23"
                value={hours} onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-center"
              />
              <span className="text-slate-500 text-sm shrink-0">h</span>
              <input
                type="number" min="0" max="59"
                value={minutes} onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-center"
              />
              <span className="text-slate-500 text-sm shrink-0">m</span>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Participants
          </label>
          <div className="flex gap-2 mb-2">
            <input
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name and press Enter"
              className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
            />
            <button
              type="button" onClick={addParticipant}
              className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {participants.map((p) => (
                <span key={p} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                  {p}
                  <button type="button" onClick={() => removeParticipant(p)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Transcript */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Transcript Text <span className="text-slate-400 font-normal">(optional — paste or type)</span>
          </label>
          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            rows={5}
            placeholder="Paste your meeting transcript here. Each line will become a transcript segment..."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : "Create Meeting"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
