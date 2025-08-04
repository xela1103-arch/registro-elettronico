import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as db from './db';
import * as dev from './dev';
import type { User, ClassInfo, Student, Lesson, Notice, Message, GradeItem, SessionRecord, ActivityRecord, Attachment } from './constants';

type StudentSessionInfo = {
  student: Student;
  teacherId: string;
  sessionId: string;
};

interface AppContextType {
    currentUser: User | null;
    currentStudent: Student | null;
    isAuthLoading: boolean;
    isTeacherLoggedIn: boolean;
    isStudentLoggedIn: boolean;
    isDevUser: boolean;
    handleLogin: (user: User, setSession?: boolean) => Promise<void>;
    handleLogout: () => void;
    handleStudentLogin: (sessionRecord: SessionRecord, student: Student, setSession?: boolean, broadcastLoginEvent?: boolean) => Promise<void>;
    handleStudentLogout: () => Promise<void>;
    
    classes: ClassInfo[];
    students: Student[];
    lessons: Lesson[];
    notices: Notice[];
    messages: Message[];
    grades: GradeItem[];
    
    handleUpdateUser: (updatedUser: User) => Promise<void>;
    handleUpdateStudent: (studentId: string, data: Partial<Student>) => Promise<void>;
    handleDeleteAccount: () => Promise<void>;

    onAddClass: (className: string) => Promise<boolean>;
    onDeleteClass: (classId: string) => Promise<void>;
    onUpdateClass: (classId: string, newName: string) => Promise<boolean>;
    onAddStudent: (data: { name: string; age: number; classId: string; avatarUrl?: string; }) => Promise<void>;
    onDeleteStudent: (studentId: string) => Promise<void>;
    onAddLesson: (lesson: Omit<Lesson, 'id'>) => Promise<void>;
    onUpdateLesson: (id: string, data: Partial<Lesson>) => Promise<void>;
    onDeleteLesson: (id: string) => Promise<void>;
    onAddNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
    onUpdateNotice: (id: string, data: Partial<Notice>) => Promise<void>;
    onDeleteNotice: (id: string) => Promise<void>;
    onAddMessage: (message: Omit<Message, 'id'>) => Promise<void>;
    onDeleteMessage: (id: string) => Promise<void>;
    onAddGrade: (grade: Omit<GradeItem, 'id'>) => Promise<void>;
    onUpdateGrade: (id: string, data: Partial<GradeItem>) => Promise<void>;
    onDeleteGrade: (id: string) => Promise<void>;

    isSidebarOpen: boolean;
    toggleSidebar: () => void;

    isDevMode: boolean;
    isDevModalOpen: boolean;
    setIsDevModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleAppTap: () => void;
    handleEnableDevMode: (showModal?: boolean) => Promise<void>;
    handleDisableDevMode: () => Promise<void>;

    hideDevButtons: boolean;
    handleToggleHideDevButtons: () => void;
    handleDevLogin: () => Promise<void>;
    handleResetDevData: () => Promise<void>;
    handleDevStudentLogin: () => Promise<void>;
    
    installPrompt: any;
    showInstallBanner: boolean;
    handleAppInstall: () => void;
    handleDismissInstallBanner: () => void;

    showSplashScreen: boolean;
    setShowSplashScreen: React.Dispatch<React.SetStateAction<boolean>>;
    handleSplashComplete: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [studentTeacherId, setStudentTeacherId] = useState<string|null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [grades, setGrades] = useState<GradeItem[]>([]);

    const [isDevModalOpen, setIsDevModalOpen] = useState(false);
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTimestamp, setLastTapTimestamp] = useState(0);

    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    const [hideDevButtons, setHideDevButtons] = useState(() => localStorage.getItem('hideDevButtons') !== 'false');
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const savedState = localStorage.getItem('sidebarOpen');
        return savedState !== null ? JSON.parse(savedState) : true;
    });
    
    const [showSplashScreen, setShowSplashScreen] = useState(!localStorage.getItem('splashScreenShown'));

    useEffect(() => { localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen)); }, [isSidebarOpen]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    const isTeacherLoggedIn = !!currentUser;
    const isStudentLoggedIn = !!currentStudent;
    const isDevUser = currentUser?.id === 'dev-user-01';
    const isDevMode = !!currentUser?.isDevMode;
    
    const handleLogin = async (user: User, setSession = true) => {
        sessionStorage.removeItem('currentStudent');
        setCurrentStudent(null);
        setStudentTeacherId(null);
        const data = await db.dbGetAllDataForTeacher(user.id);
        setClasses(data.classes);
        setStudents(data.students);
        setLessons(data.lessons);
        setNotices(data.notices);
        setMessages(data.messages);
        setGrades(data.grades);
        setCurrentUser(user);
        if (setSession) sessionStorage.setItem('currentUser', JSON.stringify(user));
    };

    const handleStudentLogin = async (sessionRecord: SessionRecord, student: Student, setSession = true, broadcastLoginEvent = true) => {
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
        setClasses([]); setStudents([]); setLessons([]); setNotices([]); setMessages([]); setGrades([]);
        
        const { teacherId, sessionId } = sessionRecord;
        setCurrentStudent(student);
        setStudentTeacherId(teacherId);
        
        const storedGrades = await db.dbGetGradesForTeacher(teacherId);
        setGrades(storedGrades);
        
        if (setSession) {
          const studentInfoForSession: StudentSessionInfo = { student, teacherId, sessionId };
          sessionStorage.setItem('currentStudent', JSON.stringify(studentInfoForSession));
        }

        if (broadcastLoginEvent) {
            // Broadcast the login event
            const channel = new BroadcastChannel('session-updates');
            channel.postMessage({ type: 'LOGIN', session: sessionRecord });
            channel.close();
        }
    };
    
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const savedUserJSON = sessionStorage.getItem('currentUser');
                const savedStudentJSON = sessionStorage.getItem('currentStudent');
                if (savedUserJSON) {
                    const user = JSON.parse(savedUserJSON);
                    // By default, developer mode should be disabled on startup.
                    if (user.isDevMode) {
                        user.isDevMode = false;
                        await db.dbPutUser(user);
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                    }
                    await handleLogin(user, false);
                }
                else if (savedStudentJSON) {
                    const savedStudentInfo: StudentSessionInfo = JSON.parse(savedStudentJSON);
                    const sessionRecord = await db.dbGetSessionById(savedStudentInfo.sessionId);

                    if (sessionRecord && !sessionRecord.logoutTimestamp) {
                        // Session is valid, exists, and is still active. Re-establish it without broadcasting a new login.
                        await handleStudentLogin(sessionRecord, savedStudentInfo.student, false, false);
                    } else {
                        // Session not found in DB or already logged out.
                        sessionStorage.removeItem('currentStudent');
                    }
                }
            } catch (error) {
                console.error("Failed to parse storage", error);
                sessionStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentStudent');
            } finally { setIsAuthLoading(false); }
        };
        initializeApp();

        const beforeInstallPromptHandler = (e: Event) => {
            e.preventDefault();
    
            const isRunningAsPWA = 
                window.matchMedia('(display-mode: standalone)').matches ||
                window.matchMedia('(display-mode: minimal-ui)').matches ||
                window.matchMedia('(display-mode: fullscreen)').matches ||
                (window.navigator as any).standalone === true;
    
            // Only show the banner if we are not in PWA mode.
            // This relies on the browser to not fire the event if the app is already installed,
            // which fixes the re-installation issue. Some mobile browsers might still show the
            // banner erroneously, but this is a better trade-off.
            if (!isRunningAsPWA) {
                setInstallPrompt(e);
                setShowInstallBanner(true);
            }
        };
    
        const appInstalledHandler = () => {
            console.log('PWA was installed');
            // When the app is installed, hide the banner and clear the prompt.
            setShowInstallBanner(false);
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
        window.addEventListener('appinstalled', appInstalledHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
            window.removeEventListener('appinstalled', appInstalledHandler);
        };
    }, []);

    // This effect handles all real-time student profile updates via BroadcastChannel.
    useEffect(() => {
        const channel = new BroadcastChannel('session-updates');

        const handleMessage = async (event: MessageEvent) => {
            if (!event.data || !event.data.type) return;
            
            const { type, student, studentId } = event.data;
            
            if (type === 'STUDENT_UPDATE' && student) {
                // Logic for TEACHER receiving an update from a student session.
                if (isTeacherLoggedIn && currentUser && student.teacherId === currentUser.id) {
                    setStudents(prevStudents => 
                        prevStudents.map(s => s.id === student.id ? student : s)
                    );
                }
                
                // Logic for STUDENT receiving an update from a teacher session.
                if (isStudentLoggedIn && currentStudent && student.id === currentStudent.id) {
                    setCurrentStudent(student);
                    // Update session storage as well to maintain state on refresh
                    const sessionDataJSON = sessionStorage.getItem('currentStudent');
                    if (sessionDataJSON) {
                        const sessionData: StudentSessionInfo = JSON.parse(sessionDataJSON);
                        sessionData.student = student;
                        sessionStorage.setItem('currentStudent', JSON.stringify(sessionData));
                    }
                }
            } else if (type === 'GRADES_UPDATE' && studentId) {
                // Logic for STUDENT receiving a grades update
                if (isStudentLoggedIn && currentStudent && studentId === currentStudent.id && studentTeacherId) {
                    const updatedGrades = await db.dbGetGradesForTeacher(studentTeacherId);
                    setGrades(updatedGrades);
                }
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [isTeacherLoggedIn, isStudentLoggedIn, currentUser, currentStudent, studentTeacherId]);


    const handleAppInstall = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            setShowInstallBanner(false);
            setInstallPrompt(null);
        });
    };
    const handleDismissInstallBanner = () => {
        setShowInstallBanner(false);
    };

    const handleAppTap = () => {
        if (isDevMode || !('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
        const now = Date.now();
        const newTapCount = now - lastTapTimestamp > 500 ? 1 : tapCount + 1;
        setTapCount(newTapCount);
        setLastTapTimestamp(now);
    };
    
    useEffect(() => {
        if (tapCount >= 6 && !isDevMode) {
            handleEnableDevMode(true); // true to show mobile modal
            setTapCount(0);
        }
    }, [tapCount, isDevMode]);

    const handleEnableDevMode = async (showModal = false) => {
        if (!isDevMode && currentUser) {
            const updatedUser = { ...currentUser, isDevMode: true };
            await db.dbPutUser(updatedUser);
            setCurrentUser(updatedUser);
            if (showModal) {
                setIsDevModalOpen(true);
            }
        }
    };

    const handleDisableDevMode = async () => {
        if (isDevMode && currentUser) {
            const updatedUser = { ...currentUser, isDevMode: false };
            await db.dbPutUser(updatedUser);
            setCurrentUser(updatedUser);
        }
    };
    const handleToggleHideDevButtons = () => { setHideDevButtons(prev => { const newState = !prev; localStorage.setItem('hideDevButtons', String(newState)); return newState; }); };
    
    const handleLocalDevLogin = () => dev.handleDevLogin(handleLogin);
    const handleLocalResetDevData = async () => {
        if (currentUser?.id === 'dev-user-01') {
            const data = await dev.handleResetDevData(currentUser.id);
            setClasses(data.classes); setStudents(data.students); setLessons(data.lessons);
            setNotices(data.notices); setMessages(data.messages); setGrades(data.grades);
        }
    };
    const handleLocalDevStudentLogin = () => dev.handleDevStudentLogin(handleStudentLogin);

    const handleStudentLogout = async () => {
        const savedStudentSessionJSON = sessionStorage.getItem('currentStudent');
        if (savedStudentSessionJSON) {
            try {
                const { sessionId, student }: StudentSessionInfo = JSON.parse(savedStudentSessionJSON);
                const sessionRecord = await db.dbGetSessionById(sessionId);
                if (sessionRecord && !sessionRecord.logoutTimestamp) {
                    const updatedRecord = { ...sessionRecord, logoutTimestamp: Date.now() };
                    await db.dbPut(db.STORES.SESSIONS, updatedRecord);
                    const channel = new BroadcastChannel('session-updates');
                    channel.postMessage({ type: 'LOGOUT', session: updatedRecord });
                    channel.close();
                }
                await db.dbPut(db.STORES.ACTIVITIES, { id: `activity-${Date.now()}`, sessionId, studentId: student.id, timestamp: Date.now(), type: 'LOGOUT' });
            } catch (error) { console.error("Error during student logout", error); }
        }
        sessionStorage.removeItem('currentStudent');
        setCurrentStudent(null);
        setStudentTeacherId(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
        setClasses([]); setStudents([]); setLessons([]); setNotices([]); setMessages([]); setGrades([]);
    };

    const handleSplashComplete = () => {
        localStorage.setItem('splashScreenShown', 'true');
        setShowSplashScreen(false);
    };

    const handleDeleteAccount = async () => {
        if (!currentUser) return;
        await db.dbDeleteAllDataForTeacher(currentUser.id);
        handleLogout();
        localStorage.removeItem('splashScreenShown');
        setShowSplashScreen(true);
    };
    
    const handleUpdateUser = async (updatedUser: User) => {
        if (!currentUser) return;
        const userFromDb = await db.dbGetUserById(updatedUser.id);
        if (!userFromDb) return;
    
        // Create the final object to save to the DB.
        // Start with the updated data from the form, then overwrite sensitive/immutable
        // fields with the original values from the database to prevent corruption.
        const userToSaveInDb: User = {
            ...updatedUser,
            email: userFromDb.email, // IMPORTANT: Preserves the hashed email.
            password: userFromDb.password, // IMPORTANT: Preserves the password.
        };
        await db.dbPutUser(userToSaveInDb);
    
        // Create the final object for app state and session storage.
        // It starts with the existing state (to preserve fields not on the form like isDevMode),
        // then applies the changes from the form.
        const { password, ...userFromForm } = updatedUser;
        const finalUserForState = {
            ...currentUser,
            ...userFromForm
        };
    
        setCurrentUser(finalUserForState);
        sessionStorage.setItem('currentUser', JSON.stringify(finalUserForState));
    };
  
    const handleUpdateStudent = async (studentId: string, data: Partial<Student>) => {
        const studentToUpdate = isStudentLoggedIn ? currentStudent : students.find(s => s.id === studentId);
        const teacherId = isStudentLoggedIn ? studentTeacherId : currentUser?.id;
        if (!studentToUpdate || !teacherId) return;

        // Ensure teacherId is part of the student object before DB update & broadcast
        const updatedStudent = { ...studentToUpdate, ...data, teacherId };
        await db.dbPut(db.STORES.STUDENTS, updatedStudent);
        
        // Broadcast the update regardless of who made it.
        // The listeners will decide if they need to act on it.
        try {
            const channel = new BroadcastChannel('session-updates');
            channel.postMessage({ type: 'STUDENT_UPDATE', student: updatedStudent });
            channel.close();
        } catch (e) {
            console.error('BroadcastChannel failed:', e);
        }

        if (isStudentLoggedIn) {
            setCurrentStudent(updatedStudent);
            const sessionDataJSON = sessionStorage.getItem('currentStudent');
            if (sessionDataJSON) {
                const sessionData: StudentSessionInfo = JSON.parse(sessionDataJSON);
                sessionStorage.setItem('currentStudent', JSON.stringify({ ...sessionData, student: updatedStudent }));
            }
        } else {
            // This is the teacher updating the student, update local state.
            setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
        }
    };

    // --- CRUD Operations ---
    const onAddClass = async (name: string) => { if (!currentUser) return false; if (classes.some(c => c.name.toLowerCase() === name.toLowerCase())) return false; const newClass = { id: `class-${Date.now()}`, name }; await db.dbPut(db.STORES.CLASSES, { ...newClass, teacherId: currentUser.id }); setClasses(p => [...p, newClass]); return true; };
    const onDeleteClass = async (id: string) => { await db.dbDelete(db.STORES.CLASSES, id); const studentsInClass = students.filter(s => s.classId === id); for (const s of studentsInClass) await db.dbDelete(db.STORES.STUDENTS, s.id); setClasses(p => p.filter(c => c.id !== id)); setStudents(p => p.filter(s => s.classId !== id)); };
    const onUpdateClass = async (id: string, name: string) => { const cls = classes.find(c => c.id === id); if (!cls || !currentUser) return false; if (classes.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) return false; const updated = { ...cls, name }; await db.dbPut(db.STORES.CLASSES, { ...updated, teacherId: currentUser.id }); setClasses(p => p.map(c => c.id === id ? updated : c)); const studentsToUpdate = students.filter(s => s.classId === id); for (const s of studentsToUpdate) await handleUpdateStudent(s.id, { className: name }); return true; };
    const onAddStudent = async (data: any) => { const cls = classes.find(c => c.id === data.classId); if (!cls || !currentUser) return; const newStudent = { id: `student-${Date.now()}`, name: data.name.trim(), age: data.age, classId: data.classId, className: cls.name, subject: 'N/A', contact: { phone: '', email: '', address: '' }, parents: [], avatarUrl: data.avatarUrl || `https://avatar.iran.liara.run/public/${Math.random() > 0.5 ? 'girl' : 'boy'}?username=${data.name.split(' ')[0]}` }; await db.dbPut(db.STORES.STUDENTS, { ...newStudent, teacherId: currentUser.id }); setStudents(p => [...p, newStudent]); };
    const onDeleteStudent = async (id: string) => { await db.dbDelete(db.STORES.STUDENTS, id); setStudents(p => p.filter(s => s.id !== id)); };
    const onAddLesson = async (l: any) => { if (!currentUser) return; const newLesson = { ...l, id: `lesson-${Date.now()}` }; await db.dbPut(db.STORES.LESSONS, { ...newLesson, teacherId: currentUser.id }); setLessons(p => [...p, newLesson]); };
    const onUpdateLesson = async (id: string, data: any) => { if (!currentUser) return; const l = lessons.find(l => l.id === id); if (!l) return; const updated = { ...l, ...data }; await db.dbPut(db.STORES.LESSONS, { ...updated, teacherId: currentUser.id }); setLessons(p => p.map(l => l.id === id ? updated : l)); };
    const onDeleteLesson = async (id: string) => { await db.dbDelete(db.STORES.LESSONS, id); setLessons(p => p.filter(l => l.id !== id)); };
    const onAddNotice = async (n: any) => { if (!currentUser) return; const newNotice = { ...n, id: `notice-${Date.now()}` }; await db.dbPut(db.STORES.NOTICES, { ...newNotice, teacherId: currentUser.id }); setNotices(p => [newNotice, ...p]); };
    const onUpdateNotice = async (id: string, data: any) => { if (!currentUser) return; const n = notices.find(n => n.id === id); if (!n) return; const updated = { ...n, ...data }; await db.dbPut(db.STORES.NOTICES, { ...updated, teacherId: currentUser.id }); setNotices(p => p.map(n => n.id === id ? updated : n)); };
    const onDeleteNotice = async (id: string) => { await db.dbDelete(db.STORES.NOTICES, id); setNotices(p => p.filter(n => n.id !== id)); };
    const onAddMessage = async (m: any) => { if (!currentUser) return; const newMessage = { ...m, id: `message-${Date.now()}` }; await db.dbPut(db.STORES.MESSAGES, { ...newMessage, teacherId: currentUser.id }); setMessages(p => [...p, newMessage]); };
    const onDeleteMessage = async (id: string) => { await db.dbDelete(db.STORES.MESSAGES, id); setMessages(p => p.filter(m => m.id !== id)); };
    
    const broadcastGradesUpdate = (studentId: string) => {
        try {
            const channel = new BroadcastChannel('session-updates');
            channel.postMessage({ type: 'GRADES_UPDATE', studentId });
            channel.close();
        } catch (e) {
            console.error('BroadcastChannel for grades failed:', e);
        }
    };
    const onAddGrade = async (g: any) => { if (!currentUser) return; const newGrade = { ...g, id: `grade-${Date.now()}` }; await db.dbPut(db.STORES.GRADES, { ...newGrade, teacherId: currentUser.id }); setGrades(p => [...p, newGrade]); broadcastGradesUpdate(g.studentId); };
    const onUpdateGrade = async (id: string, data: any) => { if (!currentUser) return; const g = grades.find(g => g.id === id); if (!g) return; const updated = { ...g, ...data }; await db.dbPut(db.STORES.GRADES, { ...updated, teacherId: currentUser.id }); setGrades(p => p.map(gr => gr.id === id ? updated : gr)); broadcastGradesUpdate(g.studentId); };
    const onDeleteGrade = async (id: string) => { const gradeToDelete = grades.find(g => g.id === id); if (!gradeToDelete) return; await db.dbDelete(db.STORES.GRADES, id); setGrades(p => p.filter(g => g.id !== id)); broadcastGradesUpdate(gradeToDelete.studentId); };
    
    const value = {
        currentUser, currentStudent, isAuthLoading, isTeacherLoggedIn, isStudentLoggedIn, isDevUser,
        handleLogin, handleLogout, handleStudentLogin, handleStudentLogout,
        classes, students, lessons, notices, messages, grades,
        handleUpdateUser, handleUpdateStudent, handleDeleteAccount,
        onAddClass, onDeleteClass, onUpdateClass, onAddStudent, onDeleteStudent, onAddLesson, onUpdateLesson, onDeleteLesson,
        onAddNotice, onUpdateNotice, onDeleteNotice, onAddMessage, onDeleteMessage, onAddGrade, onUpdateGrade, onDeleteGrade,
        isSidebarOpen, toggleSidebar,
        isDevMode, isDevModalOpen, setIsDevModalOpen, handleAppTap, handleEnableDevMode, handleDisableDevMode,
        hideDevButtons, handleToggleHideDevButtons,
        handleDevLogin: handleLocalDevLogin, handleResetDevData: handleLocalResetDevData, handleDevStudentLogin: handleLocalDevStudentLogin,
        installPrompt, showInstallBanner, handleAppInstall, handleDismissInstallBanner,
        showSplashScreen, setShowSplashScreen, handleSplashComplete
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};