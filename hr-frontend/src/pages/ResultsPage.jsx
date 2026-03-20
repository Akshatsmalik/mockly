import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ClockIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import Topbar from '../components/Topbar';
import KPITile from '../components/KPITile';
import { RemarksCard, StrengthsCard, WeaknessesCard } from '../components/Card';
import ProfilePopover from '../components/ProfilePopover';
import { ArrowUpAZ, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Navigate, useNavigate } from 'react-router-dom';
import { Data } from '../Hooks/Context';  



const ResultsPage = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = React.useState(false);
  const [remarks,setRemark]=useState('')
  const [strengths1,setStrength1] = useState('')
  const [weaknesss1,setWeakness] = useState('')
  const {conversation, setConversation } = useContext(Data)
  const {results, setResults} = useContext(Data)
  const fetched = useRef(false)
  const [loading, setLoading] = useState(true)  
  const [error, setError] = useState(null);
  
useEffect(() => {
  if (fetched.current) return;
  fetched.current = true;

  const remarks1 = async () => {
    let data;
    try {
      const response = await fetch('https://mockly-le44.onrender.com/evaluatehr', {
        credentials: 'include'
      });
      data = await response.json();
      console.log(data);
      console.log(data.strong_points);
      console.log(data.weak_points);
      console.log(data.overall_eval);
      console.log(data.overall_score);

      if (data.error) return;

      setResults(data.overall_eval);
      setRemark(data);
    } catch (error) {
      console.log(error);
    } finally {
      if (data?.error === 'No history found to evaluate') {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
  };

  remarks1();
}, []);



  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: [0.22, 0.9, 0.33, 1]
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: [0.22, 0.9, 0.33, 1]
      }
    }
  };


  if (loading){
      return (
        <>
       <Navbar action={{text:"Back",onClick:()=>{navigate('/')}}} className="mt-[20px]"/>
          <div className="min-h-screen bg-panel flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-12 h-12 text-gray-500" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluating your interview...</h2>
              <p className="text-muted">This may take a few seconds</p>
            </div>
            <div className="flex gap-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.8, delay, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </>);
      }


  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
    <Navbar action={{text:"Back",onClick:()=>{navigate('/')}}} className="mt-[20px]"/>
    <hr></hr>
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {/* <div className="relative">
        <Topbar onProfileClick={() => setShowProfile(!showProfile)} />
        <div className="absolute top-16 right-6">
          <ProfilePopover 
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hello, Akshat S Malik
          </h1>
          <p className="text-muted">You see your interview report here</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[20px]">

        <div className="space-y-6">
          <StrengthsCard strengths={remarks?.strong_points ?? []} />
        </div>

        <div className="space-y-6">
          <WeaknessesCard weaknesses={remarks?.weak_points ?? []} />
        </div>

        {/* Remarks full width below */}
        <div className="min-w-[100%] lg:col-span-2 space-y-8">
          <RemarksCard>
            <p style={{ whiteSpace: 'pre-wrap' }}>{remarks?.clean_eval}</p>
            <p className="font-bold mt-2">
              Score: {remarks?.overall_score ?? 'N/A'}
            </p>
          </RemarksCard>
        </div>

      </div>
      </div>
    </motion.div>
    </motion.div>
    </>
  );
};

export default ResultsPage;
export { ResultsPage };