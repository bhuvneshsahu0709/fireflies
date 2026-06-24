from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, field_validator
import json


class TranscriptSegment(BaseModel):
    id: str
    speaker: str
    text: str
    start_time: float
    end_time: float


class Chapter(BaseModel):
    title: str
    start_time: float
    summary: str


# ── Action Items ──────────────────────────────────────────────────────────────

class ActionItemCreate(BaseModel):
    text: str
    assignee: str | None = None
    due_date: str | None = None


class ActionItemUpdate(BaseModel):
    text: str | None = None
    assignee: str | None = None
    due_date: str | None = None
    completed: bool | None = None


class ActionItemOut(BaseModel):
    id: str
    meeting_id: str
    text: str
    assignee: str | None
    due_date: str | None
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Segment Comments ──────────────────────────────────────────────────────────

class SegmentCommentCreate(BaseModel):
    segment_id: str
    text: str
    color: str = "#fef08a"


class SegmentCommentOut(BaseModel):
    id: str
    meeting_id: str
    segment_id: str
    text: str
    color: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Transcript ────────────────────────────────────────────────────────────────

class TranscriptOut(BaseModel):
    id: str
    meeting_id: str
    segments: list[TranscriptSegment]

    model_config = {"from_attributes": True}

    @field_validator("segments", mode="before")
    @classmethod
    def parse_segments(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


class TranscriptUpsert(BaseModel):
    segments: list[TranscriptSegment] | None = None
    text: str | None = None


# ── Summary ───────────────────────────────────────────────────────────────────

class SummaryOut(BaseModel):
    id: str
    meeting_id: str
    overview: str
    key_topics: list[str]
    chapters: list[Chapter]

    model_config = {"from_attributes": True}

    @field_validator("key_topics", mode="before")
    @classmethod
    def parse_topics(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator("chapters", mode="before")
    @classmethod
    def parse_chapters(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


# ── Meetings ──────────────────────────────────────────────────────────────────

class MeetingCreate(BaseModel):
    title: str
    date: datetime
    duration: int
    participants: list[str]
    tags: list[str] = []
    transcript_text: str | None = None


class MeetingUpdate(BaseModel):
    title: str | None = None
    participants: list[str] | None = None
    tags: list[str] | None = None


class MeetingOut(BaseModel):
    id: str
    title: str
    date: datetime
    duration: int
    participants: list[str]
    tags: list[str]
    status: str
    audio_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("participants", mode="before")
    @classmethod
    def parse_participants(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v or []


class MeetingDetail(MeetingOut):
    transcript: TranscriptOut | None = None
    summary: SummaryOut | None = None
    action_items: list[ActionItemOut] = []
    segment_comments: list[SegmentCommentOut] = []


class MeetingListResponse(BaseModel):
    meetings: list[MeetingOut]
    total: int


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[TranscriptSegment] = []


# ── Search ────────────────────────────────────────────────────────────────────

class TranscriptMatch(BaseModel):
    meeting_id: str
    meeting_title: str
    segment_id: str
    speaker: str
    text: str
    start_time: float


class SearchResponse(BaseModel):
    meetings: list[MeetingOut]
    transcript_matches: list[TranscriptMatch]
