import TeacherApproval from '../components/TeacherApproval';

export default function TeacherDashboard({ user }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Teacher Dashboard, {user.name}</h1>
      <TeacherApproval />
    </div>
  );
}