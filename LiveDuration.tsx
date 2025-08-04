import React, { useMemo, useState, useEffect } from 'react';

// Formatta la durata in modo adattivo per non superare mai la larghezza del cerchio
const formatDurationForRing = (milliseconds: number): string => {
    if (milliseconds < 0) return '0s';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Sopra le 10 ore, mostra solo le ore
    if (hours >= 10) {
        return `${hours}h`;
    }
    // Da 1 a 9 ore, mostra ore e minuti
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    // Sotto 1 ora, mostra minuti e secondi
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    // Sotto 1 minuto, mostra solo i secondi
    return `${seconds}s`;
};

const LiveDuration: React.FC<{ durationMs: number }> = ({ durationMs }) => {
    const totalSeconds = useMemo(() => Math.floor(durationMs / 1000), [durationMs]);
    const hours = useMemo(() => Math.floor(totalSeconds / 3600), [totalSeconds]);
    const minutes = useMemo(() => Math.floor((totalSeconds % 3600) / 60), [totalSeconds]);
    
    // L'anello di progresso rappresenta i secondi (se sotto 1h) o i minuti (se sopra 1h)
    const progress = useMemo(() => {
        if (hours > 0) {
            return (minutes % 60) / 60; // Progresso dei minuti nell'ora
        }
        return (totalSeconds % 60) / 60; // Progresso dei secondi nel minuto
    }, [totalSeconds, hours, minutes]);

    const [pulsate, setPulsate] = useState(false);
    
    useEffect(() => {
        // Attiva l'animazione pulsante allo scoccare del minuto (o dell'ora se la durata è > 1h)
        const shouldPulsate = hours > 0
            ? (minutes > 0 && minutes % 60 === 0)
            : (totalSeconds > 0 && totalSeconds % 60 === 0);

        if (shouldPulsate) {
            setPulsate(true);
            const timer = setTimeout(() => setPulsate(false), 400); // Durata dell'animazione
            return () => clearTimeout(timer);
        }
    }, [totalSeconds, hours, minutes]);

    // Parametri SVG per l'anello di progresso
    const size = 48;
    const strokeWidth = 3;
    const radius = (size / 2) - (strokeWidth / 2);
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        // Utilizziamo un grid layout per centrare perfettamente l'SVG e il testo
        <div className={`relative grid place-items-center w-12 h-12 ${pulsate ? 'animate-pulse-ring' : ''}`}>
            <svg 
                width={size} 
                height={size} 
                viewBox={`0 0 ${size} ${size}`} 
                className="transform -rotate-90 col-start-1 row-start-1"
                aria-hidden="true"
            >
                {/* Sfondo dell'anello */}
                <circle
                    stroke="#334155" // slate-700
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size/2}
                    cy={size/2}
                />
                {/* Anello di progresso */}
                <circle
                    stroke="#22d3ee" // cyan-400
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    className="transition-stroke-offset"
                    strokeLinecap="round"
                    r={radius}
                    cx={size/2}
                    cy={size/2}
                />
            </svg>
            {/* Testo della durata, centrato sopra l'anello */}
            <span className="col-start-1 row-start-1 text-xs font-semibold text-slate-200 z-10 tabular-nums">
                {formatDurationForRing(durationMs)}
            </span>
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                }
                .transition-stroke-offset {
                    /* Transizione lineare per un movimento fluido dei secondi */
                    transition: stroke-dashoffset 0.35s linear;
                }
            `}</style>
        </div>
    );
};

export default LiveDuration;