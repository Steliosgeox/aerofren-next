'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface AnimatedTypingProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
}

/**
 * Hook to track document visibility for pausing animations
 */
const useDocumentVisibility = (): boolean => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === 'visible');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        setIsVisible(document.visibilityState === 'visible');

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
};

/**
 * AnimatedTyping - Typewriter effect for Greek text
 *
 * Cycles through an array of strings with typing animation.
 * Pauses when tab is not visible to save resources.
 */
export function AnimatedTyping({
    texts,
    typingSpeed = 50,
    deletingSpeed = 30,
    pauseDuration = 2000,
    className = ''
}: AnimatedTypingProps) {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const isVisible = useDocumentVisibility();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentText = texts[textIndex];

    const tick = useCallback(() => {
        if (isWaiting) return;

        if (!isDeleting) {
            // Typing
            if (displayText.length < currentText.length) {
                setDisplayText(currentText.slice(0, displayText.length + 1));
            } else {
                // Finished typing, wait then delete
                setIsWaiting(true);
                timerRef.current = setTimeout(() => {
                    setIsWaiting(false);
                    setIsDeleting(true);
                }, pauseDuration);
            }
        } else {
            // Deleting
            if (displayText.length > 0) {
                setDisplayText(displayText.slice(0, -1));
            } else {
                // Finished deleting, move to next text
                setIsDeleting(false);
                setTextIndex((prev) => (prev + 1) % texts.length);
            }
        }
    }, [displayText, currentText, isDeleting, isWaiting, pauseDuration, texts.length]);

    useEffect(() => {
        // Don't run animations when tab is not visible
        if (!isVisible) return;

        const speed = isDeleting ? deletingSpeed : typingSpeed;
        timerRef.current = setTimeout(tick, speed);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [tick, isDeleting, typingSpeed, deletingSpeed, isVisible]);

    return (
        <span className={className}>
            {displayText}
            <span className="cursor">|</span>
            <style jsx>{`
                .cursor {
                    animation: blink 1s infinite;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 300;
                }

                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `}</style>
        </span>
    );
}

export default AnimatedTyping;
