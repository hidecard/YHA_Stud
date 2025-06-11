import { useState } from 'react';
import ExamList from '../components/ExamList';
import AssignmentList from '../components/AssignmentList';

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('exams');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Welcome, {user.name}</h1>
      <div className="flex mb-4">
        <button
          className={`flex-1 p-2 ${activeTab === 'exams' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('exams')}
        >
          Exams
        </button>
        <button
          className={`flex-1 p-2 ${activeTab === 'assignments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>
      {activeTab === 'exams' ? <ExamList /> : <AssignmentList />}
    </div>
  );
}