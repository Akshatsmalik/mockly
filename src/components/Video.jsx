import React, { useRef, useState } from 'react';

const VideoFeed = () => {
  const mainVideoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const startMedia = () => {
    setShowPermissionModal(true);
  };

  const handleUserConfirm = async () => {
    setShowPermissionModal(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (mainVideoRef.current) mainVideoRef.current.srcObject = mediaStream;
      if (pipVideoRef.current) pipVideoRef.current.srcObject = mediaStream;

      setStream(mediaStream);
    } catch (err) {
      console.error("The browser said no:", err.name, err.message);
      setError(`Error: ${err.name}`);
    }
  };

  const handleUserDeny = () => {
    setShowPermissionModal(false);
  };

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (mainVideoRef.current) mainVideoRef.current.srcObject = null;
      if (pipVideoRef.current) pipVideoRef.current.srcObject = null;
    }
  };



  const [cameraOn, setCameraOn] = useState(true);
const [micOn, setMicOn] = useState(true);

const toggleCamera = () => {
  if (stream) {
    stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setCameraOn(prev => !prev);
  }
};

const toggleMic = () => {
  if (stream) {
    stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setMicOn(prev => !prev);
  }
};



  return (
       <div className="relative max-w-screen mt-4 flex-grow bg-white rounded-3xl overflow-hidden shadow-xl">
      {/* Placeholder when no stream */}
 {/* Bottom Control Bar */}

 {!stream && (
  <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
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
)}
       {stream && (
  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
    <div className="bg-gray-400/50 backdrop-blur-md rounded-full px-8 py-3 flex items-center gap-6 border border-white/20">
      
      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${cameraOn ? 'bg-black hover:bg-gray-800' : 'bg-red-500 hover:bg-red-600'}`}
        >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            {cameraOn
                ? <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                : <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
            }
            </svg>
        </button>

        {/* Drop Call */}
        <button
            onClick={stopMedia}
            className="w-14 h-10 bg-[#D35353] rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
        >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
        </button>

        {/* Mic Toggle */}
        <button
            onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${micOn ? 'bg-black hover:bg-gray-800' : 'bg-red-500 hover:bg-red-600'}`}
        >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            {micOn
                ? <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                : <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V20c0 .55.45 1 1 1s1-.45 1-1v-2.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
            }
            </svg>
        </button>

        </div>
    </div>
    )}

      {/* Main Camera Feed */}
      <video
        ref={mainVideoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${!stream ? 'hidden' : ''}`}
      />

      {/* Bottom Control Bar */}
      {stream && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-400/50 backdrop-blur-md rounded-full py-3 flex px-[100px] items-center gap-6 border border-white/20 z-10">
   
          <button
            onClick={stopMedia}
            className="w-14 h-10 bg-[#D35353] rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
         
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
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
      )}
    </div>
  );
};

export default VideoFeed;