

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from './Modal';
import { ICONS } from './constants';
import * as db from './db';
import type { Student, GradeItem, Parent, ActivityRecord, SessionRecord, ActivityType } from './constants';
import { useAppContext } from './AppContext';
import ImageCropperModal from './ImageCropperModal';

const getGradeInfo = (grade: number): { name: string; color: string; shadowColor: string; textColor: string; size: string; } => {
    if (grade >= 9) return { name: 'Eccellente', color: '#4ade80', shadowColor: 'rgba(74, 222, 128, 0.7)', textColor: '#a7f3d0', size: 'w-20 h-20' }; // green-400
    if (grade >= 8) return { name: 'Ottimo', color: '#60a5fa', shadowColor: 'rgba(96, 165, 250, 0.6)', textColor: '#bfdbfe', size: 'w-16 h-16' }; // blue-400
    if (grade >= 7) return { name: 'Buono', color: '#38bdf8', shadowColor: 'rgba(56, 189, 248, 0.5)', textColor: '#bae6fd', size: 'w-14 h-14' }; // sky-400
    if (grade >= 6) return { name: 'Sufficiente', color: '#fbbf24', shadowColor: 'rgba(251, 191, 36, 0.5)', textColor: '#fde68a', size: 'w-12 h-12' }; // amber-400
    if (grade >= 5) return { name: 'Insufficiente', color: '#fb923c', shadowColor: 'rgba(251, 146, 60, 0.6)', textColor: '#fed7aa', size: 'w-11 h-11' }; // orange-400
    return { name: 'Grave', color: '#f87171', shadowColor: 'rgba(248, 113, 113, 0.7)', textColor: '#fecaca', size: 'w-10 h-10' }; // red-400
};

const TabButtonMobile: React.FC<{ label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void, disabled?: boolean }> = ({ label, icon, isActive, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-full shrink-0 transition-all duration-300 transform hover:scale-105 ${isActive ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {icon}
        <span>{label}</span>
    </button>
);

const InfoCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, action?: React.ReactNode, className?: string }> = ({ title, icon, children, action, className = '' }) => (
    <div className={`bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-5 rounded-2xl shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-slate-700 text-slate-300 p-3 rounded-full mr-4">{icon}</div>
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        <div className="space-y-2">{children}</div>
    </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-center py-2 px-1">
        <div className="text-slate-400 w-6 mr-3">{icon}</div>
        <div className="flex-grow">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-base font-medium text-slate-100">{value}</p>
        </div>
    </div>
);

const FeaturePlaceholder: React.FC<{ icon: React.ReactNode; title: string; message: string }> = ({ icon, title, message }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn flex-grow">
        <div className="w-28 h-28 mb-6 text-indigo-400 opacity-60">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="max-w-xs">{message}</p>
    </div>
);

// --- START: RESULTS TAB REDESIGN COMPONENTS ---

const StatPod: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 p-4 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20`, color: color }}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-slate-100">{value}</p>
        </div>
    </div>
);

const GradeOrb: React.FC<{ grade: GradeItem, index: number }> = ({ grade, index }) => {
    const info = getGradeInfo(grade.grade);
    return (
        <div className="relative group flex flex-col items-center">
            <div
                className={`grade-orb-visual relative rounded-full flex items-center justify-center font-extrabold cursor-pointer transition-all duration-300 ${info.size}`}
                style={{
                    backgroundColor: `${info.color}30`,
                    color: info.textColor,
                    border: `2px solid ${info.color}80`,
                    boxShadow: `0 0 15px 0px ${info.shadowColor}`,
                    '--glow-color': info.color,
                    '--orb-delay': `${index * 80}ms`
                } as React.CSSProperties}
            >
                <span className="text-2xl" style={{ textShadow: `0 0 8px ${info.shadowColor}`}}>{grade.grade}</span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-3 w-48 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                <p className="font-bold text-slate-100">{info.name}</p>
                <p className="text-sm text-slate-300">{grade.type}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(grade.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
            </div>
        </div>
    );
};

const ResultsTab: React.FC<{ grades: GradeItem[], studentName: string, isStudentView: boolean, onManageGrades: () => void }> = ({ grades, studentName, isStudentView, onManageGrades }) => {
    const { overallAverage, bestSubject, groupedGrades } = useMemo(() => {
        if (grades.length === 0) {
            return { overallAverage: 'N/D', bestSubject: 'N/D', groupedGrades: {} };
        }

        const sum = grades.reduce((acc, g) => acc + g.grade, 0);
        const avg = (sum / grades.length).toFixed(1);

        const gradesBySubject: { [key: string]: number[] } = {};
        grades.forEach(g => {
            if (!gradesBySubject[g.subject]) {
                gradesBySubject[g.subject] = [];
            }
            gradesBySubject[g.subject].push(g.grade);
        });

        let bestSub = 'N/D';
        let bestAvg = 0;
        for (const subject in gradesBySubject) {
            const subjectAvg = gradesBySubject[subject].reduce((a, b) => a + b, 0) / gradesBySubject[subject].length;
            if (subjectAvg > bestAvg) {
                bestAvg = subjectAvg;
                bestSub = subject;
            }
        }
        
        const grouped = grades.reduce((acc, grade) => {
            (acc[grade.subject] = acc[grade.subject] || []).push(grade);
            return acc;
        }, {} as Record<string, GradeItem[]>);
        
        // Sort grades within each subject by date
        for(const subject in grouped) {
            grouped[subject].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        return { overallAverage: avg, bestSubject: bestSub, groupedGrades: grouped };
    }, [grades]);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        const targets = document.querySelectorAll('.cosmic-river-animate');
        targets.forEach((target) => observer.observe(target));

        return () => {
            targets.forEach((target) => observer.unobserve(target));
        };
    }, [grades]);

    if (grades.length === 0) {
        return (
             <div className="flex-grow flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
                <div className="w-28 h-28 mb-6 mx-auto text-cyan-400 opacity-50">{ICONS.medal}</div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Pronti, partenza... voti!</h3>
                <p className="max-w-xs mx-auto text-slate-300">La bacheca dei trionfi di {studentName.split(' ')[0]} è pronta. Aggiungi la prima valutazione per iniziare a riempirla!</p>
                {!isStudentView && 
                    <button onClick={onManageGrades} className="mt-6 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300">
                        {ICONS.plus}
                        <span>Aggiungi Voto</span>
                    </button>
                }
            </div>
        )
    }

    return (
        <div className="relative flex flex-col h-full">
            <div id="stars-container" className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
            </div>

            <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 cosmic-river-animate">
                    <StatPod title="Media Generale" value={overallAverage} icon={ICONS.activity} color="#60a5fa" />
                    <StatPod title="Materia Migliore" value={bestSubject} icon={ICONS.rocket} color="#4ade80" />
                    <StatPod title="Valutazioni Totali" value={String(grades.length)} icon={ICONS.clipboard} color="#facc15" />
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pb-8 -mx-4 lg:-mx-8 px-4 lg:px-8">
                <div className="space-y-12">
                    {Object.entries(groupedGrades).map(([subject, subjectGrades], i) => (
                        <div key={subject} className="subject-group cosmic-river-animate">
                            <div className="subject-header flex items-center mb-6">
                                <div className="subject-line flex-grow h-px bg-slate-700/50"></div>
                                <h3 className="subject-title text-2xl font-bold text-slate-200 mx-4 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">{subject}</h3>
                                <div className="subject-line flex-grow h-px bg-slate-700/50"></div>
                            </div>
                            <div className="flex justify-center items-end flex-wrap gap-x-8 gap-y-12 relative pt-8">
                                {/* Connection lines */}
                                <svg className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" style={{stopColor: 'rgba(56,189,248,0)'}} />
                                            <stop offset="50%" style={{stopColor: 'rgba(56,189,248,0.3)'}} />
                                            <stop offset="100%" style={{stopColor: 'rgba(56,189,248,0)'}} />
                                        </linearGradient>
                                    </defs>
                                    {subjectGrades.length > 1 &&
                                        <path d={`M ${100/(subjectGrades.length*2)}% 50% ` + subjectGrades.slice(1).map((_, idx) => `L ${(100/(subjectGrades.length*2)) * (idx*2 + 3)}% 50%`).join(' ')} stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5 5" fill="none" />
                                    }
                                </svg>
                                {subjectGrades.map((grade, index) => (
                                    <GradeOrb key={grade.id} grade={grade} index={index} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {!isStudentView &&
                    <div className="text-center mt-12 cosmic-river-animate">
                         <button onClick={onManageGrades} className="text-cyan-400 hover:text-cyan-300 font-semibold text-base flex items-center space-x-2 p-2 mx-auto">
                            {React.cloneElement(ICONS.edit, { width: 20, height: 20 })}
                            <span>Gestisci Valutazioni</span>
                        </button>
                    </div>
                }
            </div>
        </div>
    );
};

// --- END: RESULTS TAB REDESIGN COMPONENTS ---

const SHIMMER_SOUND_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
const playSound = (soundUrl: string) => {
    try {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Error playing sound:", e));
    } catch (e) {
        console.error("Could not create Audio object:", e);
    }
};

const AvatarSvg: React.FC<{ imageUrl: string; uniqueId: string; className?: string }> = ({ imageUrl, uniqueId, className = '' }) => (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 86.6 100" preserveAspectRatio="xMidYMid meet">
        <defs>
            <clipPath id={`hexClip-${uniqueId}`}>
                <polygon points="43.3 0, 86.6 25, 86.6 75, 43.3 100, 0 75, 0 25" />
            </clipPath>
        </defs>
        <image
            href={imageUrl}
            clipPath={`url(#hexClip-${uniqueId})`}
            width="86.6"
            height="100"
            preserveAspectRatio="xMidYMid slice"
        />
    </svg>
);


const FuturisticProfileHeader: React.FC<{
  student: Student;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile: boolean;
  isAvatarUpdating: boolean;
  previousAvatarUrl: string | null;
}> = ({ student, handleAvatarChange, isMobile, isAvatarUpdating, previousAvatarUrl }) => {
    const uniqueId = isMobile ? 'mobile' : 'desktop';
    
    return (
        <div className={`relative flex flex-col items-center text-center overflow-hidden ${isMobile ? 'pt-2 pb-3' : 'p-4 mb-10'}`}>
            <div className="absolute inset-0 z-0 animated-hud-background">
                <div className="grid-layer"></div>
                <div className="aurora-layer"></div>
            </div>
            
            <div className={`relative z-10 ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}>
                 <div className={`avatar-wrapper ${isAvatarUpdating ? 'is-updating' : ''}`}>
                    {isAvatarUpdating && previousAvatarUrl ? (
                        <>
                            <div className="avatar-old absolute inset-0 w-full h-full">
                                <AvatarSvg imageUrl={previousAvatarUrl} uniqueId={`${uniqueId}-old`} />
                            </div>
                            <div className="avatar-new absolute inset-0 w-full h-full">
                                <AvatarSvg imageUrl={student.avatarUrl} uniqueId={`${uniqueId}-new`} />
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 w-full h-full">
                            <AvatarSvg imageUrl={student.avatarUrl} uniqueId={`${uniqueId}-current`} />
                        </div>
                    )}
                </div>
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 86.6 100" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id={`hexGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#67e8f9', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                        </linearGradient>
                    </defs>
                    <polygon
                        className="hud-hexagon-animated"
                        points="43.3 0, 86.6 25, 86.6 75, 43.3 100, 0 75, 0 25"
                        stroke={`url(#hexGradient-${uniqueId})`}
                        strokeWidth="1.5"
                        fill="none"
                    />
                    <polygon
                        points="43.3 6, 81.8 28, 81.8 72, 43.3 94, 4.8 72, 4.8 28"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1"
                        className="opacity-20"
                    />
                </svg>
                
                <label htmlFor={`student-avatar-edit-${uniqueId}`} className="absolute -bottom-1 -right-1 z-20 bg-slate-800 border-2 border-cyan-500 rounded-full p-1.5 cursor-pointer hover:bg-cyan-900/50 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-cyan-500/20">
                    {React.cloneElement(ICONS.camera, { width: 12, height: 12, className: 'text-cyan-400' })}
                </label>
                <input id={`student-avatar-edit-${uniqueId}`} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
            
            <div className="relative z-10 mt-3">
                <h2 className={`font-bold tracking-wider uppercase ${isMobile ? 'text-xl' : 'text-2xl'}`} style={{textShadow: '0 0 10px rgba(34,211,238,0.5)'}}>{student.name}</h2>
                <p className={`mt-1 font-semibold tracking-widest text-cyan-300/80 bg-cyan-900/30 px-3 py-1 rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {student.className}
                </p>
            </div>
            
            <div className="absolute inset-0 w-full h-full pointer-events-none hud-deco-container z-10">
                 <div className="hud-corner top-0 left-0"></div>
                 <div className="hud-corner top-0 right-0 rotate-90"></div>
                 <div className="hud-corner bottom-0 left-0 -rotate-90"></div>
                 <div className="hud-corner bottom-0 right-0 rotate-180"></div>
            </div>
        </div>
    );
};

const SimpleProfileHeader: React.FC<{
  student: Student;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile: boolean;
  isAvatarUpdating: boolean;
  previousAvatarUrl: string | null;
}> = ({ student, handleAvatarChange, isMobile, isAvatarUpdating, previousAvatarUrl }) => {
    const uniqueId = isMobile ? 'mobile-simple' : 'desktop-simple';
    return (
        <div className={`flex flex-col items-center text-center ${isMobile ? 'pt-2 pb-3' : 'p-4 mb-10'}`}>
            <div className={`relative ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} avatar-wrapper ${isAvatarUpdating ? 'is-updating' : ''}`}>
                {isAvatarUpdating && previousAvatarUrl ? (
                    <>
                        <img
                            key={previousAvatarUrl}
                            src={previousAvatarUrl}
                            alt="Avatar precedente"
                            className="avatar-old w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg absolute inset-0"
                        />
                        <img
                            key={student.avatarUrl}
                            src={student.avatarUrl}
                            alt="Nuovo avatar"
                            className="avatar-new w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg absolute inset-0"
                        />
                    </>
                ) : (
                    <img
                        key={student.avatarUrl}
                        src={student.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg"
                    />
                )}
                <label htmlFor={`student-avatar-edit-${uniqueId}`} className="absolute -bottom-1 -right-1 z-20 bg-slate-800 border-2 border-cyan-500 rounded-full p-1.5 cursor-pointer hover:bg-cyan-900/50 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-cyan-500/20">
                    {React.cloneElement(ICONS.camera, { width: 12, height: 12, className: 'text-cyan-400' })}
                </label>
                <input id={`student-avatar-edit-${uniqueId}`} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
            
            <div className="relative z-10 mt-3">
                <h2 className={`font-bold text-slate-100 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{student.name}</h2>
                <p className={`mt-1 font-semibold text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {student.className}
                </p>
            </div>
        </div>
    );
};


interface StudentDetailPageProps {
    isStudentView?: boolean;
}

const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ isStudentView = false }) => {
    const { students: allStudents, currentStudent: studentProp, handleUpdateStudent: onUpdateStudent, grades: allGrades, isDevUser, handleLogout: onLogout, handleStudentLogout } = useAppContext();
    const { studentId } = useParams<{ studentId: string }>();
    
    const student = isStudentView ? studentProp : allStudents.find(s => s.id === studentId);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'Informazioni';
    
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isParentsModalOpen, setIsParentsModalOpen] = useState(false);
    
    const [editedContact, setEditedContact] = useState(student?.contact);
    const [editedParents, setEditedParents] = useState<Parent[]>(student?.parents || []);

    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
    const [previousAvatarUrl, setPreviousAvatarUrl] = useState<string | null>(null);
    
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const [lastLoggedTab, setLastLoggedTab] = useState<string>(activeTab);

    useEffect(() => {
        const logActivityForTab = async () => {
            if (!isStudentView || !student || activeTab === lastLoggedTab) return;
    
            let activityType: ActivityType | null = null;
            if (activeTab === 'Risultati') {
                activityType = 'VIEW_RESULTS';
            } else if (activeTab === 'Informazioni') {
                activityType = 'VIEW_INFO';
            }
    
            if (activityType) {
                const sessionDataJSON = sessionStorage.getItem('currentStudent');
                if (sessionDataJSON) {
                    try {
                        const sessionData = JSON.parse(sessionDataJSON);
                        const newActivity: ActivityRecord = {
                            id: `activity-${Date.now()}`,
                            sessionId: sessionData.sessionId,
                            studentId: student.id,
                            timestamp: Date.now(),
                            type: activityType,
                        };
                        await db.dbPut(db.STORES.ACTIVITIES, newActivity);
                        setLastLoggedTab(activeTab);
                    } catch (e) {
                        console.error("Failed to log activity", e);
                    }
                }
            }
        };

        logActivityForTab();
    }, [activeTab, student, isStudentView, lastLoggedTab]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(file);
             e.target.value = ''; // Allow re-selecting the same file
        }
    };

     const handleCropSave = async (croppedImage: string) => {
        if (!student) return;
        setPreviousAvatarUrl(student.avatarUrl);
        setIsAvatarUpdating(true);
        playSound(SHIMMER_SOUND_BASE64);

        if (isStudentView) {
            const sessionDataJSON = sessionStorage.getItem('currentStudent');
            if (sessionDataJSON) {
                const sessionData = JSON.parse(sessionDataJSON);
                const newActivity: ActivityRecord = {
                    id: `activity-${Date.now()}`,
                    sessionId: sessionData.sessionId,
                    studentId: student.id,
                    timestamp: Date.now(),
                    type: 'AVATAR_UPDATE',
                    payload: {
                        oldValue: student.avatarUrl,
                        newValue: croppedImage,
                    }
                };
                await db.dbPut(db.STORES.ACTIVITIES, newActivity);
            }
        }
        
        onUpdateStudent(student.id, { avatarUrl: croppedImage });
        setImageToCrop(null);

        setTimeout(() => {
            setIsAvatarUpdating(false);
            setPreviousAvatarUrl(null);
        }, 3000);
    };
    
    const generateAccessCode = () => {
        if (!student) return;
        const namePart = student.name.slice(0, 3).toUpperCase();
        const classPart = student.className.replace(/[^A-Z0-9]/ig, "").slice(0, 3).toUpperCase();
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const newCode = `${namePart}${classPart}-${randomPart}`;
        onUpdateStudent(student.id, { accessCode: newCode });
    };

    const copyCodeToClipboard = () => {
        if (!student?.accessCode) return;
        navigator.clipboard.writeText(student.accessCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSaveContact = () => {
        if (student && editedContact) {
            onUpdateStudent(student.id, { contact: editedContact });
            setIsContactModalOpen(false);
        }
    };

    const handleSaveParents = () => {
        if (student) {
            const nonEmptyParents = editedParents.filter(p => p.name.trim() !== '' || p.contact.trim() !== '');
            onUpdateStudent(student.id, { parents: nonEmptyParents });
            setIsParentsModalOpen(false);
        }
    };

    const handleParentChange = (index: number, field: keyof Parent, value: string) => {
        const newParents = [...editedParents];
        newParents[index] = { ...newParents[index], [field]: value };
        setEditedParents(newParents);
    };

    const handleAddParent = () => {
        setEditedParents([...editedParents, { name: '', contact: '' }]);
    };

    const handleRemoveParent = (index: number) => {
        setEditedParents(editedParents.filter((_, i) => i !== index));
    };
    
    const handleTabClick = (tabName: string) => {
        setSearchParams({ tab: tabName }, { replace: true });
    };


    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-300">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Studente non Trovato</h1>
                    <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-cyan-500 rounded-lg">Torna Indietro</button>
                </div>
            </div>
        );
    }
    
    const studentGrades = allGrades.filter(g => g.studentId === student.id);
    
    const TABS = [
        { name: 'Informazioni', icon: React.cloneElement(ICONS.user_profile, { width: 20, height: 20 }) },
        { name: 'Risultati', icon: React.cloneElement(ICONS.medal, { width: 20, height: 20 }) },
        { name: 'Frequenza', icon: React.cloneElement(ICONS.calendar, { width: 20, height: 20 }), disabled: isStudentView },
        { name: 'Note', icon: React.cloneElement(ICONS.clipboard, { width: 20, height: 20 }), disabled: isStudentView },
    ].filter(tab => !tab.disabled);

    const studentLogoutButton = (
        <button onClick={handleStudentLogout} className="flex items-center space-x-2 text-cyan-400 font-semibold px-3 py-2 rounded-full hover:bg-cyan-900/40 transition-colors duration-200">
            <span>Esci</span>
            {React.cloneElement(ICONS.logout, { width: 20, height: 20 })}
        </button>
    );

    const editButton = (onClick: () => void) => (
      <button onClick={onClick} className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center space-x-1 p-1">
          {React.cloneElement(ICONS.edit, { width: 16, height: 16 })}
          <span>Modifica</span>
      </button>
    );

    const tabContent = (
        <div className="h-full flex flex-col">
            {activeTab === 'Informazioni' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideInUp">
                    <InfoCard title="Contatti Studente" icon={ICONS.phone} action={!isStudentView ? editButton(() => { setEditedContact(student.contact); setIsContactModalOpen(true); }) : null}>
                        <InfoRow icon={ICONS.phone} label="Telefono" value={student.contact.phone || "Non specificato"} />
                        <InfoRow icon={ICONS.email} label="Email" value={student.contact.email || "Non specificato"} />
                        <InfoRow icon={ICONS.map_pin} label="Indirizzo" value={student.contact.address || "Non specificato"} />
                    </InfoCard>
                    <InfoCard title="Il Fan Club (Genitori)" icon={ICONS.group_outline} action={!isStudentView ? editButton(() => { setEditedParents(student.parents || []); setIsParentsModalOpen(true); }) : null}>
                        {student.parents && student.parents.length > 0 ? (
                            <div className="space-y-3">
                                {student.parents.map((parent, index) => (
                                    <div key={index} className="bg-slate-700/50 p-4 rounded-xl flex items-center space-x-4 hover:bg-slate-700 transition-colors duration-200">
                                        <div className="bg-slate-800/80 p-3 rounded-full text-slate-400 shadow-sm">{ICONS.user_profile}</div>
                                        <div>
                                            <p className="font-semibold text-slate-100">{parent.name || 'Nome non specificato'}</p>
                                            <div className="text-sm text-slate-300 flex items-center space-x-1.5 mt-1">
                                                {React.cloneElement(ICONS.phone, { width: 14, height: 14, className: 'text-slate-400 flex-shrink-0' })}
                                                <span>{parent.contact || 'Contatto non specificato'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-slate-400 py-8 px-4">
                                <p className="max-w-xs text-sm text-slate-400">Nessun contatto di riferimento aggiunto.</p>
                            </div>
                        )}
                    </InfoCard>
                    {!isStudentView && (
                        <InfoCard title="Accesso Studente" icon={ICONS.key} action={<button onClick={() => setIsCodeModalOpen(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md">Gestisci</button>} className="lg:col-span-2">
                            <p className="text-sm text-slate-300 px-1">{student.accessCode ? "Lo studente può accedere con il codice qui sotto." : "Genera un codice per consentire allo studente di accedere."}</p>
                            {student.accessCode && <p className="text-2xl font-mono text-center py-2 text-cyan-300 bg-cyan-900/40 rounded-lg tracking-widest">{student.accessCode}</p>}
                        </InfoCard>
                    )}
                </div>
            )}
            {activeTab === 'Risultati' && (
                 <ResultsTab 
                    grades={studentGrades} 
                    studentName={student.name}
                    isStudentView={isStudentView}
                    onManageGrades={() => navigate(`/student/${student.id}/grades`)}
                 />
            )}
            {activeTab === 'Frequenza' && <FeaturePlaceholder icon={ICONS.calendar} title="Operazione Presenza" message="Qui tracceremo le sue apparizioni. Speriamo non serva un radar per trovarlo!" />}
            {activeTab === 'Note' && <FeaturePlaceholder icon={ICONS.clipboard} title="Diario di Bordo" message="Il suo diario di bordo è immacolato. O è un santo, o i suoi piani sono troppo perfetti per essere scoperti. 😉" />}
        </div>
    );

    return (
        <>
            <div className="flex flex-col lg:flex-row w-full h-screen bg-slate-900 text-slate-300 overflow-hidden">
                
                <aside className="hidden lg:flex flex-col w-72 bg-slate-800/50 backdrop-blur-lg border-r border-slate-700/50 p-6 flex-shrink-0">
                    {isStudentView ? (
                        <FuturisticProfileHeader student={student} handleAvatarChange={handleAvatarChange} isMobile={false} isAvatarUpdating={isAvatarUpdating} previousAvatarUrl={previousAvatarUrl} />
                    ) : (
                        <SimpleProfileHeader student={student} handleAvatarChange={handleAvatarChange} isMobile={false} isAvatarUpdating={isAvatarUpdating} previousAvatarUrl={previousAvatarUrl} />
                    )}

                    <nav className="flex flex-col space-y-2">
                        {TABS.map(tab => (
                            <button key={tab.name} onClick={() => handleTabClick(tab.name)} className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-semibold ${activeTab === tab.name ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-700'}`}>
                                {tab.icon}
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto">
                        {isStudentView ? (
                            <button onClick={handleStudentLogout} className="w-full flex items-center justify-center space-x-2 text-slate-400 font-semibold px-3 py-3 rounded-lg hover:bg-red-900/40 hover:text-red-300 transition-colors duration-200">
                                {React.cloneElement(ICONS.logout, { width: 20, height: 20 })}
                                <span>Esci</span>
                            </button>
                        ) : (
                            <button onClick={() => navigate(-1)} className="w-full flex items-center justify-center space-x-2 text-slate-400 font-semibold px-3 py-3 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                                {React.cloneElement(ICONS.back, {strokeWidth: 2.5, className: 'h-5 w-5'})}
                                <span>Indietro</span>
                            </button>
                        )}
                    </div>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* MOBILE FIXED HEADER */}
                    <div className="lg:hidden flex-shrink-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
                        <header className="flex items-center justify-between p-4">
                            {!isStudentView ? (
                                <button onClick={() => navigate(-1)} className="text-slate-200 p-2 -ml-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                </button>
                            ) : <div className="w-6" />}
                            <h1 className="text-xl font-semibold text-slate-100">{isStudentView ? "Il Tuo Profilo" : student.name}</h1>
                            <div className="flex items-center space-x-1">
                                {isStudentView ? studentLogoutButton : (isDevUser && onLogout ? <button onClick={onLogout} className="text-slate-300 p-2 -mr-2">{ICONS.logout}</button> : <div className="w-6" />)}
                            </div>
                        </header>
                        <div className="animate-fadeIn px-4 pt-0 pb-4">
                             {isStudentView ? (
                                <FuturisticProfileHeader student={student} handleAvatarChange={handleAvatarChange} isMobile={true} isAvatarUpdating={isAvatarUpdating} previousAvatarUrl={previousAvatarUrl} />
                            ) : (
                                <SimpleProfileHeader student={student} handleAvatarChange={handleAvatarChange} isMobile={true} isAvatarUpdating={isAvatarUpdating} previousAvatarUrl={previousAvatarUrl} />
                            )}
                        </div>
                        <div className="flex items-center space-x-2 overflow-x-auto pb-3 px-4">
                            {TABS.map(tab => <TabButtonMobile key={tab.name} label={tab.name} icon={tab.icon} isActive={activeTab === tab.name} onClick={() => handleTabClick(tab.name)} />)}
                        </div>
                    </div>

                    {/* SCROLLABLE CONTENT (MOBILE + DESKTOP) */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <div className="flex-grow flex flex-col p-4 lg:p-8">
                            {tabContent}
                        </div>
                    </div>
                </main>
            </div>
            
            <ImageCropperModal
                imageSrc={imageToCrop}
                onSave={handleCropSave}
                onClose={() => setImageToCrop(null)}
            />

             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; }

                /* --- Spettacolare Nova Burst Animation --- */
                .grade-orb-visual {
                    position: relative;
                    z-index: 1;
                }

                .grade-orb-visual::before,
                .grade-orb-visual::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border: 2px solid var(--glow-color);
                    border-radius: 50%;
                    opacity: 0;
                    pointer-events: none;
                }
                
                @keyframes nova-burst-ring {
                    from {
                        transform: scale(0.8);
                        opacity: 1;
                    }
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                @keyframes nova-pulse {
                    0%, 100% {
                        transform: scale(1.15);
                        box-shadow: 0 0 20px 2px var(--glow-color);
                    }
                    50% {
                        transform: scale(1.2);
                        box-shadow: 0 0 35px 8px var(--glow-color);
                    }
                }
                
                .group:hover .grade-orb-visual {
                    animation: nova-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                }

                .group:hover .grade-orb-visual::before {
                    animation: nova-burst-ring 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                .group:hover .grade-orb-visual::after {
                    animation: nova-burst-ring 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                    animation-delay: 0.15s;
                }
                
                /* --- Fiume Cosmico Scroll Animation --- */
                .cosmic-river-animate {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
                }

                .cosmic-river-animate.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .subject-group.is-visible .subject-header .subject-line {
                    transform: scaleX(1);
                    transition: transform 1s cubic-bezier(0.25, 1, 0.5, 1) 0.3s;
                }
                .subject-group .subject-header .subject-line {
                    transform: scaleX(0);
                    transform-origin: left;
                }
                .subject-group .subject-header .subject-line:nth-of-type(2) {
                    transform-origin: right;
                }


                .subject-group.is-visible .subject-header .subject-title {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.6s ease-out 0.6s, transform 0.6s ease-out 0.6s;
                }
                .subject-group .subject-header .subject-title {
                    opacity: 0;
                    transform: translateY(10px);
                }

                .subject-group.is-visible .grade-orb-visual {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
                    transition-delay: calc(0.8s + var(--orb-delay));
                }
                .subject-group .grade-orb-visual {
                    transform: scale(0.5) translateY(20px);
                    opacity: 0;
                }


                /* Starfield background */
                #stars-container {
                    background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
                }
                @keyframes move-stars {
                    from {transform: translateY(0px);}
                    to {transform: translateY(-2000px);}
                }
                #stars, #stars2, #stars3 {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    height: 2px;
                    width: 2px;
                    background: transparent;
                    border-radius: 50%;
                    box-shadow: 
                        -37vw 18vh 0px 0px #FFF, 25vw 52vh 0px 0px #FFF, 9vw 7vh 0px 0px #FFF, 4vw 46vh 0px 0px #FFF,
                        -23vw 38vh 0px 0px #FFF, -49vw 8vh 0px 0px #FFF, 12vw 19vh 0px 0px #FFF, -4vw 61vh 0px 0px #FFF,
                        -2vw 70vh 0px 0px #FFF, -32vw 92vh 0px 0px #FFF, -17vw 64vh 0px 0px #FFF, 24vw 87vh 0px 0px #FFF;
                    animation: move-stars 200s linear infinite;
                }
                #stars2 {
                    box-shadow: 
                        4vw 85vh 0px 0px #FFF, -12vw 4vh 0px 0px #FFF, 32vw 97vh 0px 0px #FFF, 4vw 29vh 0px 0px #FFF,
                        32vw 45vh 0px 0px #FFF, 48vw 98vh 0px 0px #FFF, -49vw 88vh 0px 0px #FFF, -30vw 92vh 0px 0px #FFF;
                    animation-duration: 400s;
                }
                #stars3 {
                    box-shadow: 
                        -1vw 86vh 0px 0px #FFF, 2vw 21vh 0px 0px #FFF, -1vw 34vh 0px 0px #FFF, -30vw 23vh 0px 0px #FFF,
                        46vw 53vh 0px 0px #FFF, 3vw 6vh 0px 0px #FFF, -42vw 21vh 0px 0px #FFF, 3vw 2vh 0px 0px #FFF;
                    animation-duration: 600s;
                }

                /* --- HUD Header Styles --- */
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes trace-hexagon {
                    from { stroke-dashoffset: 250; }
                    to { stroke-dashoffset: 0; }
                }

                .hud-hexagon-animated {
                    stroke-dasharray: 250;
                    stroke-dashoffset: 250;
                    animation: trace-hexagon 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.5s, spin-slow 40s linear infinite 3s;
                    transform-origin: center;
                }

                .hud-deco-container {
                    opacity: 0;
                    animation: fadeIn 1s ease-out 0.2s forwards;
                }

                .hud-corner {
                    position: absolute;
                    width: 2rem;
                    height: 2rem;
                    border-top: 2px solid #22d3ee;
                    border-left: 2px solid #22d3ee;
                    opacity: 0.5;
                }

                /* --- NEW: Animated Header Background --- */
                .animated-hud-background {
                    background: #020617; /* slightly darker for depth */
                    overflow: hidden;
                }
                .grid-layer {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(to right, rgba(0, 194, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 194, 255, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                    animation: move-grid-lines 10s linear infinite;
                }
                .aurora-layer {
                    position: absolute; top: 0; left: 0;
                    width: 200%; height: 200%;
                    background:
                        radial-gradient(circle at 25% 25%, rgba(0, 194, 255, 0.2), transparent 20%),
                        radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.15), transparent 20%);
                    animation: move-aurora 15s ease-in-out infinite alternate;
                }

                @keyframes move-grid-lines {
                    0% { background-position: 0 0; }
                    100% { background-position: 20px 20px; }
                }

                @keyframes move-aurora {
                    0% { transform: translate(0%, 0%); }
                    100% { transform: translate(-50%, -50%); }
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
                    0% { filter: drop-shadow(0 0 0px rgba(34, 211, 238, 0.0)); }
                    50% { filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.7)); }
                    100% { filter: drop-shadow(0 0 0px rgba(34, 211, 238, 0.0)); }
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
                
                .avatar-wrapper { position: relative; width: 100%; height: 100%; }

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
                    top: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%; /* Approx for hexagon */
                    border: 2px solid transparent;
                    pointer-events: none;
                    z-index: 5;
                    animation: particle-effect 1.5s cubic-bezier(0.19, 1, 0.22, 1) 1s forwards;
                }

                .avatar-wrapper.is-updating::after {
                    animation-delay: 1.3s;
                }

            `}</style>

            <Modal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} title="Gestisci Codice Accesso" closeOnOverlayClick={false}>
                {student && (
                    <div className="space-y-6 text-center">
                        <div className="p-4 bg-yellow-900/50 border border-yellow-700/50 rounded-lg text-sm text-yellow-300"><strong>Nota:</strong> Condividi il codice solo con lo studente o i suoi genitori.</div>
                        {student.accessCode ? (
                            <div>
                                <p className="text-slate-400 mb-2">Codice di accesso attuale:</p>
                                <p className="text-3xl font-mono text-center py-3 text-cyan-300 bg-cyan-900/40 rounded-lg tracking-widest mb-4">{student.accessCode}</p>
                                <button onClick={copyCodeToClipboard} className="w-full mb-3 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600">{copied ? 'Copiato!' : 'Copia Codice'}</button>
                                <button onClick={generateAccessCode} className="w-full px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Rigenera Nuovo Codice</button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-400 mb-4">Nessun codice generato.</p>
                                <button onClick={generateAccessCode} className="w-full px-5 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600">Genera Codice</button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title="Modifica Contatti Studente" closeOnOverlayClick={false}>
                {editedContact && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-300 mb-1">Telefono</label>
                            <input id="contactPhone" type="tel" value={editedContact.phone} onChange={(e) => setEditedContact({...editedContact, phone: e.target.value})} placeholder="Numero di telefono" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                            <input id="contactEmail" type="email" value={editedContact.email} onChange={(e) => setEditedContact({...editedContact, email: e.target.value})} placeholder="Indirizzo email" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="contactAddress" className="block text-sm font-medium text-slate-300 mb-1">Indirizzo</label>
                            <input id="contactAddress" type="text" value={editedContact.address} onChange={(e) => setEditedContact({...editedContact, address: e.target.value})} placeholder="Indirizzo di residenza" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button onClick={() => setIsContactModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleSaveContact} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600">Salva</button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal isOpen={isParentsModalOpen} onClose={() => setIsParentsModalOpen(false)} title="Modifica Genitori/Tutori" closeOnOverlayClick={false}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {editedParents.map((parent, index) => (
                        <div key={index} className="p-4 bg-slate-700/50 rounded-xl space-y-3 relative border border-slate-600">
                            <button onClick={() => handleRemoveParent(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1" aria-label="Rimuovi genitore">{React.cloneElement(ICONS.trash, { width: 18, height: 18 })}</button>
                            <div>
                                <label htmlFor={`parentName-${index}`} className="block text-sm font-medium text-slate-300 mb-1">Nome Genitore {index + 1}</label>
                                <input id={`parentName-${index}`} type="text" value={parent.name} onChange={(e) => handleParentChange(index, 'name', e.target.value)} placeholder="Nome e Cognome" className="w-full px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                            </div>
                            <div>
                                <label htmlFor={`parentContact-${index}`} className="block text-sm font-medium text-slate-300 mb-1">Contatto Genitore {index + 1}</label>
                                <input id={`parentContact-${index}`} type="text" value={parent.contact} onChange={(e) => handleParentChange(index, 'contact', e.target.value)} placeholder="Telefono o Email" className="w-full px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddParent} className="w-full flex items-center justify-center space-x-2 py-3 mt-2 rounded-lg text-sm font-medium text-cyan-300 bg-cyan-900/40 hover:bg-cyan-900/60 transition-colors">{ICONS.plus}<span>Aggiungi Genitore</span></button>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                    <button onClick={() => setIsParentsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                    <button onClick={handleSaveParents} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600">Salva</button>
                </div>
            </Modal>
        </>
    );
};

export default StudentDetailPage;