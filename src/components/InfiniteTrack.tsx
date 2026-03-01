import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
import styles from './InfiniteTrack.module.css';

gsap.registerPlugin(Draggable);

const AVATARS = [
    { name: 'Alex', color: '#7B2FFF' },
    { name: 'Sam', color: '#FF3CAC' },
    { name: 'Jordan', color: '#00E5CC' },
    { name: 'Casey', color: '#FF6B35' },
    { name: 'Riley', color: '#C6FF00' },
    { name: 'Taylor', color: '#2979FF' },
];

export default function InfiniteTrack() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!trackRef.current || !containerRef.current) return;

        // Animate the track to scroll infinitely
        const trackWidth = trackRef.current.scrollWidth / 2; // Because we duplicated the items

        // We create a proxy object to handle the "throw" or drag
        const proxy = document.createElement("div");

        // The main animation loop
        const animation = gsap.to(trackRef.current, {
            x: `-=${trackWidth}`,
            ease: "none",
            duration: 15,
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(x => parseFloat(x) % trackWidth)
            }
        });

        // Setup Draggable on the proxy element
        Draggable.create(proxy, {
            type: "x",
            trigger: containerRef.current,
            onPress() {
                animation.pause();
                // Capture the current visual x position
                gsap.killTweensOf(trackRef.current);
            },
            onDrag() {
                // Apply proxy movement to the track, wrapping it
                const currentX = gsap.getProperty(trackRef.current, "x") as number;
                let newX = currentX + this.deltaX;

                // Manual wrapping logic
                newX = newX % trackWidth;
                // Keep it negative to match initial flow (or positive, modulo handles it if done right)
                if (newX > 0) newX -= trackWidth;

                gsap.set(trackRef.current, { x: newX });
            },
            onRelease() {
                // Resume the infinite animation from the new position
                // We calculate how much of the duration is left based on the new X
                // For simplicity, just resume the tween and let modifiers handle wrapping
                animation.play();
            }
        });

        return () => {
            animation.kill();
            Draggable.get(proxy)?.kill();
        };
    }, []);

    // We duplicate the items 3 times to ensure the screen is filled during wrap
    const items = [...AVATARS, ...AVATARS, ...AVATARS];

    return (
        <div className={styles.trackContainer} ref={containerRef}>
            <div className={styles.trackTitle}>
                Drag anywhere to explore <span style={{ color: 'var(--lime)' }}>creators</span>
            </div>
            <div className={styles.trackContent} ref={trackRef}>
                {items.map((item, idx) => (
                    <div key={idx} className={styles.card}>
                        <div className={styles.avatar} style={{ background: item.color }}></div>
                        <div className={styles.name}>{item.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
