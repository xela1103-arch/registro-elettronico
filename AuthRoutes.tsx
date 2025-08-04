

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import StudentAccessPage from './StudentAccessPage';
import { useAppContext } from './AppContext';

const AuthRoutes: React.FC = () => {
  const location = useLocation();
  const { handleStudentLogin, handleDevStudentLogin, hideDevButtons } = useAppContext();

  const [previousLocation, setPreviousLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== previousLocation.pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPreviousLocation(location);
        setIsTransitioning(false);
      }, 800); // Durata animazione in ms

      return () => clearTimeout(timer);
    }
  }, [location, previousLocation]);

  const studentAccessPageElement = (
    <StudentAccessPage
      onStudentLogin={(session, student) => handleStudentLogin(session, student, true)}
      onDevStudentLogin={handleDevStudentLogin}
      showDevButtons={!hideDevButtons}
    />
  );
  
  const routes = (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/student-access" element={studentAccessPageElement} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  return (
    <>
      <div className="auth-routes-container">
        <div
          key={previousLocation.pathname}
          className={`page-container ${isTransitioning ? 'page-out' : ''}`}
        >
          {React.cloneElement(routes, { location: previousLocation })}
        </div>

        {isTransitioning && (
          <div
            key={location.pathname}
            className="page-container page-in"
          >
            {React.cloneElement(routes, { location: location })}
          </div>
        )}
      </div>
      <style>{`
          .auth-routes-container {
              position: relative;
              flex: 1;
              width: 100%;
              overflow: hidden; /* Aggiunto per nascondere le barre di scorrimento durante l'animazione */
          }
          .page-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
          }
          .page-in {
              animation: focus-shift-in 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
              z-index: 2;
          }
          .page-out {
              animation: focus-shift-out 0.8s cubic-bezier(0.5, 0, 0.75, 0) forwards;
              z-index: 1;
              pointer-events: none;
          }
          @keyframes focus-shift-in {
              from {
                  opacity: 0;
                  transform: scale(1.1);
                  filter: blur(10px);
              }
              to {
                  opacity: 1;
                  transform: scale(1);
                  filter: blur(0);
              }
          }
          @keyframes focus-shift-out {
              from {
                  opacity: 1;
                  transform: scale(1);
                  filter: blur(0);
              }
              to {
                  opacity: 0;
                  transform: scale(0.9);
                  filter: blur(10px);
              }
          }
      `}</style>
    </>
  );
};

export default AuthRoutes;
