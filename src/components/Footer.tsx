import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import '../pages/LandingPage.css';
import '../pages/MissingLayouts.css';

export default function Footer() {
    return (
        <footer>
            <div className="footer-top">
                <div className="footer-brand">
                    <div style={{ marginBottom: '24px' }}>
                        <BrandLogo size={32} textColor="#fff" iconColor="#fff" />
                    </div>
                    <p>Your world. One link. The most beautiful link-in-bio tool for creators who mean business.</p>
                </div>
                <div className="footer-col">
                    <h4>Product</h4>
                    <ul>
                        <li><Link to="/templates">Templates</Link></li>
                        <li><Link to="/pricing">Pricing</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Company</h4>
                    <ul>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/">About</Link></li>
                        <li><Link to="/">Contact</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Legal</h4>
                    <ul>
                        <li><Link to="/">Privacy Policy</Link></li>
                        <li><Link to="/">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2025 Linkzy — Your world, one link.</span>
                <div className="footer-socs">
                    <div className="footer-soc">𝕏</div>
                    <div className="footer-soc">📸</div>
                    <div className="footer-soc">🎵</div>
                    <div className="footer-soc">▶</div>
                </div>
            </div>
        </footer>
    );
}
