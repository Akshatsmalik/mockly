import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BotThinkingIndicator = () => (
  <div className="flex gap-1 items-center ml-2">
    {[0, 0.2, 0.4].map((delay, index) => (
      <motion.div
        key={index}
        className="w-1.5 h-1.5 bg-gray-500 rounded-full"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.8, delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);


function ChatPanel(text1){

  const [answers, setAnswers] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages, isBotThinking]);


  const questions = async (answers) => {
    const data = await fetch("http://localhost:8000/ask", {
      method: "POST",
      body: JSON.stringify({ answer: answers }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await data.text();
    return response;
  };


  useEffect(() => {
    const getFirstQuestion = async () => {
      setIsBotThinking(true);

      try{
      const firstQuestion = await questions(""); 
      
      setMessages([
        { text: firstQuestion, sender: 'bot' }
      ]);

    }catch(error){
      console.log(error);
      setMessages([{text:'sorry went wrong',sender:'bot'}])
    
    }finally{
      setIsBotThinking(false);
    }
    };

    getFirstQuestion();
  }, []);//when we havent passed anything react just executes useeffect once
  // for the first message this useeffect is used


  const sendMessage = async () => {
    if (inputValue.trim() === ''){ 
      return
    }

    const userMessage = inputValue;

    setMessages((prev) => [
      ...prev,
      { text: userMessage, sender: 'user' }
    ]);

    setInputValue('');
    setIsBotThinking(true);

    const question2 = await questions(userMessage);

    setMessages((prev) => [
      ...prev,
      { text: question2, sender: 'bot' }
    ]);

    setIsBotThinking(false);
};



  const messageTransition = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  };


  

  return (
   <div className="w-[380px] flex-shrink-0 bg-[#1A1D21] rounded-3xl p-6 flex flex-col shadow-2xl text-white overflow-hidden">
      {/* Profile Image */}
      <div className="w-14 h-14 flex rounded-full border-2 border-white overflow-hidden shadow-lg bg-gray-200 mb-6 flex-shrink-0">
        <img src="/path-to-your-avatar.png" alt="Profile" className="w-full h-full justify-center object-cover" />
      </div>

      {/* Messages Area */}
       <div className="flex-grow min-h-0 space-y-5 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageTransition}
              initial="initial"
              animate="animate"
              className={`flex gap-3 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white mt-1">
                  <img src="/path-to-bot-avatar.png" alt="Bot" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className={`${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#F2F2F2] text-black'} px-4 py-2 rounded-2xl max-w-[75%] shadow-sm`}>
                <p className="text-sm font-medium leading-relaxed">{message.text}</p>
              </div>

              {message.sender === 'user' && (
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white mt-1">
                  <img src="/path-to-user-avatar.png" alt="User" className="w-full h-full object-cover" />
                </div>
              )}
            </motion.div>
          ))}


          

          {/* Thinking Animation */}
          {isBotThinking && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white mt-1 bg-gray-300" />
              <div className="flex items-center h-9"><BotThinkingIndicator /></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>



      {/* Input Bar */}
      <div className="mt-6 flex-shrink-0">
        <div className="relative bg-white rounded-3xl flex items-center px-5 py-3 shadow-inner">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Write your answer"
            className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400 font-medium"
          />
          <button onClick={sendMessage} className="ml-3 hover:scale-110 transition-transform text-black">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;