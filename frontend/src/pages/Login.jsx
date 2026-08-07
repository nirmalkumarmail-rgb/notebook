import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import '../login.css';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!emailRe.test(email)) e.email = 'Enter a valid email address';
    if (view !== 'forgot') {
      if (!password) e.password = 'Password is required';
      else if (password.length < 8) e.password = 'Must be at least 8 characters';
    }
    if (view === 'register' && password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      if (view === 'login') {
        await login(email, password, rememberMe);
        navigate('/');
      } else if (view === 'register') {
        await api.register(email, password);
        await login(email, password, false);
        navigate('/');
      } else {
        await api.forgotPassword(email);
        setForgotSent(true);
      }
    } catch (err) {
      setErrors({ form: err?.error || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const switchView = (v) => {
    setView(v);
    setErrors({});
    setForgotSent(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-page">

      {/* ── Left hero panel ───────────────────── */}
      <div className="auth-hero">
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />

        <div className="hero-body">
          <div className="hero-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
            <span>Notebook</span>
          </div>

          <h2 className="hero-headline">Write more.<br />Forget less.</h2>
          <p className="hero-sub">
            A calm space to capture your thoughts, ideas, and everything in between.
          </p>

          <ul className="hero-features">
            <li>
              <span className="hero-check">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8 6.5 11.5 13 4.5" />
                </svg>
              </span>
              Auto-saves as you type
            </li>
            <li>
              <span className="hero-check">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8 6.5 11.5 13 4.5" />
                </svg>
              </span>
              Search across all your notes
            </li>
            <li>
              <span className="hero-check">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8 6.5 11.5 13 4.5" />
                </svg>
              </span>
              Dark &amp; light mode support
            </li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ──────────────────── */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Mobile-only logo */}
          <div className="auth-logo auth-logo-mobile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
            <span>Notebook</span>
          </div>

          <h1 className="auth-title">
            {view === 'login' ? 'Welcome back' : view === 'register' ? 'Create account' : 'Reset password'}
          </h1>
          <p className="auth-subtitle">
            {view === 'login' ? 'Sign in to continue to your notes' : view === 'register' ? 'Start capturing your ideas today' : 'Enter your email to receive a reset link'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {errors.form && <div className="auth-error-banner">{errors.form}</div>}

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {view !== 'forgot' && (
              <div className="auth-field">
                <div className="field-label-row">
                  <label htmlFor="password">Password</label>
                  {view === 'login' && (
                    <button type="button" className="link-btn" onClick={() => switchView('forgot')}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
            )}

            {view === 'register' && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            )}

            {view === 'login' && (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me for 30 days
              </label>
            )}

            {forgotSent && (
              <div className="auth-success">
                Check your email — a reset link has been sent.
              </div>
            )}

            {!forgotSent && (
              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting
                  ? 'Please wait…'
                  : view === 'login'
                  ? 'Sign in'
                  : view === 'register'
                  ? 'Create account'
                  : 'Send reset link'}
              </button>
            )}
          </form>

          <div className="auth-footer">
            {view === 'login' ? (
              <p>Don't have an account? <button className="link-btn" onClick={() => switchView('register')}>Create one</button></p>
            ) : (
              <button className="link-btn" onClick={() => switchView('login')}>← Back to sign in</button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
