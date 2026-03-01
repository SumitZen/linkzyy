import { Link } from 'react-router-dom';
import styles from './TemplatesShowcase.module.css';

const showcaseTemplates = [
    {
        id: 'editorial-light',
        name: 'Editorial Light',
        bg: 'linear-gradient(170deg, #e8eaf6 0%, #c5cae9 100%)',
        textColor: '#1a237e',
        subtitleColor: '#5c6bc0',
        avatarUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        avatarBorder: '3px solid rgba(92,107,192,0.5)',
        avatarShadow: '0 0 20px rgba(92,107,192,0.3)',
        links: [
            { label: 'My Portfolio', icon: '🖼️', bg: '#3949ab', color: '#fff' },
            { label: 'Newsletter', icon: '✉️', bg: 'rgba(255,255,255,0.8)', color: '#1a237e', border: '1px solid rgba(57,73,171,0.15)' },
            { label: 'Buy Prints', icon: '🛒', bg: 'rgba(255,255,255,0.8)', color: '#1a237e', border: '1px solid rgba(57,73,171,0.15)' },
            { label: 'Latest Blog', icon: '📄', bg: 'rgba(255,255,255,0.8)', color: '#1a237e', border: '1px solid rgba(57,73,171,0.15)' },
        ],
        socials: ['𝕏', '📸', '▶'],
    },
    {
        id: 'neon-nights',
        name: 'Neon Nights',
        bg: 'linear-gradient(170deg, #0a0012 0%, #160030 60%, #001a10 100%)',
        textColor: '#e9d5ff',
        subtitleColor: '#a78bfa',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        avatarBorder: '3px solid #7c3aed',
        avatarShadow: '0 0 24px rgba(139,92,246,0.7)',
        links: [
            { label: 'Listen Now', icon: '🎵', bg: 'linear-gradient(90deg,#7c3aed,#db2777)', color: '#fff', shadow: '0 4px 16px rgba(124,58,237,0.5)' },
            { label: 'Merch Store', icon: '🛍️', bg: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' },
            { label: 'Booking', icon: '📅', bg: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' },
            { label: 'Fan Club', icon: '⭐', bg: 'rgba(219,39,119,0.2)', color: '#f9a8d4', border: '1px solid rgba(219,39,119,0.4)' },
        ],
        socials: ['🎧', '📸', '🎵'],
    },
    {
        id: 'pastel-dream',
        name: 'Pastel Dream',
        bg: 'linear-gradient(150deg, #fce4ec 0%, #f8bbd9 50%, #fce4ec 100%)',
        textColor: '#880e4f',
        subtitleColor: '#e91e8c',
        avatarUrl: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        avatarBorder: '3px solid #f48fb1',
        avatarShadow: '0 0 20px rgba(244,143,177,0.6)',
        links: [
            { label: 'Shop Presets', icon: '🌸', bg: 'linear-gradient(90deg,#e91e8c,#ff6090)', color: '#fff', shadow: '0 4px 12px rgba(233,30,99,0.4)' },
            { label: 'Instagram', icon: '📸', bg: 'rgba(255,255,255,0.7)', color: '#880e4f', border: '1px solid rgba(233,30,99,0.2)' },
            { label: 'Tutorials', icon: '🎬', bg: 'rgba(255,255,255,0.7)', color: '#880e4f', border: '1px solid rgba(233,30,99,0.2)' },
            { label: 'Collabs', icon: '💌', bg: 'rgba(255,255,255,0.7)', color: '#880e4f', border: '1px solid rgba(233,30,99,0.2)' },
        ],
        socials: ['📸', '🎵', '▶'],
    },
    {
        id: 'dark-minimal',
        name: 'Dark Minimal',
        bg: 'linear-gradient(160deg, #0a0a0a 0%, #111 50%, #0d0d1a 100%)',
        textColor: '#f0f0f0',
        subtitleColor: '#888',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        avatarBorder: '2px solid rgba(255,255,255,0.15)',
        avatarShadow: '0 0 16px rgba(255,255,255,0.1)',
        links: [
            { label: 'My Work', icon: '⚡', bg: '#f0f0f0', color: '#0a0a0a', shadow: '0 4px 12px rgba(255,255,255,0.15)' },
            { label: 'GitHub', icon: '⬡', bg: 'rgba(255,255,255,0.06)', color: '#bbb', border: '1px solid rgba(255,255,255,0.1)' },
            { label: 'Contact', icon: '📬', bg: 'rgba(255,255,255,0.06)', color: '#bbb', border: '1px solid rgba(255,255,255,0.1)' },
            { label: 'Blog', icon: '✍️', bg: 'rgba(255,255,255,0.06)', color: '#bbb', border: '1px solid rgba(255,255,255,0.1)' },
        ],
        socials: ['𝕏', '⬡', '💼'],
    }
];

export default function TemplatesShowcase() {
    return (
        <section id="templates" className={styles.showcaseSection}>
            <div className={styles.header}>
                <div className={styles.subhead}>The Curated Collection</div>
                <h2 className={styles.title}>Designed for impact.<br />Engineered for speed.</h2>
            </div>

            <div className={styles.masonryWrapper}>
                {showcaseTemplates.map((template) => (
                    <div key={template.id} className={styles.mockupCard}>
                        <div
                            className={styles.mockupScreen}
                            style={{ background: template.bg }}
                        >
                            {/* Profile */}
                            <div className={styles.innerProfile}>
                                <div
                                    className={styles.innerAvatar}
                                    style={{
                                        backgroundImage: `url(${template.avatarUrl})`,
                                        border: template.avatarBorder,
                                        boxShadow: template.avatarShadow,
                                    }}
                                />
                                <div className={styles.innerName} style={{ color: template.textColor }}>
                                    {template.id === 'editorial-light' ? 'Aria Wolfe' :
                                        template.id === 'neon-nights' ? 'NOVA' :
                                            template.id === 'pastel-dream' ? 'Lila Rose' : 'Marcus K.'}
                                </div>
                                <div className={styles.innerBio} style={{ color: template.subtitleColor }}>
                                    {template.id === 'editorial-light' ? 'Designer & Typographer' :
                                        template.id === 'neon-nights' ? 'Music Producer 🎧' :
                                            template.id === 'pastel-dream' ? 'Beauty Creator ✨' : 'Full-Stack Dev'}
                                </div>
                            </div>

                            {/* Links */}
                            <div className={styles.innerLinks}>
                                {template.links.map((link, i) => (
                                    <div
                                        key={i}
                                        className={styles.innerLinkRow}
                                        style={{
                                            background: link.bg,
                                            color: link.color,
                                            border: (link as { border?: string }).border || 'none',
                                            boxShadow: (link as { shadow?: string }).shadow || 'none',
                                        }}
                                    >
                                        <span className={styles.linkIcon}>{link.icon}</span>
                                        <span className={styles.linkLabel}>{link.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Social bar */}
                            <div className={styles.innerSocials}>
                                {template.socials.map((s, i) => (
                                    <span key={i} className={styles.socialDot} style={{ color: template.subtitleColor }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <Link to="/templates" className="btn-signup" style={{ textDecoration: 'none' }}>
                    Explore All Designs →
                </Link>
            </div>
        </section>
    );
}
