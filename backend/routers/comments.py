import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import SegmentComment, Meeting
from schemas import SegmentCommentCreate, SegmentCommentOut

router = APIRouter(prefix="/api/meetings", tags=["comments"])


@router.get("/{meeting_id}/comments", response_model=list[SegmentCommentOut])
def list_comments(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return [SegmentCommentOut.model_validate(c) for c in meeting.segment_comments]


@router.post("/{meeting_id}/comments", response_model=SegmentCommentOut, status_code=201)
def create_comment(meeting_id: str, body: SegmentCommentCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    comment = SegmentComment(
        id=str(uuid.uuid4()),
        meeting_id=meeting_id,
        segment_id=body.segment_id,
        text=body.text,
        color=body.color,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return SegmentCommentOut.model_validate(comment)


@router.delete("/{meeting_id}/comments/{comment_id}", status_code=204)
def delete_comment(meeting_id: str, comment_id: str, db: Session = Depends(get_db)):
    comment = db.query(SegmentComment).filter(
        SegmentComment.id == comment_id,
        SegmentComment.meeting_id == meeting_id,
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
