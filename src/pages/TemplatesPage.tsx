
import TemplateCard from '../components/TemplateCard';
import type { ThemeConfig } from '../components/TemplateCard';
import styles from './TemplatesPage.module.css';
import { useAuth } from '../context/AuthContext';

// 10 Highly Premium "Apple Glass" & Minimalist Themes
const templatesList: ThemeConfig[] = [
    {
        id: '1-vision', name: 'Vision OS', category: 'Creator',
        bg: '#1C1C1E',
        screenBg: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#FFFFFF', btnBg: 'rgba(255, 255, 255, 0.1)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.15)', btnShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)', backdropBlur: 'blur(20px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '2-midnight', name: 'Midnight Titanium', category: 'Business',
        bg: '#000000', screenBg: 'linear-gradient(145deg, #1A1C20 0%, #0A0C10 100%)',
        textColor: '#E5E7EB', btnBg: 'rgba(255, 255, 255, 0.03)', btnText: '#F3F4F6',
        btnBorder: '1px solid rgba(255,255,255,0.05)', btnShadow: '0 4px 20px rgba(0,0,0,0.4)', backdropBlur: 'blur(10px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '3-pearl', name: 'Frosted Pearl', category: 'Lifestyle',
        bg: '#F5F5F7', screenBg: 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F3 100%)',
        textColor: '#1D1D1F', btnBg: 'rgba(255, 255, 255, 0.6)', btnText: '#1D1D1F',
        btnBorder: '1px solid rgba(255,255,255,0.8)', btnShadow: '0 6px 16px rgba(0, 0, 0, 0.04)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '4-obsidian', name: 'Pure Obsidian', category: 'Developer',
        bg: '#050505', screenBg: '#050505',
        textColor: '#F5F5F5', btnBg: '#121212', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.08)', btnShadow: 'none', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '5-aura', name: 'Soft Aura', category: 'Artist',
        bg: '#141416', screenBg: 'radial-gradient(circle at 50% 0%, #2A2536 0%, #0F0F11 100%)',
        textColor: '#FFFFFF', btnBg: 'rgba(255, 255, 255, 0.06)', btnText: '#E2DDF0',
        btnBorder: '1px solid rgba(255,255,255,0.04)', btnShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropBlur: 'blur(12px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '6-silver', name: 'Liquid Silver', category: 'Design',
        bg: '#E8E8ED', screenBg: 'linear-gradient(180deg, #EBECEF 0%, #D8D9E0 100%)',
        textColor: '#333336', btnBg: 'linear-gradient(135deg, #F9F9FB 0%, #E2E3E9 100%)', btnText: '#1C1C1E',
        btnBorder: '1px solid #FFFFFF', btnShadow: '0 4px 14px rgba(0,0,0,0.05)', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '7-ocean', name: 'Deep Sea Glass', category: 'Photography',
        bg: '#040B16', screenBg: 'linear-gradient(180deg, #09152B 0%, #03060E 100%)',
        textColor: '#E6F0FF', btnBg: 'rgba(255, 255, 255, 0.04)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.07)', btnShadow: '0 10px 30px rgba(0,0,0,0.6)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '8-silk', name: 'Cashmere', category: 'Wellness',
        bg: '#FBF9F6', screenBg: '#F7F4F0',
        textColor: '#4A4640', btnBg: '#FFFFFF', btnText: '#3D3934',
        btnBorder: '1px solid rgba(0,0,0,0.03)', btnShadow: '0 4px 20px rgba(0,0,0,0.04)', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '9-graphite', name: 'Graphite', category: 'Brand',
        bg: '#1C1C1E', screenBg: '#1C1C1E',
        textColor: '#F5F5F7', btnBg: '#2C2C2E', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.08)', btnShadow: '0 2px 10px rgba(0,0,0,0.2)', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '10-lucid', name: 'Lucid Dream', category: 'Music Artist',
        bg: '#000000', screenBg: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#FFFFFF', btnBg: 'rgba(20, 20, 20, 0.4)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.1)', btnShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
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
