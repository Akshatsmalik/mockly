import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ className }) {
  const navigate = useNavigate();

  return (
    <div className={`w-full px-[100px] mx-auto ${className}`}>
      <header className="flex justify-between items-center px-4 py-5 bg-gray-50">
        
        {/* Logo Section */}
        <div className="flex items-center gap-[10px] cursor-pointer" onClick={() => navigate('/')}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="30" r="12" fill="#222"/>
            <circle cx="80" cy="30" r="12" fill="#222"/>
            <rect x="20" y="30" width="60" height="50" rx="25" fill="#222"/>
            <circle cx="35" cy="50" r="8" fill="white"/>
            <circle cx="65" cy="50" r="8" fill="white"/>
            <circle cx="35" cy="50" r="3" fill="#222"/>
            <circle cx="65" cy="50" r="3" fill="#222"/>
            <path d="M 45 65 Q 50 75 55 65" stroke="white" strokeWidth="3" fill="none"/>
          </svg>
          <span className="text-[24px] font-[800] tracking-[-0.5px] text-black">
            MOCKLY
          </span>
          </div>

          {/* Navigation Pill (Center) */}
          <nav className="flex items-center gap-[40px] md:gap-[100px] bg-[#3b3b3b] px-[50px] md:px-[60px] py-[15px] rounded-[40px]">
            {/* Home Icon */}
            <div 
              className="transition-transform duration-300 hover:scale-150 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <svg width="25" height="25" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            
            {/* Message Icon */}
            <div className="transition-transform duration-300 hover:scale-150 cursor-pointer" onClick={()=>navigate('/interview')}>
              <svg width="25" height="25" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>

            {/* Clock Icon */}
            <div className="transition-transform duration-300 hover:scale-150 cursor-pointer" onClick={()=>navigate('/results')}>
              <svg width="25" height="25" viewBox="0 0 24 24" fill="white">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
        </nav>

        {/* Back Button Section */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#4a90e2] hover:bg-blue-600 text-white font-medium py-[10px] px-[32px] rounded-[10px] transition-all duration-200 shadow-sm"
          >
            Back
          </button>
        </div>

      </header>
    </div>
  );
}

export default Navbar;