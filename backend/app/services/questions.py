import json
import random
import re
from functools import lru_cache
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "dsa" / "leetcode_with_tests.json"


@lru_cache
def load_questions() -> list[dict]:
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError("DSA question data could not be loaded") from error


def format_question(question: dict) -> dict:
    examples = [re.sub(r"(\d+)\.\s+(\d+)", r"\1.\2", item).replace("Output:", "\nOutput:").replace("Explanation:", "\nExplanation:").strip() for item in question.get("examples", [])]
    return {
        "id": int(question.get("id", 0)), "title": question.get("title", ""),
        "topic": question.get("topic", "General"), "difficulty": question.get("difficulty", "Medium"),
        "description": question.get("question", question.get("description", "")), "examples": "\n\n".join(examples),
        "constraints": "\n".join(question.get("constraints", [])),
        "test_cases": question.get("parsed_test_cases", question.get("test_cases", [])),
        "starter_code_python": question.get("starter_code_python", "def solve():\n    pass"),
        "starter_code_cpp": question.get("starter_code_cpp", "void solve() {\n\n}"),
        "starter_code_java": question.get("starter_code_java", "class Solution {\n    // Code here\n}"),
        "hints": question.get("hints", ""),
    }


def filtered_questions(topic: str | None = None, difficulty: str | None = None) -> list[dict]:
    questions = [format_question(question) for question in load_questions()]
    if topic:
        questions = [question for question in questions if question["topic"].lower() == topic.lower()]
    if difficulty:
        questions = [question for question in questions if question["difficulty"].lower() == difficulty.lower()]
    return questions


def get_question(question_id: int) -> dict:
    for question in load_questions():
        if int(question.get("id", -1)) == question_id:
            return format_question(question)
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="Question not found.")


def random_question(topic: str | None, difficulty: str | None) -> dict:
    questions = filtered_questions(topic, difficulty)
    if not questions:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="No questions match the selected filters.")
    return random.choice(questions)
