import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import DateTime, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    kind: Mapped[str] = mapped_column(String(32), default="interview")
    payload: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


def _database_url() -> str:
    url = get_settings().database_url
    if url.startswith("sqlite:///./"):
        Path(url.removeprefix("sqlite:///./")).parent.mkdir(parents=True, exist_ok=True)
    return url


engine = create_engine(_database_url(), connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class SessionStore:
    def create(self, session_id: str, kind: str = "interview", payload: dict | None = None) -> dict:
        now = datetime.now(timezone.utc)
        data = payload or {}
        with SessionLocal() as db:
            db.add(InterviewSession(id=session_id, kind=kind, payload=json.dumps(data), created_at=now, updated_at=now))
            db.commit()
        return data

    def get(self, session_id: str) -> dict | None:
        with SessionLocal() as db:
            record = db.get(InterviewSession, session_id)
            return json.loads(record.payload) if record else None

    def update(self, session_id: str, payload: dict) -> None:
        with SessionLocal() as db:
            record = db.get(InterviewSession, session_id)
            if not record:
                raise KeyError(session_id)
            record.payload = json.dumps(payload)
            record.updated_at = datetime.now(timezone.utc)
            db.commit()

    def get_or_create(self, session_id: str, kind: str = "interview") -> dict:
        payload = self.get(session_id)
        return self.create(session_id, kind, {"history": []}) if payload is None else payload


store = SessionStore()


def initialize_database() -> None:
    Base.metadata.create_all(engine)
