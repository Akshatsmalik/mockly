import { useRef, useState, useCallback } from 'react';

/**
 * useDeepgramSTT
 *
 * Uses Deepgram's WebSocket API directly (no SDK) for cross-browser,
 * real-time speech-to-text. Works on Chrome, Firefox, Safari, and Edge.
 *
 * Returns:
 *   transcript        - live rolling transcript text
 *   isListening       - true while mic is active
 *   startListening()  - begin capturing + streaming to Deepgram
 *   stopListening()   - stop mic + close WebSocket
 *   resetTranscript() - clear transcript text
 *   error             - user-facing error string, or ''
 *   isSupported       - false if getUserMedia is unavailable
 */
export function useDeepgramSTT({ language = 'en-IN', onFinalTranscript } = {}) {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');

    const wsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const accumulatedRef = useRef('');

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

        // Stop mic stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
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

            // 2. Build Deepgram WebSocket URL
            // Token passed as query param — the supported browser auth method
            const params = new URLSearchParams({
                token: apiKey,
                language,
                model: 'nova-2',
                smart_format: 'true',
                interim_results: 'true',
                punctuate: 'true',
                endpointing: '300',
            });
            const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[Deepgram] WebSocket connected');
                setIsListening(true);

                // 3. Pipe mic audio to Deepgram via MediaRecorder
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.addEventListener('dataavailable', (event) => {
                    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                        ws.send(event.data);
                    }
                });

                mediaRecorder.start(250); // send a chunk every 250ms
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const words = data?.channel?.alternatives?.[0]?.transcript ?? '';
                    const isFinal = data?.is_final;

                    if (isFinal && words.trim()) {
                        accumulatedRef.current = (accumulatedRef.current + ' ' + words).trim();
                        setTranscript(accumulatedRef.current);
                        if (onFinalTranscript) {
                            onFinalTranscript(accumulatedRef.current);
                        }
                    } else if (!isFinal && words.trim()) {
                        // Show live interim results
                        setTranscript((accumulatedRef.current + ' ' + words).trim());
                    }
                } catch (e) {
                    console.warn('[Deepgram] Failed to parse message', e);
                }
            };

            ws.onerror = (e) => {
                console.error('[Deepgram] WebSocket error:', e);
                setError('Speech recognition error. Please try again.');
                stopListening();
            };

            ws.onclose = (e) => {
                console.log('[Deepgram] WebSocket closed', e.code, e.reason);
                setIsListening(false);
            };

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
