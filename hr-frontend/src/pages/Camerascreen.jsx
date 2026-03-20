import React from 'react';
import { motion } from 'framer-motion';
import VideoFeed from '../components/Video'; 
import ChatPanel from '../components/Chatpanel';
import Navbar from '../components/Navbar';
import MediaStreamer from '../components/Camera';
import { useNavigate } from 'react-router-dom';
import { Data } from '../Hooks/Context';
import { useContext } from 'react';

function Camerascreen() {
  const pageTransition = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  };
  const navigate = useNavigate();

  const {numq,questionc} = useContext(Data)
  console.log(`numbers orignally by  user ${numq}, attempted questions ${questionc}`)

  const go = () => {
  if (questionc >= numq + 1) 
    navigate('/results')
  }

  

  return (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="h-screen overflow-hidden flex flex-col bg-gray-50"
  >
    <Navbar action={{text:"Results",onClick:go}} />
    <motion.div
      className="flex-1 overflow-hidden p-4 flex items-center justify-center font-sans"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <div className="w-full h-full max-w-[1400px] flex gap-4">
        <VideoFeed />
        <ChatPanel />
      </div>
    </motion.div>
  </motion.div>
  );
}

export default Camerascreen;