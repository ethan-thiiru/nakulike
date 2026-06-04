'use client'
import { useCallback, useRef, useState } from "react"

export interface AudioRecording {
    blob: Blob
    url: string
    duration: number
}

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioLevel, setAudioLevel] = useState(0)

    // MediaRecorder instance (handle Recording)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const interValRef = useRef<NodeJS.Timeout | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0);
    
    // Flag to track if the recording was canceled vs stopped normally
    const isCanceledRef = useRef<boolean>(false);

    const startRecording = useCallback(async (): Promise<void> => {
        try {
            isCanceledRef.current = false; // Reset cancel flag

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                }
            })

            streamRef.current = stream;

            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateAudioLevel = () => {
                if(analyserRef.current && isRecording){
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    setAudioLevel(average / 255);
                    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
                }
            }

            mediaRecorderRef.current = new MediaRecorder(stream, {
                // FIX: 'codecs' spelled correctly
                mimeType: 'audio/webm;codecs=opus', 
            })

            const chunks : Blob[] = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if(event.data.size > 0){
                    chunks.push(event.data);
                }
            }

            // FIX: Changed comma to dot
            mediaRecorderRef.current.onstop = () => { 
                // Stop microphone track
                if(streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                }

                // FIX: Removed invalid space in !==
                if(audioContextRef.current && audioContextRef.current.state !== 'closed'){
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }

                if(animationFrameRef.current){
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }

                // Only process and send the audio if it WAS NOT canceled
                if (!isCanceledRef.current) {
                    const blob = new Blob(chunks, {type: 'audio/webm;codecs=opus'})
                    const url = URL.createObjectURL(blob);
                    const duration = (Date.now() - startTimeRef.current) / 1000;

                    if(window.audioRecordingCallback){
                        window.audioRecordingCallback({blob, url, duration})
                    }
                }
            }

            startTimeRef.current = Date.now();
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            interValRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)

            updateAudioLevel();
            
        } catch (error) {
            console.error('Error starting recording', error)
            throw error;
        }
    }, [isRecording])

    const stopRecording = useCallback((): void => {
        if(mediaRecorderRef.current && isRecording){
            mediaRecorderRef.current.stop(); // This triggers onstop above
            setIsRecording(false);
            setAudioLevel(0);

            if(interValRef.current){
                clearInterval(interValRef.current);
            }
            if(animationFrameRef.current){
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isRecording])

    const cancelRecording = useCallback(() : void => {
        if(mediaRecorderRef.current && isRecording){
            // Set flag so onstop knows to discard the data
            isCanceledRef.current = true; 
            
            mediaRecorderRef.current.stop(); 
            setIsRecording(false);
            setAudioLevel(0);
            setRecordingTime(0);

            if(interValRef.current){
                clearInterval(interValRef.current);
                interValRef.current = null;
            }
            if(animationFrameRef.current){
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null;
            }
        }
    }, [isRecording])

    return {
        isRecording,
        recordingTime,
        audioLevel,
        startRecording,
        stopRecording,   // FIX: Added to return object
        cancelRecording  // FIX: Added to return object
    }
}

declare global{
    interface Window {
        audioRecordingCallback ?: (recording: AudioRecording) => void;
    }
}