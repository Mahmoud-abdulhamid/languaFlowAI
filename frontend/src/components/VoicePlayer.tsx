import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoicePlayerProps {
    audioUrl: string;
    duration: number;
    waveform?: number[];
    isMe: boolean;
}

export const VoicePlayer = ({ audioUrl, duration, waveform = [], isMe }: VoicePlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playbackRates = [1, 1.5, 2];

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const cyclePlaybackSpeed = () => {
        const currentIndex = playbackRates.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % playbackRates.length;
        const nextRate = playbackRates[nextIndex];
        setPlaybackRate(nextRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;

        const bounds = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - bounds.left;
        const percentage = clickX / bounds.width;
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Generate default waveform if not provided
    const displayWaveform = waveform.length > 0
        ? waveform
        : Array.from({ length: 40 }, () => Math.random() * 0.7 + 0.3);

    return (
        <div className={`flex items-center gap-2 min-w-[200px] max-w-[300px] ${isMe ? 'flex-row' : 'flex-row'}`}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isMe
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Waveform + Progress */}
            <div className="flex-1 flex flex-col gap-1">
                <div
                    className="flex items-center gap-0.5 h-6 cursor-pointer relative"
                    onClick={handleSeek}
                >
                    {displayWaveform.slice(0, 40).map((amplitude, i) => {
                        const barProgress = (i / 40) * 100;
                        const isPassed = barProgress <= progress;

                        return (
                            <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-75 ${isMe
                                        ? isPassed ? 'bg-white' : 'bg-white/30'
                                        : isPassed ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                style={{
                                    height: `${Math.max(amplitude * 100, 15)}%`,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Time Display */}
                <div className={`flex justify-between items-center text-[10px] ${isMe ? 'text-white/70' : 'text-muted'}`}>
                    <span>{formatTime(currentTime)}</span>
                    <button
                        onClick={cyclePlaybackSpeed}
                        className={`px-1.5 py-0.5 rounded transition-colors ${isMe
                                ? 'hover:bg-white/10 text-white/90'
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                    >
                        {playbackRate}x
                    </button>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};
