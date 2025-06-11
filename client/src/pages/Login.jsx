import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const [isStudent, setIsStudent] = useState(true);
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isStudent ? '/api/auth/login' : '/api/auth/teacher/login';
      const data = isStudent ? { student_code_no: studentCode, password } : { email, password };
      const res = await axios.post(endpoint, data);
      setUser({ ...res.data[isStudent ? 'student' : 'teacher'], type: isStudent ? 'student' : 'teacher' });
      localStorage.setItem('token', res.data.token);
      navigate(isStudent ? '/student-dashboard' : '/teacher-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{isStudent ? 'Student' : 'Teacher'} Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex mb-6">
          <button
            className={`flex-1 p-3 rounded-l-md ${isStudent ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setIsStudent(true)}
          >
            Student
          </button>
          <button
            className={`flex-1 p-3 rounded-r-md ${!isStudent ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setIsStudent(false)}
          >
            Teacher
          </button>
        </div>
        <form onSubmit={handleLogin}>
          {isStudent ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Student Code No</label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Student Code No"
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Email"
                required
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}