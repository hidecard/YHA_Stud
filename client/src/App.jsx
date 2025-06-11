import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/student-dashboard" element={user?.type === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/teacher-dashboard" element={user?.type === 'teacher' ? <TeacherDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;