from langchain_community.document_loaders import PyPDFLoader

def get_resume(file_path):
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    resume_text = ""
    for doc in documents:
        resume_text += doc.page_content + "\n"
    return resume_text




