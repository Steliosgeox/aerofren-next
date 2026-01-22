import { NextRequest, NextResponse } from 'next/server';

/**
 * Chat API Route
 * Handles chat messages for AI assistant
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // TODO: Implement actual AI chat logic here
        // For now, return a placeholder response
        return NextResponse.json({
            response: 'Ευχαριστούμε για το μήνυμά σας. Θα επικοινωνήσουμε σύντομα μαζί σας.',
            timestamp: new Date().toISOString(),
        });
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
