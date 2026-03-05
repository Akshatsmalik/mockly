import React from 'react';
import { motion } from 'framer-motion';
import VideoFeed from '../components/Video'; 
import ChatPanel from '../components/Chatpanel';
import Navbar from '../components/Navbar';
import MediaStreamer from '../components/Camera';

function Camerascreen() {
  const pageTransition = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  };

  return (
    <motion.div
      className="w-full h-screen overflow-hidden bg-gray-50 p-4 flex flex-col items-center justify-center font-sans"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <Navbar></Navbar>
      <div className="w-full h-full max-w-[1400px] flex gap-4">
        <VideoFeed />
        <ChatPanel />
      </div>
    </motion.div>
  );
}

export default Camerascreen;