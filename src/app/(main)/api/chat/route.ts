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
import * as z from 'zod';
import { randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
    extractBearerToken,
    getAdminFirestore,
    verifyIdToken,
} from '@/lib/firebase-admin';
import { createChatPersistencePlan } from '@/lib/chat/persistence-plan';

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

interface RequestUserIdentity {
    uid?: string;
    email?: string;
    name?: string;
}

interface PersistTurnResult {
    persisted: boolean;
    persistenceError?: string;
}

function extractAssistantText(content: unknown): string {
    if (typeof content === 'string') {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (typeof part === 'string') return part;
                if (part && typeof part === 'object') {
                    const candidate = (part as { text?: unknown; content?: unknown }).text
                        ?? (part as { text?: unknown; content?: unknown }).content;
                    return typeof candidate === 'string' ? candidate : '';
                }
                return '';
            })
            .join(' ')
            .trim();
    }

    return '';
}

const chatSchema = z.object({
    message: z.string().min(1, 'Message is required').max(5000),
    sessionId: z.string().max(100).optional(),
    history: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string().max(5000),
            })
        )
        .max(20)
        .optional(),
});

async function persistConversationTurn(params: {
    sessionId: string;
    userMessage: string;
    assistantMessage: string;
    user: RequestUserIdentity | null;
    traceId: string;
}): Promise<PersistTurnResult> {
    const db = getAdminFirestore();
    if (!db) {
        return {
            persisted: false,
            persistenceError: 'admin_firestore_unavailable',
        };
    }

    try {
        const occurredAt = new Date();
        const expiresAt = new Date(occurredAt);
        expiresAt.setMonth(expiresAt.getMonth() + 3);
        const timestamp = Timestamp.fromDate(occurredAt);
        const expiration = Timestamp.fromDate(expiresAt);

        const plan = createChatPersistencePlan({
            sessionId: params.sessionId,
            userMessage: params.userMessage,
            assistantMessage: params.assistantMessage,
            occurredAt,
            user: params.user,
        });

        const userMessageRef = db.collection('chatMessages').doc();
        const assistantMessageRef = db.collection('chatMessages').doc();
        const sessionRef = db.collection('chatSessions').doc(plan.sessionUpdate.sessionId);
        const globalStatsRef = db.collection('sys_stats').doc('global');
        const uniqueUserRef = plan.uniqueUserMarkerId
            ? db.collection('chatUsers').doc(plan.uniqueUserMarkerId)
            : null;

        await db.runTransaction(async (tx) => {
            tx.set(userMessageRef, {
                sessionId: plan.messages[0].sessionId,
                role: plan.messages[0].role,
                content: plan.messages[0].content,
                timestamp,
                expiresAt: expiration,
                ...(plan.messages[0].userId ? { userId: plan.messages[0].userId } : {}),
                ...(plan.messages[0].userEmail ? { userEmail: plan.messages[0].userEmail } : {}),
                ...(plan.messages[0].userName ? { userName: plan.messages[0].userName } : {}),
            });

            tx.set(assistantMessageRef, {
                sessionId: plan.messages[1].sessionId,
                role: plan.messages[1].role,
                content: plan.messages[1].content,
                timestamp,
                expiresAt: expiration,
                ...(plan.messages[1].userId ? { userId: plan.messages[1].userId } : {}),
                ...(plan.messages[1].userEmail ? { userEmail: plan.messages[1].userEmail } : {}),
                ...(plan.messages[1].userName ? { userName: plan.messages[1].userName } : {}),
            });

            tx.set(
                sessionRef,
                {
                    sessionId: plan.sessionUpdate.sessionId,
                    lastMessageAt: Timestamp.fromDate(plan.sessionUpdate.lastMessageAt),
                    messageCount: FieldValue.increment(plan.sessionUpdate.messageCountDelta),
                    ...(plan.sessionUpdate.userId ? { userId: plan.sessionUpdate.userId } : {}),
                    ...(plan.sessionUpdate.userEmail ? { userEmail: plan.sessionUpdate.userEmail } : {}),
                    ...(plan.sessionUpdate.userName ? { userName: plan.sessionUpdate.userName } : {}),
                },
                { merge: true }
            );

            if (uniqueUserRef) {
                const existingMarker = await tx.get(uniqueUserRef);
                if (!existingMarker.exists) {
                    tx.set(uniqueUserRef, {
                        uid: plan.uniqueUserMarkerId,
                        firstSeenAt: timestamp,
                        email: plan.sessionUpdate.userEmail ?? null,
                        name: plan.sessionUpdate.userName ?? null,
                    });
                    tx.set(
                        globalStatsRef,
                        {
                            uniqueUsersCount: FieldValue.increment(1),
                            updatedAt: timestamp,
                        },
                        { merge: true }
                    );
                } else {
                    tx.set(
                        globalStatsRef,
                        {
                            updatedAt: timestamp,
                        },
                        { merge: true }
                    );
                }
            }
        });

        return { persisted: true };
    } catch (error) {
        console.error(
            '[chat.api] persistence_failed',
            JSON.stringify({
                traceId: params.traceId,
                sessionId: params.sessionId,
                error: error instanceof Error ? error.message : String(error),
            })
        );
        return {
            persisted: false,
            persistenceError: 'persistence_failed',
        };
    }
}

/**
 * POST /api/chat
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
    const traceId = randomUUID();
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

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Unsupported content type' },
                { status: 415 }
            );
        }

        const body = await request.json();
        const validation = chatSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Validation failed' },
                { status: 400 }
            );
        }

        const { message, sessionId, history } = validation.data;
        const resolvedSessionId =
            typeof sessionId === 'string' && sessionId.trim().length > 0
                ? sessionId
                : randomUUID();

        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const token = extractBearerToken(authHeader);
        const decodedToken = token ? await verifyIdToken(token) : null;
        const requestUser: RequestUserIdentity | null = decodedToken
            ? {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
            }
            : null;

        console.info(
            '[chat.api] request_received',
            JSON.stringify({
                traceId,
                sessionId: resolvedSessionId,
                hasAuthToken: Boolean(token),
                historyCount: Array.isArray(history) ? history.length : 0,
            })
        );

        // Get Mistral client
        const client = getMistralClient();
        let aiResponse = FALLBACK_RESPONSES.error;
        if (!client) {
            console.warn(
                '[chat.api] mistral_unavailable',
                JSON.stringify({ traceId, sessionId: resolvedSessionId })
            );
        } else {
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
                model: 'mistral-small-latest',
                messages,
                maxTokens: 500,
                temperature: 0.7,
            });

            const rawAssistantContent = chatResponse.choices?.[0]?.message?.content;
            aiResponse = extractAssistantText(rawAssistantContent) || FALLBACK_RESPONSES.error;
        }

        const persistence = await persistConversationTurn({
            sessionId: resolvedSessionId,
            userMessage: message,
            assistantMessage: aiResponse,
            user: requestUser,
            traceId,
        });

        console.info(
            '[chat.api] response_ready',
            JSON.stringify({
                traceId,
                sessionId: resolvedSessionId,
                persisted: persistence.persisted,
                persistenceError: persistence.persistenceError ?? null,
            })
        );

        return NextResponse.json(
            {
                response: aiResponse,
                sessionId: resolvedSessionId,
                persisted: persistence.persisted,
                traceId,
                ...(persistence.persistenceError
                    ? { persistenceError: persistence.persistenceError }
                    : {}),
            },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'X-Trace-Id': traceId,
                },
            }
        );
    } catch (error) {
        console.error(
            '[chat.api] unhandled_error',
            JSON.stringify({
                traceId,
                error: error instanceof Error ? error.message : String(error),
            })
        );

        // Return user-friendly error
        return NextResponse.json(
            {
                response: FALLBACK_RESPONSES.error,
                error: 'AI service temporarily unavailable',
                persisted: false,
                traceId,
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
