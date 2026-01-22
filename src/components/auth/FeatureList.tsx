'use client';

import React from 'react';
import { Clock, Zap, Shield, Truck } from 'lucide-react';

const features = [
    { icon: Clock, label: '24/7 Υποστήριξη AI' },
    { icon: Zap, label: 'Άμεσες απαντήσεις' },
    { icon: Shield, label: 'Εξειδικευμένες λύσεις' },
    { icon: Truck, label: 'Γρήγορη παράδοση' },
];

/**
 * FeatureList - Icon bullets with value props
 */
export function FeatureList() {
    return (
        <div className="feature-list">
            <style jsx>{`
                .feature-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                :global(.feature-icon) {
                    width: 34px;
                    height: 34px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .feature-label {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 500;
                }
            `}</style>

            {features.map((feature, idx) => (
                <div key={idx} className="feature-item">
                    <div className="feature-icon">
                        <feature.icon size={17} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                    </div>
                    <span className="feature-label">{feature.label}</span>
                </div>
            ))}
        </div>
    );
}

export default FeatureList;
