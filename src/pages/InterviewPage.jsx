import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './interviewpage.css';
import Navbar from '../components/Navbar';


const ReportDisplay = ({ data }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full p-6 text-center border border-gray-100 rounded-lg">
        <img 
          src="/sad.jpg" 
          alt="No history" 
          className="w-100 h-100 mb-4 opacity-60" 
        />
        <h1 className="text-xl font-bold text-gray-700">No history yet</h1>
        <h1 className=" text-gray-600 mt-2 text-lg">
          Complete your first mock interview to see your results here!
        </h1>
      </div>
    );
  }

  return (
    <div className="text-gray-800 leading-relaxed text-left w-full h-[400px] overflow-y-auto pr-4 custom-scrollbar">
      {/* h-[400px]: Sets a fixed height.
         overflow-y-auto: Adds a scrollbar only when the text exceeds the height.
         pr-4: Adds padding on the right so text doesn't touch the scrollbar.
      */}
      <p className="whitespace-pre-wrap">{data}</p>
    </div>
  );
};

export const InterviewPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [round, setRound] = useState('Web development');
  const [remark, setRemark] = useState('');
  const [numq, setNumq] = useState('');
  const [file, setFile] = useState(null);
  const [domain, setDomain] = useState("");
  const isValid = numq > 0 && numq <= 10;
  const [error, setError] = useState("");


  const handleUpload = async () => {
  if (!file) {
    alert("Please upload a resume first");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch("http://localhost:8000/getresume", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setDomain(data.domain);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

  useEffect(() => {
    console.log(round);
  }, [round]);


  // const handleStart = () => {
  //   if(isValid && file!==null) {
  //   navigate('/')
  // }
  // };


  const handleStart = () => {
  if (!file) {
    setError("Please upload resume first");
    return;
  }
  if (!isValid) {
    setError("Enter number of questions between 1 and 10");
    return;
  }
  setError("");
  navigate('/');
};




 async function fetchHistory() {
    try {
      const response = await fetch('YOUR_API_URL_HERE');
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const textData = await response.text(); 

      if (textData.includes('<!DOCTYPE html>') || textData.trim() === '') {
        setRemark(null); 
      } else {
        setRemark(textData);
      } 
    }catch(error) {
      console.error("Error fetching data:", error);
      setRemark(null); 
    }
  }




  useEffect(() => {
    fetchHistory();
  }, []);
  




  useEffect(()=>{
    console.log(numq)
  },[numq])



  return (
    <>
      <Navbar action={{text:"Next",onClick:()=>{navigate('/camera')}}} className="shadow-sm mt-[20px] mb-[50px]" />
    <div className="mockly-container mt-7">
      <section className="round-selection">
        <button 
          className={`round-btn ${activeTab === 'hr' ? 'active' : ''}`}
          onClick={() => {setActiveTab('hr'); setRound('HR')}}>
          HR round
        </button>
        
        <button 
          className={`round-btn ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => {setActiveTab('resume'); setRound('RESUME')}}>
          Resume and Domain round
        </button>
        
        <button 
          className={`round-btn ${activeTab === 'dsa' ? 'active' : ''}`}
          onClick={() => {setActiveTab('dsa'); setRound('dsa')}}>
          DSA Round
        </button>
      </section>

      {/* Main Configuration Card */}
      <main className="main-card">
        <div className="config-row ">
          <div className="config-group block">
            <label className="config-label">Select Your domain</label>
            <div className="custom-select">
              <select value={round} onChange={(e) => {setRound(e.target.value)}}>
                <option value="Web development">Web development</option>
                <option value="Data Science">Data Science</option>
                <option value="Cloud Computing">Cloud Computing</option>
              </select>
            </div>
          </div>

          

          {/* <div className="config-group flex flex-col gap-1" >
            <label className="config-label">Upload your resume</label>
            <div className="custom-select">
              <select value={round} onChange={(e) => {setRound(e.target.value)}}>
                <option value="Web development">Web development</option>
                <option value="Data Science">Data Science</option>
                <option value="Cloud Computing">Cloud Computing</option>
              </select>
            </div>
          </div> */}
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

            {domain && (
              <p className="text-green-600">
                Detected Domain: <b>{domain}</b>
              </p>
            )}
             {error && (
            <p className="text-red-600 mt-2">{error}</p>
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
                onChange={(e) => setNumq(e.target.value)} 
              />
              {numq > 10 && (
                <span className="text-red-500 text-xs mt-1">Maximum 10 questions allowed.</span>
              )}
              
          </div>
          </div>

        <hr className="divider" />

        <section className="report-section">
          <h2 className="report-title">Previous Sessions Report</h2>
          <div className="title-underline"></div>

          <div className="report-content">
            
            {/* TEXT AREA using your new component */}
            <div className="report-text w-full">
              <ReportDisplay data={remark} />
            </div>

            {/* CHART AREA */}
            <div className="report-chart">
              <div className="y-axis">
                <span>100</span>
                <span>0</span>
              </div>
              
              <div className="chart-area">
                <div className="bar-group">
                  <div className="bar blue" style={{ height: '55%' }}></div>
                  <span className="bar-label">DOMAIN<br/>SCORE</span>
                </div>
                <div className="bar-group">
                  <div className="bar red" style={{ height: '85%' }}></div>
                  <span className="bar-label">RESUME<br/>SCORE</span>
                </div>
                <div className="bar-group">
                  <div className="bar yellow" style={{ height: '20%' }}></div>
                  <span className="bar-label">DSA ROUND</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

       
      <button 
        className="bg-blue-500 text-white m-[20px] py-[10px] px-[40px] border-[2px] border-blue-500 rounded-[20px] transition-transform duration-300 hover:scale-105 hover:bg-blue-700"
        onClick={handleStart}
      >
        Start Interview
      </button>
    </div>
    </>
  );
};