

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as db from './db';
import { User, Student, SessionRecord, ActivityRecord } from './constants';
import AuthLayout from './AuthLayout';

// --- ICONS & ILLUSTRATIONS ---

const StudentIllustration = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0F172A" d="M43.1,-55.8C56.9,-48.5,70,-38.1,75.4,-24.4C80.8,-10.8,78.5,6.1,70.9,19.3C63.3,32.5,50.4,42,37.2,51.3C24.1,60.6,10.8,69.7,-3.6,72.4C-18.1,75.1,-33.6,71.4,-44.9,62C-56.2,52.6,-63.3,37.5,-67.9,22.2C-72.5,6.9,-74.5,-8.6,-68.9,-20.9C-63.3,-33.2,-50,-42.3,-37.2,-49.2C-24.4,-56.1,-12.2,-60.8,1.4,-62.7C15,-64.6,30,-63.1,43.1,-55.8Z" transform="translate(100 100)"/>
        <foreignObject x="50" y="50" width="100" height="100">
            <div className="flex items-center justify-center h-full">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                    <path d="M15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 11v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 18h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 15h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </div>
        </foreignObject>
    </svg>
);


const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

// --- MAIN COMPONENT ---
interface StudentAccessPageProps {
  onStudentLogin: (sessionRecord: SessionRecord, student: Student) => void;
  onDevStudentLogin: () => void;
  showDevButtons: boolean;
}

const StudentAccessPage: React.FC<StudentAccessPageProps> = ({ onStudentLogin, onDevStudentLogin, showDevButtons }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startShake, setStartShake] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      if(error) {
          setStartShake(true);
          const timer = setTimeout(() => {
              setStartShake(false);
          }, 500); // Duration of the shake animation
          return () => clearTimeout(timer);
      }
  }, [error])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || loginSuccess) return;
    
    setError('');
    setIsLoading(true);

    if (!accessCode.trim()) {
      setError('Per favore, inserisci il codice di accesso.');
      setIsLoading(false);
      return;
    }

    try {
        await new Promise(res => setTimeout(res, 500)); // Simulate network
        const result = await db.dbGetStudentByAccessCode(accessCode);
        if (result) {
          const { student, teacherId } = result;
          
          setStudentName(student.name);
          setLoginSuccess(true); // Trigger animation

          setTimeout(async () => {
            const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            const newSessionRecord: SessionRecord = {
                sessionId,
                studentId: student.id,
                teacherId: teacherId,
                loginTimestamp: Date.now(),
            };
            await db.dbPut(db.STORES.SESSIONS, newSessionRecord);

            const newActivity: ActivityRecord = {
              id: `activity-${Date.now()}`,
              sessionId,
              studentId: student.id,
              timestamp: newSessionRecord.loginTimestamp,
              type: 'LOGIN',
            };
            await db.dbPut(db.STORES.ACTIVITIES, newActivity);

            onStudentLogin(newSessionRecord, student);
          }, 2000);

        } else {
          setError('Codice di accesso non valido. Riprova.');
          setIsLoading(false);
        }
    } catch(err) {
        console.error("Student login failed", err);
        setError("Si è verificato un errore durante l'accesso.");
        setIsLoading(false);
    }
  };

  const spinner = (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <AuthLayout
        title="Il Tuo Spazio Personale"
        subtitle="Visualizza i tuoi voti, le comunicazioni e il materiale didattico. Il tuo percorso di apprendimento, a portata di click."
        illustration={<StudentIllustration />}
    >
        <main className="w-full max-w-sm text-center animate-fadeInUp auth-page-student-access">
             <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/20 border border-white/10 relative overflow-hidden transition-all duration-500 auth-form-card" style={{ minHeight: '430px' }}>
                {/* Success View */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${loginSuccess ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <div className="w-24 h-24">
                        <svg viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>
                    <h2 className={`text-2xl font-bold text-white mt-4 transition-all duration-500 ${loginSuccess ? 'opacity-100 translate-y-0 delay-700' : 'opacity-0 -translate-y-4'}`}>Accesso Riuscito!</h2>
                    <p className={`text-slate-300 text-lg transition-all duration-500 ${loginSuccess ? 'opacity-100 translate-y-0 delay-[900ms]' : 'opacity-0 -translate-y-4'}`}>Benvenuto, {studentName.split(' ')[0]}!</p>
                </div>

                {/* Form View */}
                <div className={`transition-all duration-500 ${loginSuccess ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}`}>
                    <div className="lg:hidden flex justify-center mb-6">
                       <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white animate-float">
                          <path d="M15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M12 11v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M12 18h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M12 15h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">ACCEDI AI TUOI DATI!</h1>
                    <p className="text-slate-400 mb-8 auth-subtitle">Inserisci il codice di accesso per iniziare.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <input
                                id="access-code"
                                type="text"
                                value={accessCode}
                                onChange={(e) => {
                                    setAccessCode(e.target.value.toUpperCase());
                                    if(error) setError('');
                                }}
                                placeholder="CODICE-ACCESSO"
                                className={`w-full px-4 py-4 rounded-xl bg-black/20 border-2 text-white placeholder-slate-400 focus:outline-none focus:ring-4 text-center text-xl sm:text-2xl font-mono tracking-widest transition-all duration-300 ${startShake ? 'border-red-500 ring-red-500/30 animate-shake' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400/30'}`}
                                aria-invalid={!!error}
                                aria-describedby="code-error"
                            />
                             {error && <p id="code-error" className="text-red-400 text-sm font-medium pt-3 text-center">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-1 transform transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-wait"
                        >
                            {isLoading && !loginSuccess ? spinner : (
                                <span className="flex items-center space-x-3">
                                    <span className="text-lg">Entra</span>
                                    <div className="transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRightIcon />
                                    </div>
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            
            {showDevButtons && (
                 <>
                    <div className="relative flex py-5 items-center auth-divider">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">oppure</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <button
                        type="button"
                        onClick={onDevStudentLogin}
                        className="w-full bg-white/10 text-slate-200 font-semibold py-3 px-4 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                        Accesso Studente (Sviluppo)
                    </button>
                </>
            )}

            <footer className="mt-8 auth-footer">
                <p className="text-sm text-slate-400">
                    Sei un insegnante?{' '}
                    <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                        Accedi da qui
                    </Link>
                </p>
            </footer>
        </main>

        <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
            @keyframes shake {
              10%, 90% { transform: translate3d(-1px, 0, 0); }
              20%, 80% { transform: translate3d(2px, 0, 0); }
              30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
              40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            .animate-shake {
              animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            .animate-float {
                animation: float 6s ease-in-out infinite;
            }
            .checkmark__circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 3;
                stroke-miterlimit: 10;
                stroke: #4ade80;
                fill: none;
                animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.2s forwards;
            }
            .checkmark__check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                stroke-width: 4;
                stroke-linecap: round;
                stroke: #4ade80;
                fill: none;
                animation: stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke {
                100% {
                    stroke-dashoffset: 0;
                }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fadeIn {
                animation: fadeIn 0.5s ease-out forwards;
            }
        `}</style>
    </AuthLayout>
  );
};

export default StudentAccessPage;