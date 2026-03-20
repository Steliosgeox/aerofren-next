#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const DEFAULT_PAGE_SIZE = 500;
const MAX_BATCH_WRITES = 400;
const PREVIEW_LIMIT = 140;

function normalizeValue(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getEmailLocalPart(email) {
    const normalized = normalizeValue(email);
    if (!normalized) return '';
    return normalized.split('@')[0] || '';
}

function buildPreview(content) {
    if (typeof content !== 'string') return '';
    const collapsed = content.replace(/\s+/g, ' ').trim();
    if (collapsed.length <= PREVIEW_LIMIT) {
        return collapsed;
    }
    return `${collapsed.slice(0, PREVIEW_LIMIT - 1).trimEnd()}…`;
}

function parseArgs(argv) {
    const args = {
        apply: false,
        pageSize: DEFAULT_PAGE_SIZE,
    };

    for (let i = 0; i < argv.length; i += 1) {
        const value = argv[i];
        if (value === '--apply') {
            args.apply = true;
            continue;
        }
        if (value === '--page-size' && argv[i + 1]) {
            const parsed = Number(argv[i + 1]);
            if (Number.isFinite(parsed) && parsed > 0) {
                args.pageSize = Math.floor(parsed);
            }
            i += 1;
        }
    }
    return args;
}

function loadServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT is required');
    }

    try {
        return JSON.parse(raw);
    } catch {
        const decoded = Buffer.from(raw, 'base64').toString('utf8');
        return JSON.parse(decoded);
    }
}

function ensureAdminApp() {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    const serviceAccount = loadServiceAccount();
    return initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

async function readAllMessages(db, pageSize) {
    const sessions = new Map();
    const uniqueUsers = new Map();

    let totalMessages = 0;
    let page = 0;
    let lastDoc = null;

    while (true) {
        let query = db
            .collection('chatMessages')
            .select('sessionId', 'timestamp', 'userId', 'userEmail', 'userName', 'role', 'content')
            .orderBy('__name__')
            .limit(pageSize);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
            break;
        }

        page += 1;
        totalMessages += snapshot.size;
        lastDoc = snapshot.docs[snapshot.docs.length - 1];

        for (const doc of snapshot.docs) {
            const data = doc.data() || {};
            const sessionId = typeof data.sessionId === 'string' ? data.sessionId : null;
            if (!sessionId) {
                continue;
            }

            const timestampValue = data.timestamp;
            const timestampDate =
                timestampValue && typeof timestampValue.toDate === 'function'
                    ? timestampValue.toDate()
                    : new Date(0);

            const existing = sessions.get(sessionId) || {
                sessionId,
                messageCount: 0,
                lastMessageAt: new Date(0),
                lastMessagePreview: '',
                lastMessageRole: undefined,
                userId: undefined,
                userEmail: undefined,
                userName: undefined,
            };

            existing.messageCount += 1;
            if (timestampDate >= existing.lastMessageAt) {
                existing.lastMessageAt = timestampDate;
                existing.lastMessagePreview = buildPreview(data.content);
                existing.lastMessageRole = typeof data.role === 'string' ? data.role : undefined;
            }
            if (!existing.userId && typeof data.userId === 'string') {
                existing.userId = data.userId;
            }
            if (!existing.userEmail && typeof data.userEmail === 'string') {
                existing.userEmail = data.userEmail;
            }
            if (!existing.userName && typeof data.userName === 'string') {
                existing.userName = data.userName;
            }
            sessions.set(sessionId, existing);

            if (typeof data.userId === 'string' && data.userId.length > 0) {
                const userRecord = uniqueUsers.get(data.userId) || {
                    uid: data.userId,
                    email: typeof data.userEmail === 'string' ? data.userEmail : null,
                    name: typeof data.userName === 'string' ? data.userName : null,
                    firstSeenAt: timestampDate,
                };
                if (timestampDate < userRecord.firstSeenAt) {
                    userRecord.firstSeenAt = timestampDate;
                }
                if (!userRecord.email && typeof data.userEmail === 'string') {
                    userRecord.email = data.userEmail;
                }
                if (!userRecord.name && typeof data.userName === 'string') {
                    userRecord.name = data.userName;
                }
                uniqueUsers.set(data.userId, userRecord);
            }
        }

        console.log(`[backfill] scanned page ${page}, total messages: ${totalMessages}`);
    }

    return { sessions, uniqueUsers, totalMessages };
}

async function applyBackfill(db, sessions, uniqueUsers) {
    let writes = 0;
    let batch = db.batch();

    const flush = async () => {
        if (writes === 0) return;
        await batch.commit();
        batch = db.batch();
        writes = 0;
    };

    for (const session of sessions.values()) {
        const payload = {
            sessionId: session.sessionId,
            messageCount: session.messageCount,
            lastMessageAt: Timestamp.fromDate(session.lastMessageAt),
            lastMessagePreview: session.lastMessagePreview || '',
            lastMessageRole: session.lastMessageRole || 'assistant',
            ...(session.userId ? { userId: session.userId } : {}),
            ...(session.userEmail ? { userEmail: session.userEmail } : {}),
            ...(session.userName ? { userName: session.userName } : {}),
            ...(session.userEmail ? { userEmailNormalized: normalizeValue(session.userEmail) } : {}),
            ...(session.userName ? { userNameNormalized: normalizeValue(session.userName) } : {}),
            ...(session.userEmail ? { userEmailLocalPartNormalized: getEmailLocalPart(session.userEmail) } : {}),
        };
        batch.set(db.collection('chatSessions').doc(session.sessionId), payload, { merge: true });
        writes += 1;
        if (writes >= MAX_BATCH_WRITES) {
            await flush();
        }
    }

    for (const uniqueUser of uniqueUsers.values()) {
        batch.set(
            db.collection('chatUsers').doc(uniqueUser.uid),
            {
                uid: uniqueUser.uid,
                email: uniqueUser.email ?? null,
                name: uniqueUser.name ?? null,
                firstSeenAt: Timestamp.fromDate(uniqueUser.firstSeenAt),
            },
            { merge: true }
        );
        writes += 1;
        if (writes >= MAX_BATCH_WRITES) {
            await flush();
        }
    }

    batch.set(
        db.collection('sys_stats').doc('global'),
        {
            uniqueUsersCount: uniqueUsers.size,
            backfilledAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        { merge: true }
    );
    writes += 1;

    await flush();
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    ensureAdminApp();
    const db = getFirestore();

    console.log(
        `[backfill] starting scan (apply=${args.apply ? 'yes' : 'no'}, pageSize=${args.pageSize})`
    );
    const { sessions, uniqueUsers, totalMessages } = await readAllMessages(db, args.pageSize);

    console.log(`[backfill] complete scan`);
    console.log(`[backfill] total chatMessages: ${totalMessages}`);
    console.log(`[backfill] rebuilt chatSessions: ${sessions.size}`);
    console.log(`[backfill] rebuilt unique users: ${uniqueUsers.size}`);

    if (!args.apply) {
        console.log('[backfill] dry-run only. Re-run with --apply to write changes.');
        return;
    }

    await applyBackfill(db, sessions, uniqueUsers);
    console.log('[backfill] apply complete.');
}

main().catch((error) => {
    console.error('[backfill] failed:', error);
    process.exit(1);
});
