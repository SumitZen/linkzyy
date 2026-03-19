import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { Query } from 'appwrite';
import { templatesList } from '../lib/themes';
import { PLATFORM_ICONS, PLATFORM_COLORS } from '../lib/platformIcons';
import type { LinkItem } from '../context/AuthContext';
import { getContrastingColor } from '../lib/utils';

function PlatformIcon({ id, size = 24, color }: { id: string; size?: number; color?: string }) {
    const found = PLATFORM_ICONS.find(p => p.id === id);
    const svg = (found?.svg ?? PLATFORM_ICONS[0].svg)
        .replace('<svg ', `<svg style="width: 100%; height: 100%; display: block;" `);
    
    return (
        <span
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: size, 
                height: size, 
                color: color || PLATFORM_COLORS[id] || '#6b7280', 
                flexShrink: 0 
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-label={found?.label ?? id}
        />
    );
}

export default function PublicProfile() {
    const { userId } = useParams<{ userId: string }>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.profilesCollectionId,
                    [Query.equal('userId', userId as string), Query.limit(1)]
                );
                if (res.documents.length === 0) {
                    setError('Profile not found.');
                } else {
                    const doc = res.documents[0];
                    setProfile(doc);

                    // ─── Analytics: Increment View Count ───
                    const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
                    if (!isPreview) {
                        try {
                            await databases.updateDocument(
                                APPWRITE_CONFIG.databaseId,
                                APPWRITE_CONFIG.profilesCollectionId,
                                doc.$id,
                                { views: (Number(doc.views) || 0) + 1 }
                            );
                        } catch (err) {
                            console.error('Failed to increment views:', err);
                        }
                    }
                }
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message || 'Error fetching profile');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#0a0a0f',
                color: '#fff',
                fontFamily: 'var(--font-body)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <div style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: 500, letterSpacing: '0.05em' }}>LINKZY</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#0a0a0f', 
                color: '#fff', 
                gap: 24,
                padding: 20,
                textAlign: 'center'
            }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{error || 'Profile not found'}</h2>
                <p style={{ opacity: 0.6, maxWidth: 400 }}>The profile you're looking for doesn't exist or has been moved.</p>
                <a href="/" style={{ 
                    padding: '12px 24px', 
                    background: '#fff', 
                    color: '#000', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                }}>Create your own Linkzy</a>
            </div>
        );
    }

    const rawThemeString = profile.theme || 'editorial-light';
    const [themeId, manualTextColor] = rawThemeString.includes('|') ? rawThemeString.split('|') : [rawThemeString, ''];
    const theme = templatesList.find(t => t.id === themeId) ?? templatesList[0];
    const previewBg = profile.bgImage ? `url(${profile.bgImage}) top center/cover no-repeat` : profile.bgColor || theme.screenBg;

    const forceParseJSON = (data: unknown): any[] => {
        if (!data) return [];
        try {
            if (Array.isArray(data)) {
                // If Appwrite returned a string array, parse each item
                if (data.length > 0 && typeof data[0] === 'string') {
                    const parsedArray = data.map(item => {
                        try { return JSON.parse(item); } catch { return item; }
                    });
                    // If it's an array of length 1 that contains another array, flatten it
                    if (parsedArray.length === 1 && Array.isArray(parsedArray[0])) return parsedArray[0];
                    return parsedArray;
                }
                return data;
            }
            if (typeof data === 'string') {
                const parsed = JSON.parse(data);
                // Handle double serialization
                if (typeof parsed === 'string') return forceParseJSON(parsed);
                if (Array.isArray(parsed)) return parsed;
                return [parsed];
            }
            return [];
        } catch (err) {
            console.error('Failed to parse data:', data, err);
            return [];
        }
    };

    let links: LinkItem[] = forceParseJSON(profile?.links);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let blocks: any[] = forceParseJSON(profile?.blocks);

    const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
    const userPlan = profile.plan || 'free';
    const totalContent = [...links.map(l => ({ ...l, itemType: 'link' })), ...blocks.map(b => ({ ...b, itemType: 'block' }))];
    const visibleContent = (userPlan === 'free' && !isPreview) ? totalContent.slice(0, 5) : totalContent;

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: previewBg,
            backgroundPosition: 'top center',
            backgroundSize: 'cover',
            backgroundAttachment: 'scroll',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflowX: 'hidden'
        }}>

            <div style={{
                width: '100%',
                maxWidth: 680,
                padding: '0 24px 64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 64,
                position: 'relative',
                zIndex: 10,
                flex: 1
            }}>
                {/* Avatar */}
                <div style={{
                    width: 104, height: 104, borderRadius: '50%', marginBottom: 16, background: '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                    {profile.avatarUrl
                        ? <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{(profile.displayName || profile.username || 'U').charAt(0).toUpperCase()}</span>
                    }
                </div>

                {/* Name & Bio */}
                <h1 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: manualTextColor || (profile.bgImage ? '#fff' : (profile.bgColor ? getContrastingColor(profile.bgColor) : theme.textColor)), 
                    textShadow: profile.bgImage ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
                    textAlign: 'center', 
                    marginBottom: 8, 
                    margin: 0 
                }}>
                    {profile.displayName || profile.username}
                </h1>
                <p style={{ 
                    fontSize: '1rem', 
                    color: manualTextColor || (profile.bgImage ? '#fff' : (profile.bgColor ? getContrastingColor(profile.bgColor) : theme.textColor)), 
                    opacity: manualTextColor || profile.bgImage ? 1 : 0.8,
                    textShadow: profile.bgImage ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                    textAlign: 'center', 
                    marginBottom: 32, 
                    maxWidth: 500, 
                    lineHeight: 1.6 
                }}>
                    {profile.bio}
                </p>

                {/* Content (Links & Blocks combined for proper limit enforcement) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                    {visibleContent.filter(item => item.enabled !== false).map((item: any) => {
                        if (item.itemType === 'link') {
                            return (
                                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="bento-public-link" style={{
                                    background: theme.btnBg,
                                    color: theme.btnText,
                                    borderRadius: theme.borderFormat === 'thick' ? 12 : 32,
                                    padding: '16px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    border: theme.btnBorder !== 'none' ? theme.btnBorder : undefined,
                                    boxShadow: theme.btnShadow !== 'none' ? theme.btnShadow : undefined,
                                    backdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                                    WebkitBackdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                                    fontFamily: theme.fontFamily,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}>
                                    <PlatformIcon id={item.icon} size={24} color={theme.btnText} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                                </a>
                            );
                        } else {
                            // Block rendering
                            return (
                                <div key={item.id} style={{
                                    width: '100%',
                                    background: theme.btnBg, color: theme.btnText,
                                    padding: 24,
                                    borderRadius: theme.borderFormat === 'thick' ? 12 : 32,
                                    border: theme.btnBorder !== 'none' ? theme.btnBorder : undefined,
                                    boxShadow: theme.btnShadow !== 'none' ? theme.btnShadow : undefined,
                                    backdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                                    WebkitBackdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                                    fontFamily: theme.fontFamily
                                }}>
                                    {item.type === 'music' && (
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            {item.coverUrl && <img src={item.coverUrl} alt="Cover" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.artist}</div>
                                            </div>
                                            <a href={item.embedUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: theme.textColor, color: theme.bg, textDecoration: 'none', fontWeight: 600, borderRadius: 8, whiteSpace: 'nowrap' }}>Play</a>
                                        </div>
                                    )}

                                    {item.type === 'photo' && (
                                        <div>
                                            {item.caption && <p style={{ fontWeight: 600, marginBottom: 16 }}>{item.caption}</p>}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                                                {item.images.map((img: string, i: number) => (
                                                    <img key={i} src={img} alt={`img-${i}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12 }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'product' && (
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            {item.imageUrl && <img src={item.imageUrl} alt="Product" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                                <div style={{ fontWeight: 800, marginTop: 4 }}>{item.price}</div>
                                            </div>
                                            <a href={item.buyUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: theme.textColor, color: theme.bg, textDecoration: 'none', fontWeight: 600, borderRadius: 8, whiteSpace: 'nowrap' }}>Buy</a>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>

            </div> {/* End scrollable content wrap */}

            {/* Premium Floating Watermark */}
            {userPlan === 'free' && (
                <div style={{ 
                    position: 'fixed',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    pointerEvents: 'none'
                }}>
                    <a href="/" style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 999,
                        color: profile.bgImage || (profile.bgColor && getContrastingColor(profile.bgColor).includes('255')) ? '#fff' : '#000',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        letterSpacing: '0.05em',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        pointerEvents: 'auto',
                        transition: 'transform 0.2s ease'
                    }}>
                        <span style={{ 
                            width: 18, 
                            height: 18, 
                            background: '#121826', 
                            color: '#fff', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '0.6rem'
                        }}>L</span>
                        LINKZY
                    </a>
                </div>
            )}
        </div>
    );
}
