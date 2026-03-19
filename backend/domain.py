
#this file creates domain speciffic questions 

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate    
import os
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_huggingface import HuggingFaceEmbeddings
from sentence_transformers import SentenceTransformer, util
from langchain_community.document_loaders import PyPDFLoader, CSVLoader
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain_core.messages import ToolMessage
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import pandas as pd
from langchain.tools import tool
from langchain.memory import ConversationBufferMemory
import time
import random
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate
from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KE")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",temperature = 0.7
)

example = {
    "Tell me about yourself.": "I’m [Your Name], recently graduated in [Your Degree] from [College]. I’ve worked on projects in [Skill/Area] and interned at [Place], where I improved my communication and teamwork skills. I’m eager to start my career and contribute to your company’s growth.",
    "What are your strengths?": "One of my strengths is my ability to learn quickly and adapt to new challenges. I’m also a good communicator and work well in teams.",
    "What are your weaknesses?": "I sometimes take on too many tasks at once, but I’m improving by prioritising work and setting realistic deadlines.",
    "Why do you want this job?": "I want this job because it matches my skills in [Skill] and offers a chance to grow professionally in an environment focused on learning.",
    "Why should we hire you?": "I bring strong academic knowledge, a positive attitude, and willingness to learn. I’m confident I can contribute effectively to your team.",
    "Where do you see yourself in 5 years?": "In five years, I see myself taking on more responsibility, leading small projects, and continuing to grow professionally within the company.",
    "Why do you want to work for our company?": "I admire your company’s work in [Industry] and values like innovation and teamwork, and I’m excited to contribute to your mission.",
    "What motivates you?": "I’m motivated by learning new skills and overcoming challenges, especially when I see the positive results of my work.",
    "Are you a team player?": "Yes, I enjoy working in teams. In my college projects, I often coordinated tasks and helped ensure timely completion.",
    "How do you handle pressure?": "I prioritise tasks, stay organised, and focus on the most important work first, which helps me stay calm under pressure.",
    "Tell me about a challenge you faced and how you overcame it.": "Once, I struggled with a project deadline. I broke the tasks into smaller parts, focused on time management, and asked for feedback, which helped me complete it on time.",
    "What is your ideal work environment?": "I thrive in environments that encourage collaboration, learning, and positive feedback.",
    "What do you know about our company?": "Your company is known for [Product/Service/Value], and I appreciate your emphasis on innovation and employee development.",
    "How do you prioritise your tasks?": "I use lists to rank tasks by urgency and importance, starting with the most critical work while keeping track of deadlines.",
    "How do you handle criticism?": "I listen carefully, assess the feedback’s merit, and use it to improve my performance.",
    "What is your greatest achievement?": "My greatest achievement was completing a challenging project in college where I led the team to deliver a working app on time.",
    "Are you willing to relocate or travel?": "Yes, I’m open to relocation or travel if it benefits the role and my career growth.",
    "What are your salary expectations?": "I’m open to a competitive salary based on the company’s standards, and I value the growth opportunities this role offers.",
    "Do you have any questions for us?": "Yes — could you share what success looks like in this role in the first 6 months?",
    "Why do you want to leave your current role?": "As a fresher, I’m looking for my first opportunity to apply my skills, learn, and grow in a professional setting.",
}

example_domain = [
    {
        "difficulty": "easy",
        "question": "Can you explain what REST APIs are and how you've used them?",
        "answer": "A REST API uses HTTP methods to interact with resources identified by URLs. I used them in my last project to implement endpoints like GET /tasks to list tasks and POST /tasks to create tasks, tested via Postman."
    },
    {
        "difficulty": "easy",
        "question": "What is the difference between GET and POST requests?",
        "answer": "GET retrieves data and should be idempotent. POST submits data to be processed. GET doesn’t change state, while POST can create or update a resource."
    },
    {
        "difficulty": "easy",
        "question": "Describe what JSON is and why it's commonly used.",
        "answer": "JSON is a lightweight data format used for APIs because it’s easy to read, easy to parse, and language-agnostic."
    },
    {
        "difficulty": "easy",
        "question": "What is version control and why do teams use it?",
        "answer": "Version control tracks changes to code, enabling collaboration and rollback. Git is a common example."
    },
    {
        "difficulty": "easy",
        "question": "Explain what a database index is at a high level.",
        "answer": "An index improves query performance by providing a quick lookup, similar to a book’s index."
    },
    {
        "difficulty": "easy",
        "question": "What is a bug and how do you typically debug?",
        "answer": "A bug is an unexpected behavior in code. I debug using logs, breakpoints, and checking assumptions."
    },

    {
        "difficulty": "medium",
        "question": "How do you handle schema changes in production databases?",
        "answer": "I use database migrations, add columns as nullable at first, deploy with backward compatibility, and then populate safely during low-traffic periods."
    },
    {
        "difficulty": "medium",
        "question": "What strategies do you use to optimize slow database queries?",
        "answer": "I analyze query plans, add indexes, avoid SELECT *, and refactor with joins or subqueries where needed."
    },
    {
        "difficulty": "medium",
        "question": "Describe how you would implement authentication in a web app.",
        "answer": "I would use token-based auth like JWT, secure storage, session expiry, and HTTPS for token transfer."
    },
    {
        "difficulty": "medium",
        "question": "How would you handle error handling across microservices?",
        "answer": "I implement consistent error formats, structured logging, retries with exponential backoff, and circuit breakers."
    },
    {
        "difficulty": "medium",
        "question": "Explain how caching helps improve performance.",
        "answer": "Caching stores repeated responses in memory (like Redis), reducing load on the database and improving response times."
    },
    {
        "difficulty": "medium",
        "question": "What are environment variables and how do you use them?",
        "answer": "Environment variables store config outside source code, used for credentials, API keys, and different environments (dev/prod)."
    },

    {
        "difficulty": "hard",
        "question": "Your API is timing out under load. How do you investigate and fix it?",
        "answer": "I’d analyze logs and metrics, find bottlenecks, use caching, optimize queries, add pagination, and scale horizontally behind a load balancer."
    },
    {
        "difficulty": "hard",
        "question": "Describe a time you improved the performance of a system end-to-end.",
        "answer": "In my last role, I reduced request latency from 2s to 400ms by fixing N+1 DB queries, adding indexes, caching frequent reads, and load-testing before release."
    },
    {
        "difficulty": "hard",
        "question": "How would you design a fault-tolerant service for high availability?",
        "answer": "Use multiple instances across zones, health checks, automatic failover, graceful degradation, and logging for real-time monitoring."
    },
    {
        "difficulty": "hard",
        "question": "Explain a situation where you had to debug a production issue under pressure.",
        "answer": "We had an outage due to a misconfigured deployment. I rolled back, identified missing environment configs, and added automated checks to prevent recurrence."
    },
    {
        "difficulty": "hard",
        "question": "Outline how you'd build and deploy a CI/CD pipeline.",
        "answer": "I use GitHub Actions or Jenkins, run tests on pull requests, build artifacts, deploy to staging first, run sanity tests, then deploy to production with blue-green or canary releases."
    },
    {
        "difficulty": "hard",
        "question": "How do you ensure data integrity when multiple services write to the same database?",
        "answer": "Use transactions, optimistic locking, idempotent operations, and enforce business rules at the DB schema level."
    }
]



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
        template = "Based on the following text from the resume :{resume_text}, identify the most relevant professional domain or field that the resume pertains to. Provide a concise answer. for now keep the domain as AI/GENAI/ML/DATASCIENCE as one field and then WEBDEVELOPMENT/APPDEVELOPMENT as another field and DEVOPS/TESTING as another field"
    )
    response = model.invoke(prompt.invoke({'resume_text': resume_text}))
    domain= response.content
    return domain


def generate_questions_based_on_resume(domain,resume_text,str_history,d_level):
        history = []
        messages = ChatPromptTemplate.from_messages([
        ("system", """
            You are a professional technical interviewer for the domain: {domain}.
            
            CANDIDATE RESUME CONTEXT:
            "{resume_text}"
            
            YOUR RULES:
            1. Ask strictly ONE question at a time.
            2. Base your questions on the candidate's resume and the domain.
            3. Do not number the question.
            4. Do not provide a list.
            5. Be conversational but concise and with a bit of humour in bw.
            6. If the history is empty, start with an introductory question based on their resume and progress manually by refering to {str_history}.
            7. Adjust the difficulty of the question based on the candidate's previous answers which you can see in {str_history} and the difficulty level: {d_level}.
            8. Dont ask the questions from the same topic again and again ask max to max 5 questions and minimmum 2 questions and then move on to next topic in thier resume or skills and if they say they dont know skip it refere to {str_history} for that
            9. Ask questions from thier internship and then personal projects
            10. If they deny telling all the details of internship tasks due to NDA move on to personal projects
         """),
        
        ("human", """
            Here is the current conversation history so far:
            {str_history}
            
            Based on the above, generate the NEXT interview question.
        """)])   
        
        chain = messages | model 
        response = chain.invoke({'domain': domain, 'str_history':str_history, 'resume_text': resume_text,'d_level':d_level})
        questions = response.content
        return questions


def generate_questions_based_hr(example,str_history,domain):
    message = ChatPromptTemplate.from_messages([
        ("system", """
         
         example_questions and thier format - {example} 

            You are an HR interviewer.
            
            ASK QUESTIONS ABOUT:
            - Always Greet the User and ask about them say things like tell me about yourself or introduce yourself
            - Dont ask about how they would solve team collaboration issue or any other qusetion before letting the introduce themself
            - Always reflect on thier background and ask questions accoringly reagarding collaborations and other things but dont ask any technical questions yet
            - Start in a progressing way like introduce yourself and then continue towards other questions
            - Team collaboration and conflict resolution
            - Leadership and initiative
            - Career goals and motivations
            - Work culture preferences
            - Handling pressure and deadlines
            - Why they want this role - {domain}
            
            Ask ONE behavioral question.
        """),
        ("human", "History: {str_history}\n\nGenerate next HR question.")
    ])
    formatted_examples = ""
    for question, answer in example.items():
        formatted_examples += f"Q: {question}\n"
        formatted_examples += f"Good Answer: {answer}\n\n"
            
    chain = message | model  # Use Groq for generation
    response = chain.invoke({
        'example':str(example),
        'str_history': str_history,
        'domain':domain

    })
    return response.content
    

def generate_questions_based_on_domain(str_history, domain, resume_text, d_level):
    
    global example_domain

    domain_questions = ""
    for i, ex in enumerate(example_domain):
        domain_questions += f"--- Style Example {i+1} ---\n"
        domain_questions += f"Complexity: {ex['difficulty']}\n"
        domain_questions += f"Q: {ex['question']}\n"
        domain_questions += f"Target Depth: {ex['answer']}\n\n"

    message = ChatPromptTemplate.from_messages([
        ("system", """
            You are a professional technical interviewer for the domain: {domain}.
            
            CANDIDATE RESUME CONTEXT:
            "{resume_text}"
            
            EXAMPLE QUESTIONS TO LEARN FROM:
            {domain_questions}
            
            YOUR RULES:
            1. Ask strictly ONE question at a time.
            2. Base your questions on the candidate's skills and the {domain}.
            3. Do not number the question.
            4. Be conversational but concise.
            5. Adjust difficulty based on {d_level}.
            6. When {d_level} is "hard", ask scenario-based questions like the examples.
            7. Ask what are thier strongest suites in thier resume {resume_text}
         """),
        
        ("human", """
            Here is the current conversation history:
            {str_history}
            
            Generate the NEXT interview question.
        """)
    ])
    
    chain = message | model
    
    response = chain.invoke({
        'str_history': str_history,
        'domain': domain,
        'resume_text': resume_text,
        'd_level': d_level,
        'domain_questions': domain_questions 
    })
    
    return response.content
