# Fireflies.ai Clone — Meeting Intelligence Platform

A full-stack clone of [Fireflies.ai](https://fireflies.ai) built as a fullstack SDE assignment. Replicates the full meeting workspace experience: library view, interactive transcripts, AI summaries, action items, global search, highlights, export, and an LLM-powered chat assistant.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend | Python 3.13 + FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite |
| LLM | Anthropic Claude (claude-haiku-4-5) — optional |
| API client | Axios |
| Notifications | react-hot-toast |

---

## Project Structure

```
fireflies/
├── backend/
│   ├── main.py              # FastAPI app, CORS, router registration
│   ├── database.py          # SQLAlchemy engine + session factory
│   ├── models.py            # ORM models (Meeting, Transcript, Summary, ActionItem, SegmentComment)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── seed.py              # Seed script — 5 realistic meetings with full data
│   ├── .env                 # ANTHROPIC_API_KEY (optional)
│   ├── requirements.txt
│   └── routers/
│       ├── meetings.py      # CRUD + transcript/summary/action-item sub-routes + tag filter
│       ├── action_items.py  # Update and delete action items
│       ├── search.py        # Full-text search across titles and transcripts
│       ├── comments.py      # Segment highlights (create / list / delete)
│       └── chat.py          # AskFred LLM chat (Anthropic SDK + keyword fallback)
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx           # Root layout with sidebar
        │   ├── page.tsx             # Home / welcome page
        │   ├── meetings/page.tsx    # Meetings library
        │   ├── meetings/[id]/       # Meeting detail page
        │   └── search/              # Global search page
        ├── components/
        │   ├── layout/              # Sidebar (with dark mode toggle), Topbar
        │   ├── meetings/            # MeetingCard, CreateMeetingModal, EditMeetingModal
        │   ├── transcript/          # TranscriptViewer (search + sync + highlights)
        │   ├── player/              # AudioPlayer (simulated waveform + scrubber)
        │   ├── summary/             # SummaryPanel (Summary / Actions / Topics / AskFred tabs)
        │   ├── export/              # ExportModal (Markdown / TXT / PDF)
        │   ├── chat/                # ChatPanel (AskFred LLM interface)
        │   └── ui/                  # Modal, Toast
        ├── lib/
        │   ├── api.ts               # All API calls (axios)
        │   └── utils.ts             # Formatting helpers, color utilities
        └── types/
            └── index.ts             # Shared TypeScript interfaces
```

---

## Database Schema

```
┌──────────────────────────────────────────────────────────────┐
│  meetings                                                    │
│  id TEXT PK · title · date · duration · participants (JSON)  │
│  tags (JSON) · status · audio_url · created_at · updated_at  │
└────────────────────────────┬─────────────────────────────────┘
                             │ 1:many / 1:1
        ┌────────────────────┼──────────────────┬──────────────────┐
        │                    │                  │                  │
   ┌────▼────┐        ┌──────▼──────┐   ┌───▼──────────┐  ┌──────▼──────────┐
   │transcripts│       │  summaries  │   │ action_items │  │ segment_comments │
   │id · meeting_id│   │id · meeting │   │id · meeting  │  │id · meeting_id   │
   │segments (JSON)│   │overview     │   │text · assignee│  │segment_id · text │
   └───────────────┘   │key_topics   │   │due_date      │  │color · created_at│
                       │chapters     │   │completed     │  └──────────────────┘
                       └─────────────┘   └──────────────┘
```

**Design notes:**
- JSON arrays stored in TEXT columns (segments, participants, tags, etc.) — avoids join tables for SQLite simplicity
- All PKs are UUID v4 strings
- Cascade deletes on all child tables

---

## API Reference

```
GET  /api/meetings                      list meetings (search, sort, participant, tag filters)
POST /api/meetings                      create meeting (with optional transcript text)
GET  /api/meetings/:id                  get full meeting detail
PUT  /api/meetings/:id                  update title, participants, or tags
DEL  /api/meetings/:id                  delete meeting + all children (cascade)

GET  /api/meetings/:id/transcript       transcript segments
GET  /api/meetings/:id/summary          AI summary + chapters + key topics
GET  /api/meetings/:id/action-items     list action items
POST /api/meetings/:id/action-items     create action item
PUT  /api/action-items/:id              update action item (text, assignee, due_date, completed)
DEL  /api/action-items/:id              delete action item

GET  /api/meetings/:id/comments         list segment highlights
POST /api/meetings/:id/comments         add highlight (segment_id, color, note)
DEL  /api/meetings/:id/comments/:cid    remove highlight

POST /api/meetings/:id/ask              AskFred — {question} → {answer, sources[]}

GET  /api/search?q=                     full-text search across titles + transcripts
GET  /health                            health check
```

---

## Setup & Running

### Prerequisites
- Node.js 18+ and npm
- Python 3.13 (`brew install python@3.13` on macOS)

### Backend

```bash
cd backend

# Create and activate virtual environment
/opt/homebrew/bin/python3.13 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set Anthropic API key for real AI chat
# Edit backend/.env and add: ANTHROPIC_API_KEY=sk-ant-...

# Seed 5 realistic meetings
python3.13 seed.py

# Start API server
python3.13 -m uvicorn main:app --reload --port 8000
```

API live at `http://localhost:8000` · Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App live at `http://localhost:3000`

---

## Features

### Core (Required)
- [x] **Meetings Library** — grid layout, sort (recent/oldest), title search, participant filter, tag filter
- [x] **Meeting Detail** — header with meta, audio player, transcript panel, summary panel
- [x] **Interactive Transcript** — speaker labels, color-coded avatars, timestamps, in-transcript search with highlighted matches
- [x] **Timestamp Sync** — clicking a transcript line seeks the player; active segment auto-scrolls and highlights
- [x] **Audio Player** — simulated waveform, range scrubber, skip ±10s, volume control
- [x] **AI Summary** — meeting overview, expandable chapters with timestamps, key topics
- [x] **Action Items** — full CRUD: add (with assignee + due date), inline edit, complete/uncomplete, delete
- [x] **Meeting CRUD** — create (with optional transcript paste), edit title/participants, delete with cascade
- [x] **Global Search** — full-text across all meeting titles and transcript content, with highlighted matches

### Bonus Features
- [x] **Transcript Highlights** — hover any segment → pick a color + add a note → saved to backend; displayed inline with delete
- [x] **Export** — download meeting as Markdown, plain text, or PDF; section selector (all / transcript / summary)
- [x] **Tag Filtering** — meetings tagged by topic (Product, Engineering, Design, etc.); filter by tag from the library
- [x] **AskFred Chat** — LLM-powered Q&A on any meeting; uses Anthropic Claude when API key is set, falls back to keyword-matched transcript excerpts; cites source segments with timestamps
- [x] **Dark Mode** — full dark theme toggle (Moon/Sun icon in sidebar); persists across sessions via localStorage

### UI/UX Polish
- [x] Fireflies-style white sidebar with violet active states
- [x] Skeleton loading states on the meeting grid
- [x] Toast notifications for all mutations
- [x] Keyboard shortcuts (Esc to close modals)
- [x] Participant avatar stacks with consistent color-coded initials
- [x] Active filter chips with one-click clear
- [x] Responsive grid (1/2/3 columns)
- [x] Empty states for search and library

---

## Assumptions & Notes

- **Single user** — no authentication. A single default user ("Bhuvnesh") is assumed throughout.
- **Transcript accuracy** — transcripts are seeded with realistic but fictional dialogue. No real STT is performed.
- **Audio** — playback is simulated (timer-based). The waveform is procedurally generated from a deterministic hash of duration. A real audio URL can be stored in `Meeting.audio_url`.
- **AskFred without API key** — works entirely offline using keyword-overlap scoring to find and return relevant transcript segments.
- **Duration** — stored in seconds as an integer. The player counts up at real-time speed.
