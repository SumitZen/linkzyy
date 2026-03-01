import { useEffect, useRef } from 'react';
import BrutalistHero from '../components/BrutalistHero';
import TemplatesShowcase from '../components/TemplatesShowcase';
import './LandingPage.css';
import './MissingLayouts.css';

export default function LandingPage() {
    const phoneRef = useRef<HTMLDivElement>(null);

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

    // We can add the GSAP interactions and Lenis back on top of this structure later.

    return (
        <div className="landingRoot">
            {/* 3D Canvas Background Removed */}



            {/* HERO */}
            <BrutalistHero />



            {/*  TEMPLATES SHOWCASE  */}
            <TemplatesShowcase />

            {/* SOCIAL PROOF CREATOR STRIP */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                padding: '48px 24px',
                borderTop: 'var(--border-subtle)',
                borderBottom: 'var(--border-subtle)',
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
                                border: '2px solid var(--surface-1)',
                                marginLeft: i === 0 ? 0 : '-12px',
                                boxShadow: 'var(--shadow-layer-1)',
                            }}
                        />
                    ))}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>50,000+</span> creators already using Linkzy
                </div>
            </div>

            {/*  CUSTOMIZE  */}
            <section className="sec-customize">
                <div className="section-inner">
                    <div className="cust-phone">
                        <div className="dark-iphone">
                            <div className="dark-iphone-screen">
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

            {/*  SHARE ANYWHERE  */}
            <section className="sec-share">
                <div className="section-inner">
                    <div>
                        <div className="sec-label">✦ Reach</div>
                        <h2 className="sec-title">Share your Linkzy<br />everywhere.</h2>
                        <p>Add your unique Linkzy URL to every platform where your audience lives. One link works everywhere — your bio, QR code on merch, business cards, anywhere.</p>
                        <button className="btn-signup">Get your link →</button>
                    </div>
                    <div className="platform-cards">
                        <div className="plat-card">
                            <div className="plat-icon pi-ig">📸</div>
                            <div className="plat-info">
                                <div className="plat-name">Instagram</div>
                                <div className="plat-sub">Add to bio</div>
                            </div><span className="plat-url">linkzy.co/you</span>
                        </div>
                        <div className="plat-card">
                            <div className="plat-icon pi-tt">🎵</div>
                            <div className="plat-info">
                                <div className="plat-name">TikTok</div>
                                <div className="plat-sub">Add to bio</div>
                            </div><span className="plat-url">linkzy.co/you</span>
                        </div>
                        <div className="plat-card">
                            <div className="plat-icon pi-yt">📺</div>
                            <div className="plat-info">
                                <div className="plat-name">YouTube</div>
                                <div className="plat-sub">Add to about</div>
                            </div><span className="plat-url">linkzy.co/you</span>
                        </div>
                        <div className="plat-card">
                            <div className="plat-icon pi-tw">𝕏</div>
                            <div className="plat-info">
                                <div className="plat-name">Twitter / X</div>
                                <div className="plat-sub">Add to bio</div>
                            </div><span className="plat-url">linkzy.co/you</span>
                        </div>
                        <div className="plat-card">
                            <div className="plat-icon pi-li">💼</div>
                            <div className="plat-info">
                                <div className="plat-name">LinkedIn</div>
                                <div className="plat-sub">Add to profile</div>
                            </div><span className="plat-url">linkzy.co/you</span>
                        </div>
                    </div>
                </div>
            </section>

            {/*  ANALYTICS  */}
            <section className="sec-analytics">
                <div className="section-inner">
                    <div className="stat-cards">
                        <div className="stat-card sc-olive">
                            <span className="s-icon">📈</span>
                            <div className="s-num">43,500</div>
                            <div className="s-label">CLICKS</div>
                            <div className="mini-chart">
                                <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                                <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                            </div>
                        </div>
                        <div className="stat-card sc-purple">
                            <span className="s-icon">🎧</span>
                            <div className="s-num">643</div>
                            <div className="s-label">TRACK PLAYS</div>
                        </div>
                        <div className="stat-card sc-pink">
                            <span className="s-icon">💰</span>
                            <div className="s-num">$2,362</div>
                            <div className="s-label">SALES</div>
                        </div>
                        <div className="stat-card sc-dark">
                            <span className="s-icon">🌍</span>
                            <div className="s-num">960</div>
                            <div className="s-label">CITY VISITS</div>
                        </div>
                    </div>
                    <div>
                        <div className="sec-label">✦ Analytics</div>
                        <h2 className="sec-title">Analyze your audience,<br />keep them engaged.</h2>
                        <p>Track engagement over time, monitor revenue, and learn what's converting your audience. Make smarter updates — on the fly.</p>
                        <button className="btn-login" style={{ marginTop: '16px' }}>See analytics demo →</button>
                    </div>
                </div>
            </section>

        </div>
    );
}
