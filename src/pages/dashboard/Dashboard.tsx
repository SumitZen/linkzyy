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
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

import getCroppedImg from '../../lib/cropImage';
import Navbar from '../../components/Navbar';
import './Dashboard.css';
import styles from './Dashboard.module.css';

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
    const { user, logout, updateUser, redeemPromoCode } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toasts, showToast, dismiss } = useToast();
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
            setManualTextColor(user.textColor ?? '');
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
    const [manualTextColor, setManualTextColor] = useState(user?.textColor ?? '');

    // ─── Image Crop & Upload state ───
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [cropType, setCropType] = useState<'avatar' | 'banner' | 'background'>('background');

    // ─── Icon Picker State ───
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    // ── Settings state ──
    const [settingsName, setSettingsName] = useState(user?.name ?? '');
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<'idle' | 'ok' | 'invalid' | 'already_active' | 'loading'>('idle');

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard', 'success', '📋');
    };

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
        showToast('Link added', 'success', '🔗');
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
            showToast('Music block added', 'success', '🎵');
        } else if (advType === 'photo') {
            const imgs = pImg.split(',').map(s => s.trim()).filter(Boolean);
            if (!imgs.length) return;
            saveBlocks([...blocks, { id, type: 'photo', images: imgs, caption: pCap, enabled: true } as PhotoBlock]);
            setPImg(''); setPCap('');
            showToast('Photo block added', 'success', '📷');
        } else if (advType === 'product' && prName && prBuy) {
            saveBlocks([...blocks, { id, type: 'product', name: prName, price: prPrice, imageUrl: prImg, buyUrl: prBuy, enabled: true } as ProductBlock]);
            setPrName(''); setPrPrice(''); setPrBuy(''); setPrImg('');
            showToast('Product block added', 'success', '🛍️');
        }
        setShowAdvanced(false);
    };

    const saveAppearance = () => { 
        updateUser({ name, bio, avatarUrl, bannerUrl, bgColor, bgImage, theme: selTheme, textColor: manualTextColor }); 
        showToast('Appearance updated', 'success', '🎨');
    };

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
            if (!APPWRITE_READY) showToast('Appwrite not configured', 'error');
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
                showToast('Profile photo updated', 'success', '📸');
            } else if (cropType === 'banner') {
                setBannerUrl(publicUrl);
                updateUser({ bannerUrl: publicUrl });
                showToast('Banner photo updated', 'success', '🖼️');
            } else {
                setBgImage(publicUrl);
                updateUser({ bgImage: publicUrl });
                showToast('Background updated', 'success', '✨');
            }

            setCropImageSrc(null); // Close modal
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Upload failed:', error);
            showToast(`Upload failed: ${error.message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Navbar />

            {/* ── SECTION 2 / 7 — TOP SUB-NAVIGATION & MOBILE BOTTOM NAV ── */}
            <nav className={styles.subnav}>
                <button className={`${styles.tab}${activeTab === 'links' ? ` ${styles.tabActive}` : ''}`} onClick={() => setActiveTab('links')}>
                    🔗 Links
                </button>
                <button className={`${styles.tab}${activeTab === 'appearance' ? ` ${styles.tabActive}` : ''}`} onClick={() => setActiveTab('appearance')}>
                    🎨 Appearance
                </button>
                <button className={`${styles.tab}${activeTab === 'settings' ? ` ${styles.tabActive}` : ''}`} onClick={() => setActiveTab('settings')}>
                    ⚙️ Settings
                </button>
            </nav>

            {/* URL bar stays OUTSIDE the subnav pill, below it */}
            <div className="quick-actions-bar">
                <div className="quick-actions-bar__url">{window.location.host}/{user?.id}</div>
                <button className="btn-copy-link" onClick={() => handleCopyLink(`${window.location.origin}/${user?.id}`)}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="5" y="5" width="9" height="9" rx="1.5"/>
                        <path d="M3 11V3a1 1 0 0 1 1-1h8" strokeLinecap="round"/>
                    </svg>
                    Copy Link
                </button>
                <button className="btn-preview" onClick={() => navigate(`/${user?.id}`)}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 3c-4.418 0-8 5-8 5s3.582 5 8 5 8-5 8-5-3.582-5-8-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="1" fill="currentColor" />
                    </svg>
                    Preview
                </button>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="bento-mobile-nav">
                <button className={`bento-mobile-nav__item${activeTab === 'links' ? ' bento-mobile-nav__item--active' : ''}`} onClick={() => setActiveTab('links')}>
                    <span className="bento-mobile-nav__icon">🔗</span>
                    <span className="bento-mobile-nav__label">Links</span>
                </button>
                <button className={`bento-mobile-nav__item${activeTab === 'appearance' ? ' bento-mobile-nav__item--active' : ''}`} onClick={() => setActiveTab('appearance')}>
                    <span className="bento-mobile-nav__icon">🎨</span>
                    <span className="bento-mobile-nav__label">Style</span>
                </button>
                <button className={`bento-mobile-nav__item${activeTab === 'settings' ? ' bento-mobile-nav__item--active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <span className="bento-mobile-nav__icon">⚙️</span>
                    <span className="bento-mobile-nav__label">Setup</span>
                </button>
            </nav>

            {/* ── CROP MODAL (Global) ── */}
            {cropImageSrc && (
                <div className="crop-overlay">
                    <div className="crop-modal">
                        <div className="crop-modal__header">
                            <div>
                                <div className="crop-modal__title">
                                    {cropType === 'avatar' ? 'Crop Profile Photo' : cropType === 'banner' ? 'Crop Banner Image' : 'Crop Background'}
                                </div>
                                <div className="crop-modal__hint">
                                    {cropType === 'avatar' ? 'Drag to reposition · Scroll or use slider to zoom' : 'Drag to reposition · Use slider to zoom'}
                                </div>
                            </div>
                            <button className="crop-modal__close" onClick={() => setCropImageSrc(null)} aria-label="Close">✕</button>
                        </div>

                        <div className="crop-modal__canvas">
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={cropType === 'avatar' ? 1 : cropType === 'banner' ? 3 / 1 : 9 / 16}
                                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={false}
                            />
                        </div>

                        <div className="crop-modal__footer">
                            <div className="crop-modal__zoom">
                                <span className="crop-modal__zoom-label">Zoom</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))}
                                    className="crop-modal__zoom-slider"
                                />
                                <span className="crop-modal__zoom-val">{Math.round(zoom * 100)}%</span>
                            </div>
                            <div className="crop-modal__actions">
                                <button className="bento-ghost" onClick={() => setCropImageSrc(null)} disabled={isUploading}>Cancel</button>
                                <button className="bento-save" onClick={uploadCroppedImage} disabled={isUploading}>
                                    {isUploading ? 'Saving…' : 'Crop & Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bento-layout">
                <main className="bento-left-col">
                            {/* ── LINKS TAB (Includes Stats) ── */}
                            {activeTab === 'links' && (
                                <div className="bento-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <header className="bento-page-header">
                                        <h1>Links & Blocks</h1>
                                        <p>Manage the content on your Linkzy profile.</p>
                                    </header>

                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-card__icon">🔗</div>
                                            <div className="stat-card__label">Active Links</div>
                                            <div className="stat-card__value">
                                                {links.filter(l => l.enabled).length + blocks.filter(b => b.enabled).length}
                                            </div>
                                            <div className="stat-card__sub">of {links.length + blocks.length} total</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-card__icon">👁</div>
                                            <div className="stat-card__label">Profile Views</div>
                                            <div className="stat-card__value">—</div>
                                            <div className="stat-card__sub">Tracking coming soon</div>
                                        </div>
                                    </div>
                                    <div className="links-card">
                                        <h2 className="links-card__title">Your Links</h2>

                                        {/* Simple add row */}
                                        <div className="links-add-row" style={{ position: 'relative' }}>
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
                                                placeholder="Title"
                                                value={newLabel}
                                                onChange={e => setNewLabel(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addLink()}
                                            />
                                            <input
                                                placeholder="URL"
                                                value={newUrl}
                                                onChange={e => setNewUrl(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addLink()}
                                            />
                                            <button className="btn-add-link" onClick={addLink}>+ Add</button>
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
                                        <div className="link-list">
                                            {links.length === 0 && blocks.length === 0 && (
                                                <div className="bento-empty">✦ Add your first link above to get started</div>
                                            )}
                                            {links.map(link => (
                                                <div key={link.id} className={`link-item${!link.enabled ? ' off' : ''}`}>
                                                    <div className="link-item__icon">
                                                        <PlatformIcon id={link.icon} size={18} />
                                                    </div>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="link-item__text link-item__clickable"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="link-item__title-row">
                                                            <span className="link-item__title">{link.label}</span>
                                                            <svg className="link-item__external-icon" viewBox="0 0 16 16" fill="currentColor">
                                                                <path d="M6.5 1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8.5M9 1h5m0 0v5m0-5L7 9" 
                                                                    stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                                            </svg>
                                                        </div>
                                                        <div className="link-item__url">{link.url}</div>
                                                    </a>
                                                    <div className="link-item__actions">
                                                        <button
                                                            className="link-item__copy"
                                                            onClick={() => handleCopyLink(link.url)}
                                                            title="Copy URL"
                                                        >
                                                            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                                <rect x="5" y="5" width="9" height="9" rx="1.5"/>
                                                                <path d="M3 11V3a1 1 0 0 1 1-1h8" strokeLinecap="round"/>
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            className={`link-item__toggle${link.enabled ? ' link-item__toggle--active' : ''}`}
                                                            onClick={() => toggleLink(link.id)}
                                                            title={link.enabled ? "Disable link" : "Enable link"}
                                                        >
                                                            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                        <button className="link-item__delete" title="Remove" onClick={() => removeLink(link.id)}>✕</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {blocks.map(block => (
                                                <div key={block.id} className={`link-item${!block.enabled ? ' off' : ''}`}>
                                                    <div className="link-item__icon">
                                                        <PlatformIcon id={block.type === 'music' ? 'music' : block.type === 'photo' ? 'globe' : 'store'} size={18} />
                                                    </div>
                                                    <div className="link-item__text">
                                                        <div className="link-item__title">
                                                            {block.type === 'music' ? (block as MusicBlock).title
                                                                : block.type === 'photo' ? ((block as PhotoBlock).caption || 'Photo Gallery')
                                                                    : (block as ProductBlock).name}
                                                        </div>
                                                        <div className="link-item__url">{block.type} block</div>
                                                    </div>
                                                    <div className="link-item__actions">
                                                        <button 
                                                            className={`link-item__toggle${block.enabled ? ' link-item__toggle--active' : ''}`}
                                                            onClick={() => toggleBlock(block.id)}
                                                            title={block.enabled ? "Disable block" : "Enable block"}
                                                        >
                                                            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                        <button className="link-item__delete" title="Remove" onClick={() => removeBlock(block.id)}>✕</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )} {/* End Links Tab */}

                            {/* ── APPEARANCE ── */}
                            {activeTab === 'appearance' && (
                                <div className="bento-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <header className="bento-page-header">
                                        <h1>Appearance</h1>
                                        <p>Customise how your public profile looks.</p>
                                    </header>

                                    <div className="appearance-form">
                                        {/* Avatar */}
                                        <div className="field-group">
                                            <label className="field-label">Profile Photo</label>
                                            <div className="profile-photo-row">
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
                                        <div className="field-group">
                                            <label className="field-label">Banner Image</label>
                                            {bannerUrl && <div style={{ width: '100%', height: 72, borderRadius: 10, backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, border: '1.5px solid #e9ecef' }} />}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <label className="btn-upload">
                                                    Upload Banner
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFileChange(e, 'banner')} />
                                                </label>
                                                {bannerUrl && <button className="bento-ghost" onClick={() => setBannerUrl('')}>Clear</button>}
                                            </div>
                                        </div>

                                        {/* Display name */}
                                        <div className="field-group">
                                            <label className="field-label">Display Name</label>
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} />
                                        </div>

                                        {/* Bio */}
                                        <div className="field-group">
                                            <label className="field-label">Bio</label>
                                            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} />
                                        </div>

                                        <div className="appearance-section-divider"></div>

                                        {/* Background image */}
                                        <div className="field-group">
                                            <label className="field-label">Background Photo <span className="bento-hint">(fills entire profile background)</span></label>
                                            {bgImage && <div style={{ width: '100%', height: 88, borderRadius: 10, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, border: '1.5px solid #e9ecef' }} />}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <label className="btn-upload">
                                                    Upload Background
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFileChange(e, 'background')} />
                                                </label>
                                                {bgImage && <button className="bento-ghost" onClick={() => setBgImage('')}>Clear</button>}
                                            </div>
                                        </div>

                                        {/* Solid color override */}
                                        <div className="field-group">
                                            <label className="field-label">Background Colour <span className="bento-hint">(used if no photo)</span></label>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <input type="color" value={bgColor || '#7c3aed'} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 36, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: 2, cursor: 'pointer', flexShrink: 0 }} />
                                                <input className="bento-input" style={{ flex: 1 }} placeholder="#hex or rgba()" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                                                {bgColor && <button className="bento-ghost" onClick={() => setBgColor('')}>Clear</button>}
                                            </div>
                                        </div>

                                        {/* Manual Text color override */}
                                        <div className="field-group">
                                            <label className="field-label">Font Colour</label>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <input type="color" value={manualTextColor || '#ffffff'} onChange={e => setManualTextColor(e.target.value)} style={{ width: 40, height: 36, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: 2, cursor: 'pointer', flexShrink: 0 }} />
                                                <input className="bento-input" style={{ flex: 1 }} placeholder="#hex or rgba()" value={manualTextColor} onChange={e => setManualTextColor(e.target.value)} />
                                                {manualTextColor && <button className="bento-ghost" onClick={() => setManualTextColor('')}>Reset</button>}
                                            </div>
                                        </div>

                                        {/* Theme grid */}
                                        <div className="field-group">
                                            <label className="field-label">Theme Preset</label>
                                            {(() => {
                                                const swatchGradients: Record<string, string> = {
                                                    '1-vision': 'linear-gradient(135deg, #0a1628, #1e3a5f)',
                                                    '2-midnight': 'linear-gradient(135deg, #0d1117, #1a2744)',
                                                    '3-ocean': 'linear-gradient(135deg, #0c1f3f, #0a3d62)',
                                                    '4-blush': 'linear-gradient(135deg, #2d1b1b, #7c2d2d)',
                                                    '5-prism': 'linear-gradient(135deg, #e8e0f0, #c8b8e0)',
                                                    '6-onyx': 'linear-gradient(135deg, #0a0a0a, #1c1c1c)',
                                                    '7-stripe': 'linear-gradient(135deg, #0a0f2e, #1a2060)',
                                                    '8-nordic': 'linear-gradient(135deg, #1a2030, #2a3545)',
                                                    '9-sand': 'linear-gradient(135deg, #2a1f0f, #4a3520)',
                                                    '10-brutal': 'linear-gradient(135deg, #1a1a1a, #333333)',
                                                };

                                                return (
                                                    <div className="bento-theme-grid">
                                                        {(bgImage || bgColor) && (
                                                            <div className="bento-theme-btn sel" style={{ background: bgImage ? `url(${bgImage}) center/cover` : (bgColor ? bgColor : 'linear-gradient(135deg, rgba(124,58,237,0.5), #07070f)') }}>
                                                                <div className="bento-theme-name">Custom</div>
                                                            </div>
                                                        )}

                                                        {templatesList.map(t => (
                                                            <button 
                                                                key={t.id} 
                                                                className={['bento-theme-btn', (selTheme === t.id && !bgImage && !bgColor) ? 'sel' : ''].filter(Boolean).join(' ')} 
                                                                style={{ background: swatchGradients[t.id] || t.bg }}
                                                                onClick={() => {
                                                                    setSelTheme(t.id);
                                                                    setBgImage('');
                                                                    setBgColor('');
                                                                    setManualTextColor('');
                                                                }}
                                                            >
                                                                <div className="bento-theme-name">{t.name}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <button className="btn-primary" onClick={saveAppearance} style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                                </div>
                            )} {/* End Appearance Tab */}

                            {/* ── SETTINGS ── */}
                            {activeTab === 'settings' && (
                                <div className="bento-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <header className="bento-page-header">
                                        <h1>Settings</h1>
                                        <p>Manage your account details.</p>
                                    </header>

                                    <div className="settings-form">
                                        <div className="field-group">
                                            <label>Full Name</label>
                                            <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} />
                                        </div>
                                        <div className="field-group">
                                            <label>Email</label>
                                            <input type="email" style={{ opacity: 0.5 }} value={user?.email} disabled />
                                        </div>
                                        <div className="field-group">
                                            <label>Your Linkzy URL</label>
                                            <input type="text" className="settings-url-input" value={`${window.location.host}/${user?.id}`} readOnly />
                                        </div>
                                    </div>
                                    <div className="settings-actions">
                                        <button className="btn-save" onClick={() => { updateUser({ name: settingsName }); showToast('Settings saved', 'success'); }}>Save</button>
                                        <button className="btn-logout" onClick={() => { logout(); navigate('/'); }}>Log out</button>
                                    </div>

                                    {/* Promo Code Card */}
                                    <div className="plan-access-card">
                                        <div className="promo-card__header">
                                            <div>
                                                <div className="promo-card__title">Plan &amp; Access</div>
                                                <div className="promo-card__sub">Your current plan</div>
                                            </div>
                                            <span className={`plan-badge plan-badge--${user?.plan ?? 'free'}`}>
                                                {user?.plan === 'pro' ? '⚡ Pro' : user?.plan === 'business' ? '🏢 Business' : 'Free'}
                                            </span>
                                        </div>

                                        {(user?.plan ?? 'free') !== 'business' && (
                                            <div className="promo-card__redeem">
                                                <label className="bento-field-label" style={{ marginBottom: 8, display: 'block' }}>Redeem a promo code</label>
                                                <div className="promo-row">
                                                    <input
                                                        className="bento-input"
                                                        placeholder="e.g. LINKZY_FRIENDS"
                                                        value={promoCode}
                                                        onChange={e => { setPromoCode(e.target.value); setPromoStatus('idle'); }}
                                                        onKeyDown={async e => {
                                                            if (e.key === 'Enter') {
                                                                setPromoStatus('loading');
                                                                const result = await redeemPromoCode(promoCode);
                                                                setPromoStatus(result);
                                                                if (result === 'ok') {
                                                                    setPromoCode('');
                                                                    showToast('🎉 Code activated! Your plan has been upgraded.', 'success');
                                                                } else if (result === 'invalid') {
                                                                    showToast('✗ Invalid code. Double-check and try again.', 'error');
                                                                } else if (result === 'already_active') {
                                                                    showToast('✓ You already have this plan active.', 'info');
                                                                }
                                                            }
                                                        }}
                                                        style={{ flex: 1, maxWidth: '100%' }}
                                                    />
                                                    <button
                                                        className="btn-redeem"
                                                        disabled={promoStatus === 'loading' || promoCode.trim() === ''}
                                                        onClick={async () => {
                                                            setPromoStatus('loading');
                                                            const result = await redeemPromoCode(promoCode);
                                                            setPromoStatus(result);
                                                            if (result === 'ok') {
                                                                setPromoCode('');
                                                                showToast('🎉 Code activated! Your plan has been upgraded.', 'success');
                                                            } else if (result === 'invalid') {
                                                                showToast('✗ Invalid code. Double-check and try again.', 'error');
                                                            } else if (result === 'already_active') {
                                                                showToast('✓ You already have this plan active.', 'info');
                                                            }
                                                        }}
                                                    >
                                                        {promoStatus === 'loading' ? 'Checking…' : 'Redeem'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )} {/* End Settings Tab */}
                        </main>

                <aside className="bento-right-col">
                    <div className="live-preview-label">Live Preview</div>
                    <div className="phone-preview">
                        <iframe
                            src={`/${user?.id}?preview=true`}
                            title="Live Preview"
                        />
                    </div>
                </aside>
            </div>

            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </div>
    );
}
