import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './interviewpage.css';
import Navbar from '../components/Navbar';
import Dataprovider from '../Hooks/Dataprovider';
import { Data } from '../Hooks/Context';
import { motion } from 'framer-motion';
import noHistory from "../assets/sad.jpg" 
import nerd1 from "../assets/nerd1.png" 

const ReportDisplay = ({ data }) => {
  const {results, setResults} = useContext(Data)
  console.log(results)
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full p-6 text-center border border-gray-100 rounded-lg">
        <img 
          src={noHistory}
          alt="No history" 
          className="w-80 h-70 mb-4 opacity-80"
        />
        <h1 className="text-xl font-bold text-gray-700">No history yet</h1>
        <h1 className="text-gray-600 mt-2 text-lg">
          Complete your first mock interview to see your results here!
        </h1>
      </div>
    );
  }

  return (
    <div className="text-gray-800 leading-relaxed text-left w-full h-[400px] overflow-y-auto pr-4 custom-scrollbar">
      <p className="whitespace-pre-wrap">{results}</p>
    </div>
  );
};

const DsaReportDisplay = ({ evaluation }) => {
  if (!evaluation || !evaluation.score) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full p-6 text-center border border-gray-100 rounded-lg bg-gray-50">
        <h1 className="text-xl font-bold text-gray-700">No AI Review Found</h1>
        <h1 className="text-gray-600 mt-2 text-md">
          Complete a DSA round and submit your code to see the AI evaluation here.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-start bg-blue-50/50 p-6 rounded-xl border border-blue-100 h-[400px] w-full overflow-y-auto custom-scrollbar">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        ✨ AI Code Review
      </h3>
      <div className="flex flex-row items-start gap-6 w-full mt-2">
        {/* Donut Chart */}
        <div className="relative flex items-center justify-center w-24 h-24 shrink-0 bg-white rounded-full shadow-sm">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
            <motion.circle
              cx="48" cy="48" r="36"
              stroke={evaluation.score >= 80 ? "#10b981" : evaluation.score >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8" fill="transparent"
              strokeDasharray={2 * Math.PI * 36}
              initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 36) - ((evaluation.score / 100) * 2 * Math.PI * 36) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-gray-800">
            <span className="text-2xl font-bold leading-none">{evaluation.score}</span>
          </div>
        </div>

        {/* Feedback Text */}
        <div className="flex-1">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
            {evaluation.feedback}
          </p>
        </div>
      </div>
    </div>
  );
};

export const InterviewPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState(null);
  const [domains, setDomains] = useState("");
  const [error, setError] = useState("");
  const [domainMode, setDomainMode] = useState("automatic"); 
  const [manualDomain, setManualDomain] = useState("Web development");
  const { round, setRound, numq, setNumq, domain, setDomain, results } = useContext(Data)
  const isValid = numq > 0 && numq <= 10;
  const [dsaDifficulty, setDsaDifficulty] = useState("Medium");
  const [dsaTopic, setDsaTopic] = useState("");
  const [dsaTopics, setDsaTopics] = useState([]);
  const [dsaError, setDsaError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://mockly-le44.onrender.com/getresume", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      console.log(data.domain);
      setDomains(data.domain);

    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  useEffect(() => {
    console.log(round);
    console.log(domain);
  }, [round]);

  const handleStart = () => {
    if (!file) {
      setError("Please upload resume first");
      return;
    }
    if (!isValid) {
      setError("Enter number of questions between 1 and 10");
      return;
    }

    const selectedDomain = domainMode === "automatic" ? domains : manualDomain;

    setError("");
    setDomain(selectedDomain);
    console.log(selectedDomain);
    navigate('/camera');
  };

  useEffect(() => {
    console.log(numq);
    console.log(round);
    console.log(manualDomain);
  },[numq,domain]);

  useEffect(() => {
    if (activeTab === "dsa" && dsaTopics.length === 0) {
      fetch("https://mockly-le44.onrender.com/api/topics")
        .then((res) => res.json())
        .then((data) => setDsaTopics(data.topics || []))
        .catch(() => setDsaTopics([]));
    }
  }, [activeTab, dsaTopics.length]);

  
  const go = () => {
    if (isValid && file && domain) {
      navigate('/camera');
    }
  };

  const tell = ()=>{
    setActiveTab('dsa');
    setRound('DSA');
  }

  const handleStartDsa = async () => {
    if (!dsaDifficulty) {
      setDsaError("Please select a difficulty.");
      return;
    }
    if (!dsaTopic) {
      setDsaError("Please select a topic.");
      return;
    }
    setDsaError("");

    try {
      const qRes = await fetch(
        `https://mockly-le44.onrender.com/api/questions/random?topic=${encodeURIComponent(
          dsaTopic
        )}&difficulty=${encodeURIComponent(dsaDifficulty)}`
      );
      if (!qRes.ok) {
        throw new Error("No question found for selected filters.");
      }
      const qData = await qRes.json();

      const sessRes = await fetch("https://mockly-le44.onrender.com/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: qData.id,
          duration_minutes: 30,
        }),
      });
      if (!sessRes.ok) {
        throw new Error("Failed to start DSA session.");
      }
      const sess = await sessRes.json();
      const sid = sess.session_id;

      navigate(
        `/dsa/editor/${qData.id}?session=${encodeURIComponent(
          sid
        )}&duration=30`
      );
    } catch (err) {
      console.error(err);
      setDsaError(
        err instanceof Error ? err.message : "Failed to start DSA round."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Navbar action={{ text: "Start", onClick: go }} className="shadow-sm mt-[20px] mb-[50px]" />
      <div className="mockly-container mt-7">
        <div className='flex flex-col '>
        <section className="round-selection">
          <button
            className={`round-btn ${activeTab === 'hr' ? 'active' : ''}`}
            onClick={() => { setActiveTab('hr'); setRound('HR') }}>
            HR round
          </button>

          <button
            className={`round-btn ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resume'); setRound('RESUME') }}>
            Resume and Domain round
          </button>
          
          <button
            className={`round-btn ${activeTab === 'dsa' ? 'active' : ''}`}
            onClick={tell}>
            DSA Round
          </button>
        </section>
        {/* <p className='flex justify-center text-red-500 mb-[28px]'>{soon}</p> */}
        </div>





        <main className="main-card">
          <div className="config-row">

          {activeTab !== 'dsa' && (
            <>
            <div className="flex flex-col gap-2 rounded-xl align-middle justify-center">
              <label className="config-label">Upload your resume</label>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="border border-black p-2 rounded-md bg-gray-200"
              />

              <button
                onClick={handleUpload}
                className="bg-blue-500 text-white py-2 rounded-xl">
                Upload Resume
              </button>

              {domains && domainMode === "automatic" && (
                <p className="text-green-600">
                  Detected Domain: <b>{domains}</b>
                </p>
              )}
              {error && (
                <p className="text-red-600 mt-2">{error}</p>
              )}
            </div>

            <div className="config-group block">
              <label className="config-label">Select Your Domain</label>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setDomainMode("automatic")}
                  className={`py-1 px-3 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                    domainMode === "automatic"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}>
                  Automatic
                </button>
                <button
                  onClick={() => setDomainMode("manual")}
                  className={`py-1 px-3 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                    domainMode === "manual"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}>
                  Manual
                </button>
              </div>

              {domainMode === "manual" && (
                <div className="custom-select">
                  <select value={manualDomain} onChange={(e) => setManualDomain(e.target.value)}>
                    <option value="Web development">Web development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>
              )}

              {domainMode === "automatic" && (
                <p className="text-sm text-gray-500 mt-1">
                  Domain will be detected automatically from your resume.
                </p>
              )}
            </div>

            <div className="config-group flex flex-col gap-1">
              <label className="config-label">Number of Questions</label>
              <input
                value={numq}
                type="number"
                min="1"
                max="10"
                className="number-input"
                placeholder="Please enter under 10"
                onChange={(e) => setNumq(Number(e.target.value))}
              />
              {numq > 10 && (
                <span className="text-red-500 text-xs mt-1">Maximum 10 questions allowed.</span>
              )}
            </div>
            </>
          )}

          {activeTab === 'dsa' && (
            <div className="flex flex-col gap-6 w-full">
              <div className="config-group flex flex-col gap-2">
                <label className="config-label">Select DSA Difficulty</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDsaDifficulty(level)}
                      className={`py-2 px-4 rounded-full border text-sm font-medium transition-colors duration-200 ${
                        dsaDifficulty === level
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-group flex flex-col gap-2">
                <label className="config-label">Select DSA Topic</label>
                <div className="custom-select">
                  <select 
                    value={dsaTopic} 
                    onChange={(e) => setDsaTopic(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- Select a topic --</option>
                    {dsaTopics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                {dsaTopics.length === 0 && (
                  <span className="text-sm text-gray-500 mt-1">
                    No DSA topics loaded yet.
                  </span>
                )}
                {dsaError && (
                  <p className="text-red-500 text-xs mt-1">{dsaError}</p>
                )}
              </div>
            </div>
          )}
          </div>

          <hr className="divider" />

          <section className="report-section">
            <h2 className="report-title">Previous Sessions Report</h2>
            <div className="title-underline"></div>

            <div className="report-content">
              <div className="report-text w-full">
                {round === 'DSA' && (results?.score !== undefined || results?.feedback) ? (
                  <DsaReportDisplay evaluation={results} />
                ) : (
                  <ReportDisplay data={remark} />
                )}
              </div>

              {/* <div className="report-chart">

                <div className='flex flex-col items-center justify-center'>
                <img src={nerd1} className='mt-[50px]' alt="nerd result"/>
                <p className='mt-[50px] text-center font-bold text-xl'>Nice work or maybe not </p>
                </div>
              </div> */}
            </div>
          </section>
        </main>

        <button
          className="bg-blue-500 text-white m-[20px] py-[10px] px-[40px] border-[2px] border-blue-500 rounded-[20px] transition-transform duration-300 hover:scale-105 hover:bg-blue-700"
          onClick={activeTab === 'dsa' ? handleStartDsa : handleStart}
        >
          {activeTab === 'dsa' ? 'Start DSA Round' : 'Start Interview'}
        </button>
      </div>
    </motion.div>
  );
};