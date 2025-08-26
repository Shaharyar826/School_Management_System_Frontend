import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import TeacherProfileEdit from '../teachers/TeacherProfileEdit';
import AdminProfileEdit from '../admin/AdminProfileEdit';

const ProfileEditRouter = () => {
  const { user } = useContext(AuthContext);

  // Render the appropriate profile edit component based on user role
  if (user && (user.role === 'admin' || user.role === 'principal')) {
    return <AdminProfileEdit />;
  }

  // Default to teacher profile edit for all other roles
  return <TeacherProfileEdit />;
};

export default ProfileEditRouter;
