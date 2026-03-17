import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useAuth } from '../../context/AuthContext';
import type { User, LinkItem, Block, MusicBlock, PhotoBlock, ProductBlock } from '../../context/AuthContext';
import { PLATFORM_ICONS, PLATFORM_COLORS } from '../../lib/platformIcons';
import { templatesList } from '../../lib/themes';
import { storage, APPWRITE_READY, APPWRITE_CONFIG, databases } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
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
    const svg = (found?.svg ?? PLATFORM_ICONS[0].svg)
        .replace('<svg ', `<svg style="width: 100%; height: 100%; display: block;" `);

    return (
        <span
            className="bento-icon-wrapper"
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: size, 
                height: size, 
                color, 
                flexShrink: 0 
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-label={found?.label ?? id}
        />
    );
}

const PLAN_LIMITS = {
    free: { maxLinks: 5, label: 'Free' },
    pro: { maxLinks: 50, label: 'Pro' },
    business: { maxLinks: 200, label: 'Business' }
} as const;

export default function Dashboard() {
    const { user, logout, updateUser, redeemPromoCode } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toasts, showToast, dismiss } = useToast();
    const phoneRef = useRef<HTMLDivElement>(null);
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
    // Photo block: uploaded image URLs
    const [pImgs, setPImgs] = useState<string[]>([]);
    const [pCap, setPCap] = useState('');
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const [prName, setPrName] = useState(''); const [prPrice, setPrPrice] = useState('');
    const [prBuy, setPrBuy] = useState(''); const [prImg, setPrImg] = useState('');

    // ─── Appearance state ───
    const [name, setName] = useState(user?.name ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
    const [bgColor, setBgColor] = useState(user?.bgColor ?? '');
    const [bgImage, setBgImage] = useState(user?.bgImage ?? '');
    const [selTheme, setSelTheme] = useState(user?.theme ?? 'editorial-light');
    const [manualTextColor, setManualTextColor] = useState(user?.textColor ?? '');

    // ─── Image Crop & Upload state ───
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPurging, setIsPurging] = useState(false);

    // ── Maintenance: Purge Duplicates ──
    const purgeDuplicates = async () => {
        if (!window.confirm('This will search for and delete duplicate profile entries for all users. Are you sure?')) return;
        
        setIsPurging(true);
        showToast('Scanning for duplicates...', 'info', '🔍');
        
        try {
            // 1. Fetch all profiles (up to 5000 for cleanup)
            const res = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.profilesCollectionId,
                [Query.limit(5000)]
            );

            const profiles = res.documents;
            const groups: Record<string, typeof profiles> = {};

            // 2. Group by userId
            profiles.forEach(p => {
                const uid = p.userId;
                if (!groups[uid]) groups[uid] = [];
                groups[uid].push(p);
            });

            let deletedCount = 0;
            const toDelete: string[] = [];

            // 3. Identify duplicates
            Object.values(groups).forEach(list => {
                if (list.length <= 1) return;

                // Sort: Most recently updated and most content first
                list.sort((a, b) => {
                    const aScore = (a.links?.length || 0) + (a.blocks?.length || 0);
                    const bScore = (b.links?.length || 0) + (b.blocks?.length || 0);
                    if (aScore !== bScore) return bScore - aScore;
                    return new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime();
                });

                // Keep the first (best), delete the rest
                for (let i = 1; i < list.length; i++) {
                    toDelete.push(list[i].$id);
                }
            });

            // 4. Batch delete
            if (toDelete.length === 0) {
                showToast('No duplicates found!', 'success', '✨');
            } else {
                showToast(`Found ${toDelete.length} duplicates. Purging...`, 'info', '🗑️');
                for (const id of toDelete) {
                    await databases.deleteDocument(
                        APPWRITE_CONFIG.databaseId, 
                        APPWRITE_CONFIG.profilesCollectionId, 
                        id
                    );
                    deletedCount++;
                }
                showToast(`Cleanup complete! Deleted ${deletedCount} entries.`, 'success', '✅');
            }
        } catch (err: any) {
            console.error('Purge failed:', err);
            showToast(`Purge failed: ${err.message}`, 'error', '❌');
        } finally {
            setIsPurging(false);
        }
    };
    const [cropType, setCropType] = useState<'avatar' | 'background'>('background');

    // ─── Icon Picker State ───
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    // ── Settings state ──
    const [settingsName, setSettingsName] = useState(user?.name ?? '');
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<'idle' | 'ok' | 'invalid' | 'already_active' | 'loading'>('idle');

    // ─── Lock Scroll on Crop ───
    useEffect(() => {
        if (cropImageSrc) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [cropImageSrc]);

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard', 'success', '📋');
        }).catch(() => {
            showToast('Failed to copy', 'error');
        });
    };

    const scrollToPreview = () => {
        if (window.innerWidth <= 960) {
            phoneRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.open(`/${user?.id}`, '_blank');
        }
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

    // ─── Force Onboarding ───
    useEffect(() => {
        if (user && !user.onboarded) {
            navigate('/onboarding', { replace: true });
        }
    }, [user, navigate]);

    // ─── Auto-Apply Plan from Pricing Page ───
    useEffect(() => {
        const selected = sessionStorage.getItem('selectedPlan');
        if (selected && user && user.plan !== selected) {
            updateUser({ plan: selected as User['plan'] });
            sessionStorage.removeItem('selectedPlan');
            showToast(`Welcome to ${selected.toUpperCase()}!`, 'success', '🎉');
        }
    }, [user, updateUser, showToast]);

    if (!user || (!user.onboarded && window.location.pathname.includes('/dashboard'))) return null;

    // CRUD helpers
    const saveLinks = (u: LinkItem[]) => { setLinks(u); updateUser({ links: u }); };
    const saveBlocks = (u: Block[]) => { setBlocks(u); updateUser({ blocks: u }); };

    const addLink = () => {
        if (!newLabel.trim() || !newUrl.trim()) return;
        
        const currentCount = links.length + blocks.length;
        const limit = PLAN_LIMITS[user?.plan || 'free'].maxLinks;
        
        if (currentCount >= limit) {
            showToast(`Limit reached: ${user?.plan} plan allows ${limit} links.`, 'error', '🚫');
            return;
        }

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
        const currentCount = links.length + blocks.length;
        const limit = PLAN_LIMITS[user?.plan || 'free'].maxLinks;
        
        if (currentCount >= limit) {
            showToast(`Limit reached: ${user?.plan} plan allows ${limit} links.`, 'error', '🚫');
            return;
        }

        if (advType === 'music' && mt && me) {
            saveBlocks([...blocks, { id, type: 'music', title: mt, artist: ma, embedUrl: me, coverUrl: mc, enabled: true } as MusicBlock]);
            setMt(''); setMa(''); setMe(''); setMc('');
            showToast('Music block added', 'success', '🎵');
        } else if (advType === 'photo') {
            if (!pImgs.length) return;
            saveBlocks([...blocks, { id, type: 'photo', images: pImgs, caption: pCap, enabled: true } as PhotoBlock]);
            setPImgs([]); setPCap('');
            showToast('Photo block added', 'success', '📷');
        } else if (advType === 'product' && prName && prBuy) {
            saveBlocks([...blocks, { id, type: 'product', name: prName, price: prPrice, imageUrl: prImg, buyUrl: prBuy, enabled: true } as ProductBlock]);
            setPrName(''); setPrPrice(''); setPrBuy(''); setPrImg('');
            showToast('Product block added', 'success', '🛍️');
        }
        setShowAdvanced(false);
    };

    // Upload multiple photos directly to Appwrite Storage
    const uploadPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length || !APPWRITE_READY) return;
        setIsUploadingPhotos(true);
        const files = Array.from(e.target.files);
        try {
            const urls = await Promise.all(
                files.map(async (file) => {
                    const fileId = ID.unique();
                    await storage.createFile(APPWRITE_CONFIG.storageBucketId, fileId, file);
                    return storage.getFileView(APPWRITE_CONFIG.storageBucketId, fileId) as unknown as string;
                })
            );
            setPImgs(prev => [...prev, ...urls]);
            showToast(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`, 'success', '📷');
        } catch (err: unknown) {
            showToast('Photo upload failed', 'error');
        } finally {
            setIsUploadingPhotos(false);
            e.target.value = '';
        }
    };

    const handleThemeSelect = (themeId: string) => {
        const theme = templatesList.find(t => t.id === themeId);
        if (user?.plan === 'free' && theme?.isPremium) {
            showToast('This theme is a Pro feature', 'error', '💎');
            navigate('/pricing');
            return;
        }
        setSelTheme(themeId);
        updateUser({ theme: themeId });
        const name = themeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        showToast(`Theme: ${name}`, 'info', '✨');
    };

    const saveAppearance = () => { 
        updateUser({ name, bio, avatarUrl, bgColor, bgImage, theme: selTheme, textColor: manualTextColor }); 
        showToast('Appearance updated', 'success', '🎨');
    };

    // ─── Cropping & Upload Logic ───
    const onFileChange = async (e: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
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
        setIsSaving(true);
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
            setIsSaving(false);
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
                <button className="btn-preview" onClick={scrollToPreview}>
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
                <div className="bento-crop-overlay">
                    <div className="bento-crop-modal">
                        <div className="bento-crop-modal__header">
                            <div>
                                <div className="bento-crop-modal__title">
                                    {cropType === 'avatar' ? 'Crop Profile Photo' : 'Select Background Area'}
                                </div>
                                <div className="bento-crop-modal__hint">
                                    {cropType === 'avatar' 
                                        ? 'Drag to reposition · Scroll or use slider to zoom' 
                                        : 'Mobile screen ratio (9:19) · Drag area to align'
                                    }
                                </div>
                            </div>
                            <button className="bento-crop-modal__close" onClick={() => setCropImageSrc(null)} aria-label="Close">✕</button>
                        </div>

                        <div className="bento-crop-modal__canvas">
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={cropType === 'avatar' ? 1 : 9 / 19}
                                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={true}
                            />
                        </div>

                        <div className="bento-crop-modal__footer">
                            <div className="bento-crop-modal__zoom">
                                <span className="bento-crop-modal__zoom-label">Zoom</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))}
                                    className="bento-crop-modal__zoom-slider"
                                />
                                <span className="bento-crop-modal__zoom-val">{Math.round(zoom * 100)}%</span>
                            </div>
                            <div className="bento-crop-modal__actions">
                                <button className="bento-ghost" onClick={() => setCropImageSrc(null)} disabled={isSaving}>Cancel</button>
                                <button className="bento-save" onClick={uploadCroppedImage} disabled={isSaving}>
                                    {isSaving ? 'Saving…' : 'Crop & Save'}
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
                                    {user?.plan === 'free' && (
                                        <div className="bento-upgrade-banner">
                                            <div className="bento-upgrade-banner__text">
                                                <strong>Upgrade to Pro</strong>
                                                <p>Get unlimited links, premium themes, and remove Linkzy branding.</p>
                                            </div>
                                            <button className="bento-upgrade-banner__btn" onClick={() => navigate('/pricing')}>Learn More</button>
                                        </div>
                                    )}

                                    <header className="bento-page-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <h1>Links & Blocks</h1>
                                            <span className={`plan-badge plan-badge--${user?.plan || 'free'}`}>
                                                {PLAN_LIMITS[user?.plan || 'free'].label}
                                            </span>
                                        </div>
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
                                            <div className="stat-card__value">{user?.views || 0}</div>
                                            <div className="stat-card__sub">Lifetime visits</div>
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

                                                        {/* File upload drop zone */}
                                                        <label className="photo-upload-zone">
                                                            <span className="photo-upload-zone__icon">📸</span>
                                                            <span className="photo-upload-zone__text">
                                                                {isUploadingPhotos ? 'Uploading…' : 'Click to upload photos'}
                                                            </span>
                                                            <span className="photo-upload-zone__sub">JPG, PNG, WEBP — multiple allowed</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                style={{ display: 'none' }}
                                                                onChange={uploadPhotos}
                                                                disabled={isUploadingPhotos}
                                                            />
                                                        </label>

                                                        {/* Thumbnail previews */}
                                                        {pImgs.length > 0 && (
                                                            <div className="photo-thumbs">
                                                                {pImgs.map((url, i) => (
                                                                    <div key={i} className="photo-thumb">
                                                                        <img src={url} alt={`Photo ${i + 1}`} />
                                                                        <button
                                                                            className="photo-thumb__remove"
                                                                            onClick={() => setPImgs(prev => prev.filter((_, idx) => idx !== i))}
                                                                            aria-label="Remove"
                                                                        >✕</button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <button
                                                            className="bento-save"
                                                            onClick={addBlock}
                                                            disabled={pImgs.length === 0 || isUploadingPhotos}
                                                        >
                                                            {isUploadingPhotos ? 'Uploading…' : `Add Photo Block${pImgs.length > 0 ? ` (${pImgs.length})` : ''}`}
                                                        </button>
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

                                        {/* Display name */}
                                        <div className="field-group">
                                            <label className="field-label">Display Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                onBlur={() => { if (name !== user?.name) { updateUser({ name }); showToast('Name saved', 'info', '👤'); } }}
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div className="field-group">
                                            <label className="field-label">Bio</label>
                                            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} onBlur={() => { if (bio !== user?.bio) { updateUser({ bio }); showToast('Bio saved', 'info', '📝'); } }} />
                                        </div>

                                        <div className="appearance-section-divider"></div>

                                        {/* Background image */}
                                        <div className="field-group">
                                            <label className="field-label">Background Photo <span className="bento-hint">(fills entire profile background)</span></label>
                                            {bgImage && <div style={{ width: '100%', height: 160, borderRadius: 12, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 12, border: '1px solid rgba(30,45,74,0.1)' }} />}
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

                                                        {templatesList.map(t => {
                                                            const isLocked = user?.plan === 'free' && t.isPremium;
                                                            return (
                                                                <button 
                                                                    key={t.id} 
                                                                    className={[
                                                                        'bento-theme-btn', 
                                                                        (selTheme === t.id && !bgImage && !bgColor) ? 'sel' : '',
                                                                        isLocked ? 'locked' : ''
                                                                    ].filter(Boolean).join(' ')} 
                                                                    style={{ background: swatchGradients[t.id] || t.bg }}
                                                                    onClick={() => {
                                                                        if (isLocked) {
                                                                            handleThemeSelect(t.id); // Triggers toast & redirect
                                                                            return;
                                                                        }
                                                                        setBgImage('');
                                                                        setBgColor('');
                                                                        setManualTextColor('');
                                                                        handleThemeSelect(t.id);
                                                                    }}
                                                                >
                                                                    <div className="bento-theme-name">
                                                                        {t.name}
                                                                        {isLocked && <span className="bento-theme-lock">💎</span>}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
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
                                    
                                    {/* Maintenance Card (Admin Only) */}
                                    {user?.email === 'sumitsingh946765@gmail.com' && (
                                        <div className="plan-access-card" style={{ marginTop: 20, borderColor: '#fee2e2' }}>
                                            <div className="promo-card__header">
                                                <div>
                                                    <div className="promo-card__title" style={{ color: '#991b1b' }}>Maintenance</div>
                                                    <div className="promo-card__sub">System cleanup tools</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '0 20px 20px' }}>
                                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>
                                                    Found thousands of entries in your database? Run the purge tool to remove duplicates and keep only the latest version of each profile.
                                                </p>
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ background: '#ef4444', border: 'none', width: '100%', opacity: isPurging ? 0.7 : 1 }}
                                                    onClick={purgeDuplicates}
                                                    disabled={isPurging}
                                                >
                                                    {isPurging ? 'Purging Documents...' : 'Purge All Duplicate Profiles'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

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
                                                                try {
                                                                    const success = await redeemPromoCode(promoCode.trim());
                                                                    if (success) {
                                                                        setPromoStatus('ok');
                                                                        setPromoCode('');
                                                                        showToast('Pro Features Unlocked!', 'success', '🚀');
                                                                    } else {
                                                                        setPromoStatus('invalid');
                                                                        showToast('Invalid promo code', 'error', '✕');
                                                                    }
                                                                } catch (err) {
                                                                    setPromoStatus('invalid');
                                                                    showToast('Redemption failed', 'error');
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
                                                            try {
                                                                const success = await redeemPromoCode(promoCode.trim());
                                                                if (success) {
                                                                    setPromoStatus('ok');
                                                                    setPromoCode('');
                                                                    showToast('Pro Features Unlocked!', 'success', '🚀');
                                                                } else {
                                                                    setPromoStatus('invalid');
                                                                    showToast('Invalid promo code', 'error', '✕');
                                                                }
                                                            } catch (err) {
                                                                setPromoStatus('invalid');
                                                                showToast('Redemption failed', 'error');
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

                <aside className="bento-right-col" ref={phoneRef}>
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
