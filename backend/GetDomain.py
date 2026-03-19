from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain.document_loaders import PyPDFLoader
from langchain_community.document_loaders import PyPDFLoader

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KE2")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",temperature = 0.7,max_tokens=50
)

def get_resume(file_path):
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    resume_text = ""
    for doc in documents:
        resume_text += doc.page_content + "\n"
    return resume_text


def get_domain(resume_text):
    prompt  = PromptTemplate(
        input_variables = ["resume_text"],
        template = "Based on the following text from the resume :{resume_text}, identify the most relevant professional domain or field that the resume pertains to. Provide a concise answer. for now keep the domain as AI/GENAI/ML/DATASCIENCE as one field and then WEBDEVELOPMENT/APPDEVELOPMENT as another field and DEVOPS/TESTING as another field just provide answer nothing else"
    )
    response = model.invoke(prompt.invoke({'resume_text': resume_text}))
    domain= response.content
    return domain

def domain(file_path):
    txt=get_resume(file_path)
    domain1=get_domain(txt)
    return domain1