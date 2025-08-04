
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from './constants';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  backPath?: string; // New prop for explicit back navigation
  rightAccessory?: ReactNode;
  isDevUser?: boolean;
  onLogout?: () => void;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false, backPath, rightAccessory, isDevUser, onLogout, showHeader = true }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto flex flex-col min-h-screen bg-slate-900">
      {showHeader && (
        <header className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
            {showBack ? (
            <button onClick={handleBack} className="text-slate-200 p-2 -ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            ) : <div className="w-6"/>}
            <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
            <div className="flex items-center space-x-1">
                {rightAccessory && <div>{rightAccessory}</div>}
                {isDevUser && onLogout && (
                    <button onClick={onLogout} className="text-slate-300 p-2 -mr-2">{ICONS.logout}</button>
                )}
                {/* Placeholder to balance layout if only one or zero buttons are shown */}
                {!rightAccessory && !(isDevUser && onLogout) && <div className="w-6"/>}
            </div>
        </header>
      )}
      <main className={`flex-grow p-4 bg-slate-900 ${!showHeader ? 'pt-6' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
