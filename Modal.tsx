import React, { useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'default' | 'danger';
  size?: 'default' | 'large' | 'xlarge';
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, variant = 'default', size = 'default', closeOnOverlayClick = true }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  const sizeClasses = {
      default: 'max-w-md',
      large: 'max-w-2xl',
      xlarge: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
      aria-modal="true"
      role="dialog"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-transform duration-300 animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className={`text-lg font-bold ${variant === 'danger' ? 'text-red-400' : 'text-slate-100'}`}>{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 rounded-full p-1 transition-colors"
            aria-label="Chiudi modale"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-6">
            {children}
        </div>
      </div>
       <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default Modal;