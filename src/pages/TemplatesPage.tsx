
import TemplateCard from '../components/TemplateCard';
import type { ThemeConfig } from '../components/TemplateCard';
import styles from './TemplatesPage.module.css';
import { useAuth } from '../context/AuthContext';

// 20 Distinct Premium Neo-Brutalist & Modern Themes
const templatesList: ThemeConfig[] = [
    {
        id: '1-executive', name: 'Executive', category: 'Business',
        bg: '#FFFFFF', screenBg: '#F5F5F7', textColor: '#000000', btnBg: '#000000', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '2-cyberpunk', name: 'Cyberpunk', category: 'Tech / Gaming',
        bg: '#000000', screenBg: '#000000', textColor: '#00FF00', btnBg: '#00FFFF', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '3-popart', name: 'Pop Art', category: 'Creative',
        bg: '#FF00FF', screenBg: '#FFFF00', textColor: '#000000', btnBg: '#00FFFF', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '4-mint', name: 'Fresh Mint', category: 'Lifestyle',
        bg: '#000000', screenBg: '#98FF98', textColor: '#000000', btnBg: '#FFFFFF', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '5-blueprint', name: 'Blueprint', category: 'Developer',
        bg: '#FFFFFF', screenBg: '#0000FF', textColor: '#FFFFFF', btnBg: '#000000', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'none', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '6-hazard', name: 'Hazard', category: 'Brand',
        bg: '#000000', screenBg: '#FF4500', textColor: '#FFFFFF', btnBg: '#000000', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '7-bubblegum', name: 'Bubblegum', category: 'Fashion',
        bg: '#000000', screenBg: '#FF69B4', textColor: '#000000', btnBg: '#FFFFFF', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '8-monolith', name: 'Monolith', category: 'Designer',
        bg: '#E0E0E0', screenBg: '#111111', textColor: '#FFFFFF', btnBg: '#333333', btnText: '#FFFFFF',
        borderFormat: 'thin', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '9-retro', name: 'Vintage 90s', category: 'Artist',
        bg: '#000000', screenBg: '#FFD700', textColor: '#000000', btnBg: '#FF0000', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '10-y2k', name: 'Y2K Glitch', category: 'Music Artist',
        bg: '#00FFFF', screenBg: '#0000FF', textColor: '#FFFFFF', btnBg: '#FF00FF', btnText: '#FFFFFF',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'left'
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
