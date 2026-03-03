import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PublicProfile.module.css';

// --- Type Definitions ---
export type BlockType = 'link' | 'spotify' | 'map' | 'image_gallery' | 'product_card' | 'video' | 'text' | 'divider';

export interface BaseBlock {
    id: string;
    type: BlockType;
}

export interface LinkBlockData extends BaseBlock {
    type: 'link';
    title: string;
    url: string;
    icon?: string;
}

export interface SpotifyBlockData extends BaseBlock {
    type: 'spotify';
    embedUrl: string;
}

export interface MapBlockData extends BaseBlock {
    type: 'map';
    embedUrl: string;
}

export interface ImageGalleryBlockData extends BaseBlock {
    type: 'image_gallery';
    images: { url: string; alt: string }[];
}

export interface ProductCardBlockData extends BaseBlock {
    type: 'product_card';
    title: string;
    price: string;
    imageUrl: string;
    url: string;
}

export interface VideoBlockData extends BaseBlock {
    type: 'video';
    embedUrl: string;
}

export type ProfileBlock = LinkBlockData | SpotifyBlockData | MapBlockData | ImageGalleryBlockData | ProductCardBlockData | VideoBlockData;

// --- Mock Data (To be replaced with API fetch based on username) ---
const MOCK_PROFILE_DATA = {
    username: 'sofiadesign',
    displayName: 'Sofia Design',
    bio: 'UI/UX Designer · Brutalist Aficionado · Freelance',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia&backgroundColor=FF66A3',
    theme: 'dark', // We will force theme based on profile settings later
    blocks: [
        {
            id: 'b1',
            type: 'link',
            title: 'My Portfolio',
            url: 'https://example.com/portfolio',
            icon: '🎨',
        },
        {
            id: 'b2',
            type: 'product_card',
            title: 'Neo-Brutalist UI Kit (Figma)',
            price: '$49',
            imageUrl: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=600&auto=format&fit=crop',
            url: 'https://example.com/product',
        },
        {
            id: 'b3',
            type: 'video',
            // Example YouTube embed
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0',
        },
        {
            id: 'b4',
            type: 'link',
            title: 'Hire me on Upwork',
            url: 'https://upwork.com',
            icon: '💼',
        },
        {
            id: 'b5',
            type: 'spotify',
            // Example Spotify embed
            embedUrl: 'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator',
        },
        {
            id: 'b6',
            type: 'image_gallery',
            images: [
                { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=400&auto=format&fit=crop', alt: 'Design 1' },
                { url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400&auto=format&fit=crop', alt: 'Design 2' },
                { url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=400&auto=format&fit=crop', alt: 'Design 3' },
            ],
        },
        {
            id: 'b7',
            type: 'map',
            // Example Google Maps embed
            embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.25279986985!2d-74.1444878!3d40.6976637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1709148450123!5m2!1sen!2sus',
        }
    ] as ProfileBlock[]
};

// --- Block Components ---

const LinkBlock = ({ data }: { data: LinkBlockData }) => (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className={`${styles.baseBlock} ${styles.blockLink}`}>
        {data.icon && <span style={{ marginRight: '12px' }}>{data.icon}</span>}
        {data.title}
    </a>
);

const SpotifyBlock = ({ data }: { data: SpotifyBlockData }) => (
    <div className={`${styles.baseBlock} ${styles.blockSpotify}`}>
        <iframe
            style={{ borderRadius: '0', border: 'none' }}
            src={data.embedUrl}
            width="100%"
            height="152"
            allowFullScreen={false}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
        ></iframe>
    </div>
);

const MapBlock = ({ data }: { data: MapBlockData }) => (
    <div className={`${styles.baseBlock} ${styles.blockMap}`}>
        <iframe
            src={data.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
    </div>
);

const ImageGalleryBlock = ({ data }: { data: ImageGalleryBlockData }) => (
    <div className={`${styles.baseBlock} ${styles.blockImageGallery}`}>
        {data.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.alt} className={styles.galleryItem} loading="lazy" />
        ))}
    </div>
);

const ProductCardBlock = ({ data }: { data: ProductCardBlockData }) => (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className={`${styles.baseBlock} ${styles.blockProduct}`}>
        <img src={data.imageUrl} alt={data.title} className={styles.productImage} loading="lazy" />
        <div style={{ padding: '0 8px', width: '100%' }}>
            <h3 className={styles.productTitle}>{data.title}</h3>
            <div className={styles.productPrice}>{data.price}</div>
            <div style={{ marginTop: '16px', fontWeight: 'bold' }}>View Product →</div>
        </div>
    </a>
);

const VideoBlock = ({ data }: { data: VideoBlockData }) => (
    <div className={`${styles.baseBlock} ${styles.blockVideo}`}>
        <iframe
            width="100%"
            height="100%"
            src={data.embedUrl}
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
    </div>
);

// --- Global Block Renderer Mapping System ---
const BlockRenderer = ({ block }: { block: ProfileBlock }) => {
    switch (block.type) {
        case 'link':
            return <LinkBlock data={block} />;
        case 'spotify':
            return <SpotifyBlock data={block} />;
        case 'map':
            return <MapBlock data={block} />;
        case 'image_gallery':
            return <ImageGalleryBlock data={block} />;
        case 'product_card':
            return <ProductCardBlock data={block} />;
        case 'video':
            return <VideoBlock data={block} />;
        default:
            console.warn(`Unknown block type: ${(block as unknown as { type: string }).type}`);
            return null;
    }
};

// --- Main Route Component ---
export default function PublicProfile() {
    const { username } = useParams<{ username: string }>();

    // In a real app, we'd fetch the profile data based on `username` here.
    console.log(`Rendering mock profile for: ${username}`);
    const profile = MOCK_PROFILE_DATA;

    useEffect(() => {
        // Enforce the profile's specific theme on mount
        if (profile.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        return () => {
            // Cleanup: remove theme override when leaving the profile page
            // (If the user navigated here from landing page, we might want to restore their previous preference, but for now we just clear it)
            document.documentElement.removeAttribute('data-theme');
        };
    }, [profile.theme]);

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileCard}>

                {/* Header */}
                <header className={styles.profileHeader}>
                    <img src={profile.avatarUrl} alt={profile.displayName} className={styles.avatar} />
                    <h1 className={styles.username}>{profile.displayName}</h1>
                    {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                </header>

                {/* Dynamic Block Engine */}
                <main className={styles.blocksContainer}>
                    {profile.blocks.map((block) => (
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                </main>

                <footer style={{ marginTop: '48px', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)' }}>
                    <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>⚡ Powered by Linkzy</a>
                </footer>
            </div>
        </div>
    );
}
