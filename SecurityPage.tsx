

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { ICONS } from './constants';
import { useAppContext } from './AppContext';
import Modal from './Modal';
import * as db from './db';
import { bufferToBase64URL } from './webauthnHelpers';

interface StoredCredential {
    credentialId: string;
    name: string;
    createdAt: number;
}

const SecurityPage: React.FC = () => {
    const { currentUser, isDevUser, handleLogout } = useAppContext();
    const [credentials, setCredentials] = useState<StoredCredential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [credentialToDelete, setCredentialToDelete] = useState<StoredCredential | null>(null);
    const [isPlatformAuthenticatorAvailable, setIsPlatformAuthenticatorAvailable] = useState(false);

    const loadCredentials = async () => {
        if (!currentUser) return;
        try {
            const creds = await db.dbGetCredentialsForUser(currentUser.id);
            setCredentials(creds.map(c => ({
                credentialId: c.credentialId,
                name: c.name,
                createdAt: c.createdAt
            })));
        } catch (err) {
            console.error("Failed to load credentials", err);
            setError("Impossibile caricare i dispositivi registrati.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        const checkAvailability = async () => {
            if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
                setIsPlatformAuthenticatorAvailable(true);
            }
        };
        checkAvailability();
        loadCredentials();
    }, [currentUser]);

    const handleRegister = async () => {
        if (!currentUser) return;
        setError('');
        setIsLoading(true);

        try {
            const challenge = crypto.getRandomValues(new Uint8Array(32));
            const userId = new TextEncoder().encode(currentUser.id);
            
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: 'Registro Elettronico', id: window.location.hostname },
                    user: {
                        id: userId,
                        name: currentUser.email,
                        displayName: `${currentUser.firstName} ${currentUser.lastName}`,
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }], // ES256 and RS256
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                        residentKey: 'required',
                    },
                    timeout: 60000,
                    attestation: 'none',
                },
            });

            if (!credential || !(credential instanceof PublicKeyCredential) || !credential.response) {
                throw new Error('Registrazione biometrica fallita.');
            }
            
            const publicKey = (credential.response as AuthenticatorAttestationResponse).getPublicKey();
            if (!publicKey) {
                 throw new Error('Impossibile ottenere la chiave pubblica.');
            }

            const newCredential: db.WebAuthnCredential = {
                credentialId: bufferToBase64URL(credential.rawId),
                userId: currentUser.id,
                publicKey: bufferToBase64URL(publicKey),
                name: `Dispositivo (${new Date().toLocaleDateString()})`,
                createdAt: Date.now(),
            };
            
            await db.dbAddCredential(newCredential);
            await loadCredentials();

        } catch (err: any) {
            console.error(err);
             if (err.name === 'NotAllowedError') {
                setError('Registrazione annullata.');
            } else {
                setError('Impossibile registrare il dispositivo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!credentialToDelete) return;
        setError('');
        try {
            await db.dbDeleteCredential(credentialToDelete.credentialId);
            await loadCredentials();
        } catch (err) {
            console.error("Failed to delete credential", err);
            setError("Impossibile eliminare il dispositivo.");
        } finally {
            setCredentialToDelete(null);
        }
    };
    
    return (
        <Layout title="Sicurezza" showBack backPath="/settings" isDevUser={isDevUser} onLogout={handleLogout}>
            <div className="space-y-8">
                <section className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Accesso Biometrico</h3>
                    <p className="text-slate-400 mb-4">
                        Aggiungi il tuo dispositivo per accedere in modo rapido e sicuro tramite impronta digitale o riconoscimento facciale, senza bisogno di password.
                    </p>
                    {isPlatformAuthenticatorAvailable ? (
                        credentials.length > 0 ? (
                            <div className="bg-slate-700/50 p-4 rounded-lg text-center border border-slate-600">
                                <p className="font-semibold text-slate-200">Un dispositivo è già registrato.</p>
                                <p className="text-sm text-slate-400 mt-1">Per registrare un nuovo dispositivo, elimina prima quello esistente.</p>
                            </div>
                        ) : (
                            <button onClick={handleRegister} disabled={isLoading} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-wait">
                                {React.cloneElement(ICONS.shield, {width: 20, height: 20})}
                                <span>{isLoading ? 'In attesa...' : 'Registra questo dispositivo'}</span>
                            </button>
                        )
                    ) : (
                        <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg text-center">
                            Il tuo browser o dispositivo non supporta l'accesso biometrico.
                        </div>
                    )}
                    {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                </section>
                
                <section className="animate-slideInUp">
                    <h3 className="text-xl font-bold text-slate-100 mb-4">Dispositivi Registrati</h3>
                    {isLoading ? (
                        <p className="text-slate-400 text-center">Caricamento...</p>
                    ) : credentials.length > 0 ? (
                        <div className="space-y-3">
                            {credentials.map(cred => (
                                <div key={cred.credentialId} className="bg-slate-800/60 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-slate-700/50 p-3 rounded-lg text-slate-300">
                                            {ICONS.shield}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-100">{cred.name}</p>
                                            <p className="text-sm text-slate-400">Registrato il: {new Date(cred.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setCredentialToDelete(cred)} className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-red-900/20 transition-colors">
                                        {React.cloneElement(ICONS.trash, { width: 20, height: 20 })}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-4 text-slate-400 rounded-2xl bg-slate-800/60 border border-slate-700">
                            <p>Nessun dispositivo registrato.</p>
                        </div>
                    )}
                </section>
            </div>
            
            <Modal isOpen={!!credentialToDelete} onClose={() => setCredentialToDelete(null)} title="Conferma Eliminazione" variant="danger">
                {credentialToDelete && (
                    <div className="space-y-6">
                        <p className="text-slate-300 text-sm">
                            Sei sicuro di voler rimuovere l'accesso per <span className="font-semibold text-slate-100">"{credentialToDelete.name}"</span>?
                        </p>
                        <div className="bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-300 p-4 rounded-r-lg">
                            <p className="font-bold text-yellow-200">Azione richiesta</p>
                            <p className="text-sm mt-1">
                                Dopo aver eliminato la passkey da qui, dovrai anche rimuoverla manualmente dalle impostazioni del tuo dispositivo (es. Portachiavi iCloud, Google Password Manager) per completare la rimozione.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setCredentialToDelete(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleDelete} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Sì, elimina</button>
                        </div>
                    </div>
                )}
            </Modal>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; opacity: 0; animation-delay: 150ms; }
            `}</style>
        </Layout>
    );
};

export default SecurityPage;