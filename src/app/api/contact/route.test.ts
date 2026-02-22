import { describe, it, expect, beforeEach, vi } from 'vitest';

const {
    checkRateLimitMock,
    getClientIPMock,
    getAdminFirestoreMock,
    getContactEmailConfigMock,
    sendContactEmailMock,
    timestampNowMock,
} = vi.hoisted(() => ({
    checkRateLimitMock: vi.fn(),
    getClientIPMock: vi.fn(),
    getAdminFirestoreMock: vi.fn(),
    getContactEmailConfigMock: vi.fn(),
    sendContactEmailMock: vi.fn(),
    timestampNowMock: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: checkRateLimitMock,
    getClientIP: getClientIPMock,
    RATE_LIMITS: { contact: { windowMs: 60_000, maxRequests: 5 } },
}));

vi.mock('@/lib/firebase-admin', () => ({
    getAdminFirestore: getAdminFirestoreMock,
}));

vi.mock('@/lib/contact-delivery', () => ({
    getContactEmailConfig: getContactEmailConfigMock,
    sendContactEmail: sendContactEmailMock,
}));

vi.mock('firebase-admin/firestore', () => ({
    Timestamp: {
        now: timestampNowMock,
    },
}));

import { POST } from '@/app/api/contact/route';

type JsonRecord = Record<string, unknown>;

const createBody = (): JsonRecord => ({
    name: 'Giannis Papadopoulos',
    email: 'giannis@example.com',
    phone: '210 1234567',
    company: 'AEROFREN',
    subject: 'Test Subject',
    message: 'This is a test contact message with enough length.',
});

const createRequest = (body: JsonRecord): Request =>
    new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });

describe('POST /api/contact', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        checkRateLimitMock.mockReturnValue({
            success: true,
            remaining: 4,
            resetIn: 60_000,
        });
        getClientIPMock.mockReturnValue('127.0.0.1');
        timestampNowMock.mockReturnValue({
            toDate: () => new Date('2026-02-22T10:00:00.000Z'),
        });
    });

    it('returns 503 when both Firestore and SMTP are not configured', async () => {
        getAdminFirestoreMock.mockReturnValue(null);
        getContactEmailConfigMock.mockReturnValue({
            configured: false,
            missing: ['SMTP_USER', 'SMTP_PASS'],
        });

        const response = await POST(createRequest(createBody()) as never);
        const json = (await response.json()) as JsonRecord;

        expect(response.status).toBe(503);
        expect(json.error).toBe('Η υπηρεσία επικοινωνίας δεν είναι διαθέσιμη προσωρινά.');
        expect(sendContactEmailMock).not.toHaveBeenCalled();
    });

    it('succeeds when Firestore persists even if SMTP is unavailable', async () => {
        const addMock = vi.fn().mockResolvedValue({ id: 'contact-123' });
        getAdminFirestoreMock.mockReturnValue({
            collection: vi.fn(() => ({ add: addMock })),
        });
        getContactEmailConfigMock.mockReturnValue({
            configured: false,
            missing: ['SMTP_PASS'],
        });
        sendContactEmailMock.mockResolvedValue({
            attempted: false,
            success: false,
            error: 'CONTACT_EMAIL_NOT_CONFIGURED',
        });

        const response = await POST(createRequest(createBody()) as never);
        const json = (await response.json()) as JsonRecord;

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect((json.delivery as JsonRecord).firestore).toBe(true);
        expect((json.delivery as JsonRecord).email).toBe(false);
        expect(addMock).toHaveBeenCalledTimes(1);
    });

    it('succeeds when SMTP sends even if Firestore is unavailable', async () => {
        getAdminFirestoreMock.mockReturnValue(null);
        getContactEmailConfigMock.mockReturnValue({
            configured: true,
            missing: [],
        });
        sendContactEmailMock.mockResolvedValue({
            attempted: true,
            success: true,
            messageId: 'smtp-message-1',
        });

        const response = await POST(createRequest(createBody()) as never);
        const json = (await response.json()) as JsonRecord;

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect((json.delivery as JsonRecord).firestore).toBe(false);
        expect((json.delivery as JsonRecord).email).toBe(true);
    });

    it('returns 503 when all delivery channels fail', async () => {
        const addMock = vi.fn().mockRejectedValue(new Error('firestore write failed'));
        getAdminFirestoreMock.mockReturnValue({
            collection: vi.fn(() => ({ add: addMock })),
        });
        getContactEmailConfigMock.mockReturnValue({
            configured: true,
            missing: [],
        });
        sendContactEmailMock.mockResolvedValue({
            attempted: true,
            success: false,
            error: 'SMTP timeout',
        });

        const response = await POST(createRequest(createBody()) as never);
        const json = (await response.json()) as JsonRecord;

        expect(response.status).toBe(503);
        expect(json.error).toBe('Αποτυχία αποστολής. Παρακαλώ δοκιμάστε ξανά.');
    });
});
