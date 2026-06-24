import json
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from database import get_db
from models import Meeting, Transcript, Summary, ActionItem
from schemas import (
    MeetingCreate, MeetingUpdate, MeetingOut, MeetingDetail,
    MeetingListResponse, TranscriptOut, TranscriptUpsert, TranscriptSegment,
    SummaryOut, ActionItemCreate, ActionItemOut, SegmentCommentOut,
)

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _to_meeting_out(m: Meeting) -> MeetingOut:
    return MeetingOut.model_validate(m)


# ── List / Create ─────────────────────────────────────────────────────────────

@router.get("", response_model=MeetingListResponse)
def list_meetings(
    search: Optional[str] = Query(None),
    sort: str = Query("recent", pattern="^(recent|oldest)$"),
    participant: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Meeting)

    if search:
        term = f"%{search}%"
        q = q.filter(Meeting.title.ilike(term))

    if participant:
        q = q.filter(Meeting.participants.ilike(f"%{participant}%"))

    if tag:
        q = q.filter(Meeting.tags.ilike(f"%{tag}%"))

    if sort == "oldest":
        q = q.order_by(Meeting.date.asc())
    else:
        q = q.order_by(Meeting.date.desc())

    meetings = q.all()
    return MeetingListResponse(
        meetings=[_to_meeting_out(m) for m in meetings],
        total=len(meetings),
    )


@router.post("", response_model=MeetingOut, status_code=201)
def create_meeting(body: MeetingCreate, db: Session = Depends(get_db)):
    meeting = Meeting(
        id=str(uuid.uuid4()),
        title=body.title,
        date=body.date,
        duration=body.duration,
        participants=json.dumps(body.participants),
        tags=json.dumps(body.tags),
        status="processed",
    )
    db.add(meeting)

    if body.transcript_text:
        lines = [l.strip() for l in body.transcript_text.strip().splitlines() if l.strip()]
        seg_duration = body.duration / max(len(lines), 1)
        segments = [
            {
                "id": str(uuid.uuid4()),
                "speaker": f"Speaker {(i % 3) + 1}",
                "text": line,
                "start_time": round(i * seg_duration, 1),
                "end_time": round((i + 1) * seg_duration, 1),
            }
            for i, line in enumerate(lines)
        ]
        transcript = Transcript(
            id=str(uuid.uuid4()),
            meeting_id=meeting.id,
            segments=json.dumps(segments),
        )
        db.add(transcript)

    db.commit()
    db.refresh(meeting)
    return _to_meeting_out(meeting)


# ── Single Meeting ────────────────────────────────────────────────────────────

@router.get("/{meeting_id}", response_model=MeetingDetail)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    detail = MeetingDetail.model_validate(meeting)

    if meeting.transcript:
        detail.transcript = TranscriptOut.model_validate(meeting.transcript)
    if meeting.summary:
        detail.summary = SummaryOut.model_validate(meeting.summary)
    detail.action_items = [
        ActionItemOut.model_validate(ai) for ai in meeting.action_items
    ]
    detail.segment_comments = [
        SegmentCommentOut.model_validate(c) for c in meeting.segment_comments
    ]
    return detail


@router.put("/{meeting_id}", response_model=MeetingOut)
def update_meeting(meeting_id: str, body: MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if body.title is not None:
        meeting.title = body.title
    if body.participants is not None:
        meeting.participants = json.dumps(body.participants)
    if body.tags is not None:
        meeting.tags = json.dumps(body.tags)
    meeting.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(meeting)
    return _to_meeting_out(meeting)


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()


# ── Transcript ────────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/transcript", response_model=TranscriptOut)
def get_transcript(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if not meeting.transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return TranscriptOut.model_validate(meeting.transcript)


@router.post("/{meeting_id}/transcript", response_model=TranscriptOut)
def upsert_transcript(meeting_id: str, body: TranscriptUpsert, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    segments_data: list[dict]
    if body.segments:
        segments_data = [s.model_dump() for s in body.segments]
    elif body.text:
        lines = [l.strip() for l in body.text.strip().splitlines() if l.strip()]
        seg_duration = meeting.duration / max(len(lines), 1)
        segments_data = [
            {
                "id": str(uuid.uuid4()),
                "speaker": f"Speaker {(i % 3) + 1}",
                "text": line,
                "start_time": round(i * seg_duration, 1),
                "end_time": round((i + 1) * seg_duration, 1),
            }
            for i, line in enumerate(lines)
        ]
    else:
        raise HTTPException(status_code=400, detail="Provide segments or text")

    if meeting.transcript:
        meeting.transcript.segments = json.dumps(segments_data)
    else:
        t = Transcript(
            id=str(uuid.uuid4()),
            meeting_id=meeting_id,
            segments=json.dumps(segments_data),
        )
        db.add(t)

    db.commit()
    db.refresh(meeting)
    return TranscriptOut.model_validate(meeting.transcript)


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/summary", response_model=SummaryOut)
def get_summary(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if not meeting.summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return SummaryOut.model_validate(meeting.summary)


# ── Action Items ──────────────────────────────────────────────────────────────

@router.get("/{meeting_id}/action-items", response_model=list[ActionItemOut])
def list_action_items(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return [ActionItemOut.model_validate(ai) for ai in meeting.action_items]


@router.post("/{meeting_id}/action-items", response_model=ActionItemOut, status_code=201)
def create_action_item(meeting_id: str, body: ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    ai = ActionItem(
        id=str(uuid.uuid4()),
        meeting_id=meeting_id,
        text=body.text,
        assignee=body.assignee,
        due_date=body.due_date,
        completed=False,
    )
    db.add(ai)
    db.commit()
    db.refresh(ai)
    return ActionItemOut.model_validate(ai)
