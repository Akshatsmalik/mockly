# Mockly.AI - Interview Simulator

🔗 **Live Demo:** [https://mockly-one.vercel.app/](https://mockly-one.vercel.app/) (render takes time too boot up)

## 📌 Purpose
**Mockly.AI** is an AI-powered mock interview simulator designed to help candidates thoroughly prepare for High-stakes HR and Technical (DSA) interviews. By analyzing the user's uploaded resume and factoring in the chosen domain (e.g., Software Engineering, AI/ML) and difficulty level, the simulator provides a highly tailored, interactive testing environment. Candidates receive dynamic follow-up questions, an embedded code editor for problem-solving, and a comprehensive end-of-interview report highlighting key areas of improvement.

---

## ⚡ Key Features
- **Resume-Driven Context:** Extracts data from uploaded resumes to formulate personalized and relevant interview questions.
- **Dual Tracks (HR & Technical):** Complete with behavioral evaluation models and a Data Structures & Algorithms sandbox.
- **Adaptive Questioning:** The AI adjusts cross-questions dynamically based on the accuracy and strength of the candidate's previous answers.
- **Live Code Execution & Checking:** Allows users to solve algorithms on an embedded Monaco editor with immediate sandbox compilation and evaluation.
- **Voice Interaction Support:** Integrating speech recognition and rich animations to emulate a genuine human interview.
- **AI Expert Evaluator:** Detailed feedback highlighting optimal/sub-optimal code approaches, complete with custom scoring.

---

## 💻 Tech Stack

### Frontend
* **Core:** React (Vite environment)
* **Styling & Animation:** Tailwind CSS, Framer Motion
* **Utilities:** Monaco Editor (for code editing), React Speech Recognition, Axios, React Router v6

### Backend
* **Core:** FastAPI (Python 3.9+)
* **AI Models & Frameworks:** LangChain, Google Generative AI (Gemini 2.5 Flash)
* **API Utilities:** Uvicorn, httpx, pandas
* **Execution & Utilities:** Subprocess code sandboxing, uuid mapping for session scopes.

### Infrastructure & Deployment
* **Containerization:** Docker & Docker Compose
* **Hosting:** Vercel (Frontend), Custom backend deployment

---

## 🔬 Techniques & Methodologies Used

1. **Retrieval-Augmented Generation (RAG):**
   - The platform parses resume PDFs and creates succinct textual summaries. Using defined Langchain prompt chains, it guides the LLM to formulate tailored interview scenarios.

2. **Stateful Conversation Memory:**
   - Instead of evaluating single answers independently, Mockly maps unique `session_id` cookies to a dictionary-based local memory instance. This retains a moving context window of the user's questions and responses to avoid cyclic phrasing.
   
3. **Automated Code Evaluation via Prompt Chaining:**
   - When a user submits an algorithm, a custom evaluation chain wraps their code into an expert-level PromptTemplate. Gemini is heavily restricted to emit deterministic structural JSON arrays rating the optimality and correctness, scoring from 0 to 100.

4. **Transient Test Sandboxing:**
   - Employs the `subprocess` module mapped to localized data constraints (`leetcode.json`) running within 5-second asynchronous timeout thresholds, preventing malicious/infinite execution loops when validating candidate logic prior to AI evaluation.
   
5. **Adaptive Question Mapping:**
   - Mockly adjusts difficulty internally based on an evaluation hook. If a candidate excels iteratively, the cross-questioning parameter hardens structurally.

---

## 🛠️ Getting Started Locally

### Prerequisites
* Docker and Docker Compose
* Node.js & npm (if running independently of tools)
* Python 3.9+ 

### Running with Docker

You can rapidly spin up the entire application using the provided `compose.yaml`:

```bash
# Clone the repository and move to your root directory
docker-compose up --build
```
- The backend will run on `http://localhost:8000`
- The frontend will run on `http://localhost:3000`

> **Note:** Do not forget to rename your environment file containing your Gemini API tokens (e.g., `.env`) prior to launching the containers.
