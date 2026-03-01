import './LandingPage.css';

export default function BlogPage() {
    return (
        <div className="landingRoot" style={{ paddingTop: '140px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 24px' }}>
                <div className="sec-label" style={{ color: "var(--accent-pink)", display: "inline-block", marginBottom: '16px' }}>✦ Blog</div>
                <h1 className="sec-title" style={{ fontSize: '4rem', marginBottom: '24px' }}>Creator News & Strategies.</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '64px', fontWeight: 'bold' }}>Stay ahead of the curve with our latest insights on audience growth and monetization.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', textAlign: 'left' }}>

                    <div className="cardWrapper" style={{ background: 'var(--white)', border: '3px solid var(--black)', borderRadius: '16px', padding: '24px', boxShadow: '6px 6px 0 var(--black)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                        <div style={{ background: 'var(--accent-yellow)', height: '180px', borderRadius: '8px', border: '3px solid var(--black)', marginBottom: '16px' }}></div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>How to optimize your Link-in-Bio for sales.</h3>
                        <p style={{ color: 'var(--muted)', fontWeight: 'bold' }}>Learn the psychological tricks to double your conversion rate.</p>
                    </div>

                    <div className="cardWrapper" style={{ background: 'var(--white)', border: '3px solid var(--black)', borderRadius: '16px', padding: '24px', boxShadow: '6px 6px 0 var(--black)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                        <div style={{ background: 'var(--accent-blue)', height: '180px', borderRadius: '8px', border: '3px solid var(--black)', marginBottom: '16px' }}></div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>Introducing Neo-Brutalist Themes.</h3>
                        <p style={{ color: 'var(--muted)', fontWeight: 'bold' }}>Why raw, expressive design is defeating corporate minimalism.</p>
                    </div>

                    <div className="cardWrapper" style={{ background: 'var(--white)', border: '3px solid var(--black)', borderRadius: '16px', padding: '24px', boxShadow: '6px 6px 0 var(--black)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                        <div style={{ background: 'var(--accent-pink)', height: '180px', borderRadius: '8px', border: '3px solid var(--black)', marginBottom: '16px' }}></div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>Case Study: Music Artist Growth</h3>
                        <p style={{ color: 'var(--muted)', fontWeight: 'bold' }}>How Midnight Waves got 100k streams using their Linkzy page.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
