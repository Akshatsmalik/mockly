import asyncio
import json
import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.judge import execute
from app.services.questions import filtered_questions, get_question, random_question
from app.store import store

router = APIRouter(prefix="/api", tags=["dsa"])


class RunRequest(BaseModel):
    code: str = Field(min_length=1, max_length=50_000)
    language: str = Field(pattern="^(python|cpp|java|javascript)$")
    stdin: str = Field(default="", max_length=20_000)


class SubmitRequest(RunRequest):
    question_id: int
    session_id: str


class StartSessionRequest(BaseModel):
    question_id: int
    duration_minutes: int = Field(ge=5, le=180)


class EvaluateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=50_000)
    topic: str = Field(max_length=120)
    question: str = Field(max_length=20_000)
    language: str


@router.get("/questions")
def questions(topic: str | None = None, difficulty: str | None = None, limit: int = 10) -> list[dict]:
    return filtered_questions(topic, difficulty)[:max(1, min(limit, 50))]


@router.get("/questions/random")
def question_random(topic: str | None = None, difficulty: str | None = None) -> dict:
    return random_question(topic, difficulty)


@router.get("/questions/{question_id}")
def question(question_id: int) -> dict:
    return get_question(question_id)


@router.get("/topics")
def topics() -> dict:
    return {"topics": sorted({question["topic"] for question in filtered_questions()})}


@router.get("/difficulties")
def difficulties() -> dict:
    return {"difficulties": sorted({question["difficulty"] for question in filtered_questions()})}


@router.post("/judge/run")
async def run_code(body: RunRequest) -> dict:
    return await execute(body.model_dump())


@router.post("/judge/submit")
async def submit_code(body: SubmitRequest) -> dict:
    get_question(body.question_id)
    if store.get(body.session_id) is None:
        raise HTTPException(status_code=404, detail="Coding session not found.")
    return await execute(body.model_dump())


@router.post("/session/start")
def start_session(body: StartSessionRequest) -> dict:
    get_question(body.question_id)
    session_id = str(uuid.uuid4())
    store.create(session_id, "dsa", {"id": session_id, "question_id": body.question_id, "started_at": datetime.now(timezone.utc).isoformat(), "duration_minutes": body.duration_minutes, "status": "active"})
    return {"session_id": session_id}


@router.post("/session/end")
def end_session(session_id: str) -> dict:
    payload = store.get(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Coding session not found.")
    payload["status"] = "completed"
    store.update(session_id, payload)
    return {"ok": True}


@router.get("/session/{session_id}")
def get_session(session_id: str) -> dict:
    payload = store.get(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Coding session not found.")
    return payload


@router.post("/judge/evaluate")
async def evaluate_code(body: EvaluateRequest) -> dict:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.output_parsers import StrOutputParser
    from langchain.prompts import PromptTemplate

    prompt = PromptTemplate.from_template("Evaluate this {language} solution for the problem below. Return JSON only with score (0-100) and feedback.\nTopic: {topic}\nProblem: {question}\nCode: {code}")
    try:
        chain = prompt | ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2, max_tokens=700) | StrOutputParser()
        text = await asyncio.to_thread(chain.invoke, body.model_dump())
        result = json.loads(re.sub(r"```(?:json)?|```", "", text).strip())
        return {"score": max(0, min(int(result.get("score", 0)), 100)), "feedback": str(result.get("feedback", "No feedback returned."))}
    except Exception:
        return {"score": 0, "feedback": "Evaluation is temporarily unavailable."}
