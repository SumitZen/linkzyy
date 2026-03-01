
import TemplateCard from '../components/TemplateCard';
import type { ThemeConfig } from '../components/TemplateCard';
import styles from './TemplatesPage.module.css';
import { useAuth } from '../context/AuthContext';

// 10 Distinct Premium Themes (Glassmorphism, 3D, Gradients, Photography & Neo-Brutalism)
const templatesList: ThemeConfig[] = [
    {
        id: '1-glassmorphism', name: 'Frosted Glass', category: 'Creator',
        bg: '#000000',
        screenBg: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#FFFFFF', btnBg: 'rgba(255, 255, 255, 0.15)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.3)', btnShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.3)', backdropBlur: 'blur(12px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '2-cyberpunk', name: 'Neon City', category: 'Tech / Gaming',
        bg: '#120458', screenBg: 'linear-gradient(180deg, #0A0012 0%, #170028 100%)',
        textColor: '#00FF41', btnBg: 'rgba(0, 255, 65, 0.1)', btnText: '#00FF41',
        btnBorder: '1px solid #00FF41', btnShadow: '0 0 12px rgba(0,255,65,0.6)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '3-vaporwave', name: 'Vaporwave', category: 'Artist',
        bg: '#ffb6c1', screenBg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        textColor: '#1A0033', btnBg: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', btnText: '#FFFFFF',
        btnBorder: 'none', btnShadow: '0 6px 15px rgba(250, 112, 154, 0.4)',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '4-holographic', name: 'Holo Glow', category: 'Beauty',
        bg: '#E6E6FA', screenBg: 'url(https://images.unsplash.com/photo-1549468057-5ce754bbbe4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#ffffff', btnBg: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))', btnText: '#ffffff',
        btnBorder: '1px solid rgba(255,255,255,0.5)', btnShadow: '0 8px 32px rgba(255,255,255,0.2)', backdropBlur: 'blur(8px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '5-neumorphic', name: 'Soft 3D', category: 'Designer',
        bg: '#E0E5EC', screenBg: '#E0E5EC',
        textColor: '#4A5568', btnBg: '#E0E5EC', btnText: '#4A5568',
        btnBorder: 'none', btnShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '6-matte-black', name: 'Matte Black', category: 'Business',
        bg: '#111111', screenBg: '#121212',
        textColor: '#E0E0E0', btnBg: '#1E1E1E', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.05)', btnShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.5)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '7-brutalist', name: 'Neo-Brutalism', category: 'Developer',
        bg: '#F5F5F7', screenBg: '#FFFFFF',
        textColor: '#000000', btnBg: '#E0E0E0', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '8-earthy', name: 'Earthy Organic', category: 'Wellness',
        bg: '#F4F1EA', screenBg: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#FFFFFF', btnBg: 'rgba(74, 83, 32, 0.7)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.2)', btnShadow: '0 4px 14px rgba(0, 0, 0, 0.2)', backdropBlur: 'blur(4px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '9-gold', name: 'Luxury Gold', category: 'Brand',
        bg: '#1A1A1A', screenBg: 'linear-gradient(180deg, #1A1A1A 0%, #000000 100%)',
        textColor: '#D4AF37', btnBg: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7)', btnText: '#000000',
        btnBorder: 'none', btnShadow: '0 4px 15px rgba(212, 175, 55, 0.2)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '10-candy', name: 'Pop Art', category: 'Lifestyle',
        bg: '#FFFF00', screenBg: '#8A2BE2',
        textColor: '#FFFFFF', btnBg: '#FF1493', btnText: '#FFFFFF',
        btnBorder: '3px solid #00FFFF', btnShadow: '6px 6px 0px #00FFFF',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
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
