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
  'Structured paths for IT & tech roles',
  '200+ hands-on coding labs',
  'AI mentor that adapts to your pace',
  'Verifiable industry certifications',
];

export default function LoginPage() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
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
      const { data } = await api.post('/auth/login', form);
      login(data.user);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  return (
    <main className="auth-page" aria-label="Login page">
      {/* Brand panel */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand__logo">
          <img src="/rise_logo.svg" alt="Rise" />
        </div>
        <h2 className="auth-brand__headline">
          Welcome back.<br />Keep rising.
        </h2>
        <p className="auth-brand__sub">
          Pick up exactly where you left off. Your streak, progress, and AI mentor are waiting.
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
          <h1 className="auth-card__title">Log in to Rise</h1>
          <p className="auth-card__sub">
            Don't have an account? <a href="/signup">Sign up free</a>
          </p>

          {serverError && (
            <div className="auth-error" style={{ marginBottom: 16, fontSize: 14 }} role="alert">
              <ErrorOutlineRounded style={{ fontSize: 18 }} /> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`auth-input${errors.email ? ' error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                aria-describedby={errors.email ? 'login-email-err' : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="auth-error" id="login-email-err" role="alert">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`auth-input${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                aria-describedby={errors.password ? 'login-pwd-err' : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="auth-error" id="login-pwd-err" role="alert">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex w-full mt-4">
              <OrganicButton
                type="submit"
                label="Log in"
                size="md"
                variantColor="primary"
                disabled={loading}
                loading={loading}
                loadingText="Logging in…"
                fullWidth
              />
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20 }}>
            <a href="#" style={{ color: 'var(--blue-500)', fontWeight: 600 }}>Forgot password?</a>
          </p>
        </div>
      </div>
    </main>
  );
}
