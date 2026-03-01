import { useNavigate } from 'react-router-dom';
import styles from './TemplateCard.module.css';

export interface ThemeConfig {
    id: string;
    name: string;
    category: string;
    bg: string;
    screenBg: string;
    textColor: string;
    btnBg: string;
    btnText: string;
    borderFormat: 'none' | 'thin' | 'thick';
    shadowFormat: 'none' | 'soft' | 'hard';
    fontFamily: string;
    layoutType: 'centered' | 'left' | 'grid';
    // Which content block style to render inside the phone
    blockStyle?: 'links' | 'music' | 'photos' | 'product';
    avatarSeed?: string;
}

// Social icon SVGs as simple circles with emoji labels
const SOCIAL_ICONS = ['📸', '🎵', '🐦', '▶️'];

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
    return (
        <div className={styles.musicContent}>
            <div className={styles.albumArt} style={{ border: `2px solid ${btnBg}` }}>
                <div className={styles.albumInner} style={{ background: btnBg }}>🎵</div>
            </div>
            <div className={styles.songTitle} style={{ color: textColor, fontFamily: theme.fontFamily }}>
                Midnight Echoes
            </div>
            <div className={styles.songArtist} style={{ color: textColor, opacity: 0.6 }}>The Wanderers</div>
            <div className={styles.playerControls}>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ background: btnBg }} /></div>
                <div className={styles.controlRow} style={{ color: textColor }}>
                    <span>⏮</span><span className={styles.playBtn} style={{ background: btnBg, color: btnText }}>▶</span><span>⏭</span>
                </div>
            </div>
            <div className={styles.trackList}>
                {['', ''].map((_, i) => (
                    <div key={i} className={styles.trackRow} style={{ borderColor: `${textColor}20`, color: textColor }}>
                        <div className={styles.trackDot} style={{ background: btnBg }} />
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
                style={{ background: btnBg, color: btnText, borderRadius: '10px', marginTop: 8, fontFamily: theme.fontFamily }}
            >
                📷 View All Photos
            </div>
        </div>
    );
}

function ProductContent({ theme, textColor, btnBg, btnText, getBorder, getShadow, borderRadius }: PhoneContentProps) {
    return (
        <div className={styles.productContent}>
            <div className={styles.productCard} style={{ border: getBorder(), boxShadow: getShadow() }}>
                <div className={styles.productImage} style={{ background: `${btnBg}30` }}>
                    <span style={{ fontSize: '32px' }}>🛍️</span>
                </div>
                <div className={styles.productInfo}>
                    <div className={styles.productName} style={{ color: textColor, fontFamily: theme.fontFamily }}>Limited Edition Cap</div>
                    <div className={styles.productPrice} style={{ color: btnBg }}>$49.00</div>
                </div>
            </div>
            <div className={styles.productCard} style={{ border: getBorder(), boxShadow: getShadow() }}>
                <div className={styles.productImage} style={{ background: `${btnBg}30` }}>
                    <span style={{ fontSize: '32px' }}>👟</span>
                </div>
                <div className={styles.productInfo}>
                    <div className={styles.productName} style={{ color: textColor, fontFamily: theme.fontFamily }}>Collab Sneaker</div>
                    <div className={styles.productPrice} style={{ color: btnBg }}>$129.00</div>
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
                {/* Camera notch */}
                <div className={styles.phoneNotch} />

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
                    {/* Banner / header gradient strip */}
                    <div className={styles.bannerStrip} style={{ background: theme.btnBg }} />

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

                    {/* Social icons */}
                    <div className={styles.socials} style={{ alignSelf: 'center' }}>
                        {SOCIAL_ICONS.map((icon, i) => (
                            <div key={i} className={styles.socialIcon} style={{ color: theme.textColor, opacity: 0.7 }}>
                                {icon}
                            </div>
                        ))}
                    </div>
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
