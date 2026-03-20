import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { motion } from "framer-motion";

export default function DsaHome() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(30); // minutes
  const [questions, setQuestions] = useState([]);
  const [selectedQ, setSelectedQ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/topics").then((r) => setTopics(r.data.topics || []));
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      api
        .get("/questions", { params: { topic: selectedTopic, difficulty } })
        .then((r) => setQuestions(r.data || []));
    } else {
      setQuestions([]);
      setSelectedQ(null);
    }
  }, [selectedTopic, difficulty]);

  const startSession = async () => {
    if (!selectedQ) return;
    const res = await api.post("/session/start", {
      question_id: selectedQ.id,
      duration_minutes: duration,
    });
    const sid = res.data.session_id;
    navigate(
      `/dsa/editor/${selectedQ.id}?session=${encodeURIComponent(
        sid
      )}&duration=${duration}`
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-white text-gray-900 p-8 font-sans"
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-blue-600">DSA Arena</h1>
        <p className="text-gray-600 mb-8">
          Pick a topic, set your timer, and practice with timed coding sessions.
        </p>

        {/* Topic Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() =>
                setSelectedTopic((prev) => (prev === t ? "" : t))
              }
              className={`p-3 border rounded-2xl text-sm transition-all ${
                selectedTopic === t
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-gray-200 hover:border-gray-400 text-gray-700 bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Difficulty + Timer */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  difficulty === d
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 bg-white hover:border-gray-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="md:ml-auto bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 w-full md:w-auto shadow-sm"
          >
            {[15, 20, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </div>

        {/* Question List */}
        <div className="space-y-2 mb-8">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedQ(q)}
              className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                selectedQ?.id === q.id
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-400 bg-white"
              }`}
            >
              <span className="text-gray-900 font-medium">{q.title}</span>
              <span
                className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                  q.difficulty === "Easy"
                    ? "bg-emerald-100 text-emerald-700"
                    : q.difficulty === "Medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {q.difficulty}
              </span>
            </div>
          ))}
          {!selectedTopic && (
            <p className="text-xs text-gray-500">
              Select a topic above to see questions.
            </p>
          )}
        </div>

        <button
          disabled={!selectedQ}
          onClick={startSession}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-30 hover:bg-blue-700 transition-colors shadow-md"
        >
          Start Session →
        </button>
      </div>
    </motion.div>
  );
}

