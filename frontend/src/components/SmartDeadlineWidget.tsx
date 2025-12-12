import { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { Clock, AlertTriangle, CheckCircle, Calendar, Flame, PartyPopper } from 'lucide-react';

interface SmartDeadlineWidgetProps {
    deadline: string | Date | null | undefined;
    status: string;
}

export const SmartDeadlineWidget = ({ deadline: deadlineProp, status }: SmartDeadlineWidgetProps) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        totalSeconds: number;
    } | null>(null);

    useEffect(() => {
        if (!deadlineProp) return;

        const calculateTime = () => {
            const deadline = new Date(deadlineProp).getTime();
            const now = new Date().getTime();
            const difference = deadline - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                totalSeconds: difference / 1000,
            });
        };

        calculateTime();
        const timer = window.setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [deadlineProp]);

    if (!deadlineProp) {
        return (
            <GlassCard className="p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar size={80} />
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-gray-400" />
                    Deadline
                </h3>
                <p className="text-gray-500 text-sm">No deadline set for this mission.</p>
                <div className="mt-4 text-xs text-gray-600">Take your time! 🐢</div>
            </GlassCard>
        );
    }

    if (status === 'COMPLETED') {
        return (
            <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <PartyPopper size={80} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-2">
                    <CheckCircle size={20} />
                    Mission Complete!
                </h3>
                <p className="text-white/80 text-sm">Great job! The project is finished.</p>
            </GlassCard>
        );
    }

    if (!timeLeft) return null; // Loading or invalid

    // Determine State
    const isOverdue = timeLeft.totalSeconds <= 0;
    const isUrgent = timeLeft.totalSeconds < 24 * 60 * 60; // Less than 24h
    const isWarning = timeLeft.totalSeconds < 3 * 24 * 60 * 60; // Less than 3 days

    let stateConfig = {
        color: 'text-blue-400',
        bgColor: 'from-blue-500/10 to-cyan-500/10',
        borderColor: 'border-blue-500/20',
        icon: <Clock size={20} />,
        message: "Smooth sailing! ⛵",
        subMessage: "Plenty of time to polish everything.",
        title: "Time Remaining"
    };

    if (isOverdue) {
        stateConfig = {
            color: 'text-red-500',
            bgColor: 'from-red-500/10 to-pink-500/10',
            borderColor: 'border-red-500/20',
            icon: <AlertTriangle size={20} />,
            message: "Deadline Missed! 🚨",
            subMessage: "Time to hustle or request an extension!",
            title: "Overdue"
        };
    } else if (isUrgent) {
        stateConfig = {
            color: 'text-orange-500',
            bgColor: 'from-orange-500/10 to-red-500/10',
            borderColor: 'border-orange-500/20',
            icon: <Flame size={20} />,
            message: "Crunch Time! 🔥",
            subMessage: "Less than 24 hours! Focus mode ON.",
            title: "Urgent Deadline"
        };
    } else if (isWarning) {
        stateConfig = {
            color: 'text-yellow-400',
            bgColor: 'from-yellow-500/10 to-orange-500/10',
            borderColor: 'border-yellow-500/20',
            icon: <Clock size={20} />,
            message: "Approaching Fast! 🏃",
            subMessage: "Keep the momentum going.",
            title: "Time Remaining"
        };
    }

    return (
        <GlassCard className={`p-6 bg-gradient-to-br ${stateConfig.bgColor} border ${stateConfig.borderColor} relative overflow-hidden transition-all duration-500 hover:scale-[1.02]`}>
            {/* Background Decor */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-current opacity-5 rounded-full blur-3xl ${stateConfig.color}`} />

            <h3 className={`text-lg font-bold ${stateConfig.color} flex items-center gap-2 mb-4 relative z-10`}>
                {stateConfig.icon}
                {stateConfig.title}
            </h3>

            {!isOverdue ? (
                <div className="grid grid-cols-4 gap-2 text-center mb-4 relative z-10">
                    <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                        <div className={`text-xl font-bold font-outfit ${stateConfig.color}`}>{timeLeft.days}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Days</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                        <div className={`text-xl font-bold font-outfit ${stateConfig.color}`}>{timeLeft.hours}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Hrs</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
                        <div className={`text-xl font-bold font-outfit ${stateConfig.color}`}>{timeLeft.minutes}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Mins</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm animate-pulse">
                        <div className={`text-xl font-bold font-outfit ${stateConfig.color}`}>{timeLeft.seconds}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Secs</div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-center mb-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-red-500 font-outfit">OVERDUE</div>
                    <div className="text-xs text-red-400">
                        by {Math.abs(timeLeft.days)} days
                    </div>
                </div>
            )}

            <div className="relative z-10">
                <div className={`font-medium ${stateConfig.color} mb-1`}>{stateConfig.message}</div>
                <div className="text-xs text-gray-400">{stateConfig.subMessage}</div>
            </div>

            {/* Progress Bar (Visual Flair) */}
            {!isOverdue && (
                <div className="mt-4 w-full bg-black/20 h-1 rounded-full overflow-hidden">
                    {/* Just a visual pulsing line */}
                    <div className={`h-full w-full ${stateConfig.color.replace('text-', 'bg-')} origin-left animate-[loading_2s_ease-in-out_infinite]`} style={{ width: '30%' }}></div>
                </div>
            )}
        </GlassCard>
    );
};
