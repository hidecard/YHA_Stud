import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TeacherApproval() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, subjectsRes] = await Promise.all([
          axios.get('/api/approvals/students', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('/api/approvals/subjects', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setStudents(studentsRes.data);
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async () => {
    try {
      await axios.post(
        '/api/approvals/approve',
        { studentId: selectedStudent, subjectId: selectedSubject },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Exam access approved');
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-2">Approve Exam Access</h2>
      <div className="mb-4">
        <label className="block mb-1">Student</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.name} ({s.student_code_no})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.subject_name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleApprove}
        className="bg-blue-500 text-white p-2 rounded"
        disabled={!selectedStudent || !selectedSubject}
      >
        Approve
      </button>
    </div>
  );
}