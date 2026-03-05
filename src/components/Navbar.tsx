import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/LandingPage.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const theme = localStorage.getItem('theme');
        return theme === 'dark';
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [isDarkMode]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const close = () => setMenuOpen(false);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [menuOpen]);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    return (
        <nav className="nav-brutal">
            <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>Linkzy</Link>

            {/* Desktop links */}
            <ul className="nav-links nav-links--desktop">
                <li><Link to="/templates">Templates</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/blog">Blog</Link></li>
            </ul>

            {/* Desktop right actions */}
            <div className="nav-end nav-end--desktop">
                <button className="btn-theme-toggle" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
                {user ? (
                    <>
                        <Link to="/dashboard">
                            <button className="btn-login" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    background: 'var(--text-dark)', color: 'var(--surface-1)',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                                Dashboard
                            </button>
                        </Link>
                        <button className="btn-login" onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button className="btn-login">Log in</button></Link>
                        <Link to="/signup"><button className="btn-signup">Sign up free</button></Link>
                    </>
                )}
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="nav-mobile-right">
                <button className="btn-theme-toggle" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button
                    className={`nav-hamburger${menuOpen ? ' open' : ''}`}
                    onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
                    aria-label="Open menu"
                >
                    <span /><span /><span />
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="nav-mobile-menu" onClick={e => e.stopPropagation()}>
                    <Link to="/templates" onClick={() => setMenuOpen(false)}>Templates</Link>
                    <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
                    <Link to="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '4px 0' }} />
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#dc2626', fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer', padding: '10px 0', width: '100%' }}>Log out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                            <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ fontWeight: 700 }}>Sign up free →</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
