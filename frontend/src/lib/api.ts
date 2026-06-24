import axios from "axios";
import type {
  Meeting,
  MeetingDetail,
  MeetingListResponse,
  Transcript,
  Summary,
  ActionItem,
  SegmentComment,
  SearchResponse,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// ── Meetings ──────────────────────────────────────────────────────────────────

export async function getMeetings(params?: {
  search?: string;
  sort?: "recent" | "oldest";
  participant?: string;
  tag?: string;
}): Promise<MeetingListResponse> {
  const { data } = await api.get("/api/meetings", { params });
  return data;
}

export async function getMeeting(id: string): Promise<MeetingDetail> {
  const { data } = await api.get(`/api/meetings/${id}`);
  return data;
}

export async function createMeeting(body: {
  title: string;
  date: string;
  duration: number;
  participants: string[];
  transcript_text?: string;
}): Promise<Meeting> {
  const { data } = await api.post("/api/meetings", body);
  return data;
}

export async function updateMeeting(
  id: string,
  body: { title?: string; participants?: string[] }
): Promise<Meeting> {
  const { data } = await api.put(`/api/meetings/${id}`, body);
  return data;
}

export async function deleteMeeting(id: string): Promise<void> {
  await api.delete(`/api/meetings/${id}`);
}

// ── Transcript ────────────────────────────────────────────────────────────────

export async function getTranscript(meetingId: string): Promise<Transcript> {
  const { data } = await api.get(`/api/meetings/${meetingId}/transcript`);
  return data;
}

// ── Summary ───────────────────────────────────────────────────────────────────

export async function getSummary(meetingId: string): Promise<Summary> {
  const { data } = await api.get(`/api/meetings/${meetingId}/summary`);
  return data;
}

// ── Action Items ──────────────────────────────────────────────────────────────

export async function getActionItems(meetingId: string): Promise<ActionItem[]> {
  const { data } = await api.get(`/api/meetings/${meetingId}/action-items`);
  return data;
}

export async function createActionItem(
  meetingId: string,
  body: { text: string; assignee?: string; due_date?: string }
): Promise<ActionItem> {
  const { data } = await api.post(`/api/meetings/${meetingId}/action-items`, body);
  return data;
}

export async function updateActionItem(
  id: string,
  body: { text?: string; assignee?: string; due_date?: string; completed?: boolean }
): Promise<ActionItem> {
  const { data } = await api.put(`/api/action-items/${id}`, body);
  return data;
}

export async function deleteActionItem(id: string): Promise<void> {
  await api.delete(`/api/action-items/${id}`);
}

// ── Segment Comments ──────────────────────────────────────────────────────────

export async function getComments(meetingId: string): Promise<SegmentComment[]> {
  const { data } = await api.get(`/api/meetings/${meetingId}/comments`);
  return data;
}

export async function createComment(
  meetingId: string,
  body: { segment_id: string; text: string; color: string }
): Promise<SegmentComment> {
  const { data } = await api.post(`/api/meetings/${meetingId}/comments`, body);
  return data;
}

export async function deleteComment(meetingId: string, commentId: string): Promise<void> {
  await api.delete(`/api/meetings/${meetingId}/comments/${commentId}`);
}

// ── Chat (AskFred) ────────────────────────────────────────────────────────────

export async function askMeeting(
  meetingId: string,
  question: string
): Promise<{ answer: string; sources: import("@/types").TranscriptSegment[] }> {
  const { data } = await api.post(`/api/meetings/${meetingId}/ask`, { question });
  return data;
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function search(q: string): Promise<SearchResponse> {
  const { data } = await api.get("/api/search", { params: { q } });
  return data;
}
