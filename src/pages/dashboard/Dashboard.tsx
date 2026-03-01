import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { LinkItem, Block, MusicBlock, PhotoBlock, ProductBlock } from '../../context/AuthContext';
import { PLATFORM_ICONS, PLATFORM_COLORS } from '../../lib/platformIcons';
import { templatesList } from '../../lib/themes';
import './Dashboard.css';

type Tab = 'links' | 'appearance' | 'analytics' | 'settings';

// Icon helper — renders real SVG from a platform id (falls back to a generic link icon)
function PlatformIcon({ id, size = 18 }: { id: string; size?: number }) {
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

export default function Dashboard() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState<Tab>('links');
    const [savedMsg, setSavedMsg] = useState('');

    // ─── Content state ───
    const [links, setLinks] = useState<LinkItem[]>(user?.links ?? []);
    const [blocks, setBlocks] = useState<Block[]>(user?.blocks ?? []);

    // Simple link form (always visible)
    const [newIcon, setNewIcon] = useState('link');
    const [newLabel, setNewLabel] = useState('');
    const [newUrl, setNewUrl] = useState('');

    // Advanced block panel
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advType, setAdvType] = useState<'music' | 'photo' | 'product'>('music');
    const [mt, setMt] = useState(''); const [ma, setMa] = useState('');
    const [me, setMe] = useState(''); const [mc, setMc] = useState('');
    const [pImg, setPImg] = useState(''); const [pCap, setPCap] = useState('');
    const [prName, setPrName] = useState(''); const [prPrice, setPrPrice] = useState('');
    const [prBuy, setPrBuy] = useState(''); const [prImg, setPrImg] = useState('');

    // ─── Appearance state ───
    const [name, setName] = useState(user?.name ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
    const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl ?? '');
    const [bgColor, setBgColor] = useState(user?.bgColor ?? '');
    const [bgImage, setBgImage] = useState(user?.bgImage ?? '');
    const [selTheme, setSelTheme] = useState(user?.theme ?? 'editorial-light');

    // ─── Settings state ───
    const [settingsName, setSettingsName] = useState(user?.name ?? '');

    const theme = templatesList.find(t => t.id === selTheme) ?? templatesList[0];
    const previewBg = bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor || theme.bg;

    const flash = () => { setSavedMsg('Saved!'); setTimeout(() => setSavedMsg(''), 1800); };

    // ─── Auto-Apply Theme from URL ───
    useEffect(() => {
        const themeToApply = searchParams.get('template');
        if (themeToApply && templatesList.some(t => t.id === themeToApply)) {
            setSelTheme(themeToApply);
            updateUser({ theme: themeToApply });
            setTab('appearance'); // Jump right into Appearance so they see what happened
            // Auto strip the query param so refresh doesn't re-trigger
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams, updateUser]);

    // CRUD helpers
    const saveLinks = (u: LinkItem[]) => { setLinks(u); updateUser({ links: u }); };
    const saveBlocks = (u: Block[]) => { setBlocks(u); updateUser({ blocks: u }); };

    const addLink = () => {
        if (!newLabel.trim() || !newUrl.trim()) return;
        const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
        saveLinks([...links, { id: crypto.randomUUID(), type: 'link', label: newLabel.trim(), url, icon: newIcon, enabled: true }]);
        setNewLabel(''); setNewUrl('');
    };

    const removeLink = (id: string) => saveLinks(links.filter(l => l.id !== id));
    const toggleLink = (id: string) => saveLinks(links.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
    const removeBlock = (id: string) => saveBlocks(blocks.filter(b => b.id !== id));
    const toggleBlock = (id: string) => saveBlocks(blocks.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));

    const addBlock = () => {
        const id = crypto.randomUUID();
        if (advType === 'music' && mt && me) {
            saveBlocks([...blocks, { id, type: 'music', title: mt, artist: ma, embedUrl: me, coverUrl: mc, enabled: true } as MusicBlock]);
            setMt(''); setMa(''); setMe(''); setMc('');
        } else if (advType === 'photo') {
            const imgs = pImg.split(',').map(s => s.trim()).filter(Boolean);
            if (!imgs.length) return;
            saveBlocks([...blocks, { id, type: 'photo', images: imgs, caption: pCap, enabled: true } as PhotoBlock]);
            setPImg(''); setPCap('');
        } else if (advType === 'product' && prName && prBuy) {
            saveBlocks([...blocks, { id, type: 'product', name: prName, price: prPrice, imageUrl: prImg, buyUrl: prBuy, enabled: true } as ProductBlock]);
            setPrName(''); setPrPrice(''); setPrBuy(''); setPrImg('');
        }
        setShowAdvanced(false);
    };

    const saveAppearance = () => { updateUser({ name, bio, avatarUrl, bannerUrl, bgColor, bgImage, theme: selTheme }); flash(); };

    const TABS: { id: Tab; label: string }[] = [
        { id: 'links', label: 'Links' }, { id: 'appearance', label: 'Appearance' },
        { id: 'analytics', label: 'Analytics' }, { id: 'settings', label: 'Settings' },
    ];

    return (
        <div className="bento-root">
            {/* ── TOP NAV ── */}
            <header className="bento-nav">
                <div className="bento-brand">
                    <span className="bento-gem">◆</span>
                    <span className="bento-logo">Linkzy</span>
                    <span className="bento-breadcrumb">/ Dashboard</span>
                </div>
                <div className="bento-nav-pills">
                    {TABS.map(t => (
                        <button key={t.id} className={`bento-nav-pill${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="bento-nav-right">
                    <div className="bento-user-avatar">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <button className="bento-share-btn" onClick={() => { navigator.clipboard?.writeText?.(`https://linkzy.co/${user?.username}`); flash(); }}>
                        Share
                    </button>
                    <button className="bento-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                </div>
            </header>

            {/* ── BENTO GRID (links + analytics tabs) ── */}
            {(tab === 'links' || tab === 'analytics') && (
                <div className="bento-grid">

                    {/* ── STAT CARDS ── */}
                    <div className="bento-card bento-stat bento-stat-purple">
                        <div className="bento-stat-icon">🔗</div>
                        <div className="bento-stat-label">Active Links</div>
                        <div className="bento-stat-value" style={{ color: '#7c3aed' }}>
                            {links.filter(l => l.enabled).length + blocks.filter(b => b.enabled).length}
                        </div>
                        <div className="bento-stat-sub">of {links.length + blocks.length} total</div>
                    </div>
                    <div className="bento-card bento-stat bento-stat-green">
                        <div className="bento-stat-icon">👁</div>
                        <div className="bento-stat-label">Profile Views</div>
                        <div className="bento-stat-value" style={{ color: '#10b981' }}>—</div>
                        <div className="bento-stat-sub">Tracking coming soon</div>
                    </div>
                    <div className="bento-card bento-stat bento-stat-amber">
                        <div className="bento-stat-icon">📊</div>
                        <div className="bento-stat-label">Link Clicks</div>
                        <div className="bento-stat-value" style={{ color: '#f59e0b' }}>—</div>
                        <div className="bento-stat-sub">Tracking coming soon</div>
                    </div>

                    {/* ── LINKS CARD ── */}
                    <div className="bento-card bento-links-card">
                        <div className="bento-card-header">
                            <h2 className="bento-card-title">Your Links</h2>
                        </div>

                        {/* Simple add row */}
                        <div className="bento-simple-add">
                            {/* Icon picker — real brand SVGs */}
                            <div className="bento-icon-picker">
                                <div className="bento-icon-display">
                                    <PlatformIcon id={newIcon} size={20} />
                                </div>
                                <div className="bento-icon-grid">
                                    {PLATFORM_ICONS.map(p => (
                                        <button
                                            key={p.id}
                                            title={p.label}
                                            className={`bento-icon-opt${newIcon === p.id ? ' sel' : ''}`}
                                            onClick={() => setNewIcon(p.id)}
                                        >
                                            <PlatformIcon id={p.id} size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input
                                className="bento-input bento-flex1"
                                placeholder="Title  (e.g. My Website)"
                                value={newLabel}
                                onChange={e => setNewLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addLink()}
                            />
                            <input
                                className="bento-input bento-flex2"
                                placeholder="URL  (e.g. example.com)"
                                value={newUrl}
                                onChange={e => setNewUrl(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addLink()}
                            />
                            <button className="bento-add-link-btn" onClick={addLink}>+ Add</button>
                        </div>

                        {/* Advanced block toggle */}
                        <button className="bento-adv-toggle" onClick={() => setShowAdvanced(v => !v)}>
                            {showAdvanced ? '▲ Hide advanced blocks' : '+ Add Music / Photos / Product'}
                        </button>

                        {showAdvanced && (
                            <div className="bento-adv-panel">
                                <div className="bento-adv-tabs">
                                    {(['music', 'photo', 'product'] as const).map(t => (
                                        <button key={t} className={`bento-adv-tab${advType === t ? ' active' : ''}`} onClick={() => setAdvType(t)}>
                                            {t === 'music' ? '🎵 Music' : t === 'photo' ? '📷 Photos' : '🛍️ Product'}
                                        </button>
                                    ))}
                                </div>

                                {advType === 'music' && (
                                    <div className="bento-adv-fields">
                                        <input className="bento-input" placeholder="Song title *" value={mt} onChange={e => setMt(e.target.value)} />
                                        <input className="bento-input" placeholder="Artist name" value={ma} onChange={e => setMa(e.target.value)} />
                                        <input className="bento-input" placeholder="Spotify / SoundCloud embed URL *" value={me} onChange={e => setMe(e.target.value)} />
                                        <input className="bento-input" placeholder="Cover image URL (optional)" value={mc} onChange={e => setMc(e.target.value)} />
                                        <button className="bento-save" onClick={addBlock}>Add Music Block</button>
                                    </div>
                                )}
                                {advType === 'photo' && (
                                    <div className="bento-adv-fields">
                                        <input className="bento-input" placeholder="Caption (optional)" value={pCap} onChange={e => setPCap(e.target.value)} />
                                        <textarea className="bento-input" placeholder="Paste image URLs, separated by commas *" value={pImg} onChange={e => setPImg(e.target.value)} rows={2} style={{ resize: 'none' }} />
                                        <button className="bento-save" onClick={addBlock}>Add Photo Block</button>
                                    </div>
                                )}
                                {advType === 'product' && (
                                    <div className="bento-adv-fields">
                                        <input className="bento-input" placeholder="Product name *" value={prName} onChange={e => setPrName(e.target.value)} />
                                        <input className="bento-input" placeholder="Price (e.g. $49)" value={prPrice} onChange={e => setPrPrice(e.target.value)} />
                                        <input className="bento-input" placeholder="Buy URL *" value={prBuy} onChange={e => setPrBuy(e.target.value)} />
                                        <input className="bento-input" placeholder="Product image URL (optional)" value={prImg} onChange={e => setPrImg(e.target.value)} />
                                        <button className="bento-save" onClick={addBlock}>Add Product</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List */}
                        <div className="bento-link-list">
                            {links.length === 0 && blocks.length === 0 && (
                                <div className="bento-empty">✦ Add your first link above to get started</div>
                            )}
                            {links.map(link => (
                                <div key={link.id} className={`bento-link-row${!link.enabled ? ' off' : ''}`}>
                                    <div className="bento-link-icon-sq">
                                        <PlatformIcon id={link.icon} size={18} />
                                    </div>
                                    <div className="bento-link-info">
                                        <div className="bento-link-name">{link.label}</div>
                                        <div className="bento-link-url">{link.url}</div>
                                    </div>
                                    <label className="bento-toggle">
                                        <input type="checkbox" checked={link.enabled} onChange={() => toggleLink(link.id)} />
                                        <span className="bento-toggle-track" />
                                    </label>
                                    <button className="bento-del" title="Remove" onClick={() => removeLink(link.id)}>✕</button>
                                </div>
                            ))}
                            {blocks.map(block => (
                                <div key={block.id} className={`bento-link-row${!block.enabled ? ' off' : ''}`}>
                                    <div className="bento-link-icon-sq">
                                        <PlatformIcon id={block.type === 'music' ? 'music' : block.type === 'photo' ? 'globe' : 'store'} size={18} />
                                    </div>
                                    <div className="bento-link-info">
                                        <div className="bento-link-name">
                                            {block.type === 'music' ? (block as MusicBlock).title
                                                : block.type === 'photo' ? ((block as PhotoBlock).caption || 'Photo Gallery')
                                                    : (block as ProductBlock).name}
                                        </div>
                                        <div className="bento-link-url">{block.type} block</div>
                                    </div>
                                    <label className="bento-toggle">
                                        <input type="checkbox" checked={block.enabled} onChange={() => toggleBlock(block.id)} />
                                        <span className="bento-toggle-track" />
                                    </label>
                                    <button className="bento-del" title="Remove" onClick={() => removeBlock(block.id)}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── LIVE PREVIEW ── */}
                    <div className="bento-card bento-preview-card">
                        <div className="bento-preview-label">LIVE PREVIEW</div>
                        <div className="bento-phone-wrap">
                            <div className="bento-phone">
                                <div className="bento-phone-notch" />
                                <div className="bento-phone-screen" style={{ background: previewBg }}>
                                    {bannerUrl && (
                                        <div style={{ width: 'calc(100% + 28px)', marginLeft: -14, height: 64, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginTop: -18, marginBottom: 12, flexShrink: 0 }} />
                                    )}
                                    <div className="bento-phone-avatar">
                                        {avatarUrl
                                            ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            : <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{(name || user?.name || 'U').charAt(0)}</span>
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textColor, textAlign: 'center', marginBottom: 2 }}>{name || user?.name}</div>
                                    <div style={{ fontSize: '0.6rem', color: theme.textColor, opacity: 0.7, textAlign: 'center', marginBottom: 14, padding: '0 8px' }}>{bio || user?.bio}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                                        {links.filter(l => l.enabled).slice(0, 4).map(link => (
                                            <div key={link.id} style={{ background: theme.btnBg, color: theme.btnText, borderRadius: 10, padding: '8px 12px', fontSize: '0.68rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <PlatformIcon id={link.icon} size={14} /><span>{link.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 'auto', paddingTop: 10, fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Powered by Linkzy</div>
                                </div>
                            </div>
                        </div>
                        <div className="bento-share-box">
                            <span className="bento-share-url">linkzy.co/{user?.username}</span>
                            <button className="bento-copy" onClick={() => navigator.clipboard?.writeText?.(`https://linkzy.co/${user?.username}`)}>Copy</button>
                        </div>
                    </div>

                    {/* ── ANALYTICS PLACEHOLDERS ── */}
                    <div className="bento-card bento-chart-card">
                        <div className="bento-card-header">
                            <h2 className="bento-card-title">Daily Views</h2>
                            <span className="bento-muted-label">Last 30 Days</span>
                        </div>
                        <div className="bento-coming-soon">
                            <span className="bento-coming-icon">📈</span>
                            <span>Analytics tracking coming soon</span>
                        </div>
                    </div>
                    <div className="bento-card bento-platforms-card">
                        <div className="bento-card-header">
                            <h2 className="bento-card-title">Top Platforms</h2>
                        </div>
                        <div className="bento-coming-soon">
                            <span className="bento-coming-icon">🔍</span>
                            <span>Referrer tracking coming soon</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
                <div className="bento-inner-page">
                    <h1 className="bento-page-title">Appearance</h1>
                    <p className="bento-page-sub">Customise how your public profile looks.</p>

                    <div className="bento-simple-form">
                        {/* Avatar */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Profile Photo URL</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div className="bento-field-avatar-sq">
                                    {avatarUrl
                                        ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        : <span style={{ fontSize: '1.1rem' }}>{user?.name?.charAt(0)}</span>
                                    }
                                </div>
                                <input className="bento-input" style={{ flex: 1 }} placeholder="Paste an image URL…" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
                            </div>
                        </div>

                        {/* Banner */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Banner Image URL</label>
                            {bannerUrl && <div style={{ width: '100%', height: 72, borderRadius: 10, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, border: '1.5px solid #e9ecef' }} />}
                            <input className="bento-input" style={{ width: '100%' }} placeholder="Paste banner image URL…" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} />
                        </div>

                        {/* Display name */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Display Name</label>
                            <input className="bento-input" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
                        </div>

                        {/* Bio */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Bio</label>
                            <textarea className="bento-input" style={{ width: '100%', resize: 'vertical' }} rows={3} value={bio} onChange={e => setBio(e.target.value)} />
                        </div>

                        <hr className="bento-hr" />

                        {/* Background image */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Background Photo URL <span className="bento-hint">(fills entire profile background)</span></label>
                            {bgImage && <div style={{ width: '100%', height: 88, borderRadius: 10, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, border: '1.5px solid #e9ecef' }} />}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="bento-input" style={{ flex: 1 }} placeholder="Paste photo URL to use as background…" value={bgImage} onChange={e => setBgImage(e.target.value)} />
                                {bgImage && <button className="bento-ghost" onClick={() => setBgImage('')}>Clear</button>}
                            </div>
                        </div>

                        {/* Solid color override */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Background Colour <span className="bento-hint">(overrides theme, used if no photo)</span></label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="color" value={bgColor || '#7c3aed'} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 36, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: 2, cursor: 'pointer', flexShrink: 0 }} />
                                <input className="bento-input" style={{ flex: 1 }} placeholder="#hex or rgba()" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                                {bgColor && <button className="bento-ghost" onClick={() => setBgColor('')}>Clear</button>}
                            </div>
                        </div>

                        {/* Theme grid */}
                        <div className="bento-field-row">
                            <label className="bento-field-label">Theme Preset <span className="bento-hint">(base background gradient & UI style)</span></label>
                            <div className="bento-theme-grid">
                                {templatesList.map(t => (
                                    <button key={t.id} className={`bento-theme-btn${selTheme === t.id ? ' sel' : ''}`} onClick={() => setSelTheme(t.id)}>
                                        <div className="bento-tp" style={{ background: t.bg }}>
                                            <div className="bento-tp-circ" />
                                            <div className="bento-tp-bar" style={{ background: t.btnBg }} />
                                        </div>
                                        <div className="bento-theme-name">{t.name}</div>
                                        {selTheme === t.id && <div className="bento-tick">✓</div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="bento-save" onClick={saveAppearance}>{savedMsg || 'Save Changes'}</button>
                    </div>
                </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
                <div className="bento-inner-page">
                    <h1 className="bento-page-title">Settings</h1>
                    <p className="bento-page-sub">Manage your account details.</p>
                    <div className="bento-simple-form">
                        <div className="bento-field-row">
                            <label className="bento-field-label">Full Name</label>
                            <input className="bento-input" style={{ width: '100%' }} value={settingsName} onChange={e => setSettingsName(e.target.value)} />
                        </div>
                        <div className="bento-field-row">
                            <label className="bento-field-label">Email</label>
                            <input className="bento-input" style={{ width: '100%', opacity: 0.5 }} value={user?.email} disabled />
                        </div>
                        <div className="bento-field-row">
                            <label className="bento-field-label">Your Linkzy URL</label>
                            <div className="bento-url-row">
                                <span className="bento-url-pre">linkzy.co/</span>
                                <span className="bento-url-val">{user?.username}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                            <button className="bento-save" onClick={() => { updateUser({ name: settingsName }); flash(); }}>{savedMsg || 'Save'}</button>
                            <button style={{ padding: '10px 20px', background: 'transparent', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { logout(); navigate('/'); }}>Log out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
