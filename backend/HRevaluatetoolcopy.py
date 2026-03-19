from langchain.tools import tool
from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import ChatPromptTemplate,PromptTemplate
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.runnables.history import RunnableWithMessageHistory
from domain import example
from domain import example_domain
from langchain_core.output_parsers import StrOutputParser,CommaSeparatedListOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
from GetDomain import domain
from GETresume import get_resume

load_dotenv()
# os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")   
# model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7,max_tokens=2000)
memory = ConversationBufferWindowMemory(return_messages=True)
# model = ChatGoogleGenerativeAI(model='gemini-2.5-flash',temperature=0.7,max_tokens=2000)
os.environ['GOOGLE_API_KEY']=os.getenv('GEMINI_API_KE2')    
model = ChatGoogleGenerativeAI(model='gemini-2.5-flash',temperature=0.7,max_tokens=2000)

# In your main file — create one limiter per provider
from ratelimit import RateLimiter

groq_limiter   = RateLimiter(requests_per_min=28, tokens_per_min=5500,  provider="Groq")
gemini_limiter = RateLimiter(requests_per_min=58, tokens_per_min=900000, provider="Gemini")
# (using slightly below the real limits as a safety buffer)


# class HRAnswerEvaluation(BaseModel):
#     str_history: dict = Field(description="The full conversation history")
#     # current_question: str = Field(description="The current HR question being evaluated")
#     # current_answer: str = Field(description="The current answer to evaluate")

# @tool("evaluate_hr_answer", args_schema=HRAnswerEvaluation)
# def evaluate_hr(str_history: dict) -> str:
#     """Evaluate HR answers using few-shot examples and conversation context"""
    
#     global example

#     examples_text = ""
#     for q, a in example.items():
#         examples_text += f"Q: {q}\nGood Answer: {a}\n\n"
    
#     prompt1 = PromptTemplate(
#         input_variables=['str_history', 'examples'],
#         template="""
#         You are an expert HR interviewer evaluating behavioral answers.
#         "KEEP IN MIND THAT YOUR ARE CONDUCTING INTERVIEWS OF COLLAGE STUDENTS AND HENCE BE A LITTLE BIT LENIENT AND RATE THEM ACCORDINGLY DONT BE TOO CRITCAL WHILE EVALUATING AND NETIHER BE TOO SOFT"
        
#         LEARN FROM THESE EXAMPLES:
#         {examples}
        
#         CONVERSATION HISTORY (for context):
#         {str_history}
        
#         Evaluate the answers considering:
#         - Communication clarity
#         - Relevant examples/experience  
#         - Self-awareness
#         - Culture fit indicators
#         - Consistency with previous answers in history
#         -Also in the last of the response tell how can one answer certain questions to improve themselves
        
#         Rate from 1-10 with explanation.
#         when giving the review dont say things like "A good answer, as seen in the provided examples, should include..."
#         dont mention the example in your response..
#         ALWAYS GIVE A RESPONSE AS THIS/THAT example 0/10

#         in the output dont add any line breakers like /n just give the answer in a paragraph and in 3 paragraphs 1 titiles overall 2nd titled strong points and 3rd tittled weak points
#         """
#     )

#     prompt2 = PromptTemplate(
#     input_variables=["evaluation"], # Added missing comma here
#     template="Give me strong points of the candidate based on this evaluation: {evaluation} just write the points and not anything else"
# )

#     prompt3 = PromptTemplate(
#     input_variables=["evaluation"],
#     template="Give me weak points of the candidate based on this evaluation: {evaluation} just write the points and not anything else"
# )
#     parser=StrOutputParser()
#     parser2=CommaSeparatedListOutputParser()
#     chain = prompt1 | model | parser
#     eval_chain = prompt1 | model | StrOutputParser()

#     analysis_chain = RunnableParallel({
#         "overall_eval": RunnablePassthrough(), 
#         "strong_points": prompt2 | model | CommaSeparatedListOutputParser(),
#         "weak_points": prompt3 | model | CommaSeparatedListOutputParser()
#     })

#     full_chain = eval_chain | analysis_chain

#     results = full_chain.invoke({
#         'str_history': str_history,
#         'examples': examples_text
#     })
    
#     return results



from langchain_core.callbacks import UsageMetadataCallbackHandler

def evaluate_hr(str_history: dict) -> str:
    """Evaluate HR answers using few-shot examples and conversation context"""
    global example

    sample_keys = random.sample(list(example.keys()), 3)
    examples_text = "\n".join([f"Q: {k}\nGood Answer: {example[k]}" for k in sample_keys])
    prompt1 = PromptTemplate(
        input_variables=['str_history', 'examples'],
        template="""
        You are an HR interviewer evaluating a fresher candidate. Be balanced, not too harsh or too lenient.

        EXAMPLE ANSWERS FOR REFERENCE:
        {examples}

        CONVERSATION HISTORY:
        {str_history}

        Evaluate considering: communication clarity, self-awareness, culture fit, consistency.
        Do NOT mention the examples in your response.

        Respond in exactly 3 paragraphs:
        1. Overall (include a score X/10)  (CAN BE IN FLOAT TOO)
        2. Strong Points
        3. Weak Points (include tips to improve)
        """
    )

#runnable parrallel helps to run multuiple chain in a parrallly at the same time, and the runnable passthrough helps to run the 
# normal chain as it is once we could have also made a chain, but that would have increased the cost of our llm tokens
    analysis_chain = RunnableParallel({
        "overall_eval": RunnablePassthrough(),
         "overall_score": RunnableLambda(lambda x: 
                    next(
                    (parts[1].strip()
                    for line in x.split("\n")
                    if "score" in line.lower()
                    for parts in [line.split(":")]
                    if len(parts) > 1),
                    None
            )),
        "strong_points": RunnableLambda(lambda x: [
            line.strip("- ") for line in x.split("\n\n")[1].split("\n") 
            if line.strip()
        ] if len(x.split("\n\n")) > 1 else []),
        "weak_points": RunnableLambda(lambda x: [
            line.strip("- ") for line in x.split("\n\n")[2].split("\n") 
            if line.strip()
        ] if len(x.split("\n\n")) > 2 else []),
            "clean_eval": RunnableLambda(lambda x: (
            x.split("\n\n")[0].strip() 
                ))
            })
    

    full_chain = prompt1 | model | StrOutputParser() | analysis_chain

    estimated = len(str(str_history)) // 3 + 800       
    usage_handler = UsageMetadataCallbackHandler()    
    gemini_limiter.wait_if_needed(estimated_tokens=estimated) 

    results = full_chain.invoke(
        {'str_history': str_history, 'examples': examples_text},
        config={"callbacks": [usage_handler]}
    )

    total_actual = sum(u.get('total_tokens', 0) for u in usage_handler.usage_metadata.values())
    gemini_limiter.record_actual_tokens(total_actual, estimated)

    for model_name, usage in usage_handler.usage_metadata.items():
        print(f"Model: {model_name}")
        print(f"  Input tokens:     {usage.get('input_tokens')}")
        print(f"  Output tokens:    {usage.get('output_tokens')}")
        print(f"  Total tokens:     {usage.get('total_tokens')}")
        print(f"  Reasoning tokens: {usage.get('output_token_details', {}).get('reasoning', 0)}")

    return results





# the above is the tool and below is the 







import random
from langchain_core.runnables import RunnableLambda

def generate_questions_based_hr(example, str_history, domain, question_count):
    load_dotenv()
    os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
    model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7, max_tokens=150)

    difficulty_prompt = PromptTemplate(
        input_variables=['domain', 'str_history'],
        template="""
        You are an interview difficulty manager for a fresher candidate.
        DOMAIN: {domain}
        RECENT CONVERSATION: {str_history}
        Analyze answers and return ONLY one word: INCREASE, SAME, or DECREASE.
        """
    )

    question_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an HR interviewer for a fresher in {domain}.
         Difficulty: {d_level}
         Example question types: {example}
         
         Rules:
         - ONE question only, max 2 sentences
         - If history is empty, greet and ask them to introduce themselves
         - Do not repeat questions from history
         - Progress naturally: intro → background → goals → collaboration → role fit
         - No technical questions
        """),
        ("human", "History: {str_history}\n\nGenerate next HR question.")
    ])

    if question_count % 3 == 0:
        full_chain = (
            difficulty_prompt
            | model
            | StrOutputParser()
            | RunnableLambda(lambda d_level: {       
                "domain": domain,
                "d_level": d_level.strip(),
                "str_history": str_history,
                "example": example
            })
            | question_prompt
            | model
            | StrOutputParser()
        )
        estimated_tokens = 600
    else:
        full_chain = (
            RunnableLambda(lambda _: {
                "domain": domain,
                "d_level": "SAME",
                "str_history": str_history,
                "example": example
            })
            | question_prompt
            | model
            | StrOutputParser()
        )
        estimated_tokens = 500 


    usage_handler = UsageMetadataCallbackHandler()
    groq_limiter.wait_if_needed(estimated_tokens=estimated_tokens)
    results = full_chain.invoke(
        {"domain": domain, "str_history": str_history},
        config={"callbacks": [usage_handler]}
    )

    total_actual = sum(u.get('total_tokens', 0) for u in usage_handler.usage_metadata.values())
    groq_limiter.record_actual_tokens(total_actual, estimated_tokens)

    for model_name, usage in usage_handler.usage_metadata.items():
        print(f"Model: {model_name}")
        print(f"  Input tokens:     {usage.get('input_tokens')}")
        print(f"  Output tokens:    {usage.get('output_tokens')}")
        print(f"  Total tokens:     {usage.get('total_tokens')}")
        print(f"  Reasoning tokens: {usage.get('output_token_details', {}).get('reasoning', 0)}")

    return results





def generate_questions_based_on_domain(str_history, domain, resume_text, example,question_count):
    load_dotenv()

    os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY2")
    model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7, max_tokens=150)

    diff_template = """Role: Tech Interview Evaluator. 
                        Domain: {domain}
                        Resume: {resume_text}
                        History: {str_history}
                        Action: Analyze depth. Return ONLY: INCREASE, SAME, or DECREASE."""
                            
    difficulty_prompt = PromptTemplate(input_variables=['domain', 'str_history', 'resume_text'], template=diff_template)

    question_prompt = ChatPromptTemplate.from_messages([
        ("system", """Role: {domain} Interviewer. Level: {d_level}
            Context: {resume_text}
            Examples: {example}

            Rules:
            - Always start with greet comibined with technical question
            - 1 question, max 2 sentences.
            - No numbering.
            - If History empty: Ask for strongest skills from resume.
            - If Level=INCREASE: Ask scenario-based questions.
            - Maintain natural flow."""),
                    ("human", "History: {str_history}\nNext Question:")
                ])

    current_resume = resume_text if (question_count % 3 == 0 or not str_history.strip()) else "See history context."

    if question_count % 3 == 0 and str_history.strip():
        full_chain = (
            difficulty_prompt
            | model
            | StrOutputParser()
            | RunnableLambda(lambda d: {
                "domain": domain,
                "resume_text": resume_text, 
                "d_level": d.strip(),
                "str_history": str_history,
                "example": example
            })
            | question_prompt
            | model
          
            | StrOutputParser()
        )
        estimated_tokens = 600

    else:
        full_chain = (
            RunnableLambda(lambda _: {
                "domain": domain,
                "resume_text": current_resume, 
                "d_level": "SAME",
                "str_history": str_history,
                "example": example
            })
            | question_prompt
            | model
            | StrOutputParser()
        )
        estimated_tokens = 500 

    usage_handler = UsageMetadataCallbackHandler()
    groq_limiter.wait_if_needed(estimated_tokens=estimated_tokens)
    
    results = full_chain.invoke(
        {
            "domain": domain, 
            "str_history": str_history, 
            "resume_text": resume_text
        },
        config={"callbacks": [usage_handler]}  
    )

    total_actual = sum(u.get('total_tokens', 0) for u in usage_handler.usage_metadata.values())
    groq_limiter.record_actual_tokens(total_actual, estimated_tokens)


    return results








# def generate_questions_based_hr(example,str_history,domain,d_level):
#     load_dotenv()
#     os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")   
#     model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7,max_tokens=200)
#     message = ChatPromptTemplate.from_messages([
#         ("system", """
#          Keep responses concise, max 2 sentences. 
#          Do not repeat previous questions
         
#          EXAMPLE OF TYPE OF QUESTIONS TO ASK : {example}
#          CONVERSATION HISTORY :{str_history}
#          CANDIDATES DOMAIN :{domain}
#          THE DIFFICULTY LEVEL FOR THE QUESTION TO BE GENERATED:{d_level}

#             You are an HR interviewer.
            
#             ASK QUESTIONS ABOUT:
#             - Always Greet the User and ask about them say things like tell me about yourself or introduce yourself
#             - Dont ask about how they would solve team collaboration issue or any other qusetion before letting the introduce themself
#             - Always reflect on thier background and ask questions accoringly reagarding collaborations and other things but dont ask any technical questions yet
#             - Start in a progressing way like introduce yourself and then continue towards other questions
#             - Team collaboration and conflict resolution
#             - Leadership and initiative
#             - Career goals and motivations
#             - Work culture preferences
#             - Handling pressure and deadlines
#             - Why they want this role - CANDIDATES DOMAIN
#             - Based on {d_level} increase or decrease the difficulty complexity and practicality of the questions from fresher to industry standards
#             - Dont ask a really long questions keep it brief and check CONVERSATION HISTORY and ask a few detailed questions in between
#             Ask ONE behavioral question.
         
#          dont give the answer using line breakers like /n just give the answer in a straight paragraph
#         """),
#         ("human", "History: {str_history}\n\nGenerate next HR question.")
#     ])
#     formatted_examples = ""
#     for question, answer in example.items():
#         formatted_examples += f"Q: {question}\n"
#         formatted_examples += f"Good Answer: {answer}\n\n"
            
#     chain = message | model  # Use Groq for generation
#     response = chain.invoke({
#         'example':str(example),
#         'str_history': str_history,
#         'domain':domain,
#         'd_level':d_level
#     })
#     return response.content

# def main():
#     file_path = input("Please enter your file path: ")
#     domain1 = domain(file_path)
#     resume_text = get_resume(file_path)
#     print(f"Your domain is {domain1}")  
#     print("lets Get to your domain questions: ")
#     str_history = {} 
#     questions = ''
#     answer = ''
#     d_level = "EASY" 
    
#     number = int(input("Please enter no. of questions you want to attempt: "))
#     counter = 0
    
#     while counter < number:
#         questions = generate_questions_based_hr(example,str_history,domain1,d_level)
#         print(f"\nAI: {questions}")
#         answer = input("Please enter your answers: ")
#         memory.save_context(
#         {"input": questions},
#         {"output": answer})  
#         # d_level = difficulty.invoke({"domain": domain1, "questions": questions, "answer": answer,"str_history":str_history})        
#         counter += 1
        
#     print("Interview complete")
#     print("Calculating your results for the round")

#     results=evaluate_hr.invoke({"str_history":str_history})
#     print(results)

# if __name__ == "__main__":
#     main()



