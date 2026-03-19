import uuid
from database import session_db

def create_session():
    session_id = str(uuid.uuid4())
    session_db[session_id] = {
        "active": True
    }
    return session_id


def validate_session(session_id: str):
    return session_db.get(session_id)


def delete_session(session_id: str):
    session_db.pop(session_id, None)