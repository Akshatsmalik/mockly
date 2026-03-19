import os
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize Embeddings (Ensure your API key is in environment)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

def index_resume(resume_text: str, session_id: str):
    """Splits the resume into chunks and stores them in a local vector DB."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
    chunks = text_splitter.split_text(resume_text)
    
    # Store in a unique directory per session to keep data isolated
    persist_dir = f"./db/{session_id}"
    vector_db = Chroma.from_texts(
        texts=chunks, 
        embedding=embeddings, 
        persist_directory=persist_dir
    )
    return vector_db

def retrieve_context(query: str, session_id: str, k: int = 2):
    """Retrieves the most relevant parts of the resume for a given query."""
    persist_dir = f"./db/{session_id}"
    if not os.path.exists(persist_dir):
        return ""
    
    vector_db = Chroma(persist_directory=persist_dir, embedding_function=embeddings)
    docs = vector_db.similarity_search(query, k=k)
    return "\n".join([doc.page_content for doc in docs])