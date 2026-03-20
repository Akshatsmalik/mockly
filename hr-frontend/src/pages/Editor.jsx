import { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import api from "../api/client";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Data } from "../Hooks/Context";

const LANG_OPTIONS = ["python", "cpp", "java", "javascript"];

export default function Editor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session");
  const duration = Number(params.get("duration")) * 60; // to seconds

  const [question, setQuestion] = useState(null);
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [testResults, setTestResults] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("testcases"); // testcases | results

  const { setResults } = useContext(Data);

  // Load question
  useEffect(() => {
    api.get(`/questions/${id}`).then(r => {
      setQuestion(r.data);
      setCode(r.data[`starter_code_${lang}`] || "");
    });
  }, [id]);

  // Update starter code when language changes
  useEffect(() => {
    if (question) setCode(question[`starter_code_${lang}`] || "");
  }, [lang]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleTimeUp = async () => {
    await api.post(`/session/end?session_id=${sessionId}`);
    navigate(`/results?session=${sessionId}&timeout=true`);
  };

  const runCode = async () => {
    setRunning(true);
    const res = await api.post("/judge/run", { code, language: lang, stdin: customInput });
    setCustomOutput(res.data.stdout || res.data.stderr || "No output");
    setActiveTab("custom");
    setRunning(false);
  };

  const submitCode = async () => {
    setSubmitting(true);
    
    // 1. Submit code for standard test cases
    const res = await api.post("/judge/submit", {
      code, language: lang,
      question_id: Number(id),
      session_id: sessionId,
    });
    
    setTestResults(res.data);
    setActiveTab("results");
    
    // 2. Run Gemini Evaluation
    try {
      const evalRes = await api.post("/judge/evaluate", {
        code, 
        topic: question.topic || "Data Structures and Algorithms",
        question: question.description,
        language: lang
      });
      setResults(evalRes.data);
      setSubmitting(false);
      navigate("/interview");
    } catch (e) {
      console.error(e);
      setResults({ score: 0, feedback: "Failed to evaluate code with AI." });
      setSubmitting(false);
      navigate("/interview");
    }
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // Fancy loading screen (same style as commented one in ResultsPage)
  if (!question) {
    return (
      <div className="min-h-screen bg-panel flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-gray-500" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading your DSA problem...
          </h2>
          <p className="text-muted">This may take a few seconds</p>
        </div>
        <div className="flex gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                duration: 0.8,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-screen bg-transparent text-gray-900 flex flex-col font-sans"
    >
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 gap-4 border-b border-gray-200 bg-white">
        <span className="text-blue-600 font-semibold mr-4">{question.title}</span>
        <span className={`text-xs px-2 py-0.5 rounded mr-auto ${
          question.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" :
          question.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
          "bg-rose-100 text-rose-700"
        }`}>{question.difficulty}</span>

        <select value={lang} onChange={e => setLang(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm mr-4 text-gray-800"
        >
          {LANG_OPTIONS.map(l => <option key={l}>{l}</option>)}
        </select>

        <span className={`text-lg font-semibold mr-4 tabular-nums ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-gray-900"}`}>
          ⏱ {fmt(timeLeft)}
        </span>

        <button onClick={submitCode} disabled={submitting}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm">
          {submitting ? "Judging..." : "Submit"}
        </button>

        <button onClick={()=>{navigate('/interview')}}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm">
          {submitting ? "Judging..." : "Back"}

        </button>

      </div>

      {/* Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem Statement */}
        <div className="w-2/5 overflow-y-auto p-4 border-r border-gray-100 text-sm bg-gray-50">
          <p className="text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">{question.description}</p>
          
          <h3 className="text-gray-500 uppercase text-xs mb-2 tracking-wider">Examples</h3>
          <pre className="bg-white border border-gray-200 p-3 rounded-lg text-xs text-gray-800 mb-4 whitespace-pre-wrap">{question.examples}</pre>
          
          <h3 className="text-gray-500 uppercase text-xs mb-2 tracking-wider">Constraints</h3>
          <pre className="bg-white border border-gray-200 p-3 rounded-lg text-xs text-gray-800 mb-4">{question.constraints}</pre>
          
          {question.hints && (
            <details className="text-xs">
              <summary className="text-blue-600 cursor-pointer">💡 Hint</summary>
              <p className="mt-2 text-gray-600">{question.hints}</p>
            </details>
          )}
        </div>

        {/* Right: Editor + Panel */}
        <div className="flex flex-col flex-1">
          <MonacoEditor
            height="60%"
            language={lang === "cpp" ? "cpp" : lang}
            value={code}
            onChange={v => setCode(v)}
            theme="light"
            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />

          {/* Bottom Panel */}
          <div className="flex-1 border-t border-gray-100 flex flex-col overflow-hidden bg-white">
            <div className="flex border-b border-gray-100">
              {["testcases", "results"].map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>
                  {tab === "testcases" ? "Test Cases" : "Results"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 text-xs bg-white">
              {activeTab === "testcases" && (
                <div className="space-y-2">
                  {question.test_cases?.map((tc, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
                      <div className="text-gray-500">Case {i+1}</div>
                      <div>Input: <span className="text-gray-800">{tc.input}</span></div>
                      <div>Expected: <span className="text-emerald-700">{tc.output}</span></div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "results" && testResults && (
                <div>
                  <div className={`mb-3 text-sm font-semibold ${testResults.all_passed ? "text-emerald-700" : "text-rose-600"}`}>
                    {testResults.passed}/{testResults.total} test cases passed
                    {testResults.all_passed && " 🎉"}
                  </div>
                  {testResults.results.map((r, i) => (
                    <div key={i} className={`mb-2 p-2 rounded-lg border ${r.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                      <div className="flex justify-between mb-1">
                        <span>Case {r.case} {r.passed ? "✓" : "✗"}</span>
                        <span className="text-gray-500">{r.time}s • {r.memory}KB</span>
                      </div>
                      {!r.passed && (
                        <>
                          <div>Expected: <span className="text-emerald-700">{r.expected}</span></div>
                          <div>Got: <span className="text-rose-600">{r.actual || r.error}</span></div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}