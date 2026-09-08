import os
import tempfile
import uuid
from typing import Any

from fastapi import APIRouter, File, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel, Field

from app.config import get_settings
from app.store import store
from GetDomain import get_domain, get_resume, model
from HRevaluatetoolcopy import evaluate_hr, generate_questions_based_hr, generate_questions_based_on_domain
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import CommaSeparatedListOutputParser

router = APIRouter(tags=["interviews"])
HR_EXAMPLES = {
    "Tell me about yourself.": "I am a recent graduate with practical project experience.",
    "What are your strengths?": "I learn quickly and communicate clearly.",
    "What are your weaknesses?": "I seek feedback and improve deliberately.",
}


class InterviewQuestionRequest(BaseModel):
    domain: str = Field(min_length=1, max_length=120)
    d_level: str = "easy"
    user: str = Field(default="", max_length=6000)


def session_id_for(request: Request, response: Response) -> str:
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        settings = get_settings()
        response.set_cookie(key="session_id", value=session_id, httponly=True, secure=settings.cookie_secure, samesite="none" if settings.cookie_secure else "lax")
    store.get_or_create(session_id)
    return session_id


def summarize_resume(resume_text: str) -> list[str]:
    prompt = PromptTemplate.from_template("Summarize this resume as concise project, technology, and experience bullet points: {resume_text}")
    return (prompt | model | CommaSeparatedListOutputParser()).invoke({"resume_text": resume_text})


@router.get("/")
def landing(request: Request, response: Response) -> dict:
    return {"session_id": session_id_for(request, response)}


@router.post("/getresume")
async def upload_resume(request: Request, response: Response, file: UploadFile = File(...)) -> dict:
    session_id = session_id_for(request, response)
    settings = get_settings()
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=415, detail="Only PDF resumes are accepted.")
    content = await file.read(settings.max_resume_bytes + 1)
    if not content or len(content) > settings.max_resume_bytes:
        raise HTTPException(status_code=413, detail="Resume must be a non-empty PDF under 5 MB.")
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        resume_text = get_resume(temp_path)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
    payload = store.get_or_create(session_id)
    payload.update({"resume_summary": summarize_resume(resume_text)})
    store.update(session_id, payload)
    return {"domain": get_domain(resume_text)}


def ask_question(body: InterviewQuestionRequest, request: Request, response: Response, technical: bool) -> str:
    session_id = session_id_for(request, response)
    payload = store.get_or_create(session_id)
    history = payload.setdefault("history", [])
    if body.user:
        history.append({"USER": body.user})
    count = sum("USER" in item for item in history)
    recent_history = history[-6:]
    if technical:
        summary = payload.get("resume_summary")
        if not summary:
            raise HTTPException(status_code=409, detail="Upload a resume before starting a technical interview.")
        question = generate_questions_based_on_domain(
            "\n".join(f"{next(iter(item))}: {next(iter(item.values()))}" for item in recent_history),
            body.domain,
            "\n".join(summary),
            "\n".join(f"Q: {key}" for key in HR_EXAMPLES),
            count,
        )
    else:
        question = generate_questions_based_hr(HR_EXAMPLES, recent_history, body.domain, count)
    history.append({"BOT": question})
    store.update(session_id, payload)
    return question


@router.post("/mainq")
def hr_question(body: InterviewQuestionRequest, request: Request, response: Response) -> str:
    return ask_question(body, request, response, technical=False)


@router.post("/maind")
def technical_question(body: InterviewQuestionRequest, request: Request, response: Response) -> str:
    return ask_question(body, request, response, technical=True)


@router.get("/checkhistory")
def history(request: Request) -> dict[str, Any]:
    session_id = request.cookies.get("session_id")
    payload = store.get(session_id) if session_id else None
    return {"session_id": session_id, "history": (payload or {}).get("history", [])}


@router.get("/evaluatehr")
def evaluate(request: Request) -> Any:
    session_id = request.cookies.get("session_id")
    payload = store.get(session_id) if session_id else None
    if not payload or not payload.get("history"):
        raise HTTPException(status_code=404, detail="No interview history found.")
    if "evaluation" not in payload:
        payload["evaluation"] = evaluate_hr(payload["history"])
        store.update(session_id, payload)
    return payload["evaluation"]
