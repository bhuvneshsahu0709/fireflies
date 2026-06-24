export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
}

export interface Chapter {
  title: string;
  start_time: number;
  summary: string;
}

export interface Transcript {
  id: string;
  meeting_id: string;
  segments: TranscriptSegment[];
}

export interface Summary {
  id: string;
  meeting_id: string;
  overview: string;
  key_topics: string[];
  chapters: Chapter[];
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  assignee: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface SegmentComment {
  id: string;
  meeting_id: string;
  segment_id: string;
  text: string;
  color: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: TranscriptSegment[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  tags: string[];
  status: "processing" | "processed";
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingDetail extends Meeting {
  transcript?: Transcript;
  summary?: Summary;
  action_items: ActionItem[];
  segment_comments: SegmentComment[];
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
}

export interface TranscriptMatch {
  meeting_id: string;
  meeting_title: string;
  segment_id: string;
  speaker: string;
  text: string;
  start_time: number;
}

export interface SearchResponse {
  meetings: Meeting[];
  transcript_matches: TranscriptMatch[];
}
