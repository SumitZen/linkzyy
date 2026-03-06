
import TemplateCard from '../components/TemplateCard';
import styles from './TemplatesPage.module.css';
import { useAuth } from '../context/AuthContext';

import { templatesList } from '../lib/themes';

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
                {templatesList.filter(t => !t.hidden).map(theme => (
                    <TemplateCard key={theme.id} theme={theme} isLoggedIn={!!user} />
                ))}
            </div>
        </div>
    );
}
