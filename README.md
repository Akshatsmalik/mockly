# Mockly.AI - Interview Simulator

Mockly is an AI-assisted interview-practice application with separate React and FastAPI services.

```text
backend/app/       API routers, application services, configuration, and persistence
backend/data/      DSA datasets and reference material
backend/tests/     Backend unit tests
hr-frontend/src/   React pages, components, routes, and API client
```

## 📌 Purpose
**Mockly.AI** is an AI-powered mock interview simulator designed to help candidates thoroughly prepare for High-stakes HR and Technical (DSA) interviews. By analyzing the user's uploaded resume and factoring in the chosen domain (e.g., Software Engineering, AI/ML) and difficulty level, the simulator provides a highly tailored, interactive testing environment. Candidates receive dynamic follow-up questions, an embedded code editor for problem-solving, and a comprehensive end-of-interview report highlighting key areas of improvement.

---

## ⚡ Key Features
- **Resume-Driven Context:** Extracts data from uploaded resumes to formulate personalized and relevant interview questions.
- **Dual Tracks (HR & Technical):** Complete with behavioral evaluation models and a Data Structures & Algorithms sandbox.
- **Adaptive Questioning:** The AI adjusts cross-questions dynamically based on the accuracy and strength of the candidate's previous answers.
- **Code Evaluation:** Uses an externally hosted, isolated execution service for untrusted candidate code.
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
* **API Utilities:** Uvicorn, httpx, SQLAlchemy, Pydantic settings
* **Persistence:** SQLite for local development; configure a managed database for multi-instance production deployments.

### Infrastructure & Deployment
* **Containerization:** Docker & Docker Compose
* **Hosting:** Vercel (Frontend), Custom backend deployment

---

## 🔬 Techniques & Methodologies Used

1. **Resume-grounded prompting:**
   - The platform extracts a resume once, produces a concise summary, and passes that context to the technical-interview prompt. This is not described as RAG because it does not currently use a vector retrieval store.

2. **Stateful Conversation Memory:**
   - A signed-session cookie identifies an interview record stored in the configured database. The API uses a limited recent-history window for question generation while retaining the full interview for reporting.
   
3. **Automated Code Evaluation via Prompt Chaining:**
   - When a user submits an algorithm, a custom evaluation chain wraps their code into an expert-level PromptTemplate. Gemini is heavily restricted to emit deterministic structural JSON arrays rating the optimality and correctness, scoring from 0 to 100.

4. **Isolated code execution:**
   - The API never starts user code itself. It forwards execution requests only to `CODE_EXECUTION_URL`, which must be a separate service enforcing network isolation plus CPU, memory, process, and time limits.
   
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
# Copy backend/.env.example to backend/.env and fill in model keys.
# Set CODE_EXECUTION_URL before enabling the DSA runner.
docker compose up --build
```
- The backend will run on `http://localhost:8000`
- The frontend will run on `http://localhost:3000`

Set `VITE_API_URL` from `hr-frontend/.env.example` when the frontend and backend are hosted on different origins. The backend's `ALLOWED_ORIGINS` must include the deployed frontend URL.
