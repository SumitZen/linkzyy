import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

// Real Google "G" logo SVG
function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    );
}

export default function LoginPage() {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(''); setIsLoading(true);
        try {
            await login(email, password);
            const search = searchParams.toString();
            navigate(`${from}${search ? `?${search}` : ''}`, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(''); setGoogleLoading(true);
        try {
            await loginWithGoogle();
            // Google OAuth redirects — no navigate needed
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed.');
            setGoogleLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-card">
                <Link to="/" className="auth-logo">Linkzy</Link>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-sub">Log in to your Linkzy account</p>

                {error && <div className="auth-error">{error}</div>}

                {/* Google sign-in */}
                <button className="auth-google-btn" onClick={handleGoogle} disabled={googleLoading}>
                    <GoogleLogo />
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>

                <div className="auth-divider"><span>or</span></div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" placeholder="Your password"
                            value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                    </div>
                    <button type="submit" className="auth-btn" disabled={isLoading}>
                        {isLoading ? 'Signing in…' : 'Log in'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign up free</Link>
                </p>
            </div>

            <div className="auth-brand-panel">
                <div className="auth-brand-inner">
                    <div className="auth-brand-badge">✦ Free to start</div>
                    <h2 className="auth-brand-headline">Your identity,<br /><em>refined.</em></h2>
                    <p className="auth-brand-sub">One link. Every platform. All of you.</p>
                    <div className="auth-avatars">
                        {[
                            'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                        ].map((src, i) => (
                            <img key={i} src={src} alt="Creator" className="auth-avatar-img" style={{ marginLeft: i === 0 ? 0 : '-10px' }} />
                        ))}
                        <span className="auth-creator-count">50k+ creators</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
