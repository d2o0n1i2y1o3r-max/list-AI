import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AUTH_ERROR_MAP = {
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/wrong-password': 'auth.errors.wrongPassword',
  'auth/user-not-found': 'auth.errors.userNotFound',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/popup-closed-by-user': null,
  'auth/unauthorized-domain': 'auth.errors.unauthorizedDomain',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
  'auth/invalid-api-key': 'auth.errors.invalidApiKey',
  'auth/operation-not-allowed': 'auth.errors.operationNotAllowed',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignInPage({ onSuccess }) {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState('signup'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleError = (err) => {
    console.error('Auth error:', err.code, err.message);
    const key = AUTH_ERROR_MAP[err.code || err.message];
    if (key === null) return; // User dismissed popup, etc.
    
    if (key) {
      setError(t(key));
    } else {
      // Show exact error code as requested, rather than generic message
      setError(err.code || err.message || 'Unknown error');
    }
  };

  const handleGoogle = async () => {
    console.log('Google Sign-In button clicked');
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    console.log(`Email form submitted in ${mode} mode`, { email });
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Left panel — decorative (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-charcoal-800 to-charcoal-900 dark:from-charcoal-900 dark:to-black items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute w-96 h-96 rounded-full bg-amber-600/20 blur-3xl top-1/4 left-1/4 animate-pulse-soft" />
        <div className="absolute w-64 h-64 rounded-full bg-amber-400/10 blur-2xl bottom-1/4 right-1/4 animate-pulse-soft" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-12">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-8 shadow-amber-lg">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path d="M8 10h16M8 16h10M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="25" cy="22" r="5" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2"/>
              <path d="M23 22l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t('app.name')}</h2>
          <p className="text-charcoal-300 text-lg leading-relaxed max-w-xs mx-auto">{t('app.tagline')}</p>

          {/* Feature bullets */}
          <div className="mt-10 space-y-3 text-left">
            {[
              'AI-powered daily planning',
              'Smart task scheduling',
              'Multi-language support',
              'Beautiful, distraction-free design',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-charcoal-300 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Header */}
          <div className="mb-8">
            {/* Mobile logo */}
            <div className="lg:hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-6 shadow-amber">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M8 10h16M8 16h10M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {mode === 'signup' ? t('auth.welcomeNew') : t('auth.welcome')}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1.5">
              {t('auth.subtitle')}
            </p>
          </div>


          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Email form as primary */}
          {(mode === 'signin' || mode === 'signup') ? (
            <>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="label">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="input-field pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="email-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-60"
                >
                  {loading
                    ? (mode === 'signup' ? t('auth.signingUp') : t('auth.signingIn'))
                    : (mode === 'signup' ? t('auth.signUp') : t('auth.signIn'))
                  }
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)]">{t('auth.orContinueWith')}</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {/* Google Sign-In as secondary */}
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl
                           border border-[var(--border)] bg-[var(--bg-card)]
                           text-[var(--text-primary)] text-sm font-medium
                           hover:bg-[var(--bg-secondary)] active:scale-[0.98]
                           transition-all duration-150 disabled:opacity-60
                           shadow-warm-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <GoogleIcon />
                {mode === 'signup' ? 'Sign up with Google' : t('auth.signInGoogle')}
              </button>

              <button
                type="button"
                onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
                className="w-full text-center text-xs mt-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {mode === 'signup' ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {mode === 'signup' ? t('auth.signIn') : t('auth.signUp')}
                </span>
              </button>
            </>
          ) : null}

        </div>
      </div>
    </div>
  );
}
