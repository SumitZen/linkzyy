import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BrutalistHero from '../components/BrutalistHero';
import TemplatesShowcase from '../components/TemplatesShowcase';
import './LandingPage.css';
import './MissingLayouts.css';

export default function LandingPage() {
    const phoneRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Ported 3D phone mouse follow
        const handleMouseMove = (e: MouseEvent) => {
            if (!phoneRef.current) return;
            const dx = (e.clientX / window.innerWidth - 0.5) * 22;
            const dy = (e.clientY / window.innerHeight - 0.5) * 14;
            phoneRef.current.style.transform = `rotateY(${dx}deg) rotateX(${-dy}deg)`;
            phoneRef.current.style.animation = 'none';
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="landingRoot">
            {/* HERO */}
            <BrutalistHero />

            <div className="landing-page-content">
                {/*  TEMPLATES SHOWCASE  */}
                <TemplatesShowcase />

                {/* SOCIAL PROOF CREATOR STRIP */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '32px',
                    padding: '48px 24px',
                    borderTop: '1px solid rgba(30, 45, 74, 0.08)',
                    borderBottom: '1px solid rgba(30, 45, 74, 0.08)',
                    flexWrap: 'wrap',
                    maxWidth: '1000px',
                    margin: '0 auto',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                        {[
                            'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                            'https://images.unsplash.com/photo-1618077360395-f3068be8e001?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                            'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80',
                        ].map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt="Creator"
                                style={{
                                    width: '44px', height: '44px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #fff',
                                    marginLeft: i === 0 ? 0 : '-12px',
                                    boxShadow: '0 4px 12px rgba(30, 45, 74, 0.12)',
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', color: '#8a8aaa', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 700, color: '#1e2d4a' }}>50,000+</span> creators already using Linkzy
                    </div>
                </div>

                {/*  CUSTOMIZE  */}
                <section className="sec-customize">
                    <div className="section-inner">
                        <div className="cust-phone">
                            <div className="dark-iphone">
                                <div className="dark-iphone-screen" style={{ overflow: 'hidden' }}>
                                    <div className="di-dark">
                                        <div className="di-sensor"></div>
                                        <div className="di-camera"></div>
                                    </div>
                                    <div className="dark-status">
                                        <span className="sb-time">9:41</span>
                                    </div>
                                    <div className="dark-phone-content">
                                        <div className="cust-av-ring">
                                            <div className="cust-av">🎨</div>
                                        </div>
                                        <div className="cust-name">Sofia Design</div>
                                        <div className="cust-bio">UI/UX Designer · Freelance</div>
                                        <div className="cust-link cl1">
                                            <div className="cl-ico">🎨</div>My Portfolio
                                        </div>
                                        <div className="cust-link cl2">
                                            <div className="cl-ico">💼</div>Hire me
                                        </div>
                                        <div className="cust-link cl3">
                                            <div className="cl-ico">📖</div>Figma templates
                                        </div>
                                        <div className="cust-link cl4">
                                            <div className="cl-ico">📸</div>Instagram
                                        </div>
                                        <div className="dark-socs">
                                            <div className="dark-soc">𝕏</div>
                                            <div className="dark-soc">▶</div>
                                            <div className="dark-soc">📸</div>
                                            <div className="dark-soc">🎵</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="cust-text">
                            <div className="sec-label">✦ Customization</div>
                            <h2 className="sec-title">Create your page<br />in minutes.</h2>
                            <p>Connect every piece of content you create across all platforms. Customize every detail to match your brand — or let Linkzy automatically build your perfect page.</p>
                            <div className="feature-chips">
                                <span className="chip chip-v">10+ Themes</span>
                                <span className="chip chip-t">Custom Colors</span>
                                <span className="chip chip-p">Fonts & Layout</span>
                                <span className="chip chip-l">Background Art</span>
                                <span className="chip chip-v">Animations</span>
                                <span className="chip chip-t">Profile Badges</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/*  PRICING SECTION PREVIEW  */}
                <section className="pricing-preview-sec" style={{ 
                    padding: '100px 40px',
                    textAlign: 'center',
                    background: '#fdf8f2',
                }}>
                    <div className="sec-label">✦ Simple Pricing</div>
                    <h2 className="sec-title">Free to start.<br />Easy to upgrade.</h2>
                    <div className="pricing-preview-cards" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px',
                        maxWidth: '1000px',
                        margin: '60px auto 48px',
                    }}>
                        {[
                            { name: 'Free', price: '$0', desc: 'The basics, forever.', btn: 'Get started' },
                            { name: 'Pro', price: '$4', desc: 'Everything unlocked.', btn: 'Go Pro' },
                            { name: 'Business', price: '$6', desc: 'For teams & scale.', btn: 'Contact' },
                        ].map(p => (
                            <div key={p.name} style={{
                                background: '#fff',
                                padding: '32px',
                                borderRadius: '24px',
                                border: '1px solid rgba(30, 45, 74, 0.08)',
                                boxShadow: '0 4px 12px rgba(30, 45, 74, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8a8aaa', marginBottom: '8px' }}>{p.name}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e2d4a', marginBottom: '4px' }}>{p.price}</div>
                                <div style={{ fontSize: '0.85rem', color: '#1e2d4a', opacity: 0.6, marginBottom: '20px' }}>{p.name === 'Free' ? 'Forever' : 'per month'}</div>
                                <p style={{ fontSize: '0.9rem', color: '#4a4a6a', marginBottom: '32px' }}>{p.desc}</p>
                                <button 
                                    onClick={() => navigate('/pricing')}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: p.name === 'Pro' ? '#1e2d4a' : '#f0e6da',
                                        color: p.name === 'Pro' ? '#fff' : '#1e2d4a',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {p.btn}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/*  SHARE ANYWHERE  */}
                <section className="share-section">
                    <div className="share-section__text">
                        <div className="sec-label">✦ Reach</div>
                        <h2>Share your Linkzy<br />everywhere.</h2>
                        <p>Add your unique Linkzy URL to every platform where your audience lives. One link works everywhere — your bio, QR code on merch, business cards, anywhere.</p>
                        <button className="btn-signup" onClick={() => navigate('/signup')}>Get your link →</button>
                    </div>
                    <div className="platform-grid">
                        <div className="platform-card">
                            <div className="platform-card__icon">📸</div>
                            <div className="platform-card__info">
                                <div className="platform-card__name">Instagram</div>
                                <div className="platform-card__action">Add to bio <span className="platform-card__url">linkzy.co/you</span></div>
                            </div>
                        </div>
                        <div className="platform-card">
                            <div className="platform-card__icon">🎵</div>
                            <div className="platform-card__info">
                                <div className="platform-card__name">TikTok</div>
                                <div className="platform-card__action">Add to bio <span className="platform-card__url">linkzy.co/you</span></div>
                            </div>
                        </div>
                        <div className="platform-card">
                            <div className="platform-card__icon">📺</div>
                            <div className="platform-card__info">
                                <div className="platform-card__name">YouTube</div>
                                <div className="platform-card__action">Add to about <span className="platform-card__url">linkzy.co/you</span></div>
                            </div>
                        </div>
                        <div className="platform-card">
                            <div className="platform-card__icon">𝕏</div>
                            <div className="platform-card__info">
                                <div className="platform-card__name">Twitter / X</div>
                                <div className="platform-card__action">Add to bio <span className="platform-card__url">linkzy.co/you</span></div>
                            </div>
                        </div>
                        <div className="platform-card">
                            <div className="platform-card__icon">💼</div>
                            <div className="platform-card__info">
                                <div className="platform-card__name">LinkedIn</div>
                                <div className="platform-card__action">Add to profile <span className="platform-card__url">linkzy.co/you</span></div>
                            </div>
                        </div>
                        <div className="platform-card">
                            <div className="platform-card__icon">📧</div>
                            <div className="platform-card__info">
                                <div className="platform-card__name">Email</div>
                                <div className="platform-card__action">Add to signature <span className="platform-card__url">linkzy.co/you</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/*  ANALYTICS  */}
                <section className="analytics-section">
                    <div className="analytics-stats-grid">
                        <div className="analytics-stat-card">
                            <div className="analytics-stat-card__icon">📈</div>
                            <div className="analytics-stat-card__value">43.5k</div>
                            <div className="analytics-stat-card__label">Total Clicks</div>
                        </div>
                        <div className="analytics-stat-card">
                            <div className="analytics-stat-card__icon">🎧</div>
                            <div className="analytics-stat-card__value">643</div>
                            <div className="analytics-stat-card__label">Track Plays</div>
                        </div>
                        <div className="analytics-stat-card">
                            <div className="analytics-stat-card__icon">💰</div>
                            <div className="analytics-stat-card__value">$2.3k</div>
                            <div className="analytics-stat-card__label">Revenue</div>
                        </div>
                        <div className="analytics-stat-card">
                            <div className="analytics-stat-card__icon">🌍</div>
                            <div className="analytics-stat-card__value">960</div>
                            <div className="analytics-stat-card__label">City Visits</div>
                        </div>
                    </div>
                    <div className="analytics-text">
                        <div className="sec-label">✦ Analytics</div>
                        <h2>Analyze your audience,<br />keep them engaged.</h2>
                        <p>Track engagement over time, monitor revenue, and learn what's converting your audience. Make smarter updates — on the fly.</p>
                        <a href="/login">See analytics demo →</a>
                    </div>
                </section>
            </div>
        </div>
    );
}
