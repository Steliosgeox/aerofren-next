#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function loadServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT is required');
    }
    try {
        return JSON.parse(raw);
    } catch {
        return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    }
}

function ensureAdminApp() {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    return initializeApp({
        credential: cert(loadServiceAccount()),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

async function main() {
    const ratioArg = process.argv.find((value) => value.startsWith('--min-ratio='));
    const minRatio = ratioArg ? Number(ratioArg.split('=')[1]) : 0.05;

    ensureAdminApp();
    const db = getFirestore();

    const [messagesSnap, sessionsSnap] = await Promise.all([
        db.collection('chatMessages').count().get(),
        db.collection('chatSessions').count().get(),
    ]);

    const messageCount = messagesSnap.data().count || 0;
    const sessionCount = sessionsSnap.data().count || 0;
    const ratio = messageCount > 0 ? sessionCount / messageCount : 1;

    console.log(
        JSON.stringify({
            messageCount,
            sessionCount,
            ratio,
            minRatio,
        })
    );

    if (messageCount > 0 && (sessionCount === 0 || ratio < minRatio)) {
        console.error('[alert] chatSessions appear to be flatlining versus chatMessages');
        process.exit(2);
    }
}

main().catch((error) => {
    console.error('[drift-check] failed:', error);
    process.exit(1);
});
