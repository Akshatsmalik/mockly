import os
import pandas as pd
import re

# Load existing questions
csv_path = "data/questions.csv"
try:
    df = pd.read_csv(csv_path)
    next_id = df['id'].max() + 1
except:
    df = pd.DataFrame(columns=['id', 'title', 'topic', 'difficulty', 'description', 
                                'examples', 'constraints', 'test_cases', 
                                'starter_code_python', 'starter_code_cpp', 
                                'starter_code_java', 'hints'])
    next_id = 1

# Topic mapping based on folder structure
topic_mapping = {
    "Step 01": "Basics",
    "Step 02": "Sorting",
    "Step 03": "Arrays",
    "Step 04": "Binary Search",
    "Step 05": "Strings",
    "Step 06": "Linked List",
    "Step 07": "Recursion",
    "Step 08": "Bit Manipulation",
    "Step 09": "Stack and Queues",
    "Step 10": "Sliding Window",
    "Step 11": "Heaps",
    "Step 12": "Greedy",
    "Step 13": "Binary Trees"
}

# Difficulty mapping
difficulty_mapping = {
    "Easy": "Easy",
    "Medium": "Medium",
    "Hard": "Hard",
    "Sorting-I": "Easy",
    "Sorting-II": "Medium"
}

def extract_difficulty_from_path(path):
    """Extract difficulty from folder path"""
    if "Easy" in path or "1.3" in path or "1.4" in path or "1.5" in path:
        return "Easy"
    elif "Medium" in path or "2.1" in path:
        return "Medium"
    elif "Hard" in path:
        return "Hard"
    return "Medium"  # default

def get_topic_from_path(path):
    """Extract topic from folder path"""
    for key, value in topic_mapping.items():
        if key in path:
            return value
    return "General"

def read_java_file(filepath):
    """Read Java file and extract basic info"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except:
        return ""

# Scan Striver folder
striver_root = "Strivers-A2Z-DSA-Course-Sheet-master"
new_questions = []

for root, dirs, files in os.walk(striver_root):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            
            # Extract question title from filename
            title = file.replace('.java', '').strip()
            
            # Skip if already exists
            if title in df['title'].values:
                continue
            
            # Get topic and difficulty
            topic = get_topic_from_path(root)
            difficulty = extract_difficulty_from_path(root)
            
            # Read file content
            java_code = read_java_file(filepath)
            
            # Create starter code templates
            starter_python = f"def solve():\n    # {title}\n    pass"
            starter_cpp = f"// {title}\nvoid solve() {{\n    // Write your code here\n}}"
            starter_java = java_code if java_code else f"// {title}\nclass Solution {{\n    // Write your code here\n}}"
            
            new_question = {
                'id': next_id,
                'title': title,
                'topic': topic,
                'difficulty': difficulty,
                'description': f"Solve: {title}",
                'examples': "See problem statement",
                'constraints': "Standard constraints apply",
                'test_cases': '[]',
                'starter_code_python': starter_python,
                'starter_code_cpp': starter_cpp,
                'starter_code_java': starter_java,
                'hints': f"Topic: {topic}"
            }
            
            new_questions.append(new_question)
            next_id += 1

# Add new questions to dataframe
if new_questions:
    new_df = pd.DataFrame(new_questions)
    df = pd.concat([df, new_df], ignore_index=True)
    df.to_csv(csv_path, index=False)
    print(f"✓ Successfully added {len(new_questions)} questions from Striver sheet!")
    print(f"Total questions now: {len(df)}")
else:
    print("No new questions found or all questions already exist.")
