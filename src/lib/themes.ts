// src/lib/themes.ts
export interface ThemeConfig {
    id: string;
    name: string;
    category: string;
    bg: string;
    screenBg: string; // The background inside the phone screen
    textColor: string;
    btnBg: string;
    btnText: string;
    btnBorder?: string;
    btnShadow?: string;
    backdropBlur?: string;
    borderFormat: 'none' | 'thin' | 'thick';
    shadowFormat: 'none' | 'soft' | 'hard';
    fontFamily: string;
    layoutType: 'centered' | 'left' | 'grid';
    blockStyle?: 'links' | 'music' | 'photos' | 'product';
    avatarSeed?: string;
}

// 10 "Apple Glass" Premium Themes (Rich Gradients, Ethereal Atmosphere, Glassmorphism)
export const templatesList: ThemeConfig[] = [
    {
        id: '1-aurora', name: 'Aurora Glass', category: 'Creator',
        bg: '#0F0C29',
        screenBg: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
        textColor: '#FFFFFF', btnBg: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.2)', btnShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '2-sunset', name: 'Mojave Sunset', category: 'Lifestyle',
        bg: '#FF4E50', screenBg: 'linear-gradient(180deg, #FF4E50 0%, #F9D423 100%)',
        textColor: '#FFFFFF', btnBg: 'rgba(255, 255, 255, 0.2)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.4)', btnShadow: '0 4px 24px rgba(0,0,0,0.2)', backdropBlur: 'blur(12px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '3-ocean', name: 'Pacific Depths', category: 'Photography',
        bg: '#021B79', screenBg: 'url(https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#FFFFFF', btnBg: 'rgba(0, 0, 0, 0.3)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.15)', btnShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropBlur: 'blur(24px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '4-hologram', name: 'Prism Glass', category: 'Artist',
        bg: '#E2D1C3', screenBg: 'linear-gradient(45deg, #E2D1C3 0%, #FDFCFB 100%)',
        textColor: '#2D3436', btnBg: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))', btnText: '#2D3436',
        btnBorder: '1px solid rgba(255,255,255,0.8)', btnShadow: '0 8px 32px rgba(31,38,135,0.1)', backdropBlur: 'blur(8px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '5-cyber', name: 'Neon Plasma', category: 'Tech / Gaming',
        bg: '#120458', screenBg: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#00FFA3', btnBg: 'rgba(0, 255, 163, 0.1)', btnText: '#00FFA3',
        btnBorder: '1px solid rgba(0,255,163,0.3)', btnShadow: '0 0 20px rgba(0,255,163,0.2)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'monospace', layoutType: 'left'
    },
    {
        id: '6-ruby', name: 'Crimson Velvet', category: 'Fashion',
        bg: '#5A0B14', screenBg: 'linear-gradient(135deg, #5A0B14 0%, #1A0002 100%)',
        textColor: '#FFD700', btnBg: 'rgba(255, 255, 255, 0.05)', btnText: '#FFD700',
        btnBorder: '1px solid rgba(255,215,0,0.2)', btnShadow: '0 4px 14px rgba(0,0,0,0.4)', backdropBlur: 'blur(10px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '7-forest', name: 'Nordic Pine', category: 'Wellness',
        bg: '#134E5E', screenBg: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#E8F5E9', btnBg: 'rgba(255, 255, 255, 0.15)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.3)', btnShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', backdropBlur: 'blur(20px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '8-obsidian', name: 'Obsidian Glow', category: 'Business',
        bg: '#000000', screenBg: 'linear-gradient(180deg, #1A1A1A 0%, #000000 100%)',
        textColor: '#F5F5F7', btnBg: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.1)', btnShadow: '0 4px 20px rgba(0,0,0,0.5)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '9-candy', name: 'Liquid Candy', category: 'Brand',
        bg: '#A18CD1', screenBg: 'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)',
        textColor: '#FFFFFF', btnBg: 'rgba(255, 255, 255, 0.25)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255,255,255,0.4)', btnShadow: '0 8px 24px rgba(161,140,209,0.3)', backdropBlur: 'blur(12px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '10-alpine', name: 'Alpine Frost', category: 'Design',
        bg: '#E0C3FC', screenBg: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
        textColor: '#1A1A2E', btnBg: 'rgba(255, 255, 255, 0.4)', btnText: '#1A1A2E',
        btnBorder: '1px solid rgba(255,255,255,0.6)', btnShadow: '0 8px 32px rgba(142,197,252,0.2)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    }
];
