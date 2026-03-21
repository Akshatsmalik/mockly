from fastapi import FastAPI, HTTPException, Form, Depends, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import json
import uuid
import random
import asyncio
import httpx
import pandas as pd
import subprocess
import tempfile
import os
import sys

# Internal imports
from HRevaluatetoolcopy import generate_questions_based_hr, evaluate_hr
from llmtoolcall import agentdc
from chatsave import save_message
from database import session_db
from sessions import create_session
from difficulty2 import difficulty
from GetDomain import get_resume, get_domain
from GetDomain import model
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser,CommaSeparatedListOutputParser

app = FastAPI(title="Interview bot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://mockly-one.vercel.app",
    "https://mockly-one.vercel.app/"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

example = {
    "Tell me about yourself.": "I’m [Your Name], recently graduated in [Your Degree] from [College]...",
    "What are your strengths?": "One of my strengths is my ability to learn quickly...",
    "What are your weaknesses?": "I sometimes take on too many tasks at once...",
}

example_domain = [
    {"difficulty": "easy", "question": "Can you explain what REST APIs are...", "answer": "..."},
    {"difficulty": "medium", "question": "How do you handle schema changes...", "answer": "..."},
    {"difficulty": "hard", "question": "How do you ensure data integrity...", "answer": "..."}
]

chat_db: Dict[str, Dict[str, Any]] = {}

Resume_summary={}
resume_Text = {}

def resume_summary(request: Request) -> str:
    global resume_Text
    session_id = request.cookies.get('session_id')
    
    if not session_id or session_id not in resume_Text:
        return ""
    
    if session_id in Resume_summary:
        return Resume_summary[session_id]
    
    raw_text = resume_Text[session_id]

    prompt = PromptTemplate.from_template('''you summarize this {resume_Text} resume and give its points such as 
                                Project-list project summaries
                                Tech stack-list the techstack of the user
                                internships-list the internships and experience of the user
                                          Dont make it too big''')
    
    chain = prompt | model | CommaSeparatedListOutputParser()
    response = chain.invoke({'resume_Text': raw_text})
        
    Resume_summary[session_id] = response  
    return response




def get_chat_db():
    return chat_db

def get_agent_chat_db(request: Request):
    session_id = request.cookies.get('session_id')
    if not session_id or session_id not in chat_db or 'history' not in chat_db[session_id]:
        return "" 
    recent_history_list = chat_db[session_id]['history'][-3:]
    return "\n".join([str(msg) for msg in recent_history_list])

@app.get('/agent')
def agent(str_history: str = Depends(get_agent_chat_db)):
    agent_response = agentdc(str_history=str_history, domain="aiml")
    x = agent_response.get('difficulty')
    y = agent_response.get('cross_question')
    return {"status": f"x:{x}, y:{y}"}

# @app.get("/")
# def landing_page(response: Response, request: Request):
#     session_id = request.cookies.get("session_id")
#     if not session_id:
#         session_id = create_session()
#         response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="lax")
#         session_db[session_id] = {}
#     print(session_db)
#     return session_id



@app.get("/")
def landing_page(response: Response, request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = create_session()
        response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="none", secure=True)
    session_db[session_id] = session_db.get(session_id, {}) 
    print("session_db:", session_db)
    return session_id


@app.get('/main')
def mainget():
    return "hi"

class NameRequest(BaseModel):
    name: str

@app.post('/mainp')
def mainpost(data: NameRequest):
    return f'hi {data.name}'

class Questionshr(BaseModel):
    domain: str
    d_level: str
    user: Optional[str] = ""


@app.post('/mainq')
def mainq(data: Questionshr, response: Response, requests: Request, db: dict = Depends(get_chat_db)):
    session_id = requests.cookies.get('session_id')
    if not session_id:
        session_id = create_session()
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        session_db[session_id] = {}

    if session_id not in db:
        db[session_id] = {"history": []}
        
    if data.user:
        db[session_id]["history"].append({"USER": data.user})

    recent_history = db[session_id]["history"][-6:]
    question_count = len([m for m in db[session_id]["history"] if "USER" in m])

    sample_keys = random.sample(list(example.keys()), 3)
    small_example = "\n".join([f"Q: {k}" for k in sample_keys])

    bot_response = generate_questions_based_hr(small_example, recent_history, data.domain, question_count)
    
    db[session_id]["history"].append({"BOT": bot_response})
    return bot_response



@app.post('/getresume')
async def getresume(file: UploadFile = File(...), request: Request = None):
    session_id = request.cookies.get('session_id')
    if not session_id:
        return {"error": "No session generated please go to the home page"}
    content = await file.read()
    if len(content) == 0:
        return {"error": "Uploaded file is empty"}
    with open("temp_resume.pdf", "wb") as f:
        f.write(content)
    resumetxt = get_resume("temp_resume.pdf")
    resume_Text[session_id] = resumetxt
    domain = get_domain(resumetxt)
    summary = resume_summary(request)
    Resume_summary[session_id] = summary
    return {"domain": domain}


@app.get("/checkhistory")
def history(request: Request, db: dict = Depends(get_chat_db)):
    session_id = request.cookies.get("session_id")
    conversation = db.get(session_id, {})
    return {
        "session_id": session_id,
        "history": conversation
    }

@app.get('/evaluatehr')
def evaluatehr(request: Request, db: dict = Depends(get_chat_db)):
    session_id = request.cookies.get('session_id')

    if not session_id or session_id not in db or "history" not in db[session_id]:
        return {"error": "No history found to evaluate"}

    if "evaluation" in db[session_id]:
        return db[session_id]["evaluation"]

    evaluation = evaluate_hr(db[session_id]["history"])
    print("History evaluated:", db[session_id]["history"])

    if evaluation:
        db[session_id]["evaluation"] = evaluation

    return evaluation




from pydantic import BaseModel
from typing import Optional
from HRevaluatetoolcopy import generate_questions_based_on_domain

class QuestionsTech(BaseModel):
    user: Optional[str] = ""
    domain: str



@app.post('/maind')
def techq(data: QuestionsTech, response: Response, requests: Request, db: dict = Depends(get_chat_db)):
    session_id = requests.cookies.get('session_id')
    global Resume_summary
    
    if not session_id:
        session_id = create_session()
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        db[session_id] = {"history": []}
    
    if session_id not in db:
        db[session_id] = {"history": []}
        
    if data.user:
        db[session_id]["history"].append({"USER": data.user})
    
    # ✅ Always defined, regardless of data.user
    question_count = len([m for m in db[session_id]["history"] if "USER" in m])
    recent_history_list = db[session_id]["history"][-6:]
    
    str_history = "\n".join(
        [f"{list(msg.keys())[0]}: {list(msg.values())[0]}" for msg in recent_history_list]
    )
    
    sample_keys = random.sample(list(example.keys()), min(3, len(example)))
    small_example = "\n".join([f"Q:{k}|A:{example[k]}" for k in sample_keys])
    
    resume_text = Resume_summary.get(session_id, "")
    if not resume_text:
        return {"error": "No resume found, please upload resume first"}
    
    bot_response = generate_questions_based_on_domain(
        str_history=str_history,
        domain=data.domain,
        resume_text=resume_text,
        example=small_example,
        question_count=question_count
    )
    db[session_id]["history"].append({"BOT": bot_response})
    return bot_response


import json

# =========================
# DSA PRACTICE PLATFORM API
# =========================

# Load DSA questions from JSON (leetcode.json)
dsa_questions = []
try:
    with open("leetcode_with_tests.json", "r", encoding="utf-8") as f:
        dsa_questions = json.load(f)
except FileNotFoundError:
    print("WARNING: leetcode_with_tests.json not found")
except Exception as e:
    print(f"Error loading leetcode.json: {e}")

import re

def format_question(q_dict):
    """Maps leetcode.json keys to the schema expected by the frontend"""
    # Fix examples spacing
    examples = q_dict.get("examples", [])
    
    formatted_examples_list = []
    for ex in examples:
        # Fix floating point spacing (e.g. 2. 0 -> 2.0)
        ex = re.sub(r'(\d+)\.\s+(\d+)', r'\1.\2', ex)
        # Add spacing before "Output:" and "Explanation:" if they somehow end up in same string
        ex = ex.replace("Output:", "\nOutput:")
        ex = ex.replace("Explanation:", "\nExplanation:")
        formatted_examples_list.append(ex.strip())
        
    formatted_examples = "\n\n".join(formatted_examples_list)
    
    # Fix constraints spacing
    constraints = q_dict.get("constraints", [])
    formatted_constraints = "\n".join(constraints)

    return {
        "id": int(q_dict.get("id", 0)),
        "title": q_dict.get("title", ""),
        "topic": "Arrays", # Default
        "difficulty": "Medium", # Default
        "description": q_dict.get("question", ""),
        "examples": formatted_examples,
        "constraints": formatted_constraints,
        "test_cases": q_dict.get("parsed_test_cases", []),
        "starter_code_python": "def solve():\n    pass",
        "starter_code_cpp": "void solve() {\n\n}",
        "starter_code_java": "class Solution {\n    // Code here\n}",
        "hints": ""
    }


@app.get("/api/questions")
def dsa_get_questions(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 10,
):
    """
    List DSA questions (filters ignored for leetcode.json mock).
    """
    if not dsa_questions:
        raise HTTPException(status_code=500, detail="DSA questions JSON not found or empty.")
    
    return [format_question(q) for q in dsa_questions[:limit]]


@app.get("/api/questions/random")
def dsa_get_random_question(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    """
    Fetch a single random DSA question.
    """
    if not dsa_questions:
        raise HTTPException(status_code=500, detail="DSA questions JSON not found or empty.")

    # With leetcode.json we are mocking topics and difficulties
    # So we'll just return a random question regardless of filter to prevent frontend breaking
    q = random.choice(dsa_questions)
    
    # Optional: We could mock the topic/difficulty of this loaded question 
    # to match what the user requested, so the frontend UI stays consistent
    formatted_q = format_question(q)
    if topic:
        formatted_q["topic"] = topic
    if difficulty:
        formatted_q["difficulty"] = difficulty
        
    return formatted_q


@app.get("/api/questions/{question_id}")
def dsa_get_question(question_id: int):
    """
    Fetch a single DSA question by id.
    """
    if not dsa_questions:
        raise HTTPException(status_code=500, detail="DSA questions JSON not found or empty.")

    for q in dsa_questions:
        if str(q.get("id")) == str(question_id):
            return format_question(q)
            
    raise HTTPException(status_code=404, detail="Question not found.")


@app.get("/api/topics")
def dsa_get_topics():
    """
    List available DSA topics.
    """
    return {"topics": ["Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs", 
                       "Bit Manipulation", "Binary Search", "Binary Tree", "Linked List", 
                       "Stacks", "Queue", "Heap"]}


@app.get("/api/difficulties")
def dsa_get_difficulties():
    """
    List supported difficulty levels.
    """
    return {"difficulties": ["Easy", "Medium", "Hard"]}


# ---- Judge / Code Execution (local, no Docker/Judge0) ----

# Kept for compatibility with schema, but we only support python locally
LANGUAGE_IDS = {
    "python": 71,
}


class DsaRunRequest(BaseModel):
    code: str
    language: str
    stdin: str


class DsaSubmitRequest(BaseModel):
    code: str
    language: str
    question_id: int
    session_id: str


async def dsa_execute_code(code: str, language: str, stdin: str) -> Dict[str, Any]:
    """
    Execute code locally without Docker or external Judge0.
    Currently supports only Python for safety.
    """
    if language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail="Local runner currently supports only 'python' language.",
        )

    # Run Python code in a temporary file with a short timeout
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as f:
        f.write(code)
        fname = f.name

    try:
        def _run():
            return subprocess.run(
                [sys.executable, fname],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=5.0,
            )

        try:
            result = await asyncio.to_thread(_run)
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out after 5 seconds.",
                "time": "5000",
                "memory": "0",
            }
        except Exception as e:
            print(f"Subprocess Execution Error: {e}")
            return {
                "stdout": "",
                "stderr": f"Error running code: {str(e)}",
                "time": "0",
                "memory": "0",
            }

        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "time": "0",
            "memory": "0",
        }
    finally:
        try:
            os.unlink(fname)
        except OSError:
            pass


@app.post("/api/judge/run")
async def dsa_run_code(req: DsaRunRequest):
    """
    Run code once with custom stdin.
    """
    result = await dsa_execute_code(req.code, req.language, req.stdin)
    return result


@app.post("/api/judge/submit")
async def dsa_submit_code(req: DsaSubmitRequest):
    """
    Run code against all test cases for a question.
    """
    from copy import deepcopy

    if not dsa_questions:
        raise HTTPException(status_code=500, detail="DSA questions JSON not found or empty.")

    selected_q = None
    for q in dsa_questions:
        if str(q.get("id")) == str(req.question_id):
            selected_q = format_question(q)
            break

    if not selected_q:
        raise HTTPException(status_code=404, detail="Question not found.")

    test_cases = selected_q.get("test_cases", [])

    results = []
    passed = 0

    for i, tc in enumerate(test_cases):
        # We need to construct a python script that actually sets the variables and calls the user function
        # since the test case output is just a raw string like "nums = [2,7,11,15], target = 9"
        
        tc_input = tc.get("input", "")
        tc_expected = str(tc.get("output", "")).strip()
        
        # tc_input is e.g. 's = "leetcode", wordDict = ["leet","code"]'
        # We need to split this into lines so Python parses them as separate assignments
        # instead of throwing a SyntaxError for trying to assign exactly to a literal in a tuple assignment.
        # However, simple split(',') will break dictionaries or arrays `[1, 2, 3]`.
        # Standard LeetCode inputs usually follow `var = val, var2 = val2`.
        # Assuming format `var = ...` we can replace `, var_name = ` with `\nvar_name = `
        import re
        tc_input_lines = re.sub(r',\s*([a-zA-Z_]\w*\s*=)', r'\n\1', tc_input)
        
        # Inject variable declarations at top, then append a call to their function
        runnable_script = f"""
{tc_input_lines}

{req.code}

import inspect

target_func = None
if 'solve' in globals() and callable(globals()['solve']):
    target_func = solve
elif 'twoSum' in globals() and callable(globals()['twoSum']):
    target_func = twoSum
elif 'flipAndInvertImage' in globals() and callable(globals()['flipAndInvertImage']):
    target_func = flipAndInvertImage
elif 'wordBreak' in globals() and callable(globals()['wordBreak']):
    target_func = wordBreak

if target_func:
    # Auto-fill arguments based on the user's function signature
    sig = inspect.signature(target_func)
    kwargs = {{}}
    for param_name in sig.parameters:
        if param_name in globals():
            kwargs[param_name] = globals()[param_name]
    
    res = target_func(**kwargs)
    if res is not None:
        # if output is a boolean, leetcode uses 'true'/'false'
        if isinstance(res, bool):
            print(str(res).lower())
        else:
            print(res)
"""
        
        exec_result = await dsa_execute_code(runnable_script, req.language, "")
        actual = (exec_result.get("stdout") or exec_result.get("stderr") or "").strip()
        
        # Leetcode outputs often have brackets or spaces that might mismatch slightly
        # For a robust solution we would want to parse both as json to compare, but stripping is a start
        ok = actual.replace(" ","") == tc_expected.replace(" ","")
        if ok:
            passed += 1

        results.append(
            {
                "case": i + 1,
                "input": tc_input,
                "expected": tc_expected,
                "actual": actual,
                "passed": ok,
                "time": exec_result.get("time"),
                "memory": exec_result.get("memory"),
                "error": exec_result.get("stderr") if not ok else None,
            }
        )

    return {
        "passed": passed,
        "total": len(test_cases),
        "results": results,
        "all_passed": passed == len(test_cases),
    }


# ---- Timed Coding Sessions (independent from existing chat sessions) ----

dsa_sessions_store: Dict[str, Dict[str, Any]] = {}


class DsaStartSession(BaseModel):
    question_id: int
    duration_minutes: int


@app.post("/api/session/start")
def dsa_start_session(body: DsaStartSession):
    from datetime import datetime

    sid = str(uuid.uuid4())
    dsa_sessions_store[sid] = {
        "id": sid,
        "question_id": body.question_id,
        "started_at": datetime.utcnow().isoformat(),
        "duration_minutes": body.duration_minutes,
        "status": "active",
    }
    return {"session_id": sid}


@app.post("/api/session/end")
def dsa_end_session(session_id: str):
    if session_id in dsa_sessions_store:
        dsa_sessions_store[session_id]["status"] = "completed"
    return {"ok": True}


@app.get("/api/session/{session_id}")
def dsa_get_session(session_id: str):
    return dsa_sessions_store.get(session_id, {})

class DsaEvaluateRequest(BaseModel):
    code: str
    topic: str
    question: str
    language: str

@app.post("/api/judge/evaluate")
async def dsa_evaluate_code(req: DsaEvaluateRequest):
    """
    Evaluate user's code using Gemini API and return a JSON with score and feedback.
    """
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain.prompts import PromptTemplate
        from langchain.schema.output_parser import StrOutputParser
        import os
        import json
        import re
        
        if 'GEMINI_API_KE2' in os.environ:
            os.environ['GOOGLE_API_KEY'] = os.environ['GEMINI_API_KE2']
            
        llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash', temperature=0.2, max_tokens=1000)
        
        prompt = PromptTemplate(
            input_variables=["topic", "question", "language", "code"],
            template='''
You are an expert Data Structures and Algorithms interviewer. Analyze the provided {language} code for the topic "{topic}".

Problem Description:
{question}

User's Code:
{code}

Tasks:
1. Score the approach out of 100 based on correctness and optimality.
2. If the approach is good, provide a brief review.
3. If it is sub-optimal, quickly suggest a better/alternative approach in a few sentences.
Keep your response extremely token-friendly and concise.

You MUST return your response as a valid JSON object with EXACTLY two keys:
{{
  "score": <integer between 0 and 100>,
  "feedback": "<your brief text review/alternative approach string>"
}}
Do NOT wrap the JSON in markdown blocks like ```json ... ```. Just return raw JSON.
'''
        )
        
        chain = prompt | llm | StrOutputParser()
        result_text = await asyncio.to_thread(chain.invoke, {
            "topic": req.topic,
            "question": req.question,
            "language": req.language,
            "code": req.code
        })
        
        cleaned_json = re.sub(r'```json|```', '', result_text).strip()
        evaluation = json.loads(cleaned_json)
        return evaluation
        
    except Exception as e:
        print("Gemini Evaluation Error:", e)
        return {
            "score": 0,
            "feedback": f"Evaluation unavailable at this moment. Error: {str(e)}"
        }
