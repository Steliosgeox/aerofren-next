/**
 * Chat API Route - Mistral AI Agent Integration for AEROFREN
 * POST /api/chat - Send a message and get AI response
 * Uses Mistral Agent/Conversations API
 */

import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { FALLBACK_RESPONSES } from '@/lib/chatbot/prompts';
import { saveChatMessage } from '@/lib/firebase';

// AEROFREN Agent ID
const AEROFREN_AGENT_ID = 'ag_019bc9e3bda6763aa9395b8142347bbf';

// Initialize Mistral client
const mistralClient = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY || '',
});

// Rate limiting map (simple in-memory, use Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(sessionId: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(sessionId);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(sessionId, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

interface ChatRequest {
    message: string;
    sessionId: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: ChatRequest = await request.json();
        const { message, sessionId, history = [] } = body;

        // Validate inputs
        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        if (!sessionId || typeof sessionId !== 'string') {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Sanitize message (basic XSS prevention)
        const sanitizedMessage = message.trim().slice(0, 2000);

        if (sanitizedMessage.length === 0) {
            return NextResponse.json(
                { error: 'Message cannot be empty' },
                { status: 400 }
            );
        }

        // Check rate limit
        if (!checkRateLimit(sessionId)) {
            return NextResponse.json(
                { error: 'Πάρα πολλά μηνύματα. Παρακαλώ περιμένετε λίγο.' },
                { status: 429 }
            );
        }

        // Check if Mistral API key is configured
        if (!process.env.MISTRAL_API_KEY) {
            console.error('MISTRAL_API_KEY not configured');
            return NextResponse.json(
                {
                    response: FALLBACK_RESPONSES.error,
                    sessionId,
                },
                { status: 200 }
            );
        }

        // Save user message to Firebase
        await saveChatMessage(sessionId, 'user', sanitizedMessage);

        // Build conversation messages for the agent
        // Include history + current message
        const conversationMessages = [
            ...history.slice(-10).map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
            {
                role: 'user' as const,
                content: sanitizedMessage,
            },
        ];

        // Call Mistral Agent Conversations API
        const response = await mistralClient.beta.conversations.start({
            agentId: AEROFREN_AGENT_ID,
            inputs: conversationMessages,
        });

        // Extract response from agent
        // The response structure may vary - handle different formats
        let responseText = FALLBACK_RESPONSES.error;

        if (response && typeof response === 'object') {
            // Try to extract the output/response from the agent
            if ('outputs' in response && Array.isArray(response.outputs)) {
                const lastOutput = response.outputs[response.outputs.length - 1];
                if (lastOutput && typeof lastOutput === 'object' && 'content' in lastOutput) {
                    responseText = String(lastOutput.content);
                }
            } else if ('output' in response) {
                responseText = String(response.output);
            } else if ('content' in response) {
                responseText = String(response.content);
            } else if ('message' in response && typeof response.message === 'object' && response.message && 'content' in response.message) {
                responseText = String(response.message.content);
            } else {
                // Log the response structure for debugging
                console.log('Agent response structure:', JSON.stringify(response, null, 2));
                // Try to find any text content
                const responseStr = JSON.stringify(response);
                if (responseStr.length < 2000 && responseStr !== '{}') {
                    console.log('Full response:', responseStr);
                }
            }
        }

        // Save AI response to Firebase
        await saveChatMessage(sessionId, 'assistant', responseText);

        return NextResponse.json({
            response: responseText,
            sessionId,
        });

    } catch (error: unknown) {
        console.error('Chat API error:', error);

        // Log detailed error for debugging
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack?.slice(0, 500),
            });
        }

        return NextResponse.json(
            {
                response: FALLBACK_RESPONSES.error,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'AEROFREN Chat API',
        agentId: AEROFREN_AGENT_ID,
        mistralConfigured: !!process.env.MISTRAL_API_KEY,
        firebaseConfigured: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}
