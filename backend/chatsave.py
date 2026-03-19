from database import chat_db 

def save_message(session_id: str, role: str, content: str):

    if session_id not in chat_db:
        chat_db[session_id] = []

    chat_db[session_id].append({
        "role": role,
        "content": content
    })


def generate_bot_reply(message: str):
    return f"Echo: {message}"


def get_history(session_id: str):
    return chat_db.get(session_id, [])