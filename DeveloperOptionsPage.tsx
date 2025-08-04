

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Modal from './Modal';
import { ICONS } from './constants';

interface DeveloperOptionsPageProps {
  onDisableDevMode: () => void;
  isDevUser?: boolean;
  onLogout?: () => void;
  hideDevButtons: boolean;
  onToggleHideDevButtons: () => void;
  onResetDevData: () => Promise<void>;
}

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: () => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="font-medium text-slate-200">{label}</span>
    <button
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
        enabled ? 'bg-cyan-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const DeveloperOptionsPage: React.FC<DeveloperOptionsPageProps> = ({ 
    onDisableDevMode, 
    isDevUser, 
    onLogout,
    hideDevButtons,
    onToggleHideDevButtons,
    onResetDevData
}) => {
    const navigate = useNavigate();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleDisable = () => {
        onDisableDevMode();
        navigate('/settings');
    };
    
    const handleReset = async () => {
        setIsResetting(true);
        await onResetDevData();
        setIsResetting(false);
        setIsResetModalOpen(false);
    };

    return (
        <>
            <Layout title="Opzioni Sviluppatore" showBack backPath="/settings" isDevUser={isDevUser} onLogout={onLogout}>
                <div className="space-y-6">

                    <div className="bg-slate-800/60 p-5 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">Strumenti e Visibilità</h3>
                        <div className="space-y-3">
                            <ToggleSwitch
                                label="Nascondi pulsanti accesso dev"
                                enabled={hideDevButtons}
                                onChange={onToggleHideDevButtons}
                            />
                            <p className="text-xs text-slate-400 pl-1 pt-1">
                                Nasconde i pulsanti di accesso rapido per sviluppatori nelle pagine di login.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-800/60 p-5 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">Gestione Dati Sviluppo</h3>
                        <p className="text-slate-300 mb-4 text-sm">
                            Ripristina l'ambiente di sviluppo al suo stato iniziale. Verranno cancellati tutti i dati (classi, studenti, sessioni) e ricreati i dati di default.
                        </p>
                        <button
                            onClick={() => setIsResetModalOpen(true)}
                            className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl text-base font-bold text-yellow-300 bg-yellow-900/40 hover:bg-yellow-900/60 transition-colors"
                        >
                            {React.cloneElement(ICONS.trash, {width: 20, height: 20})}
                            <span>Ripristina Dati Sviluppo</span>
                        </button>
                    </div>

                    <div className="bg-slate-800/60 p-5 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">Gestione Modalità Sviluppatore</h3>
                        <p className="text-slate-300 mb-4 text-sm">
                            Disattivando la modalità sviluppatore, perderai l'accesso a menu e funzioni sperimentali. 
                            Dovrai riattivarla con la procedura di sblocco (6 tap).
                        </p>
                        <button
                            onClick={() => setIsConfirmModalOpen(true)}
                            className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl text-base font-bold text-red-300 bg-red-900/40 hover:bg-red-900/60 transition-colors"
                        >
                            {React.cloneElement(ICONS.warning, {width: 20, height: 20})}
                            <span>Disattiva Modalità Sviluppatore</span>
                        </button>
                    </div>
                </div>
            </Layout>
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Conferma Disattivazione"
                variant="danger"
                closeOnOverlayClick={false}
            >
                <div className="space-y-6 text-center">
                     <p className="text-slate-300">
                        Sei sicuro di voler disattivare la Modalità Sviluppatore?
                     </p>
                     <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                        <button 
                            onClick={handleDisable}
                            className="w-full sm:w-auto px-5 py-3 rounded-lg text-base font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            Sì, disattiva
                        </button>
                        <button onClick={() => setIsConfirmModalOpen(false)} className="w-full sm:w-auto px-5 py-3 rounded-lg text-base font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">
                            Annulla
                        </button>
                    </div>
                </div>
            </Modal>
             <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Conferma Ripristino Dati"
                variant="danger"
                closeOnOverlayClick={false}
            >
                <div className="space-y-6 text-center">
                     <p className="text-slate-300">
                        Sei sicuro di voler ripristinare i dati di sviluppo? Tutte le modifiche e le sessioni registrate verranno perse.
                     </p>
                     <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                        <button 
                            onClick={handleReset}
                            disabled={isResetting}
                            className="w-full sm:w-auto px-5 py-3 rounded-lg text-base font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isResetting ? 'Ripristino...' : 'Sì, ripristina'}
                        </button>
                        <button onClick={() => setIsResetModalOpen(false)} className="w-full sm:w-auto px-5 py-3 rounded-lg text-base font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">
                            Annulla
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DeveloperOptionsPage;