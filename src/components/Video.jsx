import React, { useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ChatPanel from './Chatpanel';


const VideoFeed = () => {
    const [micon,setmicon] = useState(false)
    const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [text,settext]=useState('micisoff')

    const startListening = () => {
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-IN",
      });

      setTimeout(()=>{
        SpeechRecognition.stopListening();
        setmicon(false);
      },3000);
    };

    const micoff = ()=>{
      if(!micon){
        console.log("mic is on")
        settext('micgoton')
        setmicon(true)
        startListening()
      }
      else{
        console.log("mic is off")
        setmicon(false)
        SpeechRecognition.stopListening()
        settext('micgotoffagain')
      }
    }

    useEffect(()=>{
      console.log(transcript)
    },[transcript])





//   useEffect(()=>{
//   navigator.mediaDevices.getUserMedia({audio:true})
//   .then(()=>{
//     setmi(true);
//     console.log('permisiongranted')
//   }).catch(()=>{
//     setMic(false);
//     console.log("micnotgrantedd")
//   })
// },[])  
  
  
  



  return (
<div className="relative w-full h-full flex-grow bg-white rounded-3xl overflow-hidden shadow-xl">

      {/* Placeholder when no stream */}
      {/* {!stream && (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <span className="text-6xl mb-4">📷</span>
          <p className="text-gray-500 mb-6">Camera is off</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition-colors font-medium"
            onClick={startMedia}
          >
            Start Camera
          </button>
          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        </div>
      )} */}

      {/* Main Camera Feed */}
      {/* <video
        ref={mainVideoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${!stream ? 'hidden' : ''}`}
      /> */}

      {/* Bottom Control Bar */}
      (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
          <div className="bg-gray-400/50 backdrop-blur-md rounded-full px-8 py-3 flex items-center gap-6 border border-white/20">

            {/* Camera Toggle */}
            {/* <button
              onClick={toggleCamera}
              title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                cameraOn ? 'bg-black hover:bg-gray-800' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                {cameraOn
                  ? <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  : <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
                }
              </svg>
            </button> */}

            {/* Hang Up */}
            <button
              title="End call"
              className="w-14 h-10 bg-[#D35353] rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>

            {/* Mic Toggle */}
          <button onClick={micoff}>  {micon ? "Stop Mic 🔴" : "Start Mic 🎤"}

          </button>

          </div>
        </div>
      )

      {/* Permission Modal */}
      {/* {showPermissionModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "32px",
            maxWidth: "400px", width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷🎙️</div>
            <h2 style={{ marginBottom: "8px" }}>Camera & Microphone Access</h2>
            <p style={{ color: "#666", marginBottom: "24px" }}>
              This app needs access to your camera and microphone to start the call.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={handleUserDeny} style={{
                padding: "10px 24px", borderRadius: "8px", border: "1px solid #ddd",
                background: "white", cursor: "pointer", fontSize: "16px"
              }}>
                Cancel
              </button>
              <button onClick={handleUserConfirm} style={{
                padding: "10px 24px", borderRadius: "8px", border: "none",
                background: "#4CAF50", color: "white", cursor: "pointer", fontSize: "16px"
              }}>
                Allow Access
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default VideoFeed;