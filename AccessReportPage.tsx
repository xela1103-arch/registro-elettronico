

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import Modal from './Modal';
import { ICONS } from './constants';
import * as db from './db';
import type { SessionRecord, User, Student, ActivityRecord } from './constants';
import LiveDuration from './LiveDuration';
import { useAppContext } from './AppContext';

const AnimatedCheckbox: React.FC<{
    checked: boolean;
    onChange: () => void;
    className?: string;
}> = ({ checked, onChange, className = '' }) => {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onChange();
            }}
            className={`shrink-0 h-5 w-5 rounded flex items-center justify-center cursor-pointer transition-all duration-200 ${
                checked ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-700 border-slate-600 border'
            } ${className}`}
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onChange();
                }
            }}
        >
            {checked && (
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="checkmark"
                    />
                </svg>
            )}
        </div>
    );
};


const EmptyState: React.FC<{ title: string; message: string; }> = ({ title, message }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-20 px-4 mt-8 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
        <div className="w-32 h-32 mb-6 text-slate-600">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 49C25 51.2091 23.2091 53 21 53C18.7909 53 17 51.2091 17 49C17 46.7909 18.7909 45 21 45C23.2091 45 25 46.7909 25 49Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M47 33C47 35.2091 45.2091 37 43 37C40.7909 37 39 35.2091 39 33C39 30.7909 40.7909 29 43 29C45.2091 29 47 30.7909 47 33Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M29 19C29 21.2091 27.2091 23 25 23C22.7909 23 21 21.2091 21 19C21 16.7909 22.7909 15 25 15C27.2091 15 29 16.7909 29 19Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 45V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M43 29V19C43 14.0294 38.9706 10 34 10H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M25 19H14C12.3431 19 11 17.6569 11 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M25 49H50C51.6569 49 53 50.3431 53 52V54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="max-w-sm text-slate-300">{message}</p>
    </div>
);


const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 0) return 'N/A';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes === 0 && hours === 0 && totalSeconds < 10) return `${totalSeconds}s`;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    // Only show seconds if duration is less than an hour
    if (hours === 0 && seconds > 0) result += `${seconds}s`;
    
    return result.trim() || '0s';
};

type GroupedSessions = {
    [date: string]: {
        [studentId: string]: SessionRecord[];
    };
};

const groupSessionsByDateAndStudent = (sessions: SessionRecord[]): GroupedSessions => {
    const groups: GroupedSessions = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    sessions.forEach(session => {
        const sessionDate = new Date(session.loginTimestamp);
        const sessionDateStr = sessionDate.toDateString();
        let groupKey = '';

        if (sessionDateStr === todayStr) {
            groupKey = 'Oggi';
        } else if (sessionDateStr === yesterdayStr) {
            groupKey = 'Ieri';
        } else {
            groupKey = sessionDate.toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            });
            groupKey = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
        }

        if (!groups[groupKey]) {
            groups[groupKey] = {};
        }
        if (!groups[groupKey][session.studentId]) {
            groups[groupKey][session.studentId] = [];
        }
        groups[groupKey][session.studentId].push(session);
    });

    return groups;
};

const AccessReportPage: React.FC<{ currentUser: User; isDevUser?: boolean; onLogout?: () => void; }> = ({ currentUser, isDevUser, onLogout }) => {
    const { students: allStudents } = useAppContext();
    const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const [liveDurations, setLiveDurations] = useState<Record<string, number>>({});
    
    // States for selection and deletion
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [itemToDelete, setItemToDelete] = useState<{ type: string; ids: string[] } | null>(null);
    const [activeStudents, setActiveStudents] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const records = await db.dbGetSessionsForTeacher(currentUser.id);
                setSessionRecords(records.sort((a, b) => b.loginTimestamp - a.loginTimestamp));
            } catch (error) {
                console.error("Failed to load access report data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [currentUser.id]);

     useEffect(() => {
        const liveSessions = sessionRecords.filter(s => !s.logoutTimestamp);
        if (liveSessions.length === 0) {
            return;
        }

        const intervalId = setInterval(() => {
            setLiveDurations(prev => {
                const newDurations: Record<string, number> = {};
                liveSessions.forEach(session => {
                    newDurations[session.sessionId] = Date.now() - session.loginTimestamp;
                });
                return { ...prev, ...newDurations };
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [sessionRecords]);
    
    useEffect(() => {
        const channel = new BroadcastChannel('session-updates');

        const handleMessage = (event: MessageEvent) => {
            if (!event.data || !event.data.type) return;
            
            const { type, session, activity } = event.data;
            
            if (currentUser && (session?.teacherId === currentUser.id || activity)) {
                 if (type === 'LOGIN') {
                    setSessionRecords(prev => [session, ...prev].sort((a, b) => b.loginTimestamp - a.loginTimestamp));
                } else if (type === 'LOGOUT') {
                    setSessionRecords(prev => prev.map(s => (s.sessionId === session.sessionId ? session : s)));
                } else if (type === 'NEW_ACTIVITY' && activity?.studentId) {
                    const studentId = activity.studentId;
                    setActiveStudents(prev => ({...prev, [studentId]: true}));
                    setTimeout(() => {
                        setActiveStudents(prev => ({...prev, [studentId]: false}));
                    }, 2000); // Activity burst duration
                }
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [currentUser.id]);

    const toggleExpand = (key: string) => {
        setExpandedCards(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedItems([]); // Reset selection when toggling mode
    };

    const toggleItemSelection = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleGroupSelection = (sessionIdsInGroup: string[]) => {
        const allInGroupSelected = sessionIdsInGroup.every(sid => selectedItems.includes(sid));
        if (allInGroupSelected) {
            // Deselect all in group
            setSelectedItems(prev => prev.filter(sid => !sessionIdsInGroup.includes(sid)));
        } else {
            // Select all in group
            setSelectedItems(prev => [...new Set([...prev, ...sessionIdsInGroup])]);
        }
    };
    
    const handleSelectAll = () => {
        const allSessionIds = sessionRecords.map(s => s.sessionId);
        if(selectedItems.length === allSessionIds.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(allSessionIds);
        }
    };

    const handleDeleteRequest = (type: string, ids: string[], studentName?: string) => {
        let title: string;
        if (type === 'session') title = `Eliminare questa sessione?`;
        else if (type === 'group') title = `Eliminare le sessioni di ${studentName}?`;
        else title = `Eliminare ${ids.length} elementi?`;
        
        setItemToDelete({ type: title, ids });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        await db.dbDeleteSessionsAndActivities(itemToDelete.ids);
        setSessionRecords(prev => {
            const newRecords = prev.filter(s => !itemToDelete.ids.includes(s.sessionId));
            if (newRecords.length === 0) {
                setSelectionMode(false);
            }
            return newRecords;
        });
        setItemToDelete(null);
        setSelectedItems(prev => prev.filter(id => !itemToDelete.ids.includes(id)));
    };
    
    const groupedSessions = useMemo(() => groupSessionsByDateAndStudent(sessionRecords), [sessionRecords]);
    
    if (loading) {
         return <Layout title="" showBack backPath="/settings">
             <div className="flex items-center justify-center h-64">
                <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        </Layout>;
    }
    
    const pageContent = (
         <div className="space-y-8">
            {Object.entries(groupedSessions).map(([date, studentGroups], groupIndex) => (
                <section key={date} className="animate-slideInUp" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{date}</h2>
                    <div className="space-y-3">
                        {Object.entries(studentGroups).map(([studentId, sessions]) => {
                            const student = allStudents.find(s => s.id === studentId);
                            if (!student) return null;
                            
                            const cardKey = `${date}-${studentId}`;
                            const isExpanded = expandedCards.includes(cardKey);
                            const isAnySessionLive = sessions.some(s => !s.logoutTimestamp);
                            const totalDuration = sessions.reduce((total, s) => {
                                if (s.logoutTimestamp) {
                                    return total + (s.logoutTimestamp - s.loginTimestamp);
                                }
                                return total + (liveDurations[s.sessionId] || 0);
                            }, 0);

                            const sessionIdsInGroup = sessions.map(s => s.sessionId);
                            const isGroupSelected = sessionIdsInGroup.length > 0 && sessionIdsInGroup.every(sid => selectedItems.includes(sid));
                            const hasRecentActivity = activeStudents[student.id];

                            return (
                                <div key={cardKey} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/80 rounded-2xl shadow-lg transition-all duration-300">
                                    <div className="group flex items-center space-x-4 p-4 hover:bg-slate-700/30 transition-colors duration-200 cursor-pointer"
                                        onClick={() => !selectionMode && toggleExpand(cardKey)}>
                                        {selectionMode && (
                                            <AnimatedCheckbox
                                                checked={isGroupSelected}
                                                onChange={() => toggleGroupSelection(sessionIdsInGroup)}
                                            />
                                        )}
                                        <div className="relative flex-shrink-0">
                                            <img src={student.avatarUrl} alt={student.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"/>
                                            {isAnySessionLive && (
                                                <div 
                                                    className={`absolute -inset-1 rounded-full border-2 border-cyan-400 pointer-events-none ${hasRecentActivity ? 'animate-breathing-ring-fast' : 'animate-breathing-ring'}`}
                                                ></div>
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-slate-100 truncate">{student.name}</p>
                                            <p className="text-sm text-slate-400">{sessions.length} {sessions.length === 1 ? 'sessione' : 'sessioni'}</p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3 flex-shrink-0">
                                            <div className={`flex items-center justify-end space-x-2 text-xs font-semibold px-2.5 py-1 rounded-full ${isAnySessionLive ? 'bg-green-900/60 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                                                <div className={`w-2 h-2 rounded-full ${isAnySessionLive ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                                                <span>{isAnySessionLive ? 'Online' : 'Offline'}</span>
                                            </div>
                                            <div className="w-12 h-12">
                                                {isAnySessionLive ? (
                                                    <LiveDuration durationMs={totalDuration} />
                                                ) : (
                                                    <div className="w-12 h-12 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-slate-300">{formatDuration(totalDuration)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {!selectionMode && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteRequest('group', sessionIdsInGroup, student.name) }} className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-slate-700/50 transition-opacity duration-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                                                    {React.cloneElement(ICONS.trash, { width: 18, height: 18 })}
                                                </button>
                                            )}
                                            <div className="p-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform duration-300 group-hover:text-cyan-400 ${isExpanded ? 'rotate-90' : 'animate-bounce-horizontal'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="border-t border-slate-700/50 p-4 space-y-2">
                                                {sessions.map(session => {
                                                     const duration = session.logoutTimestamp
                                                        ? session.logoutTimestamp - session.loginTimestamp
                                                        : (liveDurations[session.sessionId] || 0);

                                                    return (
                                                    <div key={session.sessionId} className={`group/item flex items-center justify-between p-2 rounded-lg transition-colors ${selectionMode ? 'cursor-pointer hover:bg-slate-700/80' : ''}`} onClick={() => selectionMode && toggleItemSelection(session.sessionId)}>
                                                         {selectionMode && (
                                                            <AnimatedCheckbox
                                                                checked={selectedItems.includes(session.sessionId)}
                                                                onChange={() => toggleItemSelection(session.sessionId)}
                                                                className="mr-3"
                                                            />
                                                        )}
                                                        <Link to={`/settings/access-report/${session.sessionId}`} className={`flex-grow flex justify-between items-center ${selectionMode ? 'pointer-events-none' : 'hover:bg-slate-700/50 -m-2 p-2 rounded-lg'}`}>
                                                          <div className="flex items-center space-x-3">
                                                              {React.cloneElement(ICONS.key, {width: 18, height: 18, className: "text-cyan-400 flex-shrink-0"})}
                                                              <div className="font-mono text-sm">
                                                                  <span className="text-slate-200">{new Date(session.loginTimestamp).toLocaleTimeString('it-IT')}</span>
                                                                  <span className="text-slate-500 mx-2">→</span>
                                                                  <span className={session.logoutTimestamp ? 'text-slate-200' : 'text-green-400'}>
                                                                      {session.logoutTimestamp ? new Date(session.logoutTimestamp).toLocaleTimeString('it-IT') : 'In corso'}
                                                                  </span>
                                                              </div>
                                                          </div>
                                                          <div className="flex items-center space-x-2">
                                                            <div className="text-sm font-semibold text-slate-300">
                                                                {formatDuration(duration)}
                                                            </div>
                                                            {!selectionMode && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 transition-all duration-300 group-hover/item:text-cyan-400 group-hover/item:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            )}
                                                          </div>
                                                        </Link>
                                                        {!selectionMode && (
                                                             <button onClick={(e) => {e.stopPropagation(); handleDeleteRequest('session', [session.sessionId])}} className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-slate-600/50 transition-opacity duration-200 ml-2 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100">
                                                                {React.cloneElement(ICONS.trash, { width: 16, height: 16 })}
                                                            </button>
                                                        )}
                                                    </div>
                                                )})}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            ))}
        </div>
    );

    return (
        <div className="relative min-h-screen">
            <Layout 
                title="Report Accessi" 
                showBack 
                backPath="/settings" 
                isDevUser={isDevUser} 
                onLogout={onLogout}
                rightAccessory={
                    sessionRecords.length > 0 && (
                        <button onClick={toggleSelectionMode} className="font-semibold text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-cyan-900/40 text-sm transition-colors duration-200">
                            {selectionMode ? 'Annulla' : 'Seleziona'}
                        </button>
                    )
                }
            >
                 <header className="flex items-start justify-between mb-8 animate-fadeIn">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">Registro Attività</h1>
                        <p className="text-slate-400 mt-1 max-w-sm">Raggruppa e visualizza le sessioni di accesso dei tuoi studenti.</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white p-4 rounded-xl shadow-lg shadow-indigo-500/20">
                        {React.cloneElement(ICONS.activity, { width: 28, height: 28 })}
                    </div>
                </header>

                {sessionRecords.length > 0 ? pageContent : (
                    <EmptyState 
                        title="Ancora nessun accesso"
                        message="Quando i tuoi studenti effettueranno l'accesso con il loro codice, vedrai qui la cronologia delle loro sessioni."
                    />
                )}
                 {selectionMode && <div className="h-24" />}
            </Layout>

            {selectionMode && (
                <div className="fixed bottom-0 left-0 right-0 w-full lg:max-w-screen-xl lg:mx-auto bg-slate-900/80 backdrop-blur-lg border-t border-slate-700 p-4 z-20 animate-slideUp">
                    <div className="flex items-center justify-between">
                         <button onClick={handleSelectAll} className="font-semibold text-cyan-400 hover:underline text-sm">
                            {selectedItems.length === sessionRecords.length ? 'Deseleziona' : 'Seleziona tutto'}
                        </button>
                        <p className="font-bold text-slate-100">{selectedItems.length} selezionat{selectedItems.length === 1 ? 'o' : 'i'}</p>
                        <button
                            onClick={() => handleDeleteRequest('bulk', selectedItems)}
                            disabled={selectedItems.length === 0}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Elimina
                        </button>
                    </div>
                </div>
            )}
            
            <Modal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title={itemToDelete?.type || "Conferma eliminazione"}
                variant="danger"
            >
                {itemToDelete && (
                    <div className="space-y-6">
                        <p className="text-slate-300 text-sm">Sei sicuro? Questa azione è irreversibile e rimuoverà anche tutte le attività registrate per la/le sessione/i.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setItemToDelete(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleConfirmDelete} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Conferma Elimina</button>
                        </div>
                    </div>
                )}
            </Modal>

             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; opacity: 0; }
                
                @keyframes breathing-ring {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
                .animate-breathing-ring {
                    animation: breathing-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes breathing-ring-fast {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                .animate-breathing-ring-fast {
                    animation: breathing-ring-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                 @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
                @keyframes drawCheck {
                    from { stroke-dashoffset: 22; }
                    to { stroke-dashoffset: 0; }
                }
                .checkmark {
                    stroke-dasharray: 22;
                    stroke-dashoffset: 0;
                    animation: drawCheck 0.2s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                @keyframes bounce-horizontal {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    50% {
                        transform: translateX(4px);
                    }
                }
                .animate-bounce-horizontal {
                    animation: bounce-horizontal 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default AccessReportPage;