import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [files, setFiles] = useState({});

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get('/api/assignments/list', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAssignments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignments();
  }, []);

  const handleFileChange = (assignmentId, file) => {
    setFiles({ ...files, [assignmentId]: file });
  };

  const handleSubmit = async (assignmentId) => {
    const formData = new FormData();
    if (files[assignmentId]) formData.append('file', files[assignmentId]);

    try {
      await axios.post(`/api/assignments/submit/${assignmentId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Assignment submitted successfully');
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-2">Assignments</h2>
      <ul className="list-disc pl-5">
        {assignments.map((a) => (
          <li key={a.assignment_id} className="mb-4">
            <h3 className="text-lg">{a.title} ({a.subject_name})</h3>
            <p>{a.description}</p>
            <p>Due: {new Date(a.due_date).toLocaleDateString()}</p>
            <input
              type="file"
              onChange={(e) => handleFileChange(a.assignment_id, e.target.files[0])}
              className="mt-2"
            />
            <button
              onClick={() => handleSubmit(a.assignment_id)}
              className="mt-2 bg-blue-500 text-white p-2 rounded"
            >
              Submit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}