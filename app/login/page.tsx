'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

type Tab = 'signin' | 'register';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  border: '1.5px solid var(--parchment)', borderRadius: '10px',
  background: 'var(--warm-white)', color: 'var(--brown-dark)',
  fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: '0.4rem',
  letterSpacing: '0.01em',
};

function LoginPageInner() {
  const { user, signInWithGithub, signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const nextPath     = searchParams.get('next') ?? '/dashboard';

  const [tab,         setTab]         = useState<Tab>('signin');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location,    setLocation]    = useState('');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | 'facebook' | null>(null);

  useEffect(() => {
    if (user) router.push(nextPath.startsWith('/') ? nextPath : '/dashboard');
  }, [user, router, nextPath]);

  const handleOAuth = async (provider: 'github' | 'google' | 'facebook') => {
    setOauthLoading(provider);
    setError('');
    if (provider === 'github')   await signInWithGithub();
    if (provider === 'google')   await signInWithGoogle();
    if (provider === 'facebook') await signInWithFacebook();
    // If we get here the redirect didn't happen — OAuth failed
    setOauthLoading(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false); return;
    }
    const { error } = await signUpWithEmail({ email, password, displayName, location });
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess('Account created! Check your email to confirm, then sign in.');
    setTab('signin');
  };

  const anyOauthLoading = oauthLoading !== null;

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          background: 'var(--terracotta)', margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(180,60,40,0.25)',
          fontSize: '1.6rem',
        }}>
          🌿
        </div>
        <h1 style={{
          fontFamily: "'Lora', serif", fontSize: '1.9rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '0.4rem', letterSpacing: '-0.01em',
        }}>
          {tab === 'register' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {tab === 'register'
            ? 'Join to track jobs, learn, and use AI tools.'
            : 'Sign in to continue to your dashboard.'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--parchment)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 24px rgba(44,31,20,0.07)',
      }}>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => handleOAuth('github')}
            disabled={anyOauthLoading}
            style={{
              width: '100%', background: oauthLoading === 'github' ? '#555' : '#24292e',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '0.75rem 1.5rem', fontSize: '0.92rem', fontWeight: 600,
              cursor: anyOauthLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'background 0.15s', opacity: anyOauthLoading && oauthLoading !== 'github' ? 0.5 : 1,
            }}
          >
            {oauthLoading === 'github' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Spinner color="#fff" /> Redirecting to GitHub…
              </span>
            ) : (
              <>
                <svg height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                Continue with GitHub
              </>
            )}
          </button>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => handleOAuth('google')}
              disabled={anyOauthLoading}
              style={{
                flex: 1, background: '#fff', color: '#3c4043',
                border: '1.5px solid #dadce0', borderRadius: '12px',
                padding: '0.7rem', fontSize: '0.88rem', fontWeight: 600,
                cursor: anyOauthLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: anyOauthLoading && oauthLoading !== 'google' ? 0.5 : 1,
              }}
            >
              {oauthLoading === 'google' ? <Spinner color="#4285F4" /> : (
                <svg height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              )}
              Google
            </button>
            <button
              onClick={() => handleOAuth('facebook')}
              disabled={anyOauthLoading}
              style={{
                flex: 1, background: '#1877f2', color: 'white', border: 'none',
                borderRadius: '12px', padding: '0.7rem',
                fontSize: '0.88rem', fontWeight: 600,
                cursor: anyOauthLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: anyOauthLoading && oauthLoading !== 'facebook' ? 0.5 : 1,
              }}
            >
              {oauthLoading === 'facebook' ? <Spinner color="#fff" /> : (
                <svg height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              )}
              Facebook
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--parchment)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>or email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--parchment)' }} />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--parchment)', borderRadius: '10px',
          padding: '0.25rem', marginBottom: '1.5rem',
        }}>
          {(['signin', 'register'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }} style={{
              flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none',
              background: tab === t ? 'var(--warm-white)' : 'transparent',
              color: tab === t ? 'var(--brown-dark)' : 'var(--text-muted)',
              fontWeight: tab === t ? 600 : 400, fontSize: '0.88rem',
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: tab === t ? '0 1px 4px rgba(44,31,20,0.08)' : 'none',
            }}>
              {t === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c',
            borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem',
            marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
          }}>
            <span style={{ flexShrink: 0 }}>⚠️</span>{error}
          </div>
        )}
        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d',
            borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem',
            marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
          }}>
            <span style={{ flexShrink: 0 }}>✅</span>{success}
          </div>
        )}

        {/* Sign In Form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required style={inputStyle} value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                autoComplete="email" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required style={inputStyle} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} style={{
              background: loading ? 'var(--parchment)' : 'var(--terracotta)',
              color: loading ? 'var(--text-muted)' : 'white',
              border: 'none', borderRadius: '12px', padding: '0.85rem',
              fontSize: '0.95rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s',
            }}>
              {loading ? <><Spinner color="var(--text-muted)" /> Signing in…</> : 'Sign in →'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input required style={inputStyle} value={displayName}
                onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Henry Tsai"
                autoComplete="name" />
            </div>
            <div>
              <label style={labelStyle}>Where are you based?</label>
              <input style={inputStyle} value={location}
                onChange={e => setLocation(e.target.value)} placeholder="e.g. Brisbane, Australia"
                autoComplete="address-level2" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required style={inputStyle} value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                autoComplete="email" />
            </div>
            <div>
              <label style={labelStyle}>
                Password{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(min. 8 characters)</span>
              </label>
              <input type="password" required style={inputStyle} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading} style={{
              background: loading ? 'var(--parchment)' : 'var(--terracotta)',
              color: loading ? 'var(--text-muted)' : 'white',
              border: 'none', borderRadius: '12px', padding: '0.85rem',
              fontSize: '0.95rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s',
            }}>
              {loading ? <><Spinner color="var(--text-muted)" /> Creating account…</> : 'Create account →'}
            </button>
          </form>
        )}
      </div>

      {/* Footer note */}
      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}>
        By signing in you agree to our terms. Your data stays private — we never share or sell it.
      </p>
    </div>
  );
}

function Spinner({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
