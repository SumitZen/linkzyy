import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OnboardingPage.css';

const ONBOARDING_PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        desc: 'Perfect for beginners and personal use.',
        features: ['5 links/blocks', 'Basic analytics', 'Standard themes'],
        btnText: 'Start with Free',
        color: '#6b7280'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$4',
        period: 'per month',
        desc: 'Built for professional creators.',
        features: ['Unlimited links', 'Premium themes', 'Advanced stats', 'No branding'],
        btnText: 'Get Pro Access',
        color: '#7c3aed',
        popular: true
    },
    {
        id: 'business',
        name: 'Business',
        price: '$6',
        period: 'per month',
        desc: 'Advanced tools for teams.',
        features: ['Everything in Pro', '5 team profiles', 'Priority support'],
        btnText: 'Try Business Tier',
        color: '#1e2d4a'
    }
];

export default function OnboardingPage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const selectPlan = async (planId: string) => {
        setLoading(true);
        try {
            updateUser({ plan: planId as any, onboarded: true });
            // Small delay to ensure state update/sync starts
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 500);
        } catch (err) {
            console.error('Onboarding failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="onboarding-root">
            <div className="onboarding-container">
                <header className="onboarding-header">
                    <div className="onboarding-logo">Linkzy</div>
                    <h1 className="onboarding-title">Welcome, {user.name.split(' ')[0]}!</h1>
                    <p className="onboarding-sub">Choose a plan to customize your space.</p>
                </header>

                <div className="onboarding-grid">
                    {ONBOARDING_PLANS.map(plan => (
                        <div key={plan.id} className={`onboarding-card ${plan.popular ? 'popular' : ''}`}>
                            {plan.popular && <div className="popular-tag">Recommended</div>}
                            <div className="plan-info">
                                <h3 className="plan-name" style={{ color: plan.popular ? '#fff' : plan.color }}>{plan.name}</h3>
                                <div className="plan-price-wrap">
                                    <span className="plan-price">{plan.price}</span>
                                    <span className="plan-period">{plan.period}</span>
                                </div>
                                <p className="plan-desc">{plan.desc}</p>
                            </div>
                            
                            <ul className="plan-features">
                                {plan.features.map(f => (
                                    <li key={f} className="feature-item">
                                        <span className="check">✓</span> {f}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                className={`onboarding-btn ${plan.popular ? 'primary' : 'secondary'}`}
                                onClick={() => selectPlan(plan.id)}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : plan.btnText}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="onboarding-footer">
                    <p>You can change your plan or cancel subscription anytime in settings.</p>
                </div>
            </div>
        </div>
    );
}
