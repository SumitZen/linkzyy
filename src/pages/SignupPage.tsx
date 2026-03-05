import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

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

export default function SignupPage() {
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'free';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
    const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e'];

    const handleGoogle = async () => {
        setError(''); setGoogleLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed.');
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setIsLoading(true);
        try {
            await signup(name, email, password);
            const search = searchParams.toString();
            navigate(`/dashboard${search ? `?${search}` : ''}`, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-card">
                <Link to="/" className="auth-logo">Linkzy</Link>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-sub">
                    {plan !== 'free' ? `Starting with the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan` : 'Free forever — upgrade anytime'}
                </p>

                {error && <div className="auth-error">{error}</div>}

                {/* Google sign-up */}
                <button className="auth-google-btn" onClick={handleGoogle} disabled={googleLoading}>
                    <GoogleLogo />
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>
                <div className="auth-divider"><span>or</span></div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Aria Wolfe"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {password.length > 0 && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="strength-bar"
                                            style={{ background: i <= strength ? strengthColor[strength] : 'var(--border-subtle)' }}
                                        />
                                    ))}
                                </div>
                                <span style={{ color: strengthColor[strength], fontSize: '0.75rem', fontWeight: 600 }}>
                                    {strengthLabel[strength]}
                                </span>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="auth-btn" disabled={isLoading}>
                        {isLoading ? 'Creating account…' : 'Create account →'}
                    </button>
                </form>

                <p className="auth-terms">
                    By signing up you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                </p>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>

            <div className="auth-brand-panel">
                <div className="auth-brand-logo-text">Link<span>zy</span></div>
                <p className="auth-brand-tagline">One link. Every platform. All of you.</p>
                <div className="auth-feature-list">
                    {['Unlimited links', 'Custom themes', 'Real-time analytics', 'No-code setup'].map(f => (
                        <div key={f} className="auth-feature-item">
                            <span className="auth-check">✓</span> {f}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
