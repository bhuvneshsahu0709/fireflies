"use client";

import { useState } from "react";
import { Plus, Trash2, Check, Loader2, User, Calendar, Pencil, X } from "lucide-react";
import type { ActionItem } from "@/types";
import { createActionItem, updateActionItem, deleteActionItem } from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Props {
  meetingId: string;
  actionItems: ActionItem[];
  onChange: () => void;
}

export default function ActionItemsPanel({ meetingId, actionItems, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pending = actionItems.filter((a) => !a.completed);
  const completed = actionItems.filter((a) => a.completed);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSaving(true);
    try {
      await createActionItem(meetingId, {
        text: newText.trim(),
        assignee: newAssignee.trim() || undefined,
        due_date: newDueDate || undefined,
      });
      toast.success("Action item added");
      setNewText(""); setNewAssignee(""); setNewDueDate("");
      setAdding(false);
      onChange();
    } catch {
      toast.error("Failed to add action item");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: ActionItem) => {
    setLoadingId(item.id);
    try {
      await updateActionItem(item.id, { completed: !item.completed });
      onChange();
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoadingId(null);
    }
  };

  const remove = async (id: string) => {
    setLoadingId(id);
    try {
      await deleteActionItem(id);
      toast.success("Deleted");
      onChange();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Add button */}
      <button
        onClick={() => setAdding(!adding)}
        className="flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900 transition-colors"
      >
        <Plus size={16} />
        Add action item
      </button>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-3">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Describe the action item…"
            autoFocus
            className="w-full px-3 py-2 text-sm bg-white border border-violet-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              placeholder="Assignee (optional)"
              className="w-full px-3 py-2 text-sm bg-white border border-violet-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30"
            />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-violet-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Add
            </button>
          </div>
        </form>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Open · {pending.length}
          </h4>
          <div className="space-y-2">
            {pending.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                loading={loadingId === item.id}
                editing={editingId === item.id}
                onToggle={() => toggle(item)}
                onDelete={() => remove(item.id)}
                onEdit={() => setEditingId(item.id)}
                onEditClose={() => setEditingId(null)}
                onEditSaved={() => { setEditingId(null); onChange(); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Completed · {completed.length}
          </h4>
          <div className="space-y-2 opacity-60">
            {completed.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                loading={loadingId === item.id}
                editing={editingId === item.id}
                onToggle={() => toggle(item)}
                onDelete={() => remove(item.id)}
                onEdit={() => setEditingId(item.id)}
                onEditClose={() => setEditingId(null)}
                onEditSaved={() => { setEditingId(null); onChange(); }}
              />
            ))}
          </div>
        </div>
      )}

      {actionItems.length === 0 && !adding && (
        <div className="text-center py-8 text-gray-400">
          <Check size={28} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No action items yet</p>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  item: ActionItem;
  loading: boolean;
  editing: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onEditClose: () => void;
  onEditSaved: () => void;
}

function ActionItemRow({ item, loading, editing, onToggle, onDelete, onEdit, onEditClose, onEditSaved }: RowProps) {
  const [text, setText] = useState(item.text);
  const [assignee, setAssignee] = useState(item.assignee ?? "");
  const [dueDate, setDueDate] = useState(item.due_date ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await updateActionItem(item.id, {
        text: text.trim(),
        assignee: assignee.trim() || undefined,
        due_date: dueDate || undefined,
      });
      toast.success("Updated");
      onEditSaved();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          className="w-full px-3 py-1.5 text-sm bg-white border border-violet-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400/30"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee"
            className="w-full px-3 py-1.5 text-sm bg-white border border-violet-200 rounded-lg outline-none"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-violet-200 rounded-lg outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button" onClick={onEditClose}
            className="flex-1 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={saving}
            className="flex-1 py-1.5 text-xs text-white bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : null}
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={cn(
      "group flex items-start gap-3 p-3 rounded-xl border transition-colors",
      item.completed
        ? "bg-gray-50 border-gray-100"
        : "bg-white border-gray-100 hover:border-violet-100 hover:bg-violet-50/30"
    )}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={loading}
        className={cn(
          "mt-0.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-colors",
          item.completed
            ? "bg-violet-600 border-violet-600"
            : "border-gray-300 hover:border-violet-500"
        )}
      >
        {loading
          ? <Loader2 size={11} className="animate-spin text-violet-600" />
          : item.completed && <Check size={11} className="text-white" strokeWidth={3} />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug",
          item.completed ? "line-through text-gray-400" : "text-gray-800"
        )}>
          {item.text}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {item.assignee && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User size={11} />{item.assignee}
            </span>
          )}
          {item.due_date && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={11} />{item.due_date}
            </span>
          )}
        </div>
      </div>

      {/* Edit + Delete */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
