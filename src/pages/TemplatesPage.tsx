
import TemplateCard from '../components/TemplateCard';
import type { ThemeConfig } from '../components/TemplateCard';
import styles from './TemplatesPage.module.css';
import { useAuth } from '../context/AuthContext';

// 20 Distinct Premium Neo-Brutalist & Modern Themes
const templatesList: ThemeConfig[] = [
    {
        id: '1-midnight', name: 'Midnight Waves', category: 'Music Artist',
        bg: '#1A0033', screenBg: '#1A0033', textColor: '#FFFFFF', btnBg: '#330066', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '2-acid', name: 'Acid Rain', category: 'Creative',
        bg: '#DFFF00', screenBg: '#0A0A0A', textColor: '#00FF00', btnBg: 'transparent', btnText: '#00FF00',
        borderFormat: 'thin', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '3-blush', name: 'Cotton Candy', category: 'Lifestyle',
        bg: '#FFB6C1', screenBg: '#FFF0F5', textColor: '#FF1493', btnBg: '#FF69B4', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '4-corporate', name: 'Executive', category: 'Business',
        bg: '#E0E0E0', screenBg: '#FFFFFF', textColor: '#000000', btnBg: '#111111', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '5-neon', name: 'Neon City', category: 'Tech / Gaming',
        bg: 'var(--black)', screenBg: 'var(--black)', textColor: '#FF00FF', btnBg: '#00FFFF', btnText: 'var(--black)',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'centered'
    },
    {
        id: '6-minimal', name: 'Minimal Mono', category: 'Designer',
        bg: '#F5F5F5', screenBg: '#FFFFFF', textColor: '#333333', btnBg: '#F5F5F5', btnText: '#333333',
        borderFormat: 'thin', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '7-sunset', name: 'Miami Vice', category: 'Influencer',
        bg: '#FF7F50', screenBg: '#FFDAB9', textColor: '#8B0000', btnBg: '#FF4500', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '8-forest', name: 'Evergreen', category: 'Nature / Wellness',
        bg: '#2E8B57', screenBg: '#F0FFF0', textColor: '#006400', btnBg: '#3CB371', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '9-y2k', name: 'Y2K Glitch', category: 'Fashion',
        bg: '#0000FF', screenBg: 'var(--white)', textColor: 'var(--black)', btnBg: '#FF00FF', btnText: 'var(--white)',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'centered'
    },
    {
        id: '10-clay', name: 'Terracotta', category: 'Photography',
        bg: '#E9967A', screenBg: '#FAF0E6', textColor: '#8B4513', btnBg: '#D2691E', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'serif', layoutType: 'left'
    },
    {
        id: '11-hacker', name: 'Terminal', category: 'Developer',
        bg: '#000000', screenBg: '#050505', textColor: '#00FF00', btnBg: '#003300', btnText: '#00FF00',
        borderFormat: 'thick', shadowFormat: 'none', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '12-popart', name: 'Pop Art', category: 'Artist',
        bg: '#FF00FF', screenBg: '#FFFF00', textColor: '#000000', btnBg: '#00FFFF', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '13-retro', name: 'Vintage 90s', category: 'Brand',
        bg: '#FFD700', screenBg: '#FDF5E6', textColor: '#8B0000', btnBg: '#B22222', btnText: '#FFD700',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '14-ocean', name: 'Deep Sea', category: 'Travel',
        bg: '#000080', screenBg: '#E0FFFF', textColor: '#00008B', btnBg: '#4682B4', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '15-goth', name: 'Obsidian', category: 'Alternative',
        bg: '#1A1A1A', screenBg: '#2E2E2E', textColor: '#D3D3D3', btnBg: '#000000', btnText: '#FF0000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '16-solar', name: 'Solar Flare', category: 'Fitness',
        bg: '#FF4500', screenBg: '#111111', textColor: '#FFD700', btnBg: '#FF8C00', btnText: '#000000',
        borderFormat: 'none', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '17-pastel', name: 'Lavender Dream', category: 'Beauty',
        bg: '#E6E6FA', screenBg: '#F8F8FF', textColor: '#4B0082', btnBg: '#9370DB', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '18-brutal', name: 'Raw Brutalism', category: 'Agency',
        bg: 'var(--white)', screenBg: 'var(--bg-color)', textColor: 'var(--black)', btnBg: 'transparent', btnText: 'var(--black)',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '19-cherry', name: 'Cherry Bomb', category: 'Food & Drink',
        bg: '#DC143C', screenBg: '#FFF0F5', textColor: '#8B0000', btnBg: '#DC143C', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '20-glass', name: 'Frosted Glass', category: 'Portfolio',
        bg: '#87CEEB', screenBg: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))', textColor: '#191970', btnBg: 'rgba(255,255,255,0.6)', btnText: '#000080',
        borderFormat: 'thin', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'left'
    }
];

export default function TemplatesPage() {
    const { user } = useAuth();
    return (
        <div className={styles.pageRoot}>
            <div className={styles.header}>
                <h1 className={styles.title}>Template Gallery</h1>
                <p className={styles.subtitle}>
                    Discover 20+ fully customizable, premium themes.
                    Click any template to use it instantly.
                </p>
            </div>

            <div className={styles.grid}>
                {templatesList.map(theme => (
                    <TemplateCard key={theme.id} theme={theme} isLoggedIn={!!user} />
                ))}
            </div>
        </div>
    );
}
