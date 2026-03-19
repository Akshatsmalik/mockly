from langchain.tools import tool
from langchain.prompts import PromptTemplate
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from domain import example
from domain import example_domain
from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq

load_dotenv()
os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")   
model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)



class Answersingleanalysis(BaseModel):
    # question: str = Field(description="The question asked")
    # answer: str = Field(description="The answer given by the candidate")
    resume_text: str = Field(description="The text extracted from the candidate's resume")
    # We make history optional so the Agent doesn't fail if it can't find it
    str_history: Optional[str] = Field(default="", description="Conversation history")


@tool("evaluate_answer", args_schema=Answersingleanalysis)
def evaluate(resume_text: str, str_history: str = "") -> str:
    """Evaluate the answer based on the resume and experience provided."""
    
    # 1. Define the Prompt (Your existing prompt)
    prompt = PromptTemplate(
        input_variables=['str_history', 'examples'],
        template="""
        You are evaluating a COLLEGE STUDENT/FRESHER's behavioral interview answer.
        
        LEARN FROM THESE EXAMPLES:
        {examples}
        
        CONVERSATION HISTORY:
        {str_history}
        
        """
    )
    
    chain = prompt | model
    global example # Import the global examples
    
    # 2. THE CRITICAL FIX: Map the keys correctly
    # Left side (Keys) = Must match {variables} in the template above
    # Right side (Values) = Must match the function arguments you received
    response = chain.invoke({# Maps 'answer' arg to {current_answer}
        'str_history': str_history if str_history else "No previous history available",
        'examples': example                # Maps global variable to {examples}
    })
    
    evaluation = response.content
    return evaluation





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