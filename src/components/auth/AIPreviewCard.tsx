'use client';

import React from 'react';
import { AnimatedTyping } from './AnimatedTyping';

const aiPhrases = [
    'Πώς μπορώ να σας βοηθήσω σήμερα;',
    'Θέλετε πληροφορίες για προϊόντα;',
    'Μπορώ να σας βρω την καλύτερη τιμή!',
    'Διαθεσιμότητα; Ελέγχω αμέσως!',
];

/**
 * AIPreviewCard - Shows AI chat demo with FIXED height
 * Fixed dimensions prevent any layout shift during typing animation
 */
export function AIPreviewCard() {
    return (
        <div className="ai-preview">
            <style jsx>{`
                .ai-preview {
                    padding: 18px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    width: 100%;
                    height: 148px;
                    box-sizing: border-box;
                    contain: strict;
                    overflow: hidden;
                }

                .ai-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 14px;
                    height: 40px;
                }

                .ai-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #0066cc, #0052a3);
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 16px rgba(0, 102, 204, 0.3);
                    flex-shrink: 0;
                }

                .ai-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .ai-name {
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: #ffffff;
                    letter-spacing: -0.01em;
                }

                .ai-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.55);
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse-dot 2s ease-in-out infinite;
                }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.9); }
                }

                .ai-message {
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 11px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    height: 50px;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    font-size: 0.875rem;
                    line-height: 1.4;
                    color: rgba(255, 255, 255, 0.9);
                }
            `}</style>

            <div className="ai-header">
                <div className="ai-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2v6M4.93 10.93l4.24 4.24M2 18h6M19.07 10.93l-4.24 4.24M22 18h-6" />
                    </svg>
                </div>
                <div className="ai-info">
                    <span className="ai-name">AEROFREN AI</span>
                    <span className="ai-status">
                        <span className="status-dot" />
                        Διαθέσιμο 24/7
                    </span>
                </div>
            </div>

            <div className="ai-message">
                <AnimatedTyping texts={aiPhrases} />
            </div>
        </div>
    );
}

export default AIPreviewCard;
