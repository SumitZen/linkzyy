import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles the OAuth redirect from Supabase / Google.
 * Supabase exchanges the URL hash tokens automatically.
 * We just wait for the session to settle, then redirect to dashboard.
 */
export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                navigate('/dashboard', { replace: true });
            } else {
                // Poll briefly for session (OAuth redirect can be async)
                const unsub = supabase.auth.onAuthStateChange((_e, session) => {
                    if (session) {
                        unsub.data.subscription.unsubscribe();
                        navigate('/dashboard', { replace: true });
                    }
                });
                // Timeout fallback – send back to login if no session within 5s
                setTimeout(() => navigate('/login', { replace: true }), 5000);
            }
        });
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#f5f5f7', gap: 16,
        }}>
            <div style={{ fontSize: '2rem' }}>◆</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: '#6b7280' }}>
                Signing you in…
            </div>
        </div>
    );
}
