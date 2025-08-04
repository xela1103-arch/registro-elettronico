
import React, { useEffect, useState } from 'react';
import { HashRouter, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './AppContext';
import AuthRoutes from './AuthRoutes';
import TeacherRoutes from './TeacherRoutes';
import StudentRoutes from './StudentRoutes';
import Modal from './Modal';
import InstallBanner from './InstallBanner';
import { ICONS } from './constants';
import OrientationLock from './OrientationLock';
import SplashScreen from './SplashScreen';

const App: React.FC = () => {
    const navigate = useNavigate();
    const {
        isAuthLoading,
        isStudentLoggedIn,
        isTeacherLoggedIn,
        isDevModalOpen,
        setIsDevModalOpen,
        installPrompt,
        showInstallBanner,
        handleAppInstall,
        handleDismissInstallBanner,
        handleAppTap,
        showSplashScreen,
        setShowSplashScreen
    } = useAppContext();

    const handleSplashCompleteAndNavigate = () => {
        localStorage.setItem('splashScreenShown', 'true');
        navigate('/register');
        setShowSplashScreen(false);
    };

    if (showSplashScreen) {
        return <SplashScreen onComplete={handleSplashCompleteAndNavigate} />;
    }

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }
    
    return (
        <div className="w-full bg-slate-900 min-h-screen flex flex-col" onClick={handleAppTap}>
            <OrientationLock />
            {isStudentLoggedIn ? <StudentRoutes /> : isTeacherLoggedIn ? <TeacherRoutes /> : <AuthRoutes />}
            
            <Modal isOpen={isDevModalOpen} onClose={() => setIsDevModalOpen(false)} title="Modalità Sviluppatore Sbloccata! 🚀">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 text-cyan-400 animate-pulse-slow">
                        {React.cloneElement(ICONS.lab_beaker, {width: 96, height: 96})}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Congratulazioni, Mago del Tap!</h3>
                    <p className="text-slate-300">
                        Hai sbloccato le Opzioni Sviluppatore. Ora hai accesso a strumenti e funzionalità sperimentali.
                    </p>
                    <p className="text-slate-300 mt-2">
                        Usali con saggezza (e non rompere nulla!). Troverai il nuovo menu nella pagina del <strong>Profilo</strong>.
                    </p>
                    <button
                        onClick={() => setIsDevModalOpen(false)}
                        className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20"
                    >
                        Ho capito!
                    </button>
                </div>
            </Modal>

            {showInstallBanner && installPrompt && (
                <InstallBanner 
                    onInstall={handleAppInstall}
                    onDismiss={handleDismissInstallBanner}
                />
            )}

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .animate-pulse-slow { animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
}

const AppWrapper: React.FC = () => (
    <HashRouter>
        <AppProvider>
            <App />
        </AppProvider>
    </HashRouter>
);

export default AppWrapper;