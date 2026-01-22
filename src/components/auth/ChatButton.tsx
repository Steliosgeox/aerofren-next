'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import GlassSurface from '@/components/ui/GlassSurface';

interface ChatButtonProps {
    onClick?: () => void;
    className?: string;
}

/**
 * ChatButton - Glass button for representative chat access
 */
export function ChatButton({ onClick, className = '' }: ChatButtonProps) {
    return (
        <div className={`chat-btn-wrapper ${className}`}>
            <style jsx>{`
                .chat-btn-wrapper {
                    width: 100%;
                }

                .chat-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 0.875rem;
                    font-weight: 600;
                    padding: 0;
                    transition: color 0.2s ease;
                }

                .chat-btn:hover {
                    color: #ffffff;
                }
            `}</style>

            <GlassSurface
                width="100%"
                height={48}
                borderRadius={12}
                blur={12}
                backgroundOpacity={0.05}
            >
                <button className="chat-btn" onClick={onClick}>
                    <MessageCircle size={18} />
                    <span>Μιλήστε με εκπρόσωπο</span>
                </button>
            </GlassSurface>
        </div>
    );
}

export default ChatButton;
