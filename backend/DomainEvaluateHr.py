from langchain.tools import tool
from langchain.prompts import PromptTemplate,ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from domain import example
from domain import example_domain
from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
from difficulty import difficulty
from GetDomain import domain


load_dotenv()

os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")   
model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
# os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY2")

# model = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash-lite",temperature = 0.7
# )

class HRAnswerEvaluation(BaseModel):
    str_history: dict = Field(description="The full conversation history")

@tool("evaluate_hr_answer", args_schema=HRAnswerEvaluation)
def evaluate_hr(str_history: dict) -> str:
    """Evaluate HR answers using few-shot examples and conversation context"""
    
    # global example_domain

    # examples_text = ""
    # for q, a in example_domain.items():
    #     examples_text += f"Q: {q}\nGood Answer: {a}\n\n"
    
    global example_domain

    examples_text = ""
    for item in example_domain:
        q = item.get("question")
        a = item.get("answer")
        diff = item.get("difficulty")
        examples_text += f"Difficulty: {diff}\nQ: {q}\nGood Answer: {a}\n\n"


    prompt = PromptTemplate(
        input_variables=['str_history','example'],
        template="""
        You are an expert HR interviewer evaluating behavioral answers.
        "KEEP IN MIND THAT YOUR ARE CONDUCTING INTERVIEWS OF COLLAGE STUDENTS AND HENCE BE A LITTLE BIT LENIENT AND RATE THEM ACCORDINGLY DONT BE TOO CRITCAL WHILE EVALUATING AND NETIHER BE TOO SOFT"


        LEARN FROM THESE EXAMPLES:
        {examples}
        
        CONVERSATION HISTORY (for context):
        {str_history}
        
        
        Evaluate the answer considering:
        - Communication clarity
        - Relevant examples/experience  
        - Self-awareness
        - Culture fit indicators
        - Consistency with previous answers in history
        
        Rate from 1-10 with explanation.
        """
    )
    
    chain = prompt | model
    response = chain.invoke({
        'str_history': str_history,
        'examples': examples_text
    })
    print(f"--- Token Usage (Evaluation) ---")
    print(f"Prompt Tokens: {response.usage_metadata.get('input_tokens')}")
    print(f"Completion Tokens: {response.usage_metadata.get('output_tokens')}")
    print(f"Total Tokens: {response.usage_metadata.get('total_tokens')}")
    
    return response.content




#above is the tool and below is the function whose content should go into that tool




def generate_questions_based_on_domain(str_history, domain, resume_text, d_level):
    
    # global example_domain

    # domain_questions = ""
    # for i, ex in enumerate(example):
    #     domain_questions += f"--- Style Example {i+1} ---\n"
    #     domain_questions += f"Complexity: {ex['difficulty']}\n"
    #     domain_questions += f"Q: {ex['question']}\n"
    #     domain_questions += f"Target Depth: {ex['answer']}\n\n"

    global example

    examples_text = ""
    for q, a in example.items():
        examples_text += f"Q: {q}\nGood Answer: {a}\n\n"
    
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
        'domain_questions': examples_text
    })
    print(f"--- Token Usage (Evaluation) ---")
    print(f"Prompt Tokens: {response.usage_metadata.get('input_tokens')}")
    print(f"Completion Tokens: {response.usage_metadata.get('output_tokens')}")
    print(f"Total Tokens: {response.usage_metadata.get('total_tokens')}")
    
    return response.content

from GETresume import get_resume 

# def main():
#     file_path=input("Please enter your file path: ")
#     domain1=domain(file_path)
#     resume_text = get_resume(file_path)
#     print(f"Your domain is {domain1}")  
#     print("lets Get to your domain questions: ")
#     str_history={}
#     quesitons=''
#     answer=''
#     d_level=difficulty(domain1,quesitons,answer)
#     number=int(input("Please enter no. of quesitons you want to attempt"))
#     counter=0
#     while counter<=number:
#         quesitons=generate_questions_based_on_domain(str_history,domain1,resume_text,d_level)
#         answer=input("Please enter your answers")
#         str_history[quesitons]=answer
#         counter+=1
#     print("Interview complete")
#     print("Calculating your results for the round")

def main():
    file_path = input("Please enter your file path: ")
    domain1 = domain(file_path)
    resume_text = get_resume(file_path)
    print(f"Your domain is {domain1}")  
    print("lets Get to your domain questions: ")
    str_history = {} 
    questions = ''
    answer = ''
    d_level = "EASY" 
    number = int(input("Please enter no. of questions you want to attempt: "))
    counter = 0
    
    while counter < number:
        history_context = "\n".join([f"Q: {k}\nA: {v}" for k, v in str_history.items()])
        questions = generate_questions_based_on_domain(history_context, domain1, resume_text, d_level)
        print(f"\nAI: {questions}")
        answer = input("Please enter your answers: ")
        str_history[questions] = answer 
        d_level = difficulty.invoke({"domain": domain1, "questions": questions, "answer": answer})        
        counter += 1
        
    print("Interview complete")
    print("Calculating your results for the round")

    results=evaluate_hr.invoke({'str_history':str_history})
    print(results)

if __name__ == "__main__":
    main()


