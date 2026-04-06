import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import PasswordStrengthInput from '../common/PasswordStrengthInput';
import axios from 'axios';
import { AuthLayout } from '../public/PublicLayout';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    subjects: [],
    classes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [classesLoading, setClassesLoading] = useState(false);

  const [availableSubjects] = useState([
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'History', 'Geography', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Economics', 'Business Studies', 'Accounting',
    'Political Science', 'Sociology', 'Psychology', 'Environmental Science'
  ]);

  const subjectCategories = {
    'Science': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Environmental Science'],
    'Languages': ['English'],
    'Humanities': ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology'],
    'Arts': ['Art', 'Music'],
    'Commerce': ['Economics', 'Business Studies', 'Accounting'],
    'Others': ['Physical Education']
  };

  const { firstName, middleName, lastName, email, password, confirmPassword, role, subjects, classes } = formData;

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const res = await axios.get('/api/filters/public/classes');
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          const classes = res.data.data.map(cls => cls.value);
          setAvailableClasses(classes);
        } else {
          setAvailableClasses([]);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setAvailableClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubjectSelection = (subject) => {
    const updatedSubjects = [...formData.subjects];
    if (updatedSubjects.includes(subject)) {
      updatedSubjects.splice(updatedSubjects.indexOf(subject), 1);
    } else {
      updatedSubjects.push(subject);
    }
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const handleClassSelection = (cls) => {
    const updatedClasses = [...formData.classes];
    if (updatedClasses.includes(cls)) {
      updatedClasses.splice(updatedClasses.indexOf(cls), 1);
    } else {
      updatedClasses.push(cls);
    }
    setFormData({ ...formData, classes: updatedClasses });
  };

  const filteredSubjects = Object.keys(subjectCategories).reduce((acc, category) => {
    const subjectsInCategory = subjectCategories[category].filter(subject =>
      subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
    );
    if (subjectsInCategory.length > 0) acc[category] = subjectsInCategory;
    return acc;
  }, {});

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (role === 'teacher') {
      if (formData.subjects.length === 0) { setError('Please select at least one subject'); return; }
      if (availableClasses.length > 0 && formData.classes.length === 0) { setError('Please select at least one class'); return; }
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { confirmPassword: _cp, ...registerData } = formData;
      if (role !== 'teacher') { delete registerData.subjects; delete registerData.classes; }
      const result = await register(registerData);
      if (result.success) {
        setSuccess(result.message || 'Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5.5rem 1rem 3rem', background: 'linear-gradient(135deg, #FFF0F8 0%, #F5F0FF 60%, #FAFAFA 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #FF6B35)', boxShadow: '0 4px 16px rgba(233,30,140,0.3)' }}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="alert alert-error mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="field-label">First Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input id="firstName" name="firstName" type="text" required autoComplete="given-name"
                  className="field-input" value={firstName} onChange={onChange} placeholder="John" />
              </div>
              <div className="field">
                <label className="field-label">Last Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input id="lastName" name="lastName" type="text" required autoComplete="family-name"
                  className="field-input" value={lastName} onChange={onChange} placeholder="Doe" />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Middle Name <span style={{ color: 'var(--text-muted)' }}>(Optional)</span></label>
              <input id="middleName" name="middleName" type="text" autoComplete="additional-name"
                className="field-input" value={middleName} onChange={onChange} placeholder="M." />
            </div>

            <div className="field">
              <label className="field-label">Email Address <span style={{ color: '#EF4444' }}>*</span></label>
              <input id="email" name="email" type="email" required autoComplete="email"
                className="field-input" value={email} onChange={onChange} placeholder="you@school.edu" />
            </div>

            <div className="field">
              <label className="field-label">Password <span style={{ color: '#EF4444' }}>*</span></label>
              <input id="password" name="password" type="password" required autoComplete="new-password"
                className="field-input" value={password} onChange={onChange} placeholder="••••••••" />
            </div>

            <div className="field">
              <label className="field-label">Confirm Password <span style={{ color: '#EF4444' }}>*</span></label>
              <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password"
                className="field-input" value={confirmPassword} onChange={onChange} placeholder="••••••••" />
            </div>

            <div className="field">
              <label className="field-label">Role <span style={{ color: '#EF4444' }}>*</span></label>
              <select id="role" name="role" required className="field-input" value={role} onChange={onChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="vice-principal">Vice Principal</option>
              </select>
            </div>

            {/* Teacher-specific fields */}
            {role === 'teacher' && (
              <div className="space-y-4 p-4 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#E91E8C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  Teacher Information
                </h3>

                {/* Subject selection */}
                <div>
                  <label className="field-label mb-2">Select Subjects <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" placeholder="Search subjects…"
                    className="field-input mb-3"
                    value={subjectSearchTerm}
                    onChange={(e) => setSubjectSearchTerm(e.target.value)} />

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {Object.keys(filteredSubjects).map((category) => (
                      <div key={category}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>{category}</p>
                        <div className="flex flex-wrap gap-2">
                          {filteredSubjects[category].map((subject) => (
                            <button key={subject} type="button"
                              onClick={() => handleSubjectSelection(subject)}
                              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                              style={
                                formData.subjects.includes(subject)
                                  ? { background: 'var(--gradient-brand)', color: '#fff', border: 'none' }
                                  : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                              }
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.subjects.length === 0 && (
                    <p className="field-error mt-1">Please select at least one subject</p>
                  )}
                </div>

                {/* Class selection */}
                <div>
                  <label className="field-label mb-2">Select Classes <span style={{ color: '#EF4444' }}>*</span></label>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                    {classesLoading ? (
                      <div className="flex items-center gap-2 py-3 justify-center">
                        <span className="spinner spinner-sm" style={{ borderColor: 'var(--brand-100)', borderTopColor: 'var(--brand)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading classes…</span>
                      </div>
                    ) : availableClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableClasses.sort((a, b) => Number(a) - Number(b)).map((cls) => (
                          <button key={cls} type="button"
                            onClick={() => handleClassSelection(cls)}
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                            style={
                              formData.classes.includes(cls)
                                ? { background: 'var(--gradient-brand)', color: '#fff', border: 'none' }
                                : { background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                            }
                          >
                            Class {cls}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No classes available. Please contact the administrator.</p>
                      </div>
                    )}
                  </div>
                  {availableClasses.length > 0 && formData.classes.length === 0 && (
                    <p className="field-error mt-1">Please select at least one class</p>
                  )}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9375rem', borderRadius: 9999, border: 'none', background: loading ? '#D1D5DB' : 'linear-gradient(135deg, #E91E8C, #FF6B35)', color: '#fff', fontWeight: 700, fontSize: '1.0625rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(233,30,140,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', marginTop: '0.5rem' }}>
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Creating account…
                </>
              ) : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </AuthLayout>
  );
};

export default Register;

