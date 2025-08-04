import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import type { User } from './constants';
import { ICONS } from './constants';
import ImageCropperModal from './ImageCropperModal';

interface ProfileEditPageProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  isDevUser?: boolean;
  onLogout?: () => void;
  isSidebarOpen: boolean;
}

const InputField: React.FC<{
  id: keyof User;
  label: string;
  type: string;
  icon: React.ReactElement<any>;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ id, label, type, icon, placeholder, value, onChange, disabled }) => (
  <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
              {React.cloneElement(icon, { width: 20, height: 20 })}
          </span>
          <input
              id={id}
              name={id}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 transition disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />
      </div>
  </div>
);

// Base64 encoded shimmer sound effect
const SHIMMER_SOUND_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const playSound = (soundUrl: string) => {
    try {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5; // Set volume to avoid being too loud
        audio.play().catch(e => console.error("Error playing sound:", e));
    } catch (e) {
        console.error("Could not create Audio object:", e);
    }
};


const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ currentUser, onUpdateUser, isDevUser, onLogout, isSidebarOpen }) => {
  const [formData, setFormData] = useState<User>(currentUser);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
  const [previousAvatarUrl, setPreviousAvatarUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    setFormData(currentUser);
  }, [currentUser]);

  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(currentUser), [formData, currentUser]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Allow re-selecting the same file
    }
  }, []);

  const handleCropSave = (croppedImage: string) => {
    setPreviousAvatarUrl(formData.avatarUrl);
    setIsAvatarUpdating(true);
    playSound(SHIMMER_SOUND_BASE64);
    
    const updatedUser = { ...formData, avatarUrl: croppedImage };
    setFormData(updatedUser);
    onUpdateUser(updatedUser); // Save persistently immediately
    
    setImageToCrop(null);

    setTimeout(() => {
        setIsAvatarUpdating(false);
        setPreviousAvatarUrl(null);
    }, 3000); 
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (saveState !== 'idle' || !isDirty) return;

    setSaveState('saving');
    
    setTimeout(() => {
      onUpdateUser(formData);
      setSaveState('saved');
      setTimeout(() => {
        setSaveState('idle');
      }, 2000); // Show "Saved!" for 2 seconds
    }, 800);
  }, [saveState, isDirty, formData, onUpdateUser]);

  const spinner = (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const checkmark = (
    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <>
    <Layout title="Modifica Profilo" showBack backPath="/settings" isDevUser={isDevUser} onLogout={onLogout}>
        <form id="profile-edit-form" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center pt-2 mb-8 animate-fadeIn">
                <div className={`relative w-32 h-32 avatar-wrapper ${isAvatarUpdating ? 'is-updating' : ''}`}>
                    {isAvatarUpdating && previousAvatarUrl ? (
                        <>
                            <img 
                                key={previousAvatarUrl}
                                src={previousAvatarUrl} 
                                alt="Avatar precedente"
                                className="avatar-old w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg absolute inset-0" 
                            />
                            <img 
                                key={formData.avatarUrl}
                                src={formData.avatarUrl} 
                                alt="Nuovo avatar" 
                                className="avatar-new w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg absolute inset-0" 
                            />
                        </>
                    ) : (
                        <img 
                            key={formData.avatarUrl}
                            src={formData.avatarUrl} 
                            alt={`${formData.firstName} ${formData.lastName}`} 
                            className="w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg" 
                        />
                    )}
                    <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-cyan-500 text-white rounded-full p-2.5 border-4 border-slate-900 cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg z-10">
                        {React.cloneElement(ICONS.camera, {width: 20, height: 20})}
                    </label>
                </div>
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <p className="text-sm text-slate-400 mt-3 font-medium">Tocca l'icona per cambiare l'immagine</p>
            </div>

            <div className="space-y-6 animate-slideInUp">
                <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Dati Personali</h3>
                    <div className="space-y-4">
                        <InputField id="firstName" label="Nome" type="text" icon={ICONS.user_profile} placeholder="Il tuo nome" value={formData.firstName} onChange={handleChange} />
                        <InputField id="lastName" label="Cognome" type="text" icon={ICONS.user_profile} placeholder="Il tuo cognome" value={formData.lastName} onChange={handleChange} />
                    </div>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Contatti</h3>
                    <div className="space-y-4">
                        <InputField id="email" label="Email" type="email" icon={ICONS.email} placeholder="La tua email" value={formData.email} onChange={handleChange} />
                        <InputField id="phone" label="Telefono" type="tel" icon={ICONS.phone} placeholder="Il tuo numero di telefono" value={formData.phone} onChange={handleChange} />
                    </div>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Altri Dettagli</h3>
                    <div className="space-y-4">
                        <InputField id="dateOfBirth" label="Data di Nascita" type="date" icon={ICONS.calendar} value={formData.dateOfBirth} onChange={handleChange} />
                        <InputField id="address" label="Indirizzo" type="text" icon={ICONS.map_pin} placeholder="Il tuo indirizzo" value={formData.address} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* Spacer for the fixed button */}
            <div className="h-24" />
        </form>
    </Layout>
    <ImageCropperModal
      imageSrc={imageToCrop}
      onSave={handleCropSave}
      onClose={() => setImageToCrop(null)}
    />
    <div className={`fixed bottom-16 lg:bottom-0 w-full lg:w-auto left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 z-30 transition-all duration-[1000ms] ease-in-out ${isSidebarOpen ? 'lg:left-24' : 'lg:left-0'}`}>
        <div className="w-full max-w-screen-xl mx-auto p-4">
            <button
                type="submit"
                form="profile-edit-form"
                disabled={saveState !== 'idle' || !isDirty}
                className={`w-full flex items-center justify-center font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition-all duration-300
                    ${saveState === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : ''}
                    ${saveState !== 'saved' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5' : ''}
                    disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed
                `}
            >
                 {saveState === 'saving' ? (
                    <div className="flex items-center">{spinner}<span className="ml-2">Salvataggio...</span></div>
                ) : saveState === 'saved' ? (
                    <div className="flex items-center">{checkmark}<span className="ml-2">Salvato!</span></div>
                ) : (
                    'Salva Modifiche'
                )}
            </button>
        </div>
    </div>
    <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
        input[type="date"] {
            color-scheme: dark;
        }

        /* Avatar update animations */
        @keyframes fade-out-blur {
            from { opacity: 1; filter: blur(0px) scale(1); }
            to { opacity: 0; filter: blur(8px) scale(0.95); }
        }

        @keyframes fade-in-unblur {
            from { opacity: 0; filter: blur(8px) scale(0.95); }
            to { opacity: 1; filter: blur(0px) scale(1); }
        }

        @keyframes glow-effect {
            0% {
                box-shadow: 0 0 0 0 rgba(22, 211, 238, 0.0);
            }
            50% {
                box-shadow: 0 0 20px 8px rgba(22, 211, 238, 0.6), 0 0 35px 15px rgba(22, 211, 238, 0.2);
            }
            100% {
                 box-shadow: 0 0 0 0 rgba(22, 211, 238, 0.0);
            }
        }

        @keyframes particle-effect {
            from {
                transform: scale(1);
                opacity: 1;
                border-color: #67e8f9; /* cyan-300 */
            }
            to {
                transform: scale(2.5);
                opacity: 0;
            }
        }

        .avatar-wrapper.is-updating .avatar-old {
            animation: fade-out-blur 1s ease-in-out forwards;
        }

        .avatar-wrapper.is-updating .avatar-new {
            animation: 
                fade-in-unblur 1s ease-in-out forwards,
                glow-effect 1.5s ease-in-out 1s forwards;
        }

        .avatar-wrapper.is-updating::before,
        .avatar-wrapper.is-updating::after {
            content: '';
            position: absolute;
            top: -2px; left: -2px;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            border-radius: 50%;
            border: 2px solid transparent;
            pointer-events: none;
            z-index: 5;
            animation: particle-effect 1.5s cubic-bezier(0.19, 1, 0.22, 1) 1s forwards;
        }

        .avatar-wrapper.is-updating::after {
            animation-delay: 1.3s;
        }
    `}</style>
    </>
  );
};

export default ProfileEditPage;