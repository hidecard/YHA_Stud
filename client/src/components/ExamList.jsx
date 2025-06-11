import { useEffect, useState } from 'react';
import axios from 'axios';
import ExamQuestion from './ExamQuestion';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('/api/exams/allowed', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setExams(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-2">Available Exams</h2>
      {selectedSubject ? (
        <ExamQuestion subjectId={selectedSubject} onBack={() => setSelectedSubject(null)} />
      ) : (
        <ul className="list-disc pl-5">
          {exams.map((exam) => (
            <li key={exam.subject_id}>
              <button
                onClick={() => setSelectedSubject(exam.subject_id)}
                className="text-blue-500 hover:underline"
              >
                {exam.subject_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}