import { useState, useRef, useEffect } from 'react';
import { Mic, X, Send } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface VoiceRecorderProps {
    onSend: (audioBlob: Blob, duration: number, waveform: number[]) => void;
    onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [waveform, setWaveform] = useState<number[]>([]);
    const [cancelProgress, setCancelProgress] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const waveformDataRef = useRef<number[]>([]);

    const MAX_DURATION = 300; // 5 minutes in seconds

    useEffect(() => {
        startRecording();
        return () => {
            stopRecording(false);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup MediaRecorder
            const options = { mimeType: 'audio/webm;codecs=opus' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            // Setup Audio Analyser for waveform
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            let seconds = 0;
            timerRef.current = setInterval(() => {
                seconds++;
                setDuration(seconds);
                if (seconds >= MAX_DURATION) {
                    stopRecording(true);
                }
            }, 1000);

            // Start waveform visualization
            visualizeWaveform();
        } catch (error) {
            console.error('Failed to start recording:', error);
            onCancel();
        }
    };

    const visualizeWaveform = () => {
        if (!analyserRef.current) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            analyser.getByteFrequencyData(dataArray);

            // Calculate average amplitude
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            const normalized = average / 255; // Normalize to 0-1

            // Store for later (sample every 100ms)
            if (waveformDataRef.current.length < duration * 10) {
                waveformDataRef.current.push(normalized);
            }

            // Update display waveform (last 30 bars)
            setWaveform(prev => [...prev.slice(-29), normalized]);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    const stopRecording = (send: boolean) => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (send) {
                // Wait a bit for all data to be collected
                setTimeout(() => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    onSend(audioBlob, duration, waveformDataRef.current);
                }, 100);
            } else {
                onCancel();
            }
        }
    };

    const handlePanEnd = (event: any, info: PanInfo) => {
        if (info.offset.x < -100) {
            // Swiped left more than 100px - cancel
            stopRecording(false);
        } else {
            setCancelProgress(0);
        }
    };

    const handlePan = (event: any, info: PanInfo) => {
        if (info.offset.x < 0) {
            const progress = Math.min(Math.abs(info.offset.x) / 100, 1);
            setCancelProgress(progress);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                drag="x"
                dragConstraints={{ left: -150, right: 0 }}
                dragElastic={0.2}
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                className="fixed bottom-20 left-4 right-4 bg-surface/95 backdrop-blur-xl border border-glass-border rounded-2xl p-4 shadow-2xl z-[10000]"
            >
                <div className="flex items-center gap-3">
                    {/* Mic Icon with Pulse */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-red-500 p-3 rounded-full">
                            <Mic size={20} className="text-white" />
                        </div>
                    </div>

                    {/* Waveform Display */}
                    <div className="flex-1 flex items-center gap-0.5 h-12">
                        {waveform.map((amplitude, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-blue-500 rounded-full transition-all duration-100"
                                style={{
                                    height: `${Math.max(amplitude * 100, 4)}%`,
                                    opacity: 0.3 + amplitude * 0.7
                                }}
                            />
                        ))}
                    </div>

                    {/* Duration */}
                    <div className="text-sm font-mono font-bold text-red-500">
                        {formatTime(duration)}
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={() => stopRecording(true)}
                        className="bg-blue-600 hover:bg-blue-500 p-3 rounded-full transition-colors"
                    >
                        <Send size={18} className="text-white" />
                    </button>
                </div>

                {/* Slide to Cancel Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: cancelProgress > 0.1 ? 1 : 0.5 }}
                    className="flex items-center justify-center gap-2 mt-2 text-xs text-muted"
                >
                    <motion.div
                        animate={{ x: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        ←
                    </motion.div>
                    <span>Slide to cancel</span>
                    {cancelProgress > 0 && (
                        <div className="ml-2 w-20 h-1 bg-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 transition-all"
                                style={{ width: `${cancelProgress * 100}%` }}
                            />
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
