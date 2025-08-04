import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from './constants';

interface SplashScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: React.cloneElement(ICONS.classes_custom, { width: 96, height: 96 }),
    title: "Benvenuto nel Tuo Registro",
    description: "Una guida rapida per scoprire tutte le funzionalità pensate per te. Premi play per iniziare il tour o naviga con le frecce.",
  },
  {
    icon: (
        <div className="flex space-x-4 items-center">
            {React.cloneElement(ICONS.classes_custom, { width: 64, height: 64 })}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7v14"/></svg>
            {React.cloneElement(ICONS.students_custom, { width: 64, height: 64 })}
        </div>
    ),
    title: "Classi e Studenti",
    description: "Crea le tue classi e aggiungi gli studenti. Ogni alunno avrà un profilo dettagliato con informazioni, contatti e un codice di accesso personale.",
  },
  {
    icon: (
        <div className="flex space-x-4 items-center">
            {React.cloneElement(ICONS.medal, { width: 64, height: 64 })}
            {React.cloneElement(ICONS.clipboard, { width: 64, height: 64 })}
        </div>
    ),
    title: "Valutazioni e Compiti",
    description: "Registra i voti per compiti ed esami. Tieni traccia della media di ogni studente per monitorare l'andamento scolastico in tempo reale.",
  },
  {
    icon: (
        <div className="flex space-x-4 items-center">
            {React.cloneElement(ICONS.communications_custom, { width: 64, height: 64 })}
            {React.cloneElement(ICONS.bell_filled, { width: 64, height: 64 })}
        </div>
    ),
    title: "Comunicazioni Efficaci",
    description: "Usa la bacheca per pubblicare avvisi importanti per tutti o avvia conversazioni private con le singole classi.",
  },
  {
    icon: (
        <div className="flex space-x-4 items-center">
             {React.cloneElement(ICONS.profile_custom, { width: 64, height: 64 })}
             {React.cloneElement(ICONS.fingerprint, { width: 64, height: 64 })}
        </div>
    ),
    title: "Profilo e Sicurezza",
    description: "Personalizza il tuo profilo e abilita l'accesso biometrico per entrare nell'app in modo rapido e sicuro con la tua impronta.",
  },
  {
    icon: React.cloneElement(ICONS.activity, { width: 96, height: 96 }),
    title: "Report Accessi Studenti",
    description: "Visualizza un registro dettagliato di quando e per quanto tempo i tuoi studenti accedono alla piattaforma. Supervisione completa a tua disposizione.",
  },
   {
    icon: React.cloneElement(ICONS.download, { width: 96, height: 96 }),
    title: "Accesso Offline",
    description: "Installa l'app sul tuo dispositivo per un accesso istantaneo e la possibilità di lavorare anche senza connessione a internet.",
  },
  {
    icon: React.cloneElement(ICONS.rocket, { width: 96, height: 96 }),
    title: "Tutto Pronto per Iniziare!",
    description: "Ora che conosci gli strumenti, sei pronto a trasformare il tuo modo di insegnare. Inizia subito!",
  },
];

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationState, setAnimationState] = useState<'in' | 'out'>('in');
  const [isExiting, setIsExiting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const SLIDE_DURATION = 5000;
  const [remainingTime, setRemainingTime] = useState(SLIDE_DURATION);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNext = () => {
    if (activeIndex >= SLIDES.length - 1) return;
    setAnimationState('out');
    setTimeout(() => {
      setActiveIndex(prev => prev + 1);
      setAnimationState('in');
    }, 600);
  };
  
  const handlePrev = () => {
    if (activeIndex <= 0) return;
    setAnimationState('out');
    setTimeout(() => {
      setActiveIndex(prev => prev - 1);
      setAnimationState('in');
    }, 600);
  };

  const goToSlide = (index: number) => {
    if (index === activeIndex) return;
    setAnimationState('out');
    setTimeout(() => {
        setActiveIndex(index);
        setAnimationState('in');
    }, 600);
  };

  const handlePlayPause = () => {
     setIsPlaying(prevIsPlaying => {
      if (prevIsPlaying) { // PAUSING
        clearTimer();
        const elapsed = Date.now() - startTimeRef.current;
        setRemainingTime(prevTime => Math.max(0, prevTime - elapsed));
      } else { // RESUMING
        startTimeRef.current = Date.now();
      }
      return !prevIsPlaying;
    });
  };

  const handleExit = () => {
    clearTimer();
    setIsExiting(true);
    setTimeout(onComplete, 1200); // Animation duration
  };

  // Effect to reset timer when slide changes
  useEffect(() => {
    setRemainingTime(SLIDE_DURATION);
    startTimeRef.current = Date.now();
  }, [activeIndex]);
  
  // Effect to manage the slide advancement timer
  useEffect(() => {
    clearTimer();
    if (isPlaying && activeIndex < SLIDES.length - 1) {
      timerRef.current = window.setTimeout(handleNext, remainingTime);
    }
    return () => clearTimer();
  }, [activeIndex, isPlaying, remainingTime]);
  
  const currentSlide = SLIDES[activeIndex];

  return (
    <div className={`fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'animate-splash-exit' : 'animate-splash-enter'}`}>
      {/* Background Effects */}
      <div 
        className="absolute inset-0 z-0 opacity-20 transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-${activeIndex * 5}%)` }}
      >
        <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-cyan-900/80 via-transparent to-transparent animate-spin-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-indigo-900/80 via-transparent to-transparent animate-spin-slow-reverse"></div>
      </div>
      
      {/* Skip Button */}
      {activeIndex < SLIDES.length - 1 && (
        <button onClick={handleExit} className="absolute top-6 right-6 z-20 text-slate-400 font-semibold px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
          Salta
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full px-4 text-center">
        {/* Slide Content */}
        <div className={`flex flex-col items-center justify-center ${animationState === 'in' ? 'animate-focus-in' : 'animate-focus-out'}`}>
           <div className="mb-8 text-cyan-400">
              {currentSlide.icon}
           </div>
           <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 max-w-lg">
              {currentSlide.title}
           </h1>
           <p className="text-lg md:text-xl text-slate-300 max-w-md">
              {currentSlide.description}
           </p>
        </div>

        {/* Call to Action Button (last slide) */}
        {activeIndex === SLIDES.length - 1 && (
          <div className="mt-12 animate-button-in">
            <button
              onClick={handleExit}
              className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold text-white transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-1"
            >
              <span className="absolute top-0 right-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-45 group-hover:translate-x-[250%] transition-transform duration-1000 ease-out"></span>
              <span className="relative z-10 flex items-center space-x-3 text-lg">
                <span>Inizia Ora</span>
                {React.cloneElement(ICONS.rocket, {width: 24, height: 24, className: "transition-transform duration-500 group-hover:rotate-45"})}
              </span>
            </button>
          </div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="relative z-10 w-full max-w-md p-4 mb-4">
        <div className="flex justify-center space-x-3 mb-4">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-cyan-400 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
              aria-label={`Vai alla slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="w-full max-w-sm mx-auto bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
            {activeIndex < SLIDES.length - 1 && (
                <div
                    key={activeIndex}
                    className={`bg-cyan-400 h-1.5 rounded-full animate-progress-fill ${!isPlaying ? 'paused' : ''}`}
                ></div>
            )}
            {activeIndex === SLIDES.length - 1 && (
                <div className="bg-cyan-400 h-1.5 rounded-full w-full"></div>
            )}
        </div>
        <div className="flex justify-between items-center w-full">
            <button onClick={handlePrev} disabled={activeIndex === 0} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-70'}`}>
              {React.cloneElement(ICONS.chevron_left, {width: 32, height: 32})}
            </button>
            <button onClick={handlePlayPause} className="p-3 rounded-full hover:bg-white/10 transition-all text-white">
                {isPlaying 
                    ? React.cloneElement(ICONS.pause, {width: 32, height: 32}) 
                    : React.cloneElement(ICONS.play, {width: 32, height: 32})
                }
            </button>
            <button onClick={handleNext} disabled={activeIndex === SLIDES.length - 1} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activeIndex === SLIDES.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-70'}`}>
              {React.cloneElement(ICONS.chevron_right, {width: 32, height: 32})}
            </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin 40s linear infinite; }
        .animate-spin-slow-reverse { animation: spin 50s linear infinite reverse; }

        @keyframes splash-enter-anim {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-splash-enter { animation: splash-enter-anim 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        
        @keyframes splash-exit-anim {
          from { opacity: 1; transform: scale(1); filter: blur(0px); }
          to { opacity: 0; transform: scale(1.1); filter: blur(10px); }
        }
        .animate-splash-exit { animation: splash-exit-anim 1.2s cubic-bezier(0.5, 0, 0.75, 0) forwards; }
        
        /* Focus Shift Animations */
        @keyframes focus-shift-in {
            from {
                opacity: 0;
                transform: scale(1.2) perspective(1000px) translateZ(50px);
                filter: blur(15px);
            }
            to {
                opacity: 1;
                transform: scale(1) perspective(1000px) translateZ(0);
                filter: blur(0px);
            }
        }
        .animate-focus-in {
            animation: focus-shift-in 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes focus-shift-out {
            from {
                opacity: 1;
                transform: scale(1) perspective(1000px) translateZ(0);
                filter: blur(0px);
            }
            to {
                opacity: 0;
                transform: scale(0.8) perspective(1000px) translateZ(-50px);
                filter: blur(15px);
            }
        }
        .animate-focus-out {
            animation: focus-shift-out 0.6s cubic-bezier(0.5, 0, 0.75, 0) forwards;
        }

        @keyframes button-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-button-in { animation: button-in 0.8s ease-out 0.5s backwards; }

        @keyframes progress-fill-anim {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-fill {
          animation: progress-fill-anim 5s linear forwards;
        }
        .animate-progress-fill.paused {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;