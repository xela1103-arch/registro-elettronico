import React, { useEffect, useState, useCallback } from 'react';
import { ICONS } from './constants';

interface InstallBannerProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, onDismiss }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        // Attende la fine dell'animazione prima di chiamare la funzione onDismiss del genitore
        setTimeout(() => {
            onDismiss();
        }, 500); // Deve corrispondere alla durata dell'animazione
    }, [onDismiss]);


    useEffect(() => {
        const timerId = setTimeout(handleClose, 5000); // 5 secondi

        return () => clearTimeout(timerId);
    }, [handleClose]);

    const CloseIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

    return (
        // Riduciamo la larghezza massima e l'offset
        <div className={`fixed top-3 right-3 z-50 w-full max-w-[280px] ${isClosing ? 'animate-toastOut' : 'animate-toastIn'}`}>
            <div className="relative bg-slate-800/80 backdrop-blur-lg border border-slate-700 shadow-xl shadow-cyan-900/20 rounded-xl p-2.5 overflow-hidden">
                
                {/* Riduciamo le dimensioni del timer di chiusura */}
                <div className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center">
                    <svg width="28" height="28" viewBox="0 0 28 28" className="col-start-1 row-start-1">
                        <circle className="countdown-circle-bg" r="12" cx="14" cy="14" />
                        <circle className="countdown-circle-progress" r="12" cx="14" cy="14" />
                    </svg>
                    <button
                        onClick={handleClose}
                        className="col-start-1 row-start-1 w-full h-full flex items-center justify-center text-slate-300 hover:text-white transition-colors rounded-full"
                        aria-label="Chiudi banner installazione"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex items-start space-x-2.5">
                    {/* Riduciamo le dimensioni dell'icona */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-2 rounded-md shadow-lg mt-0.5">
                        {React.cloneElement(ICONS.download, { width: 18, height: 18 })}
                    </div>
                    {/* Riduciamo il padding a destra per dare più spazio al testo */}
                    <div className="flex-grow pt-0 pr-7">
                        <h3 className="text-sm font-bold text-slate-100 leading-tight">Installa l'App</h3>
                        <p className="text-xs text-slate-300 mt-0.5">Accesso rapido e offline.</p>
                        {/* Riduciamo il padding e il margine del pulsante */}
                        <button 
                            onClick={onInstall}
                            className="mt-2 w-full text-xs font-bold text-center bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
                        >
                            Installa
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes toastIn {
                    from { 
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to { 
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-toastIn {
                    animation: toastIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                
                @keyframes toastOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
                .animate-toastOut {
                    animation: toastOut 0.5s cubic-bezier(0.5, 0, 0.75, 0) forwards;
                }

                .countdown-circle-bg {
                    fill: none;
                    stroke: #475569; /* slate-600 */
                    stroke-width: 2;
                }
                .countdown-circle-progress {
                    fill: none;
                    stroke: #22d3ee; /* cyan-400 */
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-dasharray: 75.4; /* 2 * PI * 12 */
                    stroke-dashoffset: 0;
                    transform: rotate(-90deg);
                    transform-origin: center;
                    animation: countdown 5s linear forwards;
                }
                @keyframes countdown {
                    from {
                        stroke-dashoffset: 0;
                    }
                    to {
                        stroke-dashoffset: 75.4;
                    }
                }
            `}</style>
        </div>
    );
};

export default InstallBanner;