import { useNavigate } from 'react-router-dom';
import styles from './TemplateCard.module.css';

import type { ThemeConfig } from '../lib/themes';


// Category → default content block type
function getBlockStyle(category: string): 'links' | 'music' | 'photos' | 'product' {
    if (/music|artist|band|audio/i.test(category)) return 'music';
    if (/photo|travel|nature|beauty|fashion|lifestyle/i.test(category)) return 'photos';
    if (/product|food|shop|brand|business|agency/i.test(category)) return 'product';
    return 'links';
}

interface PhoneContentProps {
    theme: ThemeConfig;
    blockStyle: 'links' | 'music' | 'photos' | 'product';
    textColor: string;
    btnBg: string;
    btnText: string;
    getBorder: () => string;
    getShadow: () => string;
    borderRadius: string;
}

function LinksContent({ theme, btnBg, btnText, getBorder, getShadow, borderRadius }: PhoneContentProps) {
    const labels = ['✦ Latest Drop', '▻ Book a Call', '💌 Newsletter', '🎥 YouTube'];
    return (
        <div className={styles.linkList}>
            {labels.map((label, i) => (
                <div
                    key={i}
                    className={styles.mockLink}
                    style={{
                        background: btnBg,
                        color: btnText,
                        border: getBorder(),
                        boxShadow: getShadow(),
                        borderRadius,
                        fontFamily: theme.fontFamily,
                        backdropFilter: theme.backdropBlur,
                        WebkitBackdropFilter: theme.backdropBlur,
                    }}
                >
                    {label}
                </div>
            ))}
        </div>
    );
}

function MusicContent({ theme, btnBg, btnText }: PhoneContentProps) {
    const textColor = theme.textColor;
    const isGradient = btnBg.includes('gradient') || btnBg.includes('url');
    const safeBorder = theme.btnBorder || (isGradient ? 'none' : `2px solid ${btnBg}`);
    const safeDotBg = isGradient ? textColor : btnBg;

    return (
        <div className={styles.musicContent}>
            <div className={styles.albumArt} style={{ border: safeBorder, boxShadow: theme.btnShadow }}>
                <div className={styles.albumInner} style={{ background: btnBg }}>🎵</div>
            </div>
            <div className={styles.songTitle} style={{ color: textColor, fontFamily: theme.fontFamily }}>
                Midnight Echoes
            </div>
            <div className={styles.songArtist} style={{ color: textColor, opacity: 0.6 }}>The Wanderers</div>
            <div className={styles.playerControls}>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ background: isGradient ? textColor : btnBg }} /></div>
                <div className={styles.controlRow} style={{ color: textColor }}>
                    <span>⏮</span><span className={styles.playBtn} style={{ background: btnBg, color: btnText }}>▶</span><span>⏭</span>
                </div>
            </div>
            <div className={styles.trackList}>
                {['', ''].map((_, i) => (
                    <div key={i} className={styles.trackRow} style={{ borderColor: `${textColor}20`, color: textColor }}>
                        <div className={styles.trackDot} style={{ background: safeDotBg }} />
                        <div className={styles.trackMeta}>
                            <div className={styles.trackName} style={{ background: `${textColor}30` }} />
                            <div className={styles.trackLen} style={{ background: `${textColor}20` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PhotosContent({ theme, btnBg, btnText }: PhoneContentProps) {
    const seeds = [10, 20, 30, 40, 50, 60];
    return (
        <div className={styles.photoContent}>
            <div className={styles.photoGrid}>
                {seeds.map((s, i) => (
                    <div
                        key={i}
                        className={styles.photoThumb}
                        style={{
                            backgroundImage: `url(https://picsum.photos/seed/${s + parseInt(theme.id)}/80/80)`,
                        }}
                    />
                ))}
            </div>
            <div
                className={styles.mockLink}
                style={{
                    background: btnBg,
                    color: btnText,
                    borderRadius: '10px',
                    marginTop: 8,
                    fontFamily: theme.fontFamily,
                    border: theme.btnBorder || 'none',
                    boxShadow: theme.btnShadow || 'none',
                    backdropFilter: theme.backdropBlur,
                    WebkitBackdropFilter: theme.backdropBlur,
                }}
            >
                📷 View All Photos
            </div>
        </div>
    );
}

function ProductContent({ theme, textColor, btnBg, btnText, getBorder, getShadow, borderRadius }: PhoneContentProps) {
    const isGradient = btnBg.includes('gradient') || btnBg.includes('url');
    const safeBg = isGradient ? 'rgba(255,255,255,0.15)' : `${btnBg}30`;
    const cardStyle = {
        border: theme.btnBorder || getBorder(),
        boxShadow: theme.btnShadow || getShadow(),
        backdropFilter: theme.backdropBlur,
        WebkitBackdropFilter: theme.backdropBlur,
    };
    return (
        <div className={styles.productContent}>
            <div className={styles.productCard} style={cardStyle}>
                <div className={styles.productImage} style={{ background: safeBg }}>
                    <span style={{ fontSize: '32px' }}>🛍️</span>
                </div>
                <div className={styles.productInfo}>
                    <div className={styles.productName} style={{ color: textColor, fontFamily: theme.fontFamily }}>Limited Edition Cap</div>
                    <div className={styles.productPrice} style={{ color: isGradient ? textColor : btnBg }}>$49.00</div>
                </div>
            </div>
            <div className={styles.productCard} style={cardStyle}>
                <div className={styles.productImage} style={{ background: safeBg }}>
                    <span style={{ fontSize: '32px' }}>👟</span>
                </div>
                <div className={styles.productInfo}>
                    <div className={styles.productName} style={{ color: textColor, fontFamily: theme.fontFamily }}>Collab Sneaker</div>
                    <div className={styles.productPrice} style={{ color: isGradient ? textColor : btnBg }}>$129.00</div>
                </div>
            </div>
            <div

                className={styles.mockLink}
                style={{ background: btnBg, color: btnText, borderRadius, fontFamily: theme.fontFamily }}
            >
                🛒 Shop All Products
            </div>
        </div>
    );
}

interface Props {
    theme: ThemeConfig;
    avatarUrl?: string;
    username?: string;
    isLoggedIn?: boolean;
}

export default function TemplateCard({ theme, avatarUrl, username = 'Creator Name', isLoggedIn = false }: Props) {
    const navigate = useNavigate();
    const blockStyle = theme.blockStyle ?? getBlockStyle(theme.category);

    const handleClick = () => {
        if (isLoggedIn) {
            navigate(`/dashboard?template=${theme.id}`);
        } else {
            navigate(`/signup?template=${theme.id}`);
        }
    };

    const getBorder = () => {
        if (theme.borderFormat === 'thick') return `2.5px solid ${theme.textColor === '#fff' || theme.textColor === '#FFFFFF' || theme.textColor.startsWith('#f') || theme.textColor.startsWith('#e') || theme.textColor.startsWith('#d') || theme.textColor.startsWith('#c') ? 'rgba(255,255,255,0.25)' : '#000'}`;
        if (theme.borderFormat === 'thin') return `1px solid ${theme.textColor.toLowerCase().includes('fff') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`;
        return 'none';
    };

    const getShadow = () => {
        if (theme.shadowFormat === 'hard') return `3px 3px 0px ${theme.textColor.toLowerCase().includes('fff') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.5)'}`;
        if (theme.shadowFormat === 'soft') return '0 6px 20px rgba(0,0,0,0.08)';
        return 'none';
    };

    const borderRadius = theme.borderFormat === 'thick' ? '10px' : '100px';

    const contentProps: PhoneContentProps = {
        theme,
        blockStyle,
        textColor: theme.textColor,
        btnBg: theme.btnBg,
        btnText: theme.btnText,
        getBorder,
        getShadow,
        borderRadius,
    };

    return (
        <div className={styles.cardWrapper} onClick={handleClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleClick()}>
            {/* Phone frame */}
            <div className={styles.phoneMockup}>
                {/* Screen */}
                <div
                    className={styles.screen}
                    style={{
                        background: theme.screenBg,
                        color: theme.textColor,
                        fontFamily: theme.fontFamily,
                        alignItems: theme.layoutType === 'centered' ? 'center' : 'flex-start',
                    }}
                >
                    {/* Avatar */}
                    <div
                        className={styles.avatarRing}
                        style={{ borderColor: theme.btnBg }}
                    >
                        <div
                            className={styles.avatar}
                            style={{
                                backgroundImage: `url(${avatarUrl || `https://i.pravatar.cc/150?u=${theme.id}`})`,
                                alignSelf: theme.layoutType === 'centered' ? 'center' : 'flex-start',
                            }}
                        />
                    </div>

                    <div
                        className={styles.title}
                        style={{
                            alignSelf: theme.layoutType === 'centered' ? 'center' : 'flex-start',
                            textAlign: theme.layoutType === 'centered' ? 'center' : 'left',
                        }}
                    >
                        {username}
                    </div>
                    <div
                        className={styles.bio}
                        style={{
                            alignSelf: theme.layoutType === 'centered' ? 'center' : 'flex-start',
                            textAlign: theme.layoutType === 'centered' ? 'center' : 'left',
                        }}
                    >
                        {theme.category} · Creator
                    </div>

                    {/* Content block */}
                    {blockStyle === 'links' && <LinksContent {...contentProps} />}
                    {blockStyle === 'music' && <MusicContent {...contentProps} />}
                    {blockStyle === 'photos' && <PhotosContent {...contentProps} />}
                    {blockStyle === 'product' && <ProductContent {...contentProps} />}


                </div>
            </div>

            {/* Label below phone */}
            <div className={styles.cardInfo}>
                <div className={styles.themeName}>{theme.name}</div>
                <div className={styles.themeCategory}>{theme.category}</div>
                <div className={styles.clickHint}>Click to use →</div>
            </div>
        </div>
    );
}
