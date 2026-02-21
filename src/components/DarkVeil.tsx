'use client';

import { memo, type CSSProperties } from 'react';
import styles from './DarkVeil.module.css';

export interface DarkVeilProps {
    variant?: 'contact' | 'default';
    intensity?: 'low' | 'medium';
    animated?: boolean;
}

const HUE_BY_VARIANT: Record<NonNullable<DarkVeilProps['variant']>, number> = {
    contact: 208,
    default: 220,
};

const INTENSITY_PRESETS: Record<NonNullable<DarkVeilProps['intensity']>, {
    baseOpacity: number;
    noiseOpacity: number;
    glowOpacity: number;
}> = {
    low: {
        baseOpacity: 0.68,
        noiseOpacity: 0.08,
        glowOpacity: 0.28,
    },
    medium: {
        baseOpacity: 0.78,
        noiseOpacity: 0.12,
        glowOpacity: 0.4,
    },
};

const DarkVeil = memo(function DarkVeil({
    variant = 'default',
    intensity = 'low',
    animated = true,
}: DarkVeilProps) {
    const preset = INTENSITY_PRESETS[intensity];
    const hue = HUE_BY_VARIANT[variant];

    return (
        <div
            className={styles.root}
            data-animated={animated ? 'true' : 'false'}
            style={{
                '--darkveil-hue': String(hue),
                '--darkveil-base-opacity': String(preset.baseOpacity),
                '--darkveil-noise-opacity': String(preset.noiseOpacity),
                '--darkveil-glow-opacity': String(preset.glowOpacity),
            } as CSSProperties}
        >
            <div className={styles.noise} />
            <div className={styles.glow} />
            <div className={styles.depth} />
        </div>
    );
});

export default DarkVeil;
