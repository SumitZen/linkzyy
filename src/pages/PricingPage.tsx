import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PricingPage.css';

type BillingCycle = 'monthly' | 'annual';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        annualPrice: 0,
        description: 'Perfect for getting started.',
        cta: 'Get started free',
        popular: false,
        color: '#6b7280',
        features: [
            { label: '5 links', included: true },
            { label: '3 themes', included: true },
            { label: 'Basic analytics', included: true },
            { label: 'Linkzy branding', included: true },
            { label: 'Custom domain', included: false },
            { label: 'QR code', included: false },
            { label: 'Team access', included: false },
            { label: 'Priority support', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 3,
        annualPrice: 29,
        description: 'For creators who mean business.',
        cta: 'Start Pro free →',
        popular: true,
        color: '#7c3aed',
        features: [
            { label: 'Unlimited links', included: true },
            { label: 'All 20+ themes', included: true },
            { label: 'Full analytics', included: true },
            { label: 'No branding', included: true },
            { label: 'Custom domain', included: true },
            { label: 'QR code', included: true },
            { label: 'Team access', included: false },
            { label: 'Priority support', included: false },
        ],
    },
    {
        id: 'business',
        name: 'Business',
        monthlyPrice: 9,
        annualPrice: 69,
        description: 'For teams and power users.',
        cta: 'Contact sales',
        popular: false,
        color: '#0f172a',
        features: [
            { label: 'Unlimited links', included: true },
            { label: 'All 20+ themes', included: true },
            { label: 'Full analytics', included: true },
            { label: 'No branding', included: true },
            { label: 'Custom domain', included: true },
            { label: 'QR code', included: true },
            { label: 'Team access (5 profiles)', included: true },
            { label: 'Priority support', included: true },
        ],
    },
];

const ALL_FEATURES = [
    'Links', 'Themes', 'Analytics', 'Branding', 'Custom domain', 'QR code', 'Team access', 'Priority support'
];

const COMPARISON = {
    free: ['5 links', '3 only', 'Basic', 'Linkzy brand', '✗', '✗', '✗', '✗'],
    pro: ['Unlimited', 'All 20+', 'Full', 'Removed', '✓', '✓', '✗', '✗'],
    business: ['Unlimited', 'All 20+', 'Full', 'Removed', '✓', '✓', '5 profiles', '✓'],
};

export default function PricingPage() {
    const [billing, setBilling] = useState<BillingCycle>('monthly');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCta = (planId: string) => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate(`/signup?plan=${planId}`);
        }
    };

    return (
        <div className="pricing-root">
            {/* Header */}
            <div className="pricing-header">
                <div className="pricing-badge">✦ Pricing</div>
                <h1 className="pricing-title">Start free.<br />Upgrade when ready.</h1>
                <p className="pricing-sub">No credit card. No catch. Always free to start.</p>

                {/* Toggle */}
                <div className="billing-toggle">
                    <button
                        className={`toggle-btn ${billing === 'monthly' ? 'active' : ''}`}
                        onClick={() => setBilling('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`toggle-btn ${billing === 'annual' ? 'active' : ''}`}
                        onClick={() => setBilling('annual')}
                    >
                        Annual
                        <span className="toggle-badge">Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Plan cards */}
            <div className="pricing-cards">
                {PLANS.map(plan => {
                    const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                    const period = billing === 'monthly' ? '/mo' : '/yr';

                    return (
                        <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                            {plan.popular && (
                                <div className="popular-badge">🔥 Most popular</div>
                            )}
                            <div className="plan-header">
                                <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
                                <div className="plan-desc">{plan.description}</div>
                            </div>
                            <div className="plan-price-row">
                                <span className="plan-price">
                                    {price === 0 ? 'Free' : `$${price}`}
                                </span>
                                {price > 0 && <span className="plan-period">{period}</span>}
                            </div>
                            {billing === 'annual' && price > 0 && (
                                <div className="plan-monthly-equiv">
                                    ~${(price / 12).toFixed(2)}/mo billed annually
                                </div>
                            )}
                            <div className="plan-divider" />
                            <ul className="plan-features">
                                {plan.features.filter(f => f.included).map(f => (
                                    <li key={f.label} className="feature-item">
                                        <span className="feature-check">✓</span>
                                        {f.label}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`plan-cta ${plan.popular ? 'cta-primary' : 'cta-secondary'}`}
                                onClick={() => handleCta(plan.id)}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Feature comparison table */}
            <div className="comparison-section">
                <h2 className="comparison-title">Full feature comparison</h2>
                <div className="comparison-table">
                    {/* Header row */}
                    <div className="comp-row comp-header">
                        <div className="comp-feature-col">Feature</div>
                        <div className="comp-plan-col">Free</div>
                        <div className="comp-plan-col highlighted">Pro</div>
                        <div className="comp-plan-col">Business</div>
                    </div>
                    {ALL_FEATURES.map((feat, i) => (
                        <div key={feat} className={`comp-row ${i % 2 === 0 ? 'even' : ''}`}>
                            <div className="comp-feature-col">{feat}</div>
                            <div className="comp-plan-col">{COMPARISON.free[i]}</div>
                            <div className="comp-plan-col highlighted">{COMPARISON.pro[i]}</div>
                            <div className="comp-plan-col">{COMPARISON.business[i]}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Strip */}
            <div className="pricing-faq">
                {[
                    { q: 'Can I cancel anytime?', a: 'Yes, cancel from Settings with one click. No penalties.' },
                    { q: 'Is there a free trial?', a: 'Pro comes with a 14-day free trial — no card required.' },
                    { q: 'What happens to my links if I downgrade?', a: 'Your links stay active. You\'ll be capped at 5 visible links on Free.' },
                ].map(item => (
                    <div key={item.q} className="faq-item">
                        <div className="faq-q">{item.q}</div>
                        <div className="faq-a">{item.a}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
