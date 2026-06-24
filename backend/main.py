from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import meetings, action_items, search, comments, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fireflies API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(search.router)
app.include_router(comments.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
