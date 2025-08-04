

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { ICONS } from './constants';
import * as db from './db';
import type { SessionRecord, ActivityRecord, Student, User, ActivityType } from './constants';
import { useAppContext } from './AppContext';

const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 0) return '0s';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    // Always show seconds if the duration is less than an hour
    if (hours === 0 && (minutes > 0 || seconds > 0 || totalSeconds === 0)) {
        result += `${seconds}s`;
    }
    
    return result.trim() || '0s';
};


const AnimatedDigit: React.FC<{ digit: number }> = ({ digit }) => {
    const translateY = `translateY(-${digit * 10}%)`;
    return (
        <div className="h-[1em] overflow-hidden">
            <div
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: translateY }}
            >
                {'0123456789'.split('').map(d => (
                    <div key={d} className="h-[1em] leading-[1em]">{d}</div>
                ))}
            </div>
        </div>
    );
};

const AnimatedCounter: React.FC<{ durationMs: number }> = ({ durationMs }) => {
    const formattedTime = useMemo(() => formatDuration(durationMs), [durationMs]);

    const parts = useMemo(() => {
        const result: React.ReactNode[] = [];
        let currentNumber = '';

        const pushNumber = () => {
            if (currentNumber) {
                result.push(
                    <div key={`num-${result.length}`} className="flex">
                        {currentNumber.split('').map((digit, i) => (
                            <AnimatedDigit key={i} digit={parseInt(digit, 10)} />
                        ))}
                    </div>
                );
                currentNumber = '';
            }
        };

        for (const char of formattedTime) {
            if (!isNaN(parseInt(char, 10))) {
                currentNumber += char;
            } else {
                pushNumber();
                result.push(<span key={`char-${result.length}`}>{char}</span>);
            }
        }
        pushNumber(); // Push any remaining number
        return result;
    }, [formattedTime]);

    return (
        <div className="flex items-center justify-center text-lg font-bold text-slate-100" style={{fontVariantNumeric: 'tabular-nums'}}>
            {parts}
        </div>
    );
};


const activityTypeInfo: { [key in ActivityType]: { icon: React.ReactElement, color: string } } = {
    'LOGIN': { icon: ICONS.key, color: 'text-green-400' },
    'LOGOUT': { icon: ICONS.logout, color: 'text-red-400' },
    'VIEW_INFO': { icon: ICONS.info, color: 'text-teal-400' },
    'VIEW_RESULTS': { icon: ICONS.eye, color: 'text-blue-400' },
    'AVATAR_UPDATE': { icon: ICONS.camera, color: 'text-purple-400' },
};

const ActivityItem: React.FC<{ activity: ActivityRecord }> = ({ activity }) => {
    const info = activityTypeInfo[activity.type] || { icon: ICONS.activity, color: 'text-slate-400' };
    
    const getDescription = (): React.ReactNode => {
        switch (activity.type) {
            case 'LOGIN': return <span>Sessione <strong>iniziata</strong>.</span>;
            case 'LOGOUT': return <span>Sessione <strong>terminata</strong>.</span>;
            case 'VIEW_INFO': return <span>Ha visualizzato la pagina delle <strong>informazioni</strong>.</span>;
            case 'VIEW_RESULTS': return <span>Ha visualizzato la pagina dei <strong>risultati</strong>.</span>;
            case 'AVATAR_UPDATE': return (
                <div className="flex flex-col">
                    <span>Ha <strong>aggiornato l'avatar</strong>.</span>
                    <div className="flex items-center space-x-2 mt-2 bg-slate-900/50 p-2 rounded-lg">
                        {activity.payload?.oldValue && <img src={activity.payload.oldValue} className="w-10 h-10 rounded-full object-cover" alt="Old avatar" />}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        {activity.payload?.newValue && <img src={activity.payload.newValue} className="w-10 h-10 rounded-full object-cover" alt="New avatar" />}
                    </div>
                </div>
            );
            default: return <span>Attività sconosciuta.</span>;
        }
    };

    return (
        <div className="flex space-x-4">
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center ${info.color} ring-4 ring-slate-900`}>
                    {React.cloneElement(info.icon, { width: 20, height: 20 })}
                </div>
                <div className="w-0.5 flex-grow bg-slate-700"></div>
            </div>
            <div className="flex-grow pb-8">
                <div className="bg-slate-800/50 p-4 rounded-xl -mt-1">
                    <p className="text-sm font-medium text-slate-300">{getDescription()}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(activity.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
};


const SessionDetailPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { students: allStudents } = useAppContext();
    const [session, setSession] = useState<SessionRecord | null>(null);
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [teacher, setTeacher] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [liveDuration, setLiveDuration] = useState<number | null>(null);

    const student = useMemo(() => {
        if (!session) return null;
        return allStudents.find(s => s.id === session.studentId) || null;
    }, [session, allStudents]);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const sessionRecord = await db.dbGetSessionById(sessionId);
                if (sessionRecord) {
                    setSession(sessionRecord);
                    const [activityRecords, teacherInfo] = await Promise.all([
                        db.dbGetActivitiesForSession(sessionId),
                        db.dbGetUserById(sessionRecord.teacherId)
                    ]);
                    setActivities(activityRecords.sort((a,b) => a.timestamp - b.timestamp));
                    setTeacher(teacherInfo || null);
                }
            } catch (error) {
                console.error("Failed to fetch session details:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) return;

        const channel = new BroadcastChannel('session-updates');

        const handleMessage = (event: MessageEvent) => {
            if (!event.data || !event.data.type) return;

            const { type, activity, session: updatedSession } = event.data;
            
            if (type === 'NEW_ACTIVITY' && activity && activity.sessionId === sessionId) {
                setActivities(prev => 
                    [...prev, activity].sort((a, b) => a.timestamp - b.timestamp)
                );
            }

            if (type === 'LOGOUT' && updatedSession && updatedSession.sessionId === sessionId) {
                setSession(prev => prev ? { ...prev, ...updatedSession } : updatedSession);
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [sessionId]);
    
    const isLive = session && !session.logoutTimestamp;

    useEffect(() => {
        let intervalId: number | undefined;
        if (isLive && session) {
            setLiveDuration(Date.now() - session.loginTimestamp);
            intervalId = window.setInterval(() => {
                setLiveDuration(Date.now() - session.loginTimestamp);
            }, 1000);
        } else {
            setLiveDuration(null);
        }

        return () => window.clearInterval(intervalId);
    }, [isLive, session]);


    if (loading) {
        return <Layout title="Caricamento..." showBack>
             <div className="flex items-center justify-center h-64">
                <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        </Layout>;
    }
    
    if (!session || !student) {
        return <Layout title="Errore" showBack backPath="/settings/access-report">
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-slate-100">Sessione non trovata</h2>
                <p className="text-slate-400 mt-2">Impossibile caricare i dettagli della sessione richiesta.</p>
            </div>
        </Layout>;
    }

    const duration = liveDuration !== null 
        ? liveDuration 
        : (session.logoutTimestamp ? session.logoutTimestamp - session.loginTimestamp : 0);
    
    return (
        <Layout title="Dettaglio Sessione" showBack backPath="/settings/access-report">
            <div className="bg-slate-800/60 p-5 rounded-2xl shadow-lg mb-6 flex items-center space-x-4 animate-fadeIn">
                <img src={student.avatarUrl} alt={student.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-700"/>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">{student.name}</h1>
                    <p className="text-slate-400">{student.className}</p>
                    <p className="text-xs text-slate-500 mt-1">Docente: {teacher?.firstName} {teacher?.lastName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slideInUp">
                 <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700">
                    <p className="text-xs text-slate-400 font-semibold">INIZIO</p>
                    <p className="text-lg font-bold text-slate-100">{new Date(session.loginTimestamp).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</p>
                    <p className="text-xs text-slate-500">{new Date(session.loginTimestamp).toLocaleDateString('it-IT')}</p>
                </div>
                 <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700">
                    <p className="text-xs text-slate-400 font-semibold">FINE</p>
                    {session.logoutTimestamp ? (
                        <>
                        <p className="text-lg font-bold text-slate-100">{new Date(session.logoutTimestamp).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</p>
                        <p className="text-xs text-slate-500">{new Date(session.logoutTimestamp).toLocaleDateString('it-IT')}</p>
                        </>
                    ) : (
                         <div className="flex items-center justify-center h-full">
                            <span className="text-green-400 font-bold text-lg animate-pulse">LIVE</span>
                        </div>
                    )}
                </div>
                 <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700 min-h-[78px] flex flex-col justify-center">
                    <p className="text-xs text-slate-400 font-semibold">DURATA</p>
                    <AnimatedCounter durationMs={duration} />
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-200 mb-4 ml-2 animate-slideInUp">Timeline Attività</h2>
            <div className="animate-slideInUp">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))
                ) : (
                     <div className="text-center py-10 text-slate-400">
                        <p>Nessuna attività specifica registrata per questa sessione.</p>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; animation-delay: 150ms; opacity: 0;}
            `}</style>
        </Layout>
    );
};

export default SessionDetailPage;