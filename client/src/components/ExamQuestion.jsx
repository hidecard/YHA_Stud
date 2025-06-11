import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExamQuestion({ subjectId, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/api/exams/questions/${subjectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, [subjectId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleFileChange = (questionId, file) => {
    setFiles({ ...files, [questionId]: file });
  };

  const handleSubmit = async (questionId) => {
    const formData = new FormData();
    formData.append('answerText', answers[questionId] || '');
    formData.append('subjectId', subjectId);
    if (files[questionId]) formData.append('file', files[questionId]);

    try {
      await axios.post(`/api/exams/submit/${questionId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Submitted successfully');
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-500 hover:underline">
        Back to Exams
      </button>
      <h2 className="text-2xl mb-2">Exam Questions</h2>
      {questions.map((q) => (
        <div key={q.question_id} className="mb-4 p-4 border rounded">
          {q.question_type === 'pdf' && q.pdf_path ? (
            <a href={q.pdf_path} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              View PDF Question
            </a>
          ) : (
            <p>{q.question_text}</p>
          )}
          {q.question_type !== 'pdf' && (
            <textarea
              value={answers[q.question_id] || ''}
              onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your answer"
            />
          )}
          {(q.question_type === 'file_upload' || q.question_type === 'pdf') && (
            <input
              type="file"
              onChange={(e) => handleFileChange(q.question_id, e.target.files[0])}
              className="mt-2"
            />
          )}
          <button
            onClick={() => handleSubmit(q.question_id)}
            className="mt-2 bg-blue-500 text-white p-2 rounded"
          >
            Submit
          </button>
        </div>
      ))}
    </div>
  );
}