
import React from 'react';

const RotateDeviceIcon = () => (
    <svg className="w-24 h-24 text-white animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.0042 7.03233C15.2012 5.56833 13.7042 4.54533 12.0042 4.22533C10.3042 3.90533 8.56324 4.30933 7.22224 5.33833L8.50424 6.62033" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.99579 16.9677C8.79879 18.4317 10.2958 19.4547 11.9958 19.7747C13.6958 20.0947 15.4368 19.6907 16.7778 18.6617L15.4958 17.3797" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 12.001C4 14.771 5.209 17.271 7.053 18.991L8.505 17.531" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 11.999C20 9.22899 18.791 6.72899 16.947 5.00899L15.495 6.46899" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const OrientationLock: React.FC = () => {
    return (
        <>
            <div id="orientation-lock-overlay">
                <div className="content">
                    <RotateDeviceIcon />
                    <h1 className="title">Ruota il dispositivo</h1>
                    <p className="message">Per la migliore esperienza, utilizza l'app in modalità verticale.</p>
                </div>
            </div>
            <style>{`
                #orientation-lock-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: #0f172a; /* bg-slate-900 */
                    z-index: 9999;
                    display: none; /* Hidden by default */
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: white;
                    padding: 2rem;
                }
                
                #orientation-lock-overlay .content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                
                #orientation-lock-overlay .title {
                    font-size: 1.875rem; /* text-3xl */
                    font-weight: 700;
                }

                #orientation-lock-overlay .message {
                    font-size: 1.125rem; /* text-lg */
                    color: #94a3b8; /* text-slate-400 */
                    max-width: 300px;
                }

                /* Show overlay only on touch devices in landscape mode */
                @media (orientation: landscape) and (pointer: coarse) {
                    #orientation-lock-overlay {
                        display: flex;
                    }
                }
            `}</style>
        </>
    );
};

export default OrientationLock;