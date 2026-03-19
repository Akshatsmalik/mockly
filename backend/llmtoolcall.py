from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from tools import tools, model
import json

def agentdc(str_history: str, domain: str) -> dict:
    """
    Analyzes the interview history and returns a strict dictionary with 
    'difficulty' and 'cross_question'.
    """
    
    system_prompt = """
    You are the core logic engine for an interview simulation platform.
    The candidate is interviewing for a role in the {domain} domain.
    
    YOUR INSTRUCTIONS:
    1. Analyze the history provided. 
    2. Decide IF a cross-question is needed. If yes, use 'cross_evaluate'.
    3. Use 'decide_next_action' to determine the next difficulty. (Pass the {domain} to this tool).

    CRITICAL OUTPUT RULE:
    Your FINAL response must be a raw, valid JSON object with NO markdown formatting.
    Structure it exactly like this:
    {{
        "difficulty": "INCREASE" | "DECREASE" | "SAME",
        "cross_question": "The question text here, or an empty string '' if none is needed"
    }}
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Here is the interview history:\n{str_history}\n\nTask: Analyze this and output the JSON."),
        ("placeholder", "{agent_scratchpad}"), 
    ])

    agent_instance = create_tool_calling_agent(model, tools, prompt)
    agent_executor = AgentExecutor(agent=agent_instance, tools=tools, verbose=True)
    
    response = agent_executor.invoke({
        "domain": domain,
        "str_history": str_history
    })

    try:
        clean_output = response['output'].replace("```json", "").replace("```", "").strip()
        final_dictionary = json.loads(clean_output)
        return final_dictionary
        
    except json.JSONDecodeError:
        return {
            "difficulty": "SAME", 
            "cross_question": "", 
            "error": "Failed to parse JSON"
        }

if __name__ == "__main__":
    sample_history = """
    Interviewer: What is polymorphism?
    Candidate: It means many forms. Like when a function can do different things.
    Evaluation: 4/10 - Basic definition, missing examples.
    """
    
    result = agentdc(str_history=sample_history, domain="Software Engineering")
    
    print("\n--- EXTRACTED DATA ---")
    print("Cross Question:", result['cross_question'])
    print("Difficulty:", result["difficulty"])