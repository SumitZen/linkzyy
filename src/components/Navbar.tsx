import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/LandingPage.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

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
    };

    return (
        <nav className="nav-brutal">
            <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>Linkzy</Link>
            <ul className="nav-links">
                <li><Link to="/templates">Templates</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/blog">Blog</Link></li>
            </ul>
            <div className="nav-end">
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
                        <button className="btn-signup" onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button className="btn-login">Log in</button></Link>
                        <Link to="/signup"><button className="btn-signup">Sign up free</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
}
