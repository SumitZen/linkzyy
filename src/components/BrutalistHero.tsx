import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { BrandIcon } from './BrandLogo';

export default function BrutalistHero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const mockupRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

            if (textRef.current && mockupRef.current) {
                // Subtle Text Reveal
                tl.fromTo(
                    textRef.current.children,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
                    0.2
                );

                // Elegant Layout Float
                tl.fromTo(
                    mockupRef.current.children,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 },
                    0.4
                );
            }
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="hero-section" ref={heroRef}>
            <div className="hero-text-block" ref={textRef}>
                <div className="hero-badge">
                    <BrandIcon size={18} color="#b5637a" />
                    One link. All of you.
                </div>
                <h1 className="hero-headline">
                    Your Identity, <br />
                    <span>Refined.</span>
                </h1>
                <p className="hero-subhead">
                    A sophisticated, typography-first link-in-bio platform for creators who demand elegance. Stop settling for basic templates.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="btn-signup" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={() => navigate('/signup')}>Start for free</button>
                    <button className="btn-login" style={{ padding: '14px 24px' }} onClick={() => navigate('/templates')}>View examples</button>
                </div>
            </div>

            {/* Deep Spatial Composition App Mockup */}
            <div className="spatial-mockup-wrapper" ref={mockupRef}>

                {/* Floating Parallax Layers */}
                <div className="floating-card card-left">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
                            alt="Creator"
                            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.06)', flexShrink: 0 }}
                        />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Latest Release</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Now Streaming</div>
                        </div>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="Album Art"
                        style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                </div>

                <div className="floating-card card-right">
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-dark)' }}>24k+</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Monthly Views</div>
                    <div style={{ display: 'flex', gap: '4px', height: '40px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, background: 'var(--text-dark)', height: '40%', borderRadius: '4px' }}></div>
                        <div style={{ flex: 1, background: 'var(--text-dark)', height: '70%', borderRadius: '4px' }}></div>
                        <div style={{ flex: 1, background: 'var(--accent-secondary)', height: '100%', borderRadius: '4px' }}></div>
                        <div style={{ flex: 1, background: 'var(--text-dark)', height: '60%', borderRadius: '4px' }}></div>
                        <div style={{ flex: 1, background: 'var(--text-dark)', height: '85%', borderRadius: '4px' }}></div>
                    </div>
                </div>

                {/* Primary Physical Device */}
                <div className="main-device" style={{ background: '#0A0A0A' }}>
                    <div className="mockup-header">
                        <div
                            className="mockup-avatar"
                            style={{
                                background: 'url(https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80) center/cover',
                                border: '3px solid rgba(139,92,246,0.5)',
                                boxShadow: '0 0 24px rgba(139,92,246,0.4)'
                            }}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <h2 className="mockup-name" style={{ color: '#f5f3ff', fontFamily: 'var(--font-serif)' }}>Aria Wolfe</h2>
                            <p className="mockup-bio" style={{ color: '#a5b4fc' }}>Design Director & Typographer</p>
                        </div>
                    </div>

                    <div className="mockup-links">
                        <div className="mockup-link" style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🖼️</span> My Portfolio
                        </div>
                        <div className="mockup-link" style={{ background: 'rgba(255,255,255,0.08)', color: '#e0e7ff', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>✉️</span> Read my Newsletter
                        </div>
                        <div className="mockup-link" style={{ background: 'rgba(255,255,255,0.08)', color: '#e0e7ff', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🛒</span> Purchase Prints
                        </div>
                        <div className="mockup-link" style={{ background: 'rgba(255,255,255,0.08)', color: '#e0e7ff', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>💬</span> Contact for Work
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
