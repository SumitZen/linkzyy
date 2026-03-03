import { Link } from 'react-router-dom';
import TemplateCard from './TemplateCard';
import { templatesList } from '../lib/themes';
import styles from './TemplatesShowcase.module.css';

export default function TemplatesShowcase() {
    const showcaseTemplates = templatesList.slice(0, 4);

    return (
        <section id="templates" className={styles.showcaseSection}>
            <div className={styles.header}>
                <div className={styles.subhead}>The Curated Collection</div>
                <h2 className={styles.title}>Designed for impact.<br />Engineered for speed.</h2>
            </div>

            <div className={styles.masonryWrapper}>
                {showcaseTemplates.map((theme, i) => (
                    <div key={theme.id} style={{
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center',
                        height: '600px',
                        marginTop: i % 2 !== 0 ? '40px' : '0px'
                    }}>
                        <TemplateCard theme={theme} />
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <Link to="/templates" className="btn-signup" style={{ textDecoration: 'none' }}>
                    Explore All Designs →
                </Link>
            </div>
        </section>
    );
}
