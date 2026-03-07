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
        <nav className="bento-nav">
            <Link to="/" className="bento-logo">Linkzy</Link>

            <ul className="bento-nav-links">
                <li><Link to="/templates">Templates</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/blog">Blog</Link></li>
            </ul>

            <div className="bento-nav-actions">
                <button className="btn-glass" style={{ padding: '8px 12px', minWidth: '44px' }} onClick={toggleTheme} aria-label="Toggle Dark Mode">
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
                {user ? (
                    <>
                        <Link to="/dashboard">
                            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px' }}>
                                <span style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 700
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                                Dashboard
                            </button>
                        </Link>
                        <button className="btn-ghost" style={{ padding: '8px 20px' }} onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button className="btn-glass" style={{ padding: '8px 20px' }}>Log in</button></Link>
                        <Link to="/signup"><button className="btn-primary" style={{ padding: '8px 20px' }}>Sign up</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
}
