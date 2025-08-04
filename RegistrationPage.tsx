

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as db from './db';
import type { User } from './constants';
import { ICONS } from './constants';
import AuthLayout from './AuthLayout';
import { useAppContext } from './AppContext';

const RegisterIllustration = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0F172A" d="M47.2,-61.7C61.4,-51.9,73.4,-38.3,77,-22.8C80.7,-7.3,76,10.2,67.6,24.6C59.2,39,47.2,50.3,33.5,58.8C19.9,67.3,4.7,73,-10.8,71.8C-26.3,70.6,-42.2,62.5,-54.3,50.5C-66.4,38.5,-74.8,22.6,-77.3,5.6C-79.9,-11.3,-76.6,-29.3,-67.2,-43.3C-57.8,-57.3,-42.3,-67.3,-26.1,-72C-9.9,-76.7,6.9,-76.1,22.4,-71.2C37.9,-66.3,42.1,-56.1,47.2,-61.7Z" transform="translate(100 100)" />
        <foreignObject x="50" y="50" width="100" height="100">
            <div className="flex items-center justify-center h-full">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </foreignObject>
    </svg>
);

const ProgressBar: React.FC<{ step: number }> = ({ step }) => (
    <div className="flex items-center w-full max-w-xs mx-auto mb-10 reg-progress-bar">
        {['Avatar', 'Dati', 'Password'].map((label, i) => {
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
                            reg-progress-circle
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
                        <p className={`text-xs mt-2 font-semibold transition-colors duration-500 reg-progress-text ${
                            step >= s ? 'text-cyan-400' : 'text-gray-500'
                        }`}>
                            {label}
                        </p>
                    </div>
                    {i < 2 && 
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


const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length > 7) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^A-Za-z0-9]/)) score++;
        return score;
    };

    const strength = getStrength();
    const width = (strength / 5) * 100;
    const color = strength < 3 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-400' : 'bg-green-500';

    return (
        <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }}></div>
        </div>
    );
};

const RegistrationPage: React.FC = () => {
  const { handleLogin } = useAppContext();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [avatarUrl, setAvatarUrl] = useState(`https://avatar.iran.liara.run/public/boy?username=Avatar`);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'out' | 'in'>('idle');
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');

  const generateRandomAvatar = () => {
    if (isGeneratingAvatar) return;
    setIsGeneratingAvatar(true);

    setTimeout(() => {
      const randomSeed = Math.random().toString(36).substring(7);
      setAvatarUrl(`https://avatar.iran.liara.run/public/${Math.random() > 0.5 ? 'girl' : 'boy'}?username=${randomSeed}`);
    }, 300); // Change image source halfway through the pop animation

    setTimeout(() => {
      setIsGeneratingAvatar(false);
    }, 600); // Animation duration
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
          setErrors(prev => ({...prev, [name]: ''}));
      }
  }

  const validateStep = async () => {
      const newErrors: Record<string, string> = {};
      if (step === 2) {
          if (!formData.name.trim()) newErrors.name = 'Il nome è obbligatorio.';
          if (!formData.email.trim()) {
            newErrors.email = 'L\'email è obbligatoria.';
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email non valida.';
          } else {
            const hashedEmail = await db.hashString(formData.email.toLowerCase().trim());
            const existingUser = await db.dbGetUserByEmail(hashedEmail);
            if (existingUser) {
                newErrors.email = 'Questa email è già registrata.';
            }
          }
      } else if (step === 3) {
          if (formData.password.length < 6) newErrors.password = 'La password deve avere almeno 6 caratteri.';
          if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Le password non corrispondono.';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleNext = async () => {
    if (animationState !== 'idle') return;
    setAnimationDirection('forward');
    if (await validateStep()) {
        setAnimationState('out');
        setTimeout(() => {
            setStep(s => s + 1);
            setAnimationState('in');
            setTimeout(() => setAnimationState('idle'), 500); // Animation "in" duration
        }, 400); // Animation "out" duration
    }
  };

  const handleBack = () => {
    if (animationState !== 'idle') return;
    setAnimationDirection('backward');
    setAnimationState('out');
    setTimeout(() => {
        setStep(s => s - 1);
        setAnimationState('in');
        setTimeout(() => setAnimationState('idle'), 500);
    }, 400);
  };

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await validateStep() || isLoading) return;
    
    setIsLoading(true);

    try {
        const hashedEmail = await db.hashString(formData.email.toLowerCase().trim());
        const hashedPassword = await db.hashString(formData.password);

        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const newUserForDb: User = {
            id: `user-${Date.now()}`,
            firstName: firstName || '',
            lastName: lastNameParts.join(' ') || '',
            email: hashedEmail,
            password: hashedPassword,
            dateOfBirth: '',
            avatarUrl: avatarUrl,
            phone: '',
            address: ''
        };
        
        await db.dbAddUser(newUserForDb);
        
        const userForState = {
            ...newUserForDb,
            email: formData.email, // Use plaintext email for session state
        };

        const { password, ...userToLogin } = userForState;
        await handleLogin(userToLogin, true);
    } catch (err) {
        console.error('Registration failed', err);
        setErrors({ confirmPassword: "Non è stato possibile completare la registrazione. Riprova."});
        setIsLoading(false);
    }
  };

  const spinner = (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <AuthLayout
        title="Crea il Tuo Account"
        subtitle="Unisciti alla nostra comunità di educatori. Registrati per accedere a strumenti potenti e semplificare la tua didattica."
        illustration={<RegisterIllustration />}
    >
        <div className="w-full max-w-md text-center animate-fadeInUp auth-page-register">
            <div className="lg:hidden flex justify-center mb-6">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white animate-float">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            
            <ProgressBar step={step} />

            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/20 border border-white/10 auth-form-card relative overflow-hidden" style={{ minHeight: '480px' }}>
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    rounded-full pointer-events-none z-20
                    ${animationState === 'out' && animationDirection === 'forward' ? 'animate-shockwave-flash' : ''}
                    ${animationState === 'in' && animationDirection === 'forward' ? 'animate-shockwave-reveal' : ''}
                `}></div>

                {/* Step 1 Content */}
                <div className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-center transition-opacity duration-200 ${step !== 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${step === 1 && animationState === 'out' && animationDirection === 'forward' ? 'animate-content-out' : ''} ${step === 1 && animationState === 'in' && animationDirection === 'backward' ? 'animate-black-hole-in' : ''}`}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2 reg-step-title">Il Tuo Tocco Personale</h2>
                        <p className="text-slate-400 mb-6 reg-step-subtitle">Scegli come vuoi apparire nel registro.</p>
                        
                        <div className="relative w-32 h-32 mx-auto mb-6 reg-step1-avatar-container">
                            <img 
                                src={avatarUrl} 
                                alt="Avatar" 
                                className={`w-full h-full rounded-full object-cover shadow-lg border-4 border-white/10 transition-all duration-500 ${isGeneratingAvatar ? 'animate-avatar-pop' : ''}`}
                            />
                            <label htmlFor="avatar-upload" className="reg-avatar-upload-button absolute bottom-1 right-1 bg-cyan-500 text-white rounded-full p-2.5 border-4 border-slate-900 cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg">
                                {React.cloneElement(ICONS.camera, {width: 20, height: 20})}
                            </label>
                        </div>
                        <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                type="button" 
                                onClick={generateRandomAvatar} 
                                disabled={isGeneratingAvatar}
                                className="w-full bg-white/10 text-slate-200 font-semibold py-3 px-4 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className={isGeneratingAvatar ? 'animate-spin' : ''}
                                >
                                    <path d="m18 2 4 4"/><path d="m2 18 4 4"/><path d="m14 2 6 6"/><path d="m2 14 6 6"/><path d="m6 8 4 4"/><path d="m12 14 4 4"/><path d="m17 2-5 5"/><path d="m22 7-5 5"/><path d="M22 17a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/><path d="M7 2a5 5 0 1 0 0 10A5 5 0 0 0 7 2z"/>
                                </svg>
                                <span>{isGeneratingAvatar ? 'Generazione...' : 'Genera Casuale'}</span>
                            </button>
                        </div>
                    </div>
                     <div className="flex items-center justify-end mt-8 reg-nav-buttons">
                        <button type="button" onClick={handleNext} className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all">Avanti</button>
                    </div>
                </div>

                {/* Step 2 Content */}
                <div className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-center ${step !== 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${step === 2 && animationState === 'in' && animationDirection === 'forward' ? 'animate-content-in' : ''} ${step === 2 && animationState === 'out' && animationDirection === 'forward' ? 'animate-content-out' : ''} ${step === 2 && animationState === 'in' && animationDirection === 'backward' ? 'animate-black-hole-in' : ''} ${step === 2 && animationState === 'out' && animationDirection === 'backward' ? 'animate-black-hole-out' : ''}`}>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 text-center reg-step-title">Raccontaci di Te</h2>
                        <p className="text-slate-400 mb-6 text-center reg-step-subtitle">Quasi finito! Inserisci i tuoi dati.</p>

                        <div className="relative mb-4">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">{React.cloneElement(ICONS.user_profile, {width: 20, height: 20})}</span>
                            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Nome completo" className={`w-full pl-12 pr-4 py-3 rounded-xl bg-black/20 border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition reg-input ${errors.name ? 'border-red-500 ring-red-500/30' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400/30'}`} />
                            {errors.name && <p className="text-red-400 text-xs mt-1 pl-2 text-left reg-error-text">{errors.name}</p>}
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">{React.cloneElement(ICONS.email, {width: 20, height: 20, "strokeWidth": "2"})}</span>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={`w-full pl-12 pr-4 py-3 rounded-xl bg-black/20 border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition reg-input ${errors.email ? 'border-red-500 ring-red-500/30' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400/30'}`} />
                            {errors.email && <p className="text-red-400 text-xs mt-1 pl-2 text-left reg-error-text">{errors.email}</p>}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-8 reg-nav-buttons">
                        <button type="button" onClick={handleBack} className="bg-transparent text-slate-300 font-bold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Indietro</button>
                        <button type="button" onClick={handleNext} className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all">Avanti</button>
                    </div>
                </div>

                {/* Step 3 Content */}
                <div className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-center ${step !== 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${step === 3 && animationState === 'in' && animationDirection === 'forward' ? 'animate-content-in' : ''} ${step === 3 && animationState === 'out' && animationDirection === 'backward' ? 'animate-black-hole-out' : ''}`}>
                    <form onSubmit={onRegisterSubmit}>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 text-center reg-step-title">Imposta la Sicurezza</h2>
                            <p className="text-slate-400 mb-6 text-center reg-step-subtitle">Scegli una password robusta e sicura.</p>

                            <div className="relative mb-4">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">{React.cloneElement(ICONS.lock, {width: 20, height: 20})}</span>
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Password" className={`w-full pl-12 pr-12 py-3 rounded-xl bg-black/20 border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition reg-input ${errors.password ? 'border-red-500 ring-red-500/30' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400/30'}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200">{showPassword ? React.cloneElement(ICONS.eye_off, {width:20, height:20}) : React.cloneElement(ICONS.eye, {width:20, height:20})}</button>
                            </div>
                            <PasswordStrength password={formData.password} />
                            {errors.password && <p className="text-red-400 text-xs mt-1 pl-2 text-left reg-error-text">{errors.password}</p>}
                            
                            <div className="relative mt-4">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">{React.cloneElement(ICONS.lock, {width: 20, height: 20})}</span>
                                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Conferma Password" className={`w-full pl-12 pr-12 py-3 rounded-xl bg-black/20 border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition reg-input ${errors.confirmPassword ? 'border-red-500 ring-red-500/30' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400/30'}`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200">{showConfirmPassword ? React.cloneElement(ICONS.eye_off, {width:20, height:20}) : React.cloneElement(ICONS.eye, {width:20, height:20})}</button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 pl-2 text-left reg-error-text">{errors.confirmPassword}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-8 reg-nav-buttons">
                            <button type="button" onClick={handleBack} className="bg-transparent text-slate-300 font-bold py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Indietro</button>
                            <button type="submit" disabled={isLoading} className="w-1/2 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-wait">
                                {isLoading ? spinner : 'Crea Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <p className="text-center mt-8 text-sm text-slate-400 auth-footer">
                Hai già un account?{' '}
                <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                    Accedi
                </Link>
            </p>
        </div>

        <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp { animation: fadeInUp 1.2s ease-out 0.5s forwards; opacity: 0; }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            .animate-float {
                animation: float 6s ease-in-out infinite;
            }
            @keyframes avatar-pop {
                0% { transform: scale(1) rotate(0deg); opacity: 1; }
                50% { transform: scale(0.6) rotate(-180deg); opacity: 0; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            .animate-avatar-pop { 
                animation: avatar-pop 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
            }

            /* --- Progress Bar "Cosmic Metamorphosis" Animation --- */
            .reg-progress-circle.active {
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

            .reg-progress-circle.completed {
                animation: cosmic-nova 0.8s ease-out forwards;
            }

            @keyframes cosmic-nova {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                30% { box-shadow: 0 0 10px 4px rgba(255, 255, 255, 0.7); }
                100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
            }

            .reg-progress-circle.completed .checkmark-icon {
                text-shadow: 0 0 4px #fff, 0 0 8px #fff, 0 0 12px #22d3ee;
                transform-origin: center;
                animation: star-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards;
            }

            @keyframes star-pop {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
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
        `}</style>
    </AuthLayout>
  );
};

export default RegistrationPage;