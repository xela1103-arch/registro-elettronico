
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Modal from './Modal';
import { ICONS } from './constants';
import * as db from './db';
import type { User, ClassInfo, Student } from './constants';
import { useAppContext } from './AppContext';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full space-x-4 p-4 text-left cursor-pointer hover:bg-slate-700/50 transition-colors duration-200 rounded-lg">
        <div className="bg-slate-700 p-3 rounded-xl text-slate-300">
            {icon}
        </div>
        <p className="flex-grow font-semibold text-slate-100 text-base">{label}</p>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 flex-shrink-0"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
);

const InstallSettingRow: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full space-x-4 p-4 text-left cursor-pointer bg-cyan-900/40 hover:bg-cyan-900/60 transition-colors duration-200 rounded-lg">
        <div className="bg-cyan-500/30 p-3 rounded-xl text-cyan-300">
            {icon}
        </div>
        <div>
            <p className="flex-grow font-bold text-cyan-200 text-base">{label}</p>
            <p className="text-sm text-cyan-300/80">Aggiungi l'app alla schermata Home</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 flex-shrink-0 ml-auto"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
);


const SettingsPage: React.FC = () => {
    const { 
        currentUser, 
        classes, 
        students: allStudents, 
        handleLogout: onLogout, 
        handleDeleteAccount: onDeleteAccount, 
        isDevUser, 
        isDevMode: isDevModeEnabled,
        handleEnableDevMode
    } = useAppContext();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const CONFIRMATION_WORD = 'ELIMINA';
    
    // States for desktop developer mode unlock
    const [keySequence, setKeySequence] = useState('');
    const [isDevUnlockedModalOpen, setIsDevUnlockedModalOpen] = useState(false);
    const [highlightDevOptions, setHighlightDevOptions] = useState(false);
    const devOptionsRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const targetSequence = 'developer';
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore keypresses if a modal is open or if typing in an input
            if (isDeleteModalOpen || isDevUnlockedModalOpen || (e.target as HTMLElement).tagName === 'INPUT') return;

            const newSequence = (keySequence + e.key.toLowerCase()).slice(-targetSequence.length);
            setKeySequence(newSequence);

            if (newSequence === targetSequence && !isDevModeEnabled) {
                handleEnableDevMode();
                setIsDevUnlockedModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keySequence, isDevModeEnabled, handleEnableDevMode, isDeleteModalOpen, isDevUnlockedModalOpen]);


    const resetDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setConfirmationText('');
    };
    
    const handleAcknowledgeDevMode = () => {
        setIsDevUnlockedModalOpen(false);
        setTimeout(() => {
            devOptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightDevOptions(true);
            setTimeout(() => setHighlightDevOptions(false), 4000); // Highlight for 4 seconds
        }, 100);
    };

    const handleConfirmDelete = () => {
        if (confirmationText === CONFIRMATION_WORD) {
            onDeleteAccount();
            resetDeleteModal();
        }
    };

    if (!currentUser) return null;

    return (
        <>
            <Layout title="" showBack={false} isDevUser={isDevUser} onLogout={onLogout}>
                
                {/* Profile Header */}
                <div className="relative mb-8 animate-fadeIn">
                    <div className="h-28 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-b-3xl" />
                    <div className="flex flex-col items-center -mt-20 px-4">
                        <div className="relative">
                            <img src={currentUser.avatarUrl} alt="User Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-lg" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100 mt-3">{`${currentUser.firstName} ${currentUser.lastName}`}</h2>
                        <p className="text-slate-400">{currentUser.email}</p>
                        <button 
                            onClick={() => navigate('/settings/profile')} 
                            className="mt-4 flex items-center space-x-2 bg-slate-800/60 text-cyan-300 font-semibold px-5 py-2.5 rounded-full border border-slate-700 shadow-sm hover:bg-slate-700/80 hover:-translate-y-0.5 transition-all transform duration-300"
                        >
                            {React.cloneElement(ICONS.edit, {width: 16, height: 16})}
                            <span>Modifica Profilo</span>
                        </button>
                    </div>
                </div>
                
                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-center animate-slideInUp" style={{animationDelay: '100ms'}}>
                    <div className="bg-blue-900/40 p-4 rounded-xl border border-blue-800/50">
                        <p className="text-3xl font-bold text-blue-300">{classes.length}</p>
                        <p className="text-sm font-medium text-slate-400 mt-1">Classi</p>
                    </div>
                    <div className="bg-indigo-900/40 p-4 rounded-xl border border-indigo-800/50">
                        <p className="text-3xl font-bold text-indigo-300">{allStudents.length}</p>
                        <p className="text-sm font-medium text-slate-400 mt-1">Studenti</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <section className="animate-slideInUp" style={{animationDelay: '200ms'}}>
                        <h3 className="text-lg font-bold text-slate-200 px-2 mb-2">Account</h3>
                        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg overflow-hidden p-2">
                            <SettingRow icon={ICONS.shield} label="Sicurezza" onClick={() => navigate('/settings/security')} />
                            <SettingRow icon={ICONS.activity} label="Report Accessi Studenti" onClick={() => navigate('/settings/access-report')} />
                        </div>
                    </section>

                    <section className="animate-slideInUp" style={{animationDelay: '300ms'}}>
                        <h3 className="text-lg font-bold text-slate-200 px-2 mb-2">App</h3>
                        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg overflow-hidden p-2 space-y-2">
                            <SettingRow icon={ICONS.eye} label="Preferenze di visualizzazione" onClick={() => navigate('/settings/display')} />
                            <SettingRow icon={ICONS.bell_outline} label="Notifiche" onClick={() => navigate('/settings/notifications')} />
                            <SettingRow icon={ICONS.language} label="Lingua" onClick={() => navigate('/settings/language')} />
                            <SettingRow icon={ICONS.theme} label="Tema" onClick={() => navigate('/settings/theme')} />
                        </div>
                    </section>
                    
                    <section className="animate-slideInUp" style={{animationDelay: '400ms'}}>
                        <h3 className="text-lg font-bold text-slate-200 px-2 mb-2">Supporto</h3>
                        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg overflow-hidden p-2">
                            <SettingRow icon={ICONS.help} label="Centro Assistenza" onClick={() => navigate('/settings/help')} />
                            <SettingRow icon={ICONS.feedback} label="Invia Feedback" onClick={() => navigate('/settings/feedback')} />
                            <SettingRow icon={ICONS.info} label="Informazioni" onClick={() => navigate('/settings/about')} />
                        </div>
                    </section>
                    
                    {isDevModeEnabled && (
                        <section ref={devOptionsRef} className="animate-slideInUp" style={{animationDelay: '500ms'}}>
                            <h3 className="text-lg font-bold text-yellow-400 px-2 mb-2">Opzioni Sviluppatore</h3>
                            <div className={`bg-yellow-900/20 border border-yellow-700/40 rounded-2xl shadow-lg overflow-hidden p-2 transition-all duration-500 ${highlightDevOptions ? 'animate-breathing-glow' : ''}`}>
                                <SettingRow icon={ICONS.lab_beaker} label="Menu Sviluppatore" onClick={() => navigate('/settings/developer')} />
                            </div>
                        </section>
                    )}

                    {!isDevUser && (
                        <div className="space-y-6 pt-4 animate-slideInUp" style={{animationDelay: isDevModeEnabled ? '600ms' : '500ms'}}>
                            <div className="px-1">
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl text-base font-bold text-cyan-300 bg-cyan-900/40 hover:bg-cyan-900/60 transition-colors"
                                >
                                    {React.cloneElement(ICONS.logout, {width: 20, height: 20})}
                                    <span>Esci</span>
                                </button>
                            </div>

                             <section className="border-t-2 border-dashed border-slate-700 mt-8 pt-6">
                                <h3 className="text-lg font-bold text-red-400 px-2 mb-3">Zona Pericolo</h3>
                                 <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-red-200">Elimina account</p>
                                            <p className="text-sm text-red-300/80">Questa azione è permanente.</p>
                                        </div>
                                         <button
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex-shrink-0"
                                        >
                                            Elimina
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={isDevUnlockedModalOpen}
                onClose={handleAcknowledgeDevMode}
                title="Modalità Sviluppatore Sbloccata! 🚀"
                closeOnOverlayClick={false}
            >
                 <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 text-yellow-400 animate-pulse-slow">
                        {React.cloneElement(ICONS.lab_beaker, {width: 96, height: 96})}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Congratulazioni, Mago della Tastiera!</h3>
                    <p className="text-slate-300">
                        Hai sbloccato le Opzioni Sviluppatore. Ora hai accesso a strumenti e funzionalità sperimentali.
                    </p>
                     <button
                        onClick={handleAcknowledgeDevMode}
                        className="mt-8 w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-yellow-500/20"
                    >
                        OK
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={resetDeleteModal}
                title="Elimina il tuo account"
                variant="danger"
                closeOnOverlayClick={false}
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 flex items-center justify-center bg-red-900/40 rounded-full text-red-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                         <h3 className="text-xl font-bold text-slate-100">Questa azione è definitiva</h3>
                        <p className="text-slate-300 mt-2">
                           Se elimini il tuo account, tutti i dati associati, incluse classi e studenti, verranno rimossi per sempre. Questa azione non può essere annullata.
                        </p>
                    </div>

                    <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <h4 className="font-bold text-red-200">Conseguenze dell'eliminazione:</h4>
                        <ul className="list-disc list-inside text-sm text-red-300/90 mt-2 space-y-1">
                            <li>Il tuo profilo insegnante verrà eliminato.</li>
                            <li>Tutte le tue <strong>{classes.length} classi</strong> e i <strong>{allStudents.length} studenti</strong> verranno rimossi.</li>
                            <li>Tutte le valutazioni e i dati di accesso degli studenti verranno persi.</li>
                        </ul>
                    </div>
                    
                     <div>
                        <label htmlFor="delete-confirm-input" className="block text-sm font-medium text-slate-300 mb-2">
                            Per confermare, digita <strong className="text-red-300">{CONFIRMATION_WORD}</strong> qui sotto.
                        </label>
                        <input
                            id="delete-confirm-input"
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-semibold tracking-widest"
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                        <button 
                            onClick={handleConfirmDelete} 
                            disabled={confirmationText !== CONFIRMATION_WORD}
                            className="w-full sm:w-auto px-5 py-3 rounded-lg text-base font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Elimina Definitivamente
                        </button>
                        <button onClick={resetDeleteModal} className="w-full sm:w-auto px-5 py-3 rounded-lg text-base font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">
                            Annulla
                        </button>
                    </div>
                </div>
            </Modal>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.4s ease-out forwards; }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .animate-pulse-slow { animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes breathing-glow {
                    0% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.2), 0 0 10px rgba(251, 191, 36, 0.1); border-color: rgba(180, 83, 9, 0.4); }
                    50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.3); border-color: rgba(251, 191, 36, 1); }
                    100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.2), 0 0 10px rgba(251, 191, 36, 0.1); border-color: rgba(180, 83, 9, 0.4); }
                }
                .animate-breathing-glow {
                    animation: breathing-glow 2s ease-in-out 2;
                }
            `}</style>
        </>
    );
};

export default SettingsPage;