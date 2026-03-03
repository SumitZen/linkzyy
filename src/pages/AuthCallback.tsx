import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, APPWRITE_READY } from '../lib/appwrite';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!APPWRITE_READY) {
            navigate('/login');
            return;
        }

        // Appwrite sets the session cookie before redirecting back here.
        // We just need to check if we can get the account, then redirect.
        account.get()
            .then(() => {
                navigate('/dashboard', { replace: true });
            })
            .catch((error) => {
                console.error("Appwrite OAuth Redirect Error:", error);
                navigate('/login', { replace: true });
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
