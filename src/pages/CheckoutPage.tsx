import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { useToast } from '../hooks/useToast';
import './CheckoutPage.css';

const PRICING = {
    pro: { name: 'Linkzy Pro', priceInCents: 400, features: ['Unlimited links', 'Custom themes', 'No branding', 'Detailed analytics', 'Priority support'] },
    business: { name: 'Linkzy Business', priceInCents: 600, features: ['Everything in Pro', '5 team members', 'Advanced security', 'Custom domain', 'Dedicated manager'] }
};

export default function CheckoutPage() {
    const { user, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const planId = searchParams.get('plan') as 'pro' | 'business' | null;

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: window.location.pathname + window.location.search } } });
        }
    }, [user, navigate]);

    if (!planId || !PRICING[planId]) {
        return (
            <div className="checkout-root">
                <div className="checkout-container" style={{ display: 'block', textAlign: 'center', padding: '100px 48px' }}>
                    <h1>Invalid plan selected</h1>
                    <button onClick={() => navigate('/pricing')} className="checkout-btn">Back to Pricing</button>
                </div>
            </div>
        );
    }

    const plan = PRICING[planId];

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate network delay
        setTimeout(() => {
            updateUser({ plan: planId });
            showToast(`Welcome to ${plan.name}! Your account is now active.`, 'success', '✨');
            setIsProcessing(false);
            navigate('/dashboard', { replace: true });
        }, 3000);
    };

    return (
        <div className="checkout-root">
            <div className="checkout-container">
                <div className="checkout-summary">
                    <div className="checkout-logo">
                        <BrandLogo size={42} />
                    </div>
                    
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }} className="checkout-back">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19 12H5M5 12l7-7m-7 7l7 7" />
                        </svg>
                        Back to Pricing
                    </a>

                    <div className="checkout-plan-details">
                        <h1>{plan.name}</h1>
                        <div className="checkout-price">
                            ${(plan.priceInCents / 100).toFixed(2)} 
                            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}> / month</span>
                        </div>
                        
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '16px' }}>
                            Included in your plan
                        </div>
                        <ul className="checkout-features">
                            {plan.features.map(f => (
                                <li key={f} className="checkout-feature">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="checkout-form-panel">
                    <h2 className="checkout-title">Payment method</h2>
                    
                    <form onSubmit={handleCheckout} className="checkout-form">
                        <div className="input-group">
                            <label>Card number</label>
                            <input 
                                type="text" 
                                placeholder="4242 4242 4242 4242" 
                                required 
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                        </div>
                        
                        <div className="card-details-row">
                            <div className="input-group">
                                <label>Expiry date</label>
                                <input 
                                    type="text" 
                                    placeholder="MM / YY" 
                                    required
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>CVC</label>
                                <input 
                                    type="text" 
                                    placeholder="CVV" 
                                    required
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="checkout-btn" disabled={isProcessing}>
                            {isProcessing ? 'Processing payment...' : `Pay $${(plan.priceInCents / 100).toFixed(2)}`}
                        </button>
                    </form>

                    <div className="checkout-footer">
                        Securely processed with <strong>Linkzy Payments</strong>. <br />
                        You will be charged annually after your trial.
                    </div>
                </div>
            </div>
        </div>
    );
}
