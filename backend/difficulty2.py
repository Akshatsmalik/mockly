from langchain.tools import tool
from langchain.prompts import PromptTemplate
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
model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7,max_tokens=100)

class diffuculty_level(BaseModel):
    domain: str = Field(description="the professional domain identified from the resume")
    str_history:dict = Field(description="the summary of the conversation so that the bot can understand the level")

@tool("decide difficulty", args_schema=diffuculty_level)
# def difficulty(domain:str,str_history:dict) -> str:
#     """Decide whether to ask a follow-up question based on the evaluation of the candidate's answer."""
#     try:
#         prompt = PromptTemplate(
#             input_variables=['domain','str_history'],
#             template="""
#             You are an expert Interview Manager adjusting question difficulty for a COLLEGE STUDENT/FRESHER candidate.

#             DOMAIN: {domain}
#             CURRENT QUESTIONS: {questions}
#             CURRENT ANSWER: {answer}
#             TOTAL CONVERSATION: {str_history}

#             YOUR TASK:
#             Analyze the CURRENT QUESTIONS and CURRENT ANSWER and decide the difficulty level and also give a evaluation score for the NEXT question as INCREASE / SAME / DECREASE.

#             DECISION RULES:

#             1. INCREASE DIFFICULTY if:
#             - Evaluation score is 7-10/10
#             - Candidate shows strong understanding with good examples
#             - Answer demonstrates depth beyond basic concepts
#             → Next question should be: Scenario-based, system design, or edge cases

#             2. MAINTAIN SAME DIFFICULTY if:
#             - Evaluation score is 5-6/10
#             - Candidate has basic understanding but lacks depth
#             - Answer is acceptable but not exceptional
#             → Next question should be: Similar complexity, different topic

#             3. DECREASE DIFFICULTY if:
#             - Evaluation score is 1-4/10
#             - Candidate struggled significantly or couldn't answer
#             - Answer shows fundamental gaps in understanding
#             → Next question should be: More basic concepts, simpler examples

#             IMPORTANT GUIDELINES:
#             - Be gradual: Don't jump from easy to very hard in one step
#             - For freshers, "medium" difficulty is the sweet spot
#             - If candidate scores 6-7/10 consistently, that's good - don't rush to increase
#             - If decreasing, don't make it feel punishing - frame as "building foundations"
#             - Consider the topic: some topics are naturally harder (system design vs. basic syntax)

#             OUTPUT FORMAT:
#             Return ONLY one word:
#             INCREASE
#             SAME
#             DECREASE

#             Do not return anything else.
#             """
#         )
#         chain = prompt | model 
#         response = chain.invoke({'domain': domain ,'str_history':str_history})
#         d_level = response.content
#         return d_level
        
#     except Exception as e:
#         return "EASY"

@tool("decide difficulty", args_schema=diffuculty_level)
def difficulty(domain:str, str_history:dict) -> str:
    """Decide whether to ask a follow-up question based on the evaluation of the candidate's answer."""
    try:
        prompt = PromptTemplate(
            input_variables=['domain','str_history'],
                template="""
            You are an interview difficulty manager for a fresher candidate.

            DOMAIN: {domain}
            RECENT CONVERSATION: {str_history}

            Analyze answers and return ONLY one word:
            - INCREASE (score 7-10/10, strong answers)
            - SAME (score 5-6/10, average answers)  
            - DECREASE (score 1-4/10, weak answers)

            Return ONLY one word. Nothing else.
            """
    #             """
        )
        chain = prompt | model 
        response = chain.invoke({'domain': domain, 'str_history': str_history})
        return response.content.strip()
        
    except Exception as e:
        print(f"DEBUG - Error in difficulty tool: {e}") # <-- Add this to see future errors!
        return "EASY"