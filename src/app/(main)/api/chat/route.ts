import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Chat API Route
 * Handles chat messages for AI assistant with rate limiting
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
        const { message } = body;

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

        // TODO: Implement actual AI chat logic here
        // For now, return a placeholder response
        return NextResponse.json(
            {
                response: 'Ευχαριστούμε για το μήνυμά σας. Θα επικοινωνήσουμε σύντομα μαζί σας.',
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                },
            }
        );
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Chat API is running',
    });
}
