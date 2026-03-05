import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useAuth } from '../../context/AuthContext';
import type { LinkItem, Block, MusicBlock, PhotoBlock, ProductBlock } from '../../context/AuthContext';
import { PLATFORM_ICONS, PLATFORM_COLORS } from '../../lib/platformIcons';
import { templatesList } from '../../lib/themes';
import { storage, APPWRITE_READY, APPWRITE_CONFIG } from '../../lib/appwrite';
import { ID } from 'appwrite';

// ... other imports remain unchanged (keep them outside this replace block by targeting just the function)

import getCroppedImg from '../../lib/cropImage';
import Navbar from '../../components/Navbar';
import './Dashboard.css';

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
    const [savedMsg, setSavedMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'settings'>('links');

    // ─── Content state ───
    const [links, setLinks] = useState<LinkItem[]>(user?.links ?? []);
    const [blocks, setBlocks] = useState<Block[]>(user?.blocks ?? []);

    // Sync local state when AuthContext user data updates (e.g. rollback on failed DB saves)
    useEffect(() => {
        if (user) {
            setLinks(user.links ?? []);
            setBlocks(user.blocks ?? []);
            setName(user.name ?? '');
            setBio(user.bio ?? '');
            setAvatarUrl(user.avatarUrl ?? '');
            setBannerUrl(user.bannerUrl ?? '');
            setBgColor(user.bgColor ?? '');
            setBgImage(user.bgImage ?? '');
            setSelTheme(user.theme ?? 'editorial-light');
        }
    }, [user]);

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

    // ─── Image Crop & Upload state ───
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [cropType, setCropType] = useState<'avatar' | 'banner' | 'background'>('background');

    // ─── Icon Picker State ───
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    // ─── Settings state ───
    const [settingsName, setSettingsName] = useState(user?.name ?? '');

    const theme = templatesList.find(t => t.id === selTheme) ?? templatesList[0];
    const previewBg = bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor || theme.screenBg;

    const flash = () => { setSavedMsg('Saved!'); setTimeout(() => setSavedMsg(''), 1800); };

    // ─── Auto-Apply Theme from URL ───
    useEffect(() => {
        const themeToApply = searchParams.get('template');
        if (themeToApply && templatesList.some(t => t.id === themeToApply)) {
            setSelTheme(themeToApply);
            updateUser({ theme: themeToApply });
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

    // ─── Cropping & Upload Logic ───
    const onFileChange = async (e: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner' | 'background') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCropType(type);
                setCropImageSrc(reader.result as string);
                setZoom(1);
                setCrop({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
        // Reset file input so same file can be chosen again
        e.target.value = '';
    };

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const uploadCroppedImage = async () => {
        if (!cropImageSrc || !croppedAreaPixels || !user || !APPWRITE_READY) {
            if (!APPWRITE_READY) alert('Appwrite is not configured yet. Add VITE_APPWRITE_ keys.');
            return;
        }
        setIsUploading(true);
        try {
            const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
            if (!croppedFile) throw new Error('Failed to generate crop');

            const fileId = ID.unique();

            // Upload to Appwrite Storage
            await storage.createFile(APPWRITE_CONFIG.storageBucketId, fileId, croppedFile);

            // Get public URL
            const publicUrl = storage.getFileView(APPWRITE_CONFIG.storageBucketId, fileId);

            if (cropType === 'avatar') {
                setAvatarUrl(publicUrl);
                updateUser({ avatarUrl: publicUrl });
            } else if (cropType === 'banner') {
                setBannerUrl(publicUrl);
                updateUser({ bannerUrl: publicUrl });
            } else {
                setBgImage(publicUrl);
                updateUser({ bgImage: publicUrl });
            }

            setCropImageSrc(null); // Close modal
            flash();
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message || error.toString()}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bento-root">
            <Navbar />

            <div className="bento-app-container">
                {/* ── PRO SIDEBAR ── */}
                <aside className="bento-sidebar">
                    <button
                        className={`bento-sidebar-btn${activeTab === 'links' ? ' active' : ''}`}
                        onClick={() => setActiveTab('links')}
                    >
                        <span className="bento-sidebar-icon">🔗</span>
                        Links
                    </button>
                    <button
                        className={`bento-sidebar-btn${activeTab === 'appearance' ? ' active' : ''}`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        <span className="bento-sidebar-icon">✨</span>
                        Appearance
                    </button>
                    <button
                        className={`bento-sidebar-btn${activeTab === 'settings' ? ' active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <span className="bento-sidebar-icon">⚙️</span>
                        Settings
                    </button>

                    <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>LOGGED IN AS</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                    </div>
                </aside>

                {/* ── MOBILE BOTTOM NAV ── */}
                <nav className="bento-tablet-nav">
                    <button className={`bento-tablet-btn${activeTab === 'links' ? ' active' : ''}`} onClick={() => setActiveTab('links')}>
                        <span className="bento-tablet-icon">🔗</span>
                        Links
                    </button>
                    <button className={`bento-tablet-btn${activeTab === 'appearance' ? ' active' : ''}`} onClick={() => setActiveTab('appearance')}>
                        <span className="bento-tablet-icon">✨</span>
                        Appearance
                    </button>
                    <button className={`bento-tablet-btn${activeTab === 'settings' ? ' active' : ''}`} onClick={() => setActiveTab('settings')}>
                        <span className="bento-tablet-icon">⚙️</span>
                        Settings
                    </button>
                </nav>

                <main className="bento-main-view">
                    {/* ── BENTO GRID ── */}
                    <div className="bento-grid">

                        {/* ── CROP MODAL (Global) ── */}
                        {cropImageSrc && (
                            <div className="bento-modal-overlay" style={{ zIndex: 9999 }}>
                                <div className="bento-modal" style={{ width: '90%', maxWidth: 600, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                                    <div className="bento-modal-header">
                                        <h2>Crop {cropType === 'avatar' ? 'Profile Photo' : cropType === 'banner' ? 'Banner' : 'Background'}</h2>
                                        <button className="bento-modal-close" onClick={() => setCropImageSrc(null)}>✕</button>
                                    </div>
                                    <div style={{ position: 'relative', flex: 1, background: '#000', borderRadius: 8, overflow: 'hidden', margin: '16px 0' }}>
                                        <Cropper
                                            image={cropImageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={cropType === 'avatar' ? 1 : cropType === 'banner' ? 3 / 1 : 9 / 16}
                                            cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onCropComplete={onCropComplete}
                                        />
                                    </div>
                                    <div className="bento-modal-footer">
                                        <button className="bento-ghost" onClick={() => setCropImageSrc(null)} disabled={isUploading}>Cancel</button>
                                        <button className="bento-save" onClick={uploadCroppedImage} disabled={isUploading}>
                                            {isUploading ? 'Uploading...' : 'Crop & Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bento-left-col">


                            {savedMsg && <div className="bento-toast">{savedMsg}</div>}

                            {/* ── LINKS TAB (Includes Stats) ── */}
                            {activeTab === 'links' && (
                                <div className="bento-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <h1 className="bento-page-title">Links & Blocks</h1>
                                        <p className="bento-page-sub">Manage the content on your Linkzy profile.</p>
                                    </div>

                                    <div className="bento-stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                                    </div>
                                    <div className="bento-card bento-links-card">
                                        <div className="bento-card-header">
                                            <h2 className="bento-card-title">Your Links</h2>
                                        </div>

                                        {/* Simple add row */}
                                        <div className="bento-simple-add" style={{ position: 'relative' }}>
                                            {/* Brand new interactive icon picker popup */}
                                            <div className="bento-icon-picker-btn" onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}>
                                                <PlatformIcon id={newIcon} size={20} />
                                                <div className="bento-icon-caret">▼</div>
                                            </div>

                                            {isIconPickerOpen && (
                                                <div className="bento-icon-picker-modal">
                                                    <div className="bento-icon-picker-header">
                                                        Select Icon
                                                        <button onClick={() => setIsIconPickerOpen(false)}>✕</button>
                                                    </div>
                                                    <div className="bento-icon-grid-large">
                                                        {PLATFORM_ICONS.map(p => (
                                                            <button
                                                                key={p.id}
                                                                title={p.label}
                                                                className={`bento-icon-opt-lg${newIcon === p.id ? ' sel' : ''}`}
                                                                onClick={() => { setNewIcon(p.id); setIsIconPickerOpen(false); }}
                                                            >
                                                                <PlatformIcon id={p.id} size={24} />
                                                                <span className="bento-icon-label">{p.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

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
                                </div>
                            )} {/* End Links Tab */}

                            {/* ── APPEARANCE ── */}
                            {activeTab === 'appearance' && (
                                <div className="bento-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <h1 className="bento-page-title">Appearance</h1>
                                        <p className="bento-page-sub">Customise how your public profile looks.</p>
                                    </div>

                                    <div className="bento-card" style={{ padding: '32px' }}>
                                        {/* Avatar */}
                                        <div className="bento-field-row">
                                            <label className="bento-field-label">Profile Photo</label>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                <div className="bento-field-avatar-sq">
                                                    {avatarUrl
                                                        ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                        : <span style={{ fontSize: '1.1rem' }}>{user?.name?.charAt(0)}</span>
                                                    }
                                                </div>
                                                <label className="bento-btn" style={{ cursor: 'pointer' }}>
                                                    Upload Photo
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFileChange(e, 'avatar')} />
                                                </label>
                                                {avatarUrl && <button className="bento-ghost" onClick={() => setAvatarUrl('')}>Clear</button>}
                                            </div>
                                        </div>

                                        {/* Banner */}
                                        <div className="bento-field-row">
                                            <label className="bento-field-label">Banner Image</label>
                                            {bannerUrl && <div style={{ width: '100%', height: 72, borderRadius: 10, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, border: '1.5px solid #e9ecef' }} />}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <label className="bento-btn" style={{ cursor: 'pointer' }}>
                                                    Upload Banner
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFileChange(e, 'banner')} />
                                                </label>
                                                {bannerUrl && <button className="bento-ghost" onClick={() => setBannerUrl('')}>Clear</button>}
                                            </div>
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
                                            <label className="bento-field-label">Background Photo <span className="bento-hint">(fills entire profile background)</span></label>
                                            {bgImage && <div style={{ width: '100%', height: 88, borderRadius: 10, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, border: '1.5px solid #e9ecef' }} />}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <label className="bento-btn" style={{ cursor: 'pointer' }}>
                                                    Upload Background
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFileChange(e, 'background')} />
                                                </label>
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
                                    </div>

                                    <button className="bento-save" onClick={saveAppearance} style={{ alignSelf: 'flex-start' }}>{savedMsg || 'Save Changes'}</button>
                                </div>
                            )} {/* End Appearance Tab */}

                            {/* ── SETTINGS ── */}
                            {activeTab === 'settings' && (
                                <div className="bento-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <h1 className="bento-page-title">Settings</h1>
                                        <p className="bento-page-sub">Manage your account details.</p>
                                    </div>

                                    <div className="bento-card" style={{ padding: '32px' }}>
                                        <div className="bento-field-row" style={{ paddingTop: 0 }}>
                                            <label className="bento-field-label">Full Name</label>
                                            <input className="bento-input" style={{ width: '100%', maxWidth: '400px' }} value={settingsName} onChange={e => setSettingsName(e.target.value)} />
                                        </div>
                                        <div className="bento-field-row">
                                            <label className="bento-field-label">Email</label>
                                            <input className="bento-input" style={{ width: '100%', maxWidth: '400px', opacity: 0.5 }} value={user?.email} disabled />
                                        </div>
                                        <div className="bento-field-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                                            <label className="bento-field-label">Your Linkzy URL</label>
                                            <div className="bento-url-row" style={{ maxWidth: '400px' }}>
                                                <span className="bento-url-pre">{window.location.host}/</span>
                                                <span className="bento-url-val">{user?.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                        <button className="bento-save" onClick={() => { updateUser({ name: settingsName }); flash(); }}>{savedMsg || 'Save'}</button>
                                        <button style={{ padding: '10px 20px', background: 'transparent', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { logout(); navigate('/'); }}>Log out</button>
                                    </div>
                                </div>
                            )} {/* End Settings Tab */}
                        </div> {/* End Left Col */}

                        {/* ── LIVE PREVIEW (Floating Phone) ── */}
                        <div className="bento-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                            <div className="bento-share-box" style={{ width: '100%', maxWidth: '280px', background: 'var(--surface-1)', border: 'var(--border-subtle)', borderRadius: '16px', padding: '12px 16px', boxShadow: 'var(--shadow-layer-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="bento-share-url" style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>{window.location.host}/{user?.id}</span>
                                <button className="bento-copy" style={{ background: 'color-mix(in srgb, var(--text-dark) 85%, transparent)', color: 'var(--bg-color)', backdropFilter: 'blur(12px)', padding: '6px 12px', borderRadius: '8px' }} onClick={() => navigator.clipboard?.writeText?.(`${window.location.origin}/${user?.id}`)}>Copy</button>
                            </div>

                            <div className="bento-preview-label" style={{ alignSelf: 'center', margin: '4px 0 8px', letterSpacing: '0.15em', opacity: 0.6 }}>LIVE PREVIEW</div>

                            <div className="bento-phone-wrap">
                                <div className="bento-phone">
                                    <div className="bento-phone-content" style={{ background: previewBg }}>
                                        {bannerUrl && (
                                            <div style={{ width: '100%', height: 96, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                                        )}
                                        <div className="bento-phone-avatar" style={{
                                            width: 80, height: 80, borderRadius: '50%', margin: bannerUrl ? '-40px auto 16px' : '24px auto 16px', background: '#333',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid currentColor', color: previewBg.includes('#') ? previewBg : '#f9f9f9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', flexShrink: 0
                                        }}>
                                            {avatarUrl
                                                ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{(name || user?.name || 'U').charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: theme.textColor, textAlign: 'center', marginBottom: 4 }}>{name || user?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.8, textAlign: 'center', marginBottom: 20, padding: '0 16px' }}>{bio || user?.bio}</div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
                                            {links.filter(l => l.enabled).slice(0, 4).map(link => (
                                                <div key={link.id} style={{
                                                    background: theme.btnBg,
                                                    color: theme.btnText,
                                                    borderRadius: theme.borderFormat === 'thick' ? 8 : 24,
                                                    padding: '12px 16px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    border: theme.btnBorder !== 'none' ? theme.btnBorder : undefined,
                                                    boxShadow: theme.btnShadow !== 'none' ? theme.btnShadow : undefined,
                                                    backdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                                                    WebkitBackdropFilter: theme.backdropBlur !== 'none' ? theme.backdropBlur : undefined,
                                                    fontFamily: theme.fontFamily
                                                }}>
                                                    <PlatformIcon id={link.icon} size={18} /><span>{link.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ padding: '24px 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Powered by Linkzy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
