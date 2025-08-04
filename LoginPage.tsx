

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as db from './db';
import { ICONS, User } from './constants';
import AuthLayout from './AuthLayout';
import { useAppContext } from './AppContext';
import { bufferToBase64URL, base64URLToBuffer } from './webauthnHelpers';

const TeacherIllustration = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0F172A" d="M48.4,-58.3C61.3,-46.8,69.5,-30.9,72.2,-13.7C74.9,3.5,72,22,63,37.3C54.1,52.6,39.2,64.8,22.8,70.2C6.4,75.6,-11.5,74.2,-27.9,67.6C-44.4,61,-59.5,49.2,-67.2,33.9C-74.9,18.6,-75.2,0,-70.7,-16.4C-66.2,-32.8,-56.9,-47,-44.6,-57.1C-32.3,-67.2,-16.1,-73.2,0.8,-73.9C17.8,-74.6,35.5,-70,48.4,-58.3Z" transform="translate(100 100)" />
        <foreignObject x="50" y="50" width="100" height="100">
            <div className="flex items-center justify-center h-full">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-11A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </div>
        </foreignObject>
    </svg>
);

const ProgressBar: React.FC<{ step: number }> = ({ step }) => (
    <div className="flex items-center w-full max-w-xs mx-auto mb-10 login-progress-bar">
        {['Email', 'Password'].map((label, i) => {
            const s = i + 1;
            const isCompleted = step > s;
            const isActive = step === s;
            const isLineCompleted = step > s;

            return (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 
                            transition-all duration-500 ease-in-out relative
                            login-progress-circle 
                            ${isCompleted ? 'completed bg-blue-500 border-blue-500 text-white' : ''}
                            ${isActive ? 'active bg-cyan-500 border-cyan-500 text-white' : ''}
                            ${!isCompleted && !isActive ? 'inactive bg-white/10 border-white/20 text-gray-400' : ''}
                        `}>
                            <span className={`
                                number-text transition-all duration-300
                                ${isCompleted ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                            `}>{s}</span>
                            <span className={`
                                checkmark-icon absolute opacity-0
                            `}>✓</span>
                        </div>
                        <p className={`text-xs mt-2 font-semibold transition-colors duration-500 login-progress-text ${
                            step >= s ? 'text-cyan-400' : 'text-gray-500'
                        }`}>
                            {label}
                        </p>
                    </div>
                    {i < 1 && 
                        <div className={`
                            flex-1 h-1 mx-2 transition-colors duration-500
                            ${isLineCompleted ? 'progress-line-completed' : 'bg-white/10'}
                        `}>
                        </div>
                    }
                </React.Fragment>
            );
        })}
    </div>
);


const LoginPage: React.FC = () => {
  const { handleLogin, handleDevLogin, hideDevButtons } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricsForCurrentUser, setBiometricsForCurrentUser] = useState(false);
  const [loginUser, setLoginUser] = useState<User | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'out' | 'in'>('idle');
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');


  const handleNextStep = async () => {
    if (isLoading || animationState !== 'idle') return;
    setAnimationDirection('forward');
    setError('');
    
    if (!email) {
        setError('Per favore, inserisci un\'email.');
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Formato email non valido.');
        return;
    }

    setIsLoading(true);
    try {
        const hashedEmail = await db.hashString(email.toLowerCase().trim());
        const foundUser = await db.dbGetUserByEmail(hashedEmail);
        if (foundUser) {
            if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
                const userCredentials = await db.dbGetCredentialsForUser(foundUser.id);
                setBiometricsForCurrentUser(userCredentials.length > 0);
            }
            setLoginUser(foundUser);
            setAnimationState('out');
            setTimeout(() => {
                setStep(2);
                setAnimationState('in');
                setTimeout(() => setAnimationState('idle'), 500); // Durata animazione "in"
            }, 400); // Durata animazione "out"
        } else {
            setError('Nessun account trovato. Prova a registrarti.');
        }
    } catch (err) {
        console.error("Email check failed", err);
        setError('Si è verificato un errore durante la verifica.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleBackStep = () => {
    if (animationState !== 'idle') return;
    setAnimationDirection('backward');
    setAnimationState('out');
    setTimeout(() => {
        setStep(1);
        setError('');
        setPassword('');
        setBiometricsForCurrentUser(false);
        setAnimationState('in');
        setTimeout(() => setAnimationState('idle'), 500);
    }, 400);
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !loginUser) return;

    setError('');
    setIsLoading(true);
    
    try {
        const hashedPassword = await db.hashString(password);
        if (loginUser.password === hashedPassword) {
            const { password, ...userFromDb } = loginUser;
            const userForState = {
                ...userFromDb,
                email: email, // use plaintext email from state for session
            };
            await handleLogin(userForState, true);
        } else {
            setError('Password non corretta. Riprova.');
        }
    } catch (err) {
        console.error("Login failed", err);
        setError('Si è verificato un errore durante l\'accesso.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleBiometricLogin = async () => {
      if(isLoading || !loginUser) return;
      setError('');
      setIsLoading(true);
      
      try {
          const userCredentials = await db.dbGetCredentialsForUser(loginUser.id);
          if (userCredentials.length === 0) {
              throw new Error("Nessun dispositivo biometrico registrato per questo account.");
          }

          const challenge = crypto.getRandomValues(new Uint8Array(32));
          
          const allowCredentials: PublicKeyCredentialDescriptor[] = userCredentials.map(cred => ({
            type: 'public-key',
            id: base64URLToBuffer(cred.credentialId),
          }));

          const assertion = await navigator.credentials.get({
              publicKey: {
                  challenge,
                  allowCredentials,
                  timeout: 60000,
                  userVerification: 'required',
                  rpId: window.location.hostname,
              }
          });
          
          if(!assertion || !(assertion instanceof PublicKeyCredential)) {
              throw new Error("Autenticazione biometrica fallita.");
          }
          
          // Se arriviamo qui, l'autenticazione è riuscita.
          // Non dobbiamo verificare la signature lato client in questo scenario
          // perché il browser e l'autenticatore l'hanno già fatto.
          // In un'app reale, invieresti l'assertion al server per la verifica.
          
          const { password, ...userFromDb } = loginUser;
          const userForState = { ...userFromDb, email: email };
          await handleLogin(userForState, true);

      } catch (err: any) {
          console.error("Biometric login failed", err);
          if (err.name === 'NotAllowedError') {
              setError('Autenticazione annullata.');
          } else {
              setError('Accesso biometrico fallito. Riprova.');
          }
      } finally {
          setIsLoading(false);
      }
  }

  const spinner = (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <AuthLayout
        title="Registro Elettronico"
        subtitle="Gestione Semplice, Apprendimento Efficace. Accedi per iniziare a organizzare le tue classi e monitorare i progressi degli studenti."
        illustration={<TeacherIllustration />}
    >
        <div className="w-full max-w-sm text-center animate-fadeInUp auth-page-login">
            <div className="lg:hidden flex justify-center mb-6">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white animate-float">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-11A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </div>
            
            <ProgressBar step={step} />

            <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/20 border border-white/10 auth-form-card flex flex-col justify-center relative overflow-hidden" style={{ minHeight: '350px' }}>
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    rounded-full pointer-events-none z-20
                    ${animationState === 'out' && animationDirection === 'forward' ? 'animate-shockwave-flash' : ''}
                    ${animationState === 'in' && animationDirection === 'forward' ? 'animate-shockwave-reveal' : ''}
                `}></div>
                
                {/* Step 1 Content */}
                <div className={`
                    transition-opacity duration-200 
                    ${step === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    ${animationState === 'out' && animationDirection === 'forward' ? 'animate-content-out' : ''}
                    ${animationState === 'in' && animationDirection === 'backward' ? 'animate-black-hole-in' : ''}
                `}>
                     <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Bentornato!</h1>
                     <p className="text-slate-400 mb-6 auth-subtitle">Inserisci la tua email per continuare.</p>
                     <form onSubmit={(e) => {e.preventDefault(); handleNextStep(); }} className="space-y-4">
                         {error && (
                             <p className="bg-red-500/20 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-md text-left text-sm font-medium">
                                 {error}
                             </p>
                         )}
                         <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                                 {React.cloneElement(ICONS.email, { width: 20, height: 20, "strokeWidth": "2" })}
                             </span>
                             <input
                                 id="username"
                                 type="email"
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 placeholder="Email"
                                 className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/20 border-2 border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30 focus:border-cyan-400 transition"
                             />
                         </div>
                         <button
                             type="submit"
                             disabled={isLoading}
                             className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transform transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-wait"
                         >
                             {isLoading ? <div className="flex items-center">{spinner}<span className="ml-2">Verifica...</span></div> : 'Avanti'}
                         </button>
                     </form>
                </div>

                {/* Step 2 Content */}
                <div className={`
                    absolute inset-0 p-6 sm:p-8 flex flex-col justify-center
                    ${step === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    ${animationState === 'in' && animationDirection === 'forward' ? 'animate-content-in' : ''}
                    ${animationState === 'out' && animationDirection === 'backward' ? 'animate-black-hole-out' : ''}
                `}>
                     {loginUser && (
                         <>
                            <div className="flex flex-col items-center mb-6">
                                <img src={loginUser.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-slate-600"/>
                                <p className="font-semibold text-slate-200">{email}</p>
                            </div>
                            <form onSubmit={onLoginSubmit} className="space-y-4">
                                {error && (
                                    <p className="bg-red-500/20 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-md text-left text-sm font-medium">
                                        {error}
                                    </p>
                                )}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                                        {React.cloneElement(ICONS.lock, { width: 20, height: 20 })}
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-black/20 border-2 border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30 focus:border-cyan-400 transition"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200 transition-colors">
                                        {showPassword ? React.cloneElement(ICONS.eye_off, { width: 20, height: 20 }) : React.cloneElement(ICONS.eye, { width: 20, height: 20 })}
                                    </button>
                                </div>
                                <a href="#" className="text-sm text-cyan-400 hover:underline text-right block pr-1 font-medium">
                                    Password dimenticata?
                                </a>
                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <button type="button" onClick={handleBackStep} className="bg-transparent text-slate-300 font-bold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Indietro</button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-1/2 flex-grow flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-wait"
                                    >
                                        {isLoading ? spinner : 'Accedi'}
                                    </button>
                                </div>
                            </form>
                            {biometricsForCurrentUser && (
                                <>
                                    <div className="relative flex py-3 items-center">
                                        <div className="flex-grow border-t border-gray-700/50"></div>
                                        <span className="flex-shrink mx-4 text-gray-500 text-xs">oppure</span>
                                        <div className="flex-grow border-t border-gray-700/50"></div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleBiometricLogin}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center space-x-2 bg-white/10 text-slate-200 font-semibold py-3 px-4 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
                                        aria-label="Accedi con biometria"
                                    >
                                        {React.cloneElement(ICONS.fingerprint, { width: 20, height: 20 })}
                                        <span>Accedi con Biometria</span>
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            <div className="relative flex py-5 items-center auth-divider">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm"></span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="space-y-3 auth-button-group">
                <button
                    type="button"
                    onClick={() => navigate('/student-access')}
                    className="w-full bg-white/10 text-slate-200 font-semibold py-3 px-4 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                    {React.cloneElement(ICONS.key, { width: 20, height: 20 })}
                    <span>Accesso Studente</span>
                </button>
                {!hideDevButtons && (
                    <button
                        type="button"
                        onClick={handleDevLogin}
                        className="w-full bg-white/10 text-slate-200 font-semibold py-3 px-4 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                        Accedi (Sviluppo)
                    </button>
                )}
            </div>

            <p className="text-center mt-8 text-sm text-slate-400 auth-footer">
                Non hai un account?{' '}
                <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                    Registrati
                </Link>
            </p>
        </div>

        <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            .animate-float {
                animation: float 6s ease-in-out infinite;
            }

            /* --- Animation: Onda d'Urto Invertita (Forward) --- */
            @keyframes shockwave-flash-effect {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
                50% { opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
            .animate-shockwave-flash {
                background-color: #22d3ee;
                animation: shockwave-flash-effect 0.4s ease-in-out forwards;
            }

            @keyframes content-implode-effect {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.6); opacity: 0; }
            }
            .animate-content-out {
                animation: content-implode-effect 0.4s ease-in forwards;
            }

            @keyframes shockwave-reveal-effect {
                from {
                    width: 0;
                    height: 0;
                    opacity: 0.6;
                    border: 2px solid #22d3ee;
                    box-shadow: 0 0 20px #22d3ee, inset 0 0 20px #22d3ee;
                }
                to {
                    width: 800px;
                    height: 800px;
                    opacity: 0;
                    border: 2px solid #22d3ee;
                }
            }
            .animate-shockwave-reveal {
                animation: shockwave-reveal-effect 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            @keyframes content-settle-effect {
                from { transform: scale(0.7); opacity: 0; }
                70% { transform: scale(1.05); opacity: 1; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-content-in {
                animation: content-settle-effect 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.1s backwards;
            }

            /* --- Animation: Black Hole Implosion (Backward) --- */
            @keyframes black-hole-implode-effect {
                from {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                    filter: blur(0px);
                }
                to {
                    transform: scale(0) rotate(360deg);
                    opacity: 0;
                    filter: blur(10px);
                }
            }
            .animate-black-hole-out {
                animation: black-hole-implode-effect 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
            }

            @keyframes black-hole-explode-effect {
                from {
                    transform: scale(0) rotate(-360deg);
                    opacity: 0;
                    filter: blur(10px);
                }
                to {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                    filter: blur(0px);
                }
            }
            .animate-black-hole-in {
                animation: black-hole-explode-effect 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
            }

            /* --- Progress Bar "Cosmic Metamorphosis" Animation --- */
            .login-progress-circle.active {
                animation: cosmic-nebula 2.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
            }

            @keyframes cosmic-nebula {
                0%, 100% {
                    box-shadow: 0 0 2px rgba(34, 211, 238, 0.5), 0 0 5px rgba(34, 211, 238, 0.3), 0 0 10px rgba(168, 85, 247, 0.2);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 8px rgba(34, 211, 238, 0.8), 0 0 15px rgba(34, 211, 238, 0.5), 0 0 25px rgba(168, 85, 247, 0.4);
                    transform: scale(1.05);
                }
            }

            .progress-line-completed {
                position: relative;
                overflow: hidden;
                background: linear-gradient(90deg, #3b82f6, #22d3ee); /* base color */
            }
            .progress-line-completed::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 200%;
                height: 100%;
                background-image:
                    radial-gradient(circle at 15% 50%, white 1px, transparent 1px),
                    radial-gradient(circle at 35% 80%, rgba(255,255,255,0.7) 1px, transparent 1px),
                    radial-gradient(circle at 55% 30%, white 1.5px, transparent 1.5px),
                    radial-gradient(circle at 75% 60%, rgba(255,255,255,0.8) 1px, transparent 1px),
                    radial-gradient(circle at 95% 40%, white 1px, transparent 1px);
                background-size: 50% 100%;
                background-repeat: repeat-x;
                animation: stardust-flow 3s linear infinite;
                opacity: 0.8;
            }

            @keyframes stardust-flow {
                from { transform: translateX(0%); }
                to { transform: translateX(-50%); }
            }

            .login-progress-circle.completed {
                animation: cosmic-nova 0.8s ease-out forwards;
            }

            @keyframes cosmic-nova {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                30% { box-shadow: 0 0 10px 4px rgba(255, 255, 255, 0.7); }
                100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
            }

            .login-progress-circle.completed .checkmark-icon {
                text-shadow: 0 0 4px #fff, 0 0 8px #fff, 0 0 12px #22d3ee;
                transform-origin: center;
                animation: star-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards;
            }

            @keyframes star-pop {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
        `}</style>
    </AuthLayout>
  );
};

export default LoginPage;
