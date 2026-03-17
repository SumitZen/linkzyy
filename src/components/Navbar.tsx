import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

import { BrandLogo } from './BrandLogo';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isLandingPage = location.pathname === '/' || location.pathname === '';
    
    // Start scrolled=true on all pages EXCEPT the landing page
    const [scrolled, setScrolled] = useState(!isLandingPage);

    // Scroll detection logic
    useEffect(() => {
        // On non-landing pages: always warm pill, no need to listen
        if (!isLandingPage) {
            setScrolled(true);
            return;
        }

        // On landing page: listen to scroll
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };

        // Check immediately on mount/path change
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLandingPage]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const close = () => setMenuOpen(false);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [menuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    const isHome = location.pathname === '/';

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles['navbar--scrolled'] : ''}`}>
            <Link to="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                <BrandLogo 
                    size={scrolled ? 28 : 32} 
                    textColor={scrolled ? '#1e2d4a' : '#fff'} 
                    iconColor={scrolled ? '#b5637a' : '#fff'}
                />
            </Link>

            {/* Desktop links */}
            <div className={styles.navLinks}>
                <Link to="/" className={`${styles.navLink} ${isHome ? styles.navLinkActive : ''}`}>Home</Link>
                <Link to="/templates" className={styles.navLink}>Templates</Link>
                <Link to="/pricing" className={styles.navLink}>Pricing</Link>
                <Link to="/blog" className={styles.navLink}>Blog</Link>
            </div>

            {/* Desktop right actions */}
            <div className={styles.navRight}>
                {user ? (
                    <>
                        <Link to="/dashboard" className={styles.dashboardBtn}>
                            <span style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: scrolled ? 'var(--text-dark)' : 'rgba(255,255,255,0.2)', 
                                color: scrolled ? '#fff' : '#fff',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginRight: '8px'
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                            Dashboard
                        </Link>
                        <button className={styles.logoutBtn} onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={styles.navLink}>Log in</Link>
                        <Link to="/signup" className={styles.ctaBtn}>Sign up free</Link>
                    </>
                )}
            </div>

            {/* Mobile: hamburger */}
            <button
                className={styles.hamburger}
                onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
                aria-label="Open menu"
            >
                <span /><span /><span />
            </button>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div style={{
                    position: 'absolute', top: '70px', left: '12px', right: '12px',
                    background: 'rgba(253, 248, 242, 0.98)', borderRadius: '24px',
                    padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(30,45,74,0.08)'
                }}>
                    <Link to="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 500 }}>Home</Link>
                    <Link to="/templates" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 500 }}>Templates</Link>
                    <Link to="/pricing" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 500 }}>Pricing</Link>
                    <Link to="/blog" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 500 }}>Blog</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: 0 }} />
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 500 }}>Dashboard</Link>
                            <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#dc2626', fontWeight: 500, cursor: 'pointer', padding: 0 }}>Log out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 500 }}>Log in</Link>
                            <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e2d4a', fontWeight: 700 }}>Sign up free</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
