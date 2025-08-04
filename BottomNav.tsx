import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ICONS } from './constants';

const BottomNavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group relative flex flex-col items-center justify-center w-full transition-colors duration-200 
       lg:w-16 lg:h-16 lg:rounded-xl lg:mb-2
      ${
        isActive 
        ? 'text-cyan-400 lg:bg-cyan-500/10 lg:text-cyan-300' 
        : 'text-slate-400 hover:text-slate-200 lg:hover:bg-slate-700/50'
      }`
    }
  >
    <div className={`absolute left-0 h-8 w-1 rounded-r-full bg-cyan-400 transition-transform duration-300 ease-out hidden lg:block ${useLocation().pathname.startsWith(to) ? 'scale-y-100' : 'scale-y-0'}`}></div>
    {icon}
    <span className="text-xs mt-1 lg:hidden">{label}</span>
    <div className="absolute left-full ml-4 hidden lg:group-hover:block bg-slate-800 text-white text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50">
      {label}
      <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
    </div>
  </NavLink>
);

interface BottomNavProps {
    isSidebarOpen: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ isSidebarOpen }) => {
    const navItems = [
        { to: "/home", icon: ICONS.home, label: "Home" },
        { to: "/classes", icon: ICONS.classes_custom, label: "Classi" },
        { to: "/students", icon: ICONS.students_custom, label: "Studenti" },
        { to: "/communications", icon: ICONS.communications_custom, label: "Comunicazioni" },
    ];
    
    const profileItem = { to: "/settings", icon: ICONS.profile_custom, label: "Profilo" };

    const allMobileItems = [...navItems, profileItem];

    return (
        <>
            {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 shadow-t-md z-30 transition-all duration-1000 ease-in-out lg:opacity-0 lg:pointer-events-none lg:[filter:blur(20px)]">
                <div className="flex justify-around items-center h-full">
                    {allMobileItems.map(item => (
                        <BottomNavItem key={item.label} to={item.to} icon={item.icon} label={item.label} />
                    ))}
                </div>
            </nav>

            {/* --- DESKTOP SIDEBAR --- */}
            <nav className={`
                fixed top-0 left-0 w-24 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 z-30
                opacity-0 pointer-events-none [filter:blur(20px)]
                lg:opacity-100 lg:pointer-events-auto lg:[filter:blur(0px)]
                transition-all duration-1000 ease-in-out
                ${isSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
            `}>
                <div className={`
                    flex flex-col justify-between items-center h-full py-6
                    transition-opacity duration-500 ease-in-out
                    ${isSidebarOpen ? 'opacity-100 lg:delay-250' : 'opacity-0'}
                `}>
                    <div className="flex flex-col w-auto">
                        {navItems.map(item => (
                            <BottomNavItem key={item.label} to={item.to} icon={item.icon} label={item.label} />
                        ))}
                    </div>
                    <div>
                        <div className="h-px w-8 bg-slate-700 my-2 mx-auto"></div>
                        <BottomNavItem to={profileItem.to} icon={profileItem.icon} label={profileItem.label} />
                    </div>
                </div>
            </nav>
        </>
    );
};

export default BottomNav;