import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { AlertCircle } from 'lucide-react';
import { OrganicButton } from '@/components/ui/organic-button';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../styles/Auth.css';

const PERKS = [
  'Free forever plan — no credit card',
  'Access to 200+ lessons on day one',
  'AI mentor personalised to your goals',
  'Join 10,000+ learners already rising',
];

export default function SignupPage() {
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.user);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  const fields = [
    { key: 'name',     label: 'Full name',       type: 'text',     placeholder: 'Jane Smith',        autoComplete: 'name' },
    { key: 'email',    label: 'Email address',   type: 'email',    placeholder: 'you@example.com',   autoComplete: 'email' },
    { key: 'password', label: 'Password',        type: 'password', placeholder: 'Min. 8 characters', autoComplete: 'new-password' },
    { key: 'confirm',  label: 'Confirm password',type: 'password', placeholder: '••••••••',          autoComplete: 'new-password' },
  ];

  return (
    <main className="auth-page" aria-label="Sign up page">
      {/* Brand panel */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand__logo">
          <img src="/rise_logo.svg" alt="Rise" />
        </div>
        <h2 className="auth-brand__headline">
          Start your IT journey today.
        </h2>
        <p className="auth-brand__sub">
          Everything you need to go from beginner to job-ready — structured, hands-on, and free to start.
        </p>
        <div className="auth-brand__perks">
          {PERKS.map((p) => (
            <div key={p} className="auth-perk">
              <div className="auth-perk__check">
                <CheckRounded style={{ fontSize: 13 }} />
              </div>
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">
            Already have one? <a href="/login">Log in</a>
          </p>

          {serverError && (
            <div className="auth-error" style={{ marginBottom: 16, fontSize: 14 }} role="alert">
              <ErrorOutlineRounded style={{ fontSize: 18 }} /> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {fields.map(({ key, label, type, placeholder, autoComplete }) => (
              <div className="auth-field" key={key}>
                <label className="auth-label" htmlFor={`signup-${key}`}>{label}</label>
                <input
                  id={`signup-${key}`}
                  type={type}
                  className={`auth-input${errors[key] ? ' error' : ''}`}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  autoComplete={autoComplete}
                  aria-describedby={errors[key] ? `signup-${key}-err` : undefined}
                  aria-invalid={!!errors[key]}
                />
                {errors[key] && (
                  <p className="auth-error" id={`signup-${key}-err`} role="alert">
                    <AlertCircle size={12} /> {errors[key]}
                  </p>
                )}
              </div>
            ))}

            <div className="flex w-full mt-4">
              <OrganicButton
                type="submit"
                label="Create free account"
                size="md"
                variantColor="primary"
                disabled={loading}
                loading={loading}
                loadingText="Creating account…"
                fullWidth
              />
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 20, lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <a href="#" style={{ color: 'var(--blue-500)' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--blue-500)' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
