
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDetailPage from './StudentDetailPage';

const StudentRoutes: React.FC = () => {
  return (
    <Routes>
        <Route path="/student/view" element={<StudentDetailPage isStudentView={true} />} />
        <Route path="*" element={<Navigate to="/student/view" replace />} />
    </Routes>
  );
};

export default StudentRoutes;
