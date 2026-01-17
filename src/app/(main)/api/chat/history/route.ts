/**
 * Chat History API Route
 * GET /api/chat/history?sessionId=xxx - Get chat history for a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChatHistory } from '@/lib/firebase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const history = await getChatHistory(sessionId);

        // Transform to simpler format for frontend
        const messages = history.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));

        return NextResponse.json({
            sessionId,
            messages,
            count: messages.length,
        });

    } catch (error) {
        console.error('Chat history API error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch chat history' },
            { status: 500 }
        );
    }
}
