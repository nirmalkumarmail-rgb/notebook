import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import '../login.css';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'register'
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

      {/* Background illustration */}
      <svg className="auth-deco" viewBox="0 0 1200 750" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {/* Card: top-left */}
        <g transform="translate(60,40) rotate(-6)">
          <rect width="160" height="120" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <rect x="0" y="0" width="160" height="26" rx="8" fill="rgba(99,102,241,0.15)"/>
          <rect x="14" y="42" width="132" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
          <rect x="14" y="58" width="100" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="14" y="74" width="120" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="14" y="90" width="80" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
        </g>

        {/* Card: top-right */}
        <g transform="translate(950,30) rotate(7)">
          <rect width="180" height="130" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <rect x="0" y="0" width="180" height="26" rx="8" fill="rgba(139,92,246,0.18)"/>
          <rect x="14" y="44" width="152" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
          <rect x="14" y="60" width="110" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="14" y="76" width="140" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="14" y="92" width="90" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="14" y="108" width="120" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
        </g>

        {/* Card: left-middle */}
        <g transform="translate(30,330) rotate(5)">
          <rect width="140" height="100" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <rect x="14" y="18" width="112" height="2" rx="1" fill="rgba(255,255,255,0.09)"/>
          <rect x="14" y="34" width="85" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
          <rect x="14" y="50" width="100" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
          <rect x="14" y="66" width="70" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
        </g>

        {/* Card: right-middle (larger, more prominent) */}
        <g transform="translate(960,280) rotate(-5)">
          <rect width="200" height="150" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)" strokeWidth="1"/>
          <rect x="0" y="0" width="200" height="26" rx="8" fill="rgba(79,70,229,0.2)"/>
          <rect x="16" y="44" width="168" height="2" rx="1" fill="rgba(255,255,255,0.12)"/>
          <rect x="16" y="60" width="130" height="2" rx="1" fill="rgba(255,255,255,0.09)"/>
          <rect x="16" y="76" width="155" height="2" rx="1" fill="rgba(255,255,255,0.09)"/>
          <rect x="16" y="92" width="100" height="2" rx="1" fill="rgba(255,255,255,0.09)"/>
          <rect x="16" y="108" width="140" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
          <rect x="16" y="124" width="110" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
        </g>

        {/* Card: bottom-left */}
        <g transform="translate(80,580) rotate(-4)">
          <rect width="150" height="110" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <rect x="0" y="0" width="150" height="26" rx="8" fill="rgba(139,92,246,0.12)"/>
          <rect x="14" y="44" width="122" height="2" rx="1" fill="rgba(255,255,255,0.09)"/>
          <rect x="14" y="60" width="90" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
          <rect x="14" y="76" width="110" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
          <rect x="14" y="92" width="70" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
        </g>

        {/* Card: bottom-right */}
        <g transform="translate(1000,580) rotate(6)">
          <rect width="130" height="95" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
          <rect x="12" y="16" width="106" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
          <rect x="12" y="32" width="80" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
          <rect x="12" y="48" width="95" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
          <rect x="12" y="64" width="60" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
        </g>

        {/* Tiny floating dots */}
        <circle cx="220" cy="200" r="2" fill="rgba(255,255,255,0.12)"/>
        <circle cx="980" cy="200" r="2" fill="rgba(255,255,255,0.1)"/>
        <circle cx="150" cy="500" r="1.5" fill="rgba(255,255,255,0.1)"/>
        <circle cx="1050" cy="480" r="2.5" fill="rgba(167,139,250,0.2)"/>
        <circle cx="600" cy="80" r="2" fill="rgba(255,255,255,0.08)"/>
        <circle cx="600" cy="680" r="2" fill="rgba(255,255,255,0.08)"/>
      </svg>

      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
          </svg>
          <span>Notebook</span>
        </div>

        {/* Heading */}
        <h1 className="auth-title">
          {view === 'login' ? 'Welcome back' : view === 'register' ? 'Create account' : 'Reset password'}
        </h1>
        <p className="auth-subtitle">
          {view === 'login' ? 'Sign in to your notes' : view === 'register' ? 'Start capturing your ideas' : 'Enter your email to receive a reset link'}
        </p>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {errors.form && (
            <div className="auth-error-banner">{errors.form}</div>
          )}

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm password */}
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

          {/* Remember me */}
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

          {/* Forgot-sent confirmation */}
          {forgotSent && (
            <div className="auth-success">
              Check your email — a reset link has been sent.
            </div>
          )}

          {/* Submit */}
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

        {/* Footer link */}
        <div className="auth-footer">
          {view === 'login' ? (
            <p>Don't have an account? <button className="link-btn" onClick={() => switchView('register')}>Create one</button></p>
          ) : (
            <button className="link-btn" onClick={() => switchView('login')}>← Back to sign in</button>
          )}
        </div>

      </div>
    </div>
  );
}
