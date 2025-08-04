

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './AppContext';

import BottomNav from './BottomNav';
import HomePage from './HomePage';
import ClassesPage from './ClassesPage';
import ClassDetailPage from './ClassDetailPage';
import StudentsPage from './StudentsPage';
import StudentDetailPage from './StudentDetailPage';
import GradesPage from './GradesPage';
import CommunicationsPage from './CommunicationsPage';
import SettingsPage from './SettingsPage';
import ProfileEditPage from './ProfileEditPage';
import PlaceholderPage from './PlaceholderPage';
import AccessReportPage from './AccessReportPage';
import SessionDetailPage from './SessionDetailPage';
import DeveloperOptionsPage from './DeveloperOptionsPage';
import SecurityPage from './SecurityPage';

const TeacherRoutes: React.FC = () => {
    const { 
        isSidebarOpen, 
        toggleSidebar, 
        currentUser, 
        handleLogout, 
        isDevUser, 
        handleUpdateUser,
        handleDisableDevMode,
        hideDevButtons,
        handleToggleHideDevButtons,
        handleResetDevData
    } = useAppContext();

    if (!currentUser) return null;

    return (
        <div className="flex w-full">
            <BottomNav isSidebarOpen={isSidebarOpen} />

            <button
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? 'Chiudi menu' : 'Apri menu'}
                className={`
                    hidden lg:block fixed top-1/2 -translate-y-1/2 z-40
                    bg-slate-800/60 backdrop-blur-sm border border-l-0 border-slate-700 text-slate-300 rounded-r-full p-2
                    hover:bg-cyan-500/50 hover:text-white
                    transition-all duration-[1000ms] ease-in-out
                    ${isSidebarOpen ? 'left-[96px]' : 'left-0'}
                `}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-[1000ms] ${isSidebarOpen ? 'rotate-180' : ''}`}
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            <div className={`w-full pb-24 lg:pb-0 transition-all duration-[1000ms] ease-in-out ${isSidebarOpen ? 'lg:pl-24' : 'lg:pl-0'}`}>
                <Routes>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/classes" element={<ClassesPage />} />
                    <Route path="/class/:classId" element={<ClassDetailPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/student/:studentId" element={<StudentDetailPage />} />
                    <Route path="/student/:studentId/grades" element={<GradesPage />} />
                    <Route path="/communications" element={<CommunicationsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/profile" element={<ProfileEditPage currentUser={currentUser} onUpdateUser={handleUpdateUser} isSidebarOpen={isSidebarOpen} onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/notifications" element={<PlaceholderPage title="Notifiche" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/language" element={<PlaceholderPage title="Lingua" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/theme" element={<PlaceholderPage title="Tema" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/help" element={<PlaceholderPage title="Aiuto" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/feedback" element={<PlaceholderPage title="Feedback" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/about" element={<PlaceholderPage title="Informazioni sull'app" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/security" element={<SecurityPage />} />
                    <Route path="/settings/access-report" element={<AccessReportPage currentUser={currentUser} onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/access-report/:sessionId" element={<SessionDetailPage />} />
                    <Route path="/settings/display" element={<PlaceholderPage title="Preferenze di visualizzazione" onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="/settings/developer" element={<DeveloperOptionsPage onDisableDevMode={handleDisableDevMode} hideDevButtons={hideDevButtons} onToggleHideDevButtons={handleToggleHideDevButtons} onResetDevData={handleResetDevData} onLogout={handleLogout} isDevUser={isDevUser} />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default TeacherRoutes;