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
# os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")   
# model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7,max_tokens=2000)
os.environ['GOOGLE_API_KEY']=os.getenv('GEMINI_API_KE2')    
model = ChatGoogleGenerativeAI(model='gemini-2.5-flash',temperature=0.7,max_tokens=2000)

# class Answersingleanalysis(BaseModel):
#     question: str = Field(description="The question asked")
#     answer: str = Field(description="The answer given by the candidate")
#     resume_text: str = Field(description="The text extracted from the candidate's resume")
#     # We make history optional so the Agent doesn't fail if it can't find it
#     str_history: Optional[str] = Field(default="", description="Conversation history")

# @tool("evaluate_answer", args_schema=Answersingleanalysis)
# def evaluate(resume_text: str, str_history: str = "") -> str:
#     """Evaluate the answer based on the resume and experience provided."""
    
#     # 1. Define the Prompt (Your existing prompt)
#     prompt = PromptTemplate(
#         input_variables=['str_history', 'examples'],
#         template="""
#         You are evaluating a COLLEGE STUDENT/FRESHER's behavioral interview answer.
        
#         LEARN FROM THESE EXAMPLES:
#         {examples}
        
#         CONVERSATION HISTORY:
#         {str_history}
        
#         CURRENT QUESTION: {current_question}
#         CURRENT ANSWER: {current_answer}
        
#         """
#     )
    
#     chain = prompt | model
#     global example 
    
#     response = chain.invoke({
#         'current_question': question,      # Maps 'question' arg to {current_question}
#         'current_answer': answer,          # Maps 'answer' arg to {current_answer}
#         'str_history': str_history if str_history else "No previous history available",
#         'examples': example                # Maps global variable to {examples}
#     })
    
#     evaluation = response.content
#     return evaluation

# class totalreview(BaseModel):
#     resume_text: str = Field(description="The text extracted from the candidate's resume")
#     str_history: Optional[str] = Field(default="", description="The conversation history between the interviewer and the candidate")

# @tool("total_review", args_schema=totalreview)
# def total_evaluate(resume_text: str,str_history:str) -> str:
#     """this is to evaluate a total interview rating out of 10 with explanation on what should be improved and where the person lacked"""   
#     prompt = PromptTemplate(
#     input_variables=['resume_text', 'str_history'],
#     template="""
#     You are an expert technical interviewer providing a FINAL SUMMARY REPORT for a COLLEGE STUDENT/FRESHER candidate.
    
#     CANDIDATE'S RESUME:
#     {resume_text}
    
#     COMPLETE INTERVIEW TRANSCRIPT:
#     {str_history}
    
#     CRITICAL INSTRUCTIONS:
#     - DO NOT quote or repeat the questions from the interview
#     - DO NOT quote or repeat the candidate's answers verbatim
#     - DO NOT create tables showing each Q&A pair
#     - Instead, provide a HIGH-LEVEL SUMMARY of overall performance
    
#     EVALUATION MINDSET:
#     - Remember this is a FRESHER/COLLEGE STUDENT with limited professional experience
#     - Be CONSTRUCTIVE and ENCOURAGING, not harsh or overly critical
#     - Focus on POTENTIAL and LEARNING ABILITY, not just current perfection
#     - Minor communication errors are NORMAL for freshers - don't penalize heavily
#     - Value enthusiasm, willingness to learn, and honest answers
#     - A 6-7/10 is a GOOD score for a fresher, not mediocre
#     - Balance critique with positive reinforcement
    
#     RATING SCALE FOR FRESHERS:
#     - 8-10: Exceptional for a fresher, ready to hit the ground running
#     - 6-7: Good candidate with solid foundation, normal areas to develop
#     - 4-5: Average, needs more preparation but shows potential
#     - 1-3: Significant gaps, needs substantial improvement
    
#     YOUR TASK:
#     Write a concise final evaluation (300-500 words maximum) that includes:
    
#     **Overall Rating: X/10**
#     (Remember: 6-7 is good for a fresher!)
    
#     **Performance Summary:**
#     In 2-3 paragraphs, describe:
#     - Overall interview performance across all rounds
#     - Key strengths demonstrated (technical skills, projects, attitude)
#     - Main areas needing improvement (frame as "growth opportunities")
#     - Communication quality (be lenient with minor errors)
#     - Resume alignment and authenticity
#     - Enthusiasm and learning potential
    
#     **Round Performance:**
#     - HR Round: [Brief 1-sentence assessment - focus on soft skills shown]
#     - Technical Round: [Brief 1-sentence assessment - acknowledge knowledge level]
#     - Domain Round: [Brief 1-sentence assessment - note depth of understanding]
    
#     **Top 3 Recommendations for Growth:**
#     1. [Specific, actionable advice with encouragement]
#     2. [Specific, actionable advice with encouragement]
#     3. [Specific, actionable advice with encouragement]
    
#     **Hiring Recommendation:** [Strong Yes / Yes / Maybe / No]
#     - Strong Yes: Exceptional fresher, hire immediately
#     - Yes: Solid candidate, would benefit the team
#     - Maybe: Has potential but needs more preparation/training
#     - No: Significant gaps for this role at this time
    
#     Provide 1-2 sentences justifying your decision in an encouraging tone.
    
#     TONE GUIDELINES:
#     - Start with something positive the candidate did well
#     - Frame weaknesses as "areas to develop" or "growth opportunities"
#     - End on an encouraging note about their potential
#     - Use phrases like "with some practice", "as you gain experience", "continue building"
#     - Avoid harsh words like "poor", "failed", "inadequate" - use "needs development", "can improve", "opportunity to strengthen"
    
#     Keep it concise, professional, and MOTIVATING. Remember: you're helping shape a future professional's confidence and growth trajectory.
#     """
# )
#     chain = prompt | model
#     response = chain.invoke({'resume_text': resume_text,'str_history':str_history})
#     total_evaluation = response.content
#     return total_evaluation

# class HRAnswerEvaluation(BaseModel):
#     str_history: str = Field(description="The full conversation history")
#     current_question: str = Field(description="The current HR question being evaluated")
#     current_answer: str = Field(description="The current answer to evaluate")

# @tool("evaluate_hr_answer", args_schema=HRAnswerEvaluation)
# def evaluate_hr(str_history: str, current_question: str, current_answer: str) -> str:
#     """Evaluate HR answers using few-shot examples and conversation context"""
    
#     global example

#     examples_text = ""
#     for q, a in example.items():
#         examples_text += f"Q: {q}\nGood Answer: {a}\n\n"
    
#     prompt = PromptTemplate(
#         input_variables=['str_history', 'current_question', 'current_answer', 'example'],
#         template="""
#         You are an expert HR interviewer evaluating behavioral answers.
#         "KEEP IN MIND THAT YOUR ARE CONDUCTING INTERVIEWS OF COLLAGE STUDENTS AND HENCE BE A LITTLE BIT LENIENT AND RATE THEM ACCORDINGLY DONT BE TOO CRITCAL WHILE EVALUATING AND NETIHER BE TOO SOFT"


#         LEARN FROM THESE EXAMPLES:
#         {examples}
        
#         CONVERSATION HISTORY (for context):
#         {str_history}
        
#         CURRENT QUESTION: {current_question}
#         CURRENT ANSWER: {current_answer}
        
#         Evaluate the CURRENT answer considering:
#         - Communication clarity
#         - Relevant examples/experience  
#         - Self-awareness
#         - Culture fit indicators
#         - Consistency with previous answers in history
        
#         Rate from 1-10 with explanation.
#         """
#     )
    
#     chain = prompt | model
#     response = chain.invoke({
#         'str_history': str_history,
#         'current_question': current_question,
#         'current_answer': current_answer,
#         'examples': examples_text
#     })
#     return response.content

# class answer_crossquestions(BaseModel):
#     str_history: str = Field(description="previous few questions")

# @tool("cross_evaluate", args_schema=answer_crossquestions)
# def cross_question(str_history:str) -> str:
#     """Generate a follow-up question based on the previous question and answer and the evaluation of the answer given by the user."""
#     prompt = PromptTemplate(
#         input_variables = ['str_history'],
#         template = """Based on the resume provided and the experience mentioned,
#           evaluate the following answer: {answer} for the question: {question} and the evaluation for the previous questions {evaluation} and
#           Provide a follow up question for it that an interviewer would ask to further 
#           assess the candidate's knowledge and skills
#         ."""
#     )
#     chain = prompt | model
#     response = chain.invoke({'str_history':str_history})
#     follow_up = response.content
#     return follow_up

# class diffuculty_level(BaseModel):
#     domain: str = Field(description="the professional domain identified from the resume")
#     str_history:str = Field(description="the total conversation history for some questions")

# @tool("decide_next_action", args_schema=diffuculty_level)
# def difficulty(domain:str,str_history:str) -> str:
#     """Decide whether to ask a follow-up question based on the evaluation of the candidate's answer."""
#     prompt = PromptTemplate(
#         input_variables=['domain','str_history'],
#         template="""
#         You are an expert Interview Manager adjusting question difficulty for a COLLEGE STUDENT/FRESHER candidate.

#         DOMAIN: {domain}
#         PREVIOUS QUESTIONS AND ANSWERS: {str_history}

#         YOUR TASK:
#         Analyze the evaluation score and decide the difficulty level for the NEXT question.

#         DECISION RULES:

#         1. INCREASE DIFFICULTY if:
#            - Evaluation score is 7-10/10
#            - Candidate shows strong understanding with good examples
#            - Answer demonstrates depth beyond basic concepts
#            → Next question should be: Scenario-based, system design, or edge cases

#         2. MAINTAIN SAME DIFFICULTY if:
#            - Evaluation score is 5-6/10
#            - Candidate has basic understanding but lacks depth
#            - Answer is acceptable but not exceptional
#            → Next question should be: Similar complexity, different topic

#         3. DECREASE DIFFICULTY if:
#            - Evaluation score is 1-4/10
#            - Candidate struggled significantly or couldn't answer
#            - Answer shows fundamental gaps in understanding
#            → Next question should be: More basic concepts, simpler examples

#         IMPORTANT GUIDELINES:
#         - Be gradual: Don't jump from easy to very hard in one step
#         - For freshers, "medium" difficulty is the sweet spot
#         - If candidate scores 6-7/10 consistently, that's good - don't rush to increase
#         - If decreasing, don't make it feel punishing - frame as "building foundations"
#         - Consider the topic: some topics are naturally harder (system design vs. basic syntax)

#         OUTPUT FORMAT:
#         Difficulty Decision: [INCREASE / SAME / DECREASE]
#         Reasoning: [1-2 sentences explaining why, referencing the evaluation score]
#         Next Question Style: [Brief guidance - e.g., "Ask about performance optimization" or "Cover basic concepts in a different area"]
#         Keep your response concise and actionable.
#         """
#     )

#     chain = prompt | model 
#     response = chain.invoke({'domain': domain,'str_history':str_history})
#     d_level = response.content
#     return d_level



# from langchain.tools import tool
# from langchain.prompts import PromptTemplate
# from pydantic import BaseModel, Field
# from dotenv import load_dotenv
# import os
# from langchain_groq import ChatGroq

# load_dotenv()
# os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")   
# model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)

# --- CROSS QUESTION TOOL ---

class answer_crossquestions(BaseModel):
    str_history: str = Field(description="The complete interview conversation history including the latest question, candidate answer, and evaluation.")

@tool("cross_evaluate", args_schema=answer_crossquestions)
def cross_question(str_history: str) -> str:
    """Use this tool to generate a follow-up question based on the candidate's latest answer in the history."""
    prompt = PromptTemplate(
        input_variables=['str_history'],
        template="""Based on the following interview history:
        
        {str_history}
        
        YOUR TASK:
        1. Identify the MOST RECENT question asked.
        2. Identify the candidate's answer to that question.
        3. Identify the evaluation given for that answer.
        4. Provide a targeted follow-up cross-question that an interviewer would ask to further assess the candidate's knowledge, clarify gaps, or test edge cases mentioned in their answer.
        
        Output ONLY the follow-up question.
        """
    )
    chain = prompt | model
    response = chain.invoke({'str_history': str_history})
    return response.content


# --- DIFFICULTY LEVEL TOOL ---

class difficulty_level(BaseModel):
    domain: str = Field(description="the professional domain identified from the resume")
    str_history: str = Field(description="The complete interview conversation history including the latest evaluation score.")

@tool("decide_next_action", args_schema=difficulty_level)
def difficulty(domain: str, str_history: str) -> str:
    """Use this tool to decide if the next question should be harder, easier, or the same difficulty based on the latest evaluation."""
    prompt = PromptTemplate(
        input_variables=['domain', 'str_history'],
        template="""
        You are an expert Interview Manager adjusting question difficulty for a COLLEGE STUDENT/FRESHER candidate.

        DOMAIN: {domain}
        INTERVIEW HISTORY: 
        {str_history}

        YOUR TASK:
        Analyze the MOST RECENT evaluation score in the history and decide the difficulty level for the NEXT question.

        DECISION RULES:
        1. INCREASE DIFFICULTY if evaluation is 7-10/10 (Candidate shows strong understanding).
        2. MAINTAIN SAME DIFFICULTY if evaluation is 5-6/10 (Candidate has basic understanding but lacks depth).
        3. DECREASE DIFFICULTY if evaluation is 1-4/10 (Candidate struggled significantly).

        OUTPUT FORMAT:
        Difficulty Decision: [INCREASE / SAME / DECREASE]
        Reasoning: [1-2 sentences explaining why based on the history]
        Next Question Style: [Brief guidance on what to ask next]
        """
    )
    chain = prompt | model 
    response = chain.invoke({'domain': domain, 'str_history': str_history})
    return response.content

tools = [cross_question, difficulty]


