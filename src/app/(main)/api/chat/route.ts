/**
 * Chat API Route
 * Handles AI chat with Mistral API
 *
 * Features:
 * - Rate limiting per IP
 * - Conversation history support
 * - AEROFREN system prompt
 * - Graceful error handling with fallback responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { AEROFREN_SYSTEM_PROMPT, FALLBACK_RESPONSES } from '@/lib/chatbot/prompts';

// Initialize Mistral client (lazy - only when needed)
let mistralClient: Mistral | null = null;

function getMistralClient(): Mistral | null {
    if (!process.env.MISTRAL_API_KEY) {
        console.warn('MISTRAL_API_KEY not configured');
        return null;
    }
    if (!mistralClient) {
        mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    }
    return mistralClient;
}

// Message type for conversation history
interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * POST /api/chat
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
    try {
        // Server-side rate limiting
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`chat:${clientIP}`, RATE_LIMITS.chat);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                }
            );
        }

        const body = await request.json();
        const { message, sessionId, history } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Validate message length (prevent abuse)
        if (message.length > 5000) {
            return NextResponse.json(
                { error: 'Το μήνυμα είναι πολύ μεγάλο (μέγιστο 5000 χαρακτήρες)' },
                { status: 400 }
            );
        }

        // Get Mistral client
        const client = getMistralClient();
        if (!client) {
            // No API key configured - return fallback response
            console.warn('Mistral API not configured, returning fallback');
            return NextResponse.json({
                response: FALLBACK_RESPONSES.error,
                sessionId: sessionId || 'no-session',
            });
        }

        // Build conversation messages
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: AEROFREN_SYSTEM_PROMPT },
        ];

        // Add conversation history (last 10 messages for context)
        if (Array.isArray(history)) {
            const recentHistory = history.slice(-10) as ConversationMessage[];
            for (const msg of recentHistory) {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    messages.push({
                        role: msg.role,
                        content: msg.content,
                    });
                }
            }
        }

        // Add current user message
        messages.push({ role: 'user', content: message });

        // Call Mistral API
        const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest', // Cost-effective model
            messages,
            maxTokens: 500, // Keep responses concise
            temperature: 0.7, // Balanced creativity
        });

        const aiResponse = chatResponse.choices?.[0]?.message?.content || FALLBACK_RESPONSES.error;

        return NextResponse.json(
            {
                response: aiResponse,
                sessionId: sessionId || 'no-session',
            },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                },
            }
        );
    } catch (error) {
        console.error('Chat API error:', error);

        // Return user-friendly error
        return NextResponse.json(
            {
                response: FALLBACK_RESPONSES.error,
                error: 'AI service temporarily unavailable',
            },
            { status: 200 } // Return 200 so frontend handles gracefully
        );
    }
}

/**
 * GET /api/chat
 * Health check endpoint
 */
export async function GET() {
    const hasMistral = !!process.env.MISTRAL_API_KEY;
    return NextResponse.json({
        status: 'ok',
        message: 'Chat API is running',
        mistralConfigured: hasMistral,
    });
}
