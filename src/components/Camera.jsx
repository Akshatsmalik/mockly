import React, { useEffect, useRef, useState } from 'react';

const MediaStreamer = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const startMedia = () => {
    setShowPermissionModal(true);
  };

  const handleUserConfirm = async () => {
    setShowPermissionModal(false);

    try {
      console.log("Requesting permissions...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log("Stream obtained!", mediaStream);

      const permissionGranted = true;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);

      return { mediaStream, permissionGranted };

    } catch (err) {
      console.error("The browser said no:", err.name, err.message);
      const permissionGranted = false;
      setError(`Error: ${err.name}`);
      return { mediaStream: null, permissionGranted };
    }
  };

  const handleUserDeny = () => {
    setShowPermissionModal(false);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button className = 'bg-blue-500 p-4' onClick={startMedia}>Start Camera</button>

      {/* Custom Permission Popup */}
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

export default MediaStreamer;