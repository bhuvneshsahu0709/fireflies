import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Meeting, Transcript
from schemas import SearchResponse, MeetingOut, TranscriptMatch

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    term = f"%{q.lower()}%"

    # search meeting titles
    meetings = (
        db.query(Meeting)
        .filter(Meeting.title.ilike(term))
        .order_by(Meeting.date.desc())
        .limit(10)
        .all()
    )

    # search transcript text
    transcripts = db.query(Transcript).all()
    matches: list[TranscriptMatch] = []
    for t in transcripts:
        meeting = t.meeting
        try:
            segments = json.loads(t.segments)
        except Exception:
            continue
        for seg in segments:
            if q.lower() in seg.get("text", "").lower():
                matches.append(
                    TranscriptMatch(
                        meeting_id=meeting.id,
                        meeting_title=meeting.title,
                        segment_id=seg.get("id", ""),
                        speaker=seg.get("speaker", ""),
                        text=seg.get("text", ""),
                        start_time=seg.get("start_time", 0),
                    )
                )
                if len(matches) >= 20:
                    break
        if len(matches) >= 20:
            break

    return SearchResponse(
        meetings=[MeetingOut.model_validate(m) for m in meetings],
        transcript_matches=matches,
    )
