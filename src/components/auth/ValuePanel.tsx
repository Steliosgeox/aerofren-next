'use client';

import React from 'react';
import { AIPreviewCard } from './AIPreviewCard';
import { FeatureList } from './FeatureList';

/**
 * ValuePanel - Right side content (inside unified card)
 * Displays AI preview, features, and brand slogan
 */
export function ValuePanel() {
    return (
        <div className="value-panel">
            <style jsx>{`
                .value-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    width: 100%;
                    max-width: 320px;
                }

                .brand-slogan {
                    text-align: center;
                    padding-top: 8px;
                }

                .slogan-title {
                    font-size: 1.0625rem;
                    font-weight: 700;
                    color: var(--theme-text);
                    margin-bottom: 6px;
                    letter-spacing: -0.01em;
                    text-shadow: 0 2px 15px rgba(0, 0, 0, 0.25);
                }

                .slogan-subtitle {
                    font-size: 0.8125rem;
                    color: var(--theme-text-muted);
                    font-weight: 500;
                }

                .slogan-brand {
                    color: var(--theme-accent);
                    font-weight: 600;
                }
            `}</style>

            {/* AI Demo Preview */}
            <AIPreviewCard />

            {/* Feature List */}
            <FeatureList />

            {/* Brand Slogan */}
            <div className="brand-slogan">
                <div className="slogan-title">
                    Η τεχνολογία στην υπηρεσία<br />
                    της βιομηχανίας σας
                </div>
                <div className="slogan-subtitle">
                    <span className="slogan-brand">AEROFREN</span> • Εξαρτήματα Νερού και Αέρα
                </div>
            </div>
        </div>
    );
}

export default ValuePanel;
