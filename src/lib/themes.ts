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
    hidden?: boolean; // Used to hide legacy themes from the Dashboard picker
}

// 10 Premium Themes: A mix of high-end Apple Liquid Glass and Strict Minimal
export const templatesList: ThemeConfig[] = [
    // --- PREMIUM LIQUID GLASS ---
    {
        id: '1-vision', name: 'Vision Frost', category: 'Creator',
        bg: '#0F172A',
        // Smooth meshed abstract gradient
        screenBg: 'radial-gradient(circle at 15% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 85% 30%, #ec4899 0%, transparent 50%), radial-gradient(circle at 50% 80%, #3b82f6 0%, transparent 50%), #0f172a',
        textColor: '#FFFFFF', btnBg: 'rgba(255, 255, 255, 0.1)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255, 255, 255, 0.25)', btnShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', backdropBlur: 'blur(32px)',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '2-midnight', name: 'Midnight Aurora', category: 'Artist',
        bg: '#020617', screenBg: 'radial-gradient(circle at 50% -20%, #4338ca 0%, #020617 80%)',
        textColor: '#F8FAFC', btnBg: 'rgba(255, 255, 255, 0.05)', btnText: '#F8FAFC',
        btnBorder: '1px solid rgba(255, 255, 255, 0.1)(', btnShadow: '0 4px 24px rgba(0,0,0,0.3)', backdropBlur: 'blur(24px)',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '3-ocean', name: 'Pacific Glass', category: 'Photography',
        bg: '#0C4A6E', screenBg: 'url(https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80) center/cover',
        textColor: '#FFFFFF', btnBg: 'rgba(0, 0, 0, 0.25)', btnText: '#FFFFFF',
        btnBorder: '1px solid rgba(255, 255, 255, 0.15)', btnShadow: '0 10px 40px rgba(0,0,0,0.4)', backdropBlur: 'blur(40px)',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '4-blush', name: 'Rose Quartz', category: 'Lifestyle',
        bg: '#FFF1F2', screenBg: 'radial-gradient(circle at top right, #fecdd3 0%, #fff1f2 100%)',
        textColor: '#4C1D95', btnBg: 'rgba(255, 255, 255, 0.4)', btnText: '#4C1D95',
        btnBorder: '1px solid rgba(255, 255, 255, 0.8)', btnShadow: '0 4px 16px rgba(136, 19, 55, 0.08)', backdropBlur: 'blur(16px)',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '5-prism', name: 'Prism Light', category: 'Brand',
        bg: '#F8FAFC', screenBg: 'radial-gradient(circle at 0% 0%, #e0c3fc 0%, transparent 60%), radial-gradient(circle at 100% 100%, #8ec5fc 0%, transparent 60%), #f8fafc',
        textColor: '#1E293B', btnBg: 'rgba(255, 255, 255, 0.5)', btnText: '#1E293B',
        btnBorder: '1px solid rgba(255, 255, 255, 0.9)', btnShadow: '0 8px 32px rgba(142, 197, 252, 0.15)', backdropBlur: 'blur(24px)',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered'
    },

    // --- STRICT MINIMAL (SaaS / Editorial) ---
    {
        id: '6-onyx', name: 'Onyx System', category: 'Tech',
        bg: '#FFFFFF', screenBg: '#FFFFFF',
        textColor: '#0A0A0A', btnBg: '#0A0A0A', btnText: '#FFFFFF',
        btnBorder: 'none', btnShadow: '0 2px 8px rgba(0,0,0,0.06)', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '7-stripe', name: 'Cobalt Clean', category: 'Business',
        bg: '#F9FAFB', screenBg: '#F9FAFB',
        textColor: '#111827', btnBg: '#FFFFFF', btnText: '#111827',
        btnBorder: '1px solid #E5E7EB', btnShadow: '0 1px 3px rgba(0,0,0,0.05)', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'left'
    },
    {
        id: '8-nordic', name: 'Nordic Slate', category: 'Design',
        bg: '#F1F5F9', screenBg: '#F1F5F9',
        textColor: '#334155', btnBg: '#CBD5E1', btnText: '#0F172A',
        btnBorder: 'none', btnShadow: 'none', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'sans-serif', layoutType: 'centered'
    },
    {
        id: '9-sand', name: 'Warm Sand', category: 'Wellness',
        bg: '#FAFAF9', screenBg: '#FAFAF9',
        textColor: '#44403C', btnBg: '#F5F5F4', btnText: '#44403C',
        btnBorder: '1px solid #E7E5E4', btnShadow: 'none', backdropBlur: 'none',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered'
    },
    {
        id: '10-brutal', name: 'Brutalist Form', category: 'Developer',
        bg: '#FFFFFF', screenBg: '#FFFFFF',
        textColor: '#000000', btnBg: '#FFFFFF', btnText: '#000000',
        btnBorder: '2px solid #000000', btnShadow: '4px 4px 0px #000000', backdropBlur: 'none',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'left'
    },
    
    // --- LEGACY MINIMAL / BRUTAL THEMES (HIDDEN) ---
    // These ensure existing user profiles don't break/whitescreen if they saved an old theme ID.
    {
        id: 'classic-light', name: 'Classic (Legacy)', category: 'Legacy',
        bg: '#F3F4F6', screenBg: '#F3F4F6', textColor: '#111827', btnBg: '#FFFFFF', btnText: '#111827',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: 'minimal-dark', name: 'Dark (Legacy)', category: 'Legacy',
        bg: '#111827', screenBg: '#111827', textColor: '#F9FAFB', btnBg: '#1F2937', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: 'brutal-light', name: 'Brutal (Legacy)', category: 'Legacy',
        bg: '#FFFFFF', screenBg: '#FFFFFF', textColor: '#000000', btnBg: '#FFFFFF', btnText: '#000000',
        borderFormat: 'thick', shadowFormat: 'hard', fontFamily: 'monospace', layoutType: 'left', hidden: true
    },
    {
        id: 'terminal', name: 'Terminal (Legacy)', category: 'Legacy',
        bg: '#000000', screenBg: '#000000', textColor: '#10B981', btnBg: '#111827', btnText: '#10B981',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'monospace', layoutType: 'left', hidden: true
    },
    {
        id: 'editorial-light', name: 'Editorial (Legacy)', category: 'Legacy',
        bg: '#FFFFFF', screenBg: '#FFFFFF', textColor: '#1C1917', btnBg: '#F5F5F4', btnText: '#1C1917',
        borderFormat: 'none', shadowFormat: 'none', fontFamily: 'serif', layoutType: 'centered', hidden: true
    },

    // --- LEGACY GLOSS / GRADIENT THEMES (HIDDEN) ---
    {
        id: '1-aurora', name: 'Aurora Glass (Legacy)', category: 'Legacy',
        bg: '#1e1b4b', screenBg: 'linear-gradient(45deg, #1e1b4b, #312e81)', textColor: '#FFFFFF', btnBg: 'rgba(255,255,255,0.1)', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '2-sunset', name: 'Mojave Sunset (Legacy)', category: 'Legacy',
        bg: '#7c2d12', screenBg: 'linear-gradient(to bottom, #7c2d12, #f59e0b)', textColor: '#FFFFFF', btnBg: 'rgba(0,0,0,0.2)', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '3-ocean', name: 'Pacific (Legacy)', category: 'Legacy',
        bg: '#083344', screenBg: '#083344', textColor: '#FFFFFF', btnBg: '#164e63', btnText: '#FFFFFF',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '4-hologram', name: 'Hologram (Legacy)', category: 'Legacy',
        bg: '#000000', screenBg: 'linear-gradient(135deg, #fce7f3, #e0e7ff, #dcfce7)', textColor: '#111827', btnBg: 'rgba(255,255,255,0.4)', btnText: '#111827',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '5-cyber', name: 'Cyber (Legacy)', category: 'Legacy',
        bg: '#000000', screenBg: '#000000', textColor: '#22d3ee', btnBg: 'rgba(34,211,238,0.1)', btnText: '#22d3ee',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '6-ruby', name: 'Ruby (Legacy)', category: 'Legacy',
        bg: '#4c0519', screenBg: '#4c0519', textColor: '#fecdd3', btnBg: 'rgba(255,255,255,0.1)', btnText: '#fecdd3',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '7-forest', name: 'Forest (Legacy)', category: 'Legacy',
        bg: '#022c22', screenBg: '#022c22', textColor: '#dcfce7', btnBg: '#064e3b', btnText: '#dcfce7',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '8-obsidian', name: 'Obsidian (Legacy)', category: 'Legacy',
        bg: '#000000', screenBg: '#0a0a0a', textColor: '#f8fafc', btnBg: '#171717', btnText: '#f8fafc',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '9-candy', name: 'Candy (Legacy)', category: 'Legacy',
        bg: '#fdf4ff', screenBg: 'linear-gradient(to right, #fdf4ff, #f3e8ff)', textColor: '#701a75', btnBg: 'rgba(216,180,254,0.3)', btnText: '#701a75',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    },
    {
        id: '10-alpine', name: 'Alpine (Legacy)', category: 'Legacy',
        bg: '#f8fafc', screenBg: '#f8fafc', textColor: '#0f172a', btnBg: '#FFFFFF', btnText: '#0f172a',
        borderFormat: 'none', shadowFormat: 'soft', fontFamily: 'sans-serif', layoutType: 'centered', hidden: true
    }
];
