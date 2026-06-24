import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Meeting
from schemas import ChatRequest, ChatResponse, TranscriptSegment

router = APIRouter(prefix="/api/meetings", tags=["chat"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")


def _find_relevant_segments(segments: list[dict], question: str, top_n: int = 4) -> list[dict]:
    """Return the most relevant segments by keyword overlap."""
    q_words = set(question.lower().split())
    scored = []
    for seg in segments:
        words = set(seg["text"].lower().split())
        score = len(q_words & words)
        if score > 0:
            scored.append((score, seg))
    scored.sort(key=lambda x: -x[0])
    return [s for _, s in scored[:top_n]]


@router.post("/{meeting_id}/ask", response_model=ChatResponse)
def ask_meeting(meeting_id: str, body: ChatRequest, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if not meeting.transcript:
        raise HTTPException(status_code=404, detail="No transcript available for this meeting")

    segments: list[dict] = json.loads(meeting.transcript.segments)
    relevant = _find_relevant_segments(segments, body.question)

    transcript_text = "\n".join(
        f"[{s['speaker']} @ {int(s['start_time']//60):02d}:{int(s['start_time']%60):02d}] {s['text']}"
        for s in segments
    )

    if ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=512,
                system=(
                    "You are a meeting assistant. Answer questions about meeting transcripts "
                    "concisely and accurately. Base your answers only on the transcript provided. "
                    "If the answer isn't in the transcript, say so clearly."
                ),
                messages=[{
                    "role": "user",
                    "content": (
                        f"Meeting: {meeting.title}\n\n"
                        f"Transcript:\n{transcript_text}\n\n"
                        f"Question: {body.question}"
                    ),
                }],
            )
            answer = message.content[0].text
        except Exception as e:
            answer = _fallback_answer(body.question, relevant, meeting.title)
    else:
        answer = _fallback_answer(body.question, relevant, meeting.title)

    sources = [TranscriptSegment(**s) for s in relevant]
    return ChatResponse(answer=answer, sources=sources)


def _fallback_answer(question: str, relevant: list[dict], title: str) -> str:
    """Generate a contextual answer without an LLM when no API key is set."""
    if not relevant:
        return (
            f"I couldn't find specific information about that in the transcript of '{title}'. "
            "Try asking about topics, decisions, or people mentioned in the meeting."
        )
    excerpts = "\n".join(f"• [{s['speaker']}]: {s['text']}" for s in relevant[:3])
    return (
        f"Based on the transcript of '{title}', here are the most relevant moments:\n\n"
        f"{excerpts}\n\n"
        "_(Set ANTHROPIC_API_KEY in backend/.env for full AI-powered answers.)_"
    )
