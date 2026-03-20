import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Data } from '../Hooks/Context';
import Dataprovider from '../Hooks/Dataprovider';
import interviewerImg from '../assets/interviewer.png';
import userImg from '../assets/user.png';

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

const useTTS = () => {
  const synthRef = useRef(window.speechSynthesis);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const pickVoice = () => {
    const voices = synthRef.current.getVoices();
    const preferred = [
      'Google UK English Female',
      'Microsoft Hazel Desktop - English (Great Britain)',
      'Microsoft Zira Desktop - English (United States)',
      'Karen',      
      'Moira',       
      'Samantha',   
    ];
    for (const name of preferred) {
      const found = voices.find(v => v.name === name);
      if (found) return found;
    }
    return (
      voices.find(v => v.lang === 'en-GB') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const speakUtterance = (text) => {
    synthRef.current.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.15;
      utterance.rate = 0.92;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }, 100);
  };

  const speak = (text) => {
    if (!text || !synthRef.current) return;
    if (synthRef.current.getVoices().length > 0) {
      speakUtterance(text);
    } else {
      const onVoicesReady = () => {
        speakUtterance(text);
        synthRef.current.removeEventListener('voiceschanged', onVoicesReady);
      };
      synthRef.current.addEventListener('voiceschanged', onVoicesReady);
    }
  };

  const stop = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    const loadVoices = () => synthRef.current.getVoices();
    loadVoices();
    synthRef.current.addEventListener?.('voiceschanged', loadVoices);
    return () => synthRef.current.removeEventListener?.('voiceschanged', loadVoices);
  }, []);

  return { speak, stop, isSpeaking };
};


function ChatPanel() {
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { Data1, setData1, numq } = useContext(Data);
  const { questionc, setQuestionc } = useContext(Data);
  const { round } = useContext(Data);
  const { domain } = useContext(Data);
  const conversationRef = useRef([]);
  const { setConversation } = useContext(Data);
  const { speak, stop, isSpeaking } = useTTS();

  const questioncRef = useRef(questionc);
const numqRef = useRef(numq);

  useEffect(() => {
    questioncRef.current = questionc;
  }, [questionc]);

  useEffect(() => {
    numqRef.current = numq;
  }, [numq]);

  const questions = async (answers) => {
    console.log(questioncRef.current, numqRef.current) 
    if (questioncRef.current >= numqRef.current + 1) {
      return "Thank you for your interview, please proceed to your results";
    }

    const endpoint = round === 'HR' ? '/mainq' : '/maind';

    const data = await fetch(`https://mockly-le44.onrender.com${endpoint}`, {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: domain,
        d_level: "easy",
        user: answers
      }),
    });

    const response = await data.text();

    conversationRef.current = [
      ...conversationRef.current,
      { answer: answers, question: response }
    ];
    setConversation(conversationRef.current);
    setQuestionc(prev => prev + 1);
    return response;
  };

  useEffect(() => {
    console.log(questionc);
  }, [questionc]);

  useEffect(() => {
    const getFirstQuestion = async () => {
      setIsBotThinking(true);
      console.log(round);
      try {
        const firstQuestion = await questions("");
        setMessages([{ text: firstQuestion, sender: 'bot' }]);
        speak(firstQuestion);
      } catch (error) {
        console.log(error);
        setMessages([{ text: 'sorry went wrong', sender: 'bot' }]);
      } finally {
        setIsBotThinking(false);
      }
    };
    getFirstQuestion();
  }, []);

  const sendMessage = async () => {
    if (Data1.trim() === '') return;
    const userMessage = Data1;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setData1("");
    setIsBotThinking(true);
    const question2 = await questions(userMessage);
    setMessages(prev => [...prev, { text: question2, sender: 'bot' }]);
    // ── Speak every new bot question/response ──
    speak(question2);
    setIsBotThinking(false);
  };

  const messageTransition = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotThinking]);

  return (
    <Dataprovider>
      <div className="w-[380px] flex-shrink-0 bg-[#1A1D21] rounded-3xl p-6 flex flex-col shadow-2xl text-white overflow-hidden">
        <div className="w-14 h-14 flex rounded-full border-2 border-white overflow-hidden shadow-lg bg-gray-200 mb-6 flex-shrink-0">
          <img src={userImg} alt="Profile" className="w-full h-full justify-center object-cover" />
        </div>

        <button
          onClick={() => isSpeaking ? stop() : null}
          title={isSpeaking ? 'Click to stop speaking' : 'Bot will speak questions aloud'}
          className="absolute top-6 right-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {isSpeaking ? (
            <>
              <span className="flex gap-0.5 items-end h-4">
                {[0, 0.1, 0.2].map((d, i) => (
                  <motion.span
                    key={i}
                    className="w-0.5 bg-green-400 rounded-full"
                    animate={{ height: ['4px', '12px', '4px'] }}
                    transition={{ duration: 0.6, delay: d, repeat: Infinity }}
                    style={{ display: 'inline-block' }}
                  />
                ))}
              </span>
              <span className="text-green-400">Speaking…</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-50">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.061z" />
              </svg>
            </>
          )}
        </button>

        <div className="flex-grow min-h-0 space-y-5 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div key={index}
                variants={messageTransition}
                initial="initial"
                animate="animate"
                className={`flex gap-3 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white mt-1">
                    <img src={userImg} alt="Bot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#F2F2F2] text-black'} px-4 py-2 rounded-2xl max-w-[75%] shadow-sm`}>
                  <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white mt-1">
                    <img src={interviewerImg} alt="User" className="w-full h-full object-cover" />
                  </div>
                )}
              </motion.div>
            ))}

            {isBotThinking && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white mt-1 bg-gray-300" />
                <div className="flex items-center h-9"><BotThinkingIndicator /></div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-6 flex-shrink-0">
          <div className="relative bg-white rounded-3xl flex items-center px-5 py-3 shadow-inner">
            <input
              type="text"
              value={Data1}
              onChange={(e) => setData1(e.target.value)}
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
    </Dataprovider>
  );
}

export default ChatPanel;