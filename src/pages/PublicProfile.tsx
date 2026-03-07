import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { Query } from 'appwrite';
import { templatesList } from '../lib/themes';
import { PLATFORM_ICONS, PLATFORM_COLORS } from '../lib/platformIcons';
import type { LinkItem } from '../context/AuthContext';
import { getContrastingColor } from '../lib/utils';

function PlatformIcon({ id, size = 24 }: { id: string; size?: number }) {
    const found = PLATFORM_ICONS.find(p => p.id === id);
    const color = PLATFORM_COLORS[id] ?? '#6b7280';
    const svg = found?.svg ?? PLATFORM_ICONS[0].svg;
    return (
        <span
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, flexShrink: 0 }}
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
                    setProfile(res.documents[0]);
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
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff' }}>Loading profile...</div>;
    }
    if (error || !profile) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', gap: 16 }}>
                <h2>{error || 'Profile not found'}</h2>
                <a href="/" style={{ color: '#7c3aed', textDecoration: 'none' }}>Create your own Linkzy</a>
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
            {/* Banner */}
            {profile.bannerUrl && (
                <div style={{ width: '100%', height: 240, backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
            )}

            <div style={{
                width: '100%',
                maxWidth: 680,
                padding: '0 24px 64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: profile.bannerUrl ? -52 : 64,
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

                {/* Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                    {links.filter(l => l.enabled !== false).map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="bento-public-link" style={{
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
                            <PlatformIcon id={link.icon} size={24} /><span>{link.label}</span>
                        </a>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', marginTop: 32 }}>
                    {blocks.filter(b => b.enabled !== false).map(block => (
                        <div key={block.id} style={{
                            width: '100%', marginBottom: 16,
                            background: theme.btnBg, color: theme.btnText,
                            padding: 24, paddingBottom: 24,
                            borderRadius: theme.borderFormat === 'thick' ? 12 : 32,
                            border: theme.btnBorder !== 'none' ? theme.btnBorder : undefined,
                            boxShadow: theme.btnShadow !== 'none' ? theme.btnShadow : undefined,
                            backdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                            WebkitBackdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                            fontFamily: theme.fontFamily
                        }}>
                            {block.type === 'music' && (
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    {block.coverUrl && <img src={block.coverUrl} alt="Cover" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{block.title}</div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{block.artist}</div>
                                    </div>
                                    <a href={block.embedUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: theme.textColor, color: theme.bg, textDecoration: 'none', fontWeight: 600, borderRadius: 8 }}>Play</a>
                                </div>
                            )}

                            {block.type === 'photo' && (
                                <div>
                                    {block.caption && <p style={{ fontWeight: 600, marginBottom: 16 }}>{block.caption}</p>}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                                        {block.images.map((img: string, i: number) => (
                                            <img key={i} src={img} alt={`img-${i}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {block.type === 'product' && (
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    {block.imageUrl && <img src={block.imageUrl} alt="Product" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{block.name}</div>
                                        <div style={{ fontWeight: 800, marginTop: 4 }}>{block.price}</div>
                                    </div>
                                    <a href={block.buyUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: theme.textColor, color: theme.bg, textDecoration: 'none', fontWeight: 600, borderRadius: 8 }}>Buy</a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div> {/* End scrollable content wrap */}

            {/* Bottom Watermark - Pushed to bottom by flex: 1 above */}
            <div style={{ 
                width: '100%',
                padding: '40px 0 24px', 
                fontSize: '0.85rem', 
                color: profile.bgImage || (profile.bgColor && getContrastingColor(profile.bgColor).includes('255')) ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', 
                textAlign: 'center', 
                fontWeight: 600,
                flexShrink: 0
            }}>
                <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Powered by Linkzy</a>
            </div>
        </div>
    );
}
