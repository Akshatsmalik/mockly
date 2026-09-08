import { useRef, useState, useCallback } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

/**
 * useDeepgramSTT
 * 
 * A hook that replaces react-speech-recognition with Deepgram's real-time
 * WebSocket-based Speech-to-Text. Works cross-browser (Chrome, Firefox, Safari).
 *
 * Returns:
 *   transcript        - the live rolling transcript text
 *   isListening       - boolean, true while mic is active
 *   startListening()  - begin capturing + streaming to Deepgram
 *   stopListening()   - stop mic + close WebSocket
 *   resetTranscript() - clear transcript text
 *   error             - error string if something went wrong, else ''
 *   isSupported       - false if getUserMedia is unavailable
 */
export function useDeepgramSTT({ language = 'en-IN', onFinalTranscript } = {}) {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');

    const connectionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const accumulatedRef = useRef(''); // holds text across interim results

    const isSupported =
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia;

    const resetTranscript = useCallback(() => {
        setTranscript('');
        accumulatedRef.current = '';
    }, []);

    const stopListening = useCallback(() => {
        // Stop MediaRecorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;

        // Stop mic stream tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        // Close Deepgram WebSocket
        if (connectionRef.current) {
            try { connectionRef.current.finish(); } catch (_) {}
            connectionRef.current = null;
        }

        setIsListening(false);
    }, []);

    const startListening = useCallback(async () => {
        setError('');

        const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
        if (!apiKey) {
            setError('Deepgram API key is missing. Set VITE_DEEPGRAM_API_KEY in your .env file.');
            return;
        }

        if (!isSupported) {
            setError('Your browser does not support microphone access.');
            return;
        }

        try {
            // 1. Get mic stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 2. Open Deepgram live connection
            const deepgram = createClient(apiKey);
            const connection = deepgram.listen.live({
                language,
                model: 'nova-2',
                smart_format: true,
                interim_results: true,
                punctuate: true,
                endpointing: 300,
            });
            connectionRef.current = connection;

            // 3. Handle transcription events
            connection.on(LiveTranscriptionEvents.Open, () => {
                console.log('[Deepgram] Connection opened');
                setIsListening(true);

                // 4. Pipe mic audio to Deepgram via MediaRecorder
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.addEventListener('dataavailable', (event) => {
                    if (event.data.size > 0 && connection.getReadyState() === 1) {
                        connection.send(event.data);
                    }
                });

                mediaRecorder.start(250); // send chunks every 250ms
            });

            connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                const words = data?.channel?.alternatives?.[0]?.transcript ?? '';
                const isFinal = data?.is_final;

                if (isFinal && words.trim()) {
                    accumulatedRef.current = (accumulatedRef.current + ' ' + words).trim();
                    setTranscript(accumulatedRef.current);

                    // Call optional callback with the latest final segment
                    if (onFinalTranscript) {
                        onFinalTranscript(accumulatedRef.current);
                    }
                } else if (!isFinal) {
                    // Show interim (live) results appended to accumulated finals
                    setTranscript((accumulatedRef.current + ' ' + words).trim());
                }
            });

            connection.on(LiveTranscriptionEvents.Error, (err) => {
                console.error('[Deepgram] Error:', err);
                setError('Speech recognition error. Please try again.');
                stopListening();
            });

            connection.on(LiveTranscriptionEvents.Close, () => {
                console.log('[Deepgram] Connection closed');
                setIsListening(false);
            });

        } catch (err) {
            console.error('[Deepgram] Failed to start:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone permission denied. Please allow mic access in your browser.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone.');
            } else {
                setError(`Could not start microphone: ${err.message}`);
            }
            stopListening();
        }
    }, [language, isSupported, onFinalTranscript, stopListening]);

    return {
        transcript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported,
    };
}
