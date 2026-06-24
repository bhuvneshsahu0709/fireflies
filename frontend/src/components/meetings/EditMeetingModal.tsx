"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { updateMeeting } from "@/lib/api";
import toast from "react-hot-toast";
import type { Meeting } from "@/types";

interface Props {
  meeting: Meeting | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditMeetingModal({ meeting, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setParticipants([...meeting.participants]);
    }
  }, [meeting]);

  const addParticipant = () => {
    const name = participantInput.trim();
    if (name && !participants.includes(name)) {
      setParticipants([...participants, name]);
      setParticipantInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting || !title.trim()) return;
    setLoading(true);
    try {
      await updateMeeting(meeting.id, { title: title.trim(), participants });
      toast.success("Meeting updated!");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!meeting} onClose={onClose} title="Edit Meeting" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Participants</label>
          <div className="flex gap-2 mb-2">
            <input
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
              placeholder="Add participant"
              className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
            />
            <button
              type="button" onClick={addParticipant}
              className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {participants.map((p) => (
              <span key={p} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                {p}
                <button type="button" onClick={() => setParticipants(participants.filter((x) => x !== p))}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

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
            {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
