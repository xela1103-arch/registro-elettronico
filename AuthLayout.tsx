

import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    illustration: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, illustration }) => {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-900 auth-container">
            {/* Left Decorative Column (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white relative overflow-hidden auth-illustration-col">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-[-20%] left-[-20%] h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-900/80 via-transparent to-transparent animate-spin-slow"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-900/80 via-transparent to-transparent animate-spin-slow-reverse"></div>
                </div>
                <div className="relative z-10 text-center">
                    <div className="mb-8 w-64 h-64 mx-auto">
                        {illustration}
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-bold tracking-tighter mb-4">{title}</h1>
                    <p className="text-lg xl:text-xl text-slate-300 max-w-md mx-auto">{subtitle}</p>
                </div>
            </div>

            {/* Right Form Column (Mobile & Desktop) */}
            <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-grow items-center justify-center p-4 auth-form-col">
                {children}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
                .animate-spin-slow-reverse {
                    animation: spin 25s linear infinite reverse;
                }
            `}</style>
        </div>
    );
};

export default AuthLayout;