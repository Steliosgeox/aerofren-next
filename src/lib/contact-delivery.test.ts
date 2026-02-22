import {
    getContactEmailConfig,
    sendContactEmail,
    type ContactSubmissionPayload,
} from '@/lib/contact-delivery';

const ORIGINAL_ENV = { ...process.env };

const withCleanContactEnv = () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.CONTACT_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
    delete process.env.CONTACT_FROM_NAME;
    delete process.env.CONTACT_EMAIL_SUBJECT_PREFIX;
};

const mockPayload: ContactSubmissionPayload = {
    requestId: 'test-request',
    name: 'Test User',
    email: 'user@example.com',
    message: 'This is a test contact message with enough length.',
    submittedAtISO: new Date('2026-02-22T10:00:00.000Z').toISOString(),
};

describe('contact-delivery config', () => {
    beforeEach(() => {
        withCleanContactEnv();
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    it('marks config as missing when env vars are not set', () => {
        const config = getContactEmailConfig();
        expect(config.configured).toBe(false);
        expect(config.missing).toContain('SMTP_HOST');
        expect(config.missing).toContain('SMTP_USER');
        expect(config.missing).toContain('SMTP_PASS');
        expect(config.missing).toContain('CONTACT_EMAIL');
    });

    it('rejects placeholder SMTP credentials', () => {
        process.env.SMTP_HOST = 'smtp.gmail.com';
        process.env.SMTP_PORT = '587';
        process.env.SMTP_USER = 'your-email@gmail.com';
        process.env.SMTP_PASS = 'your-app-password';
        process.env.CONTACT_EMAIL = 'info@aerofren.gr';

        const config = getContactEmailConfig();
        expect(config.configured).toBe(false);
        expect(config.missing).toContain('SMTP_USER');
        expect(config.missing).toContain('SMTP_PASS');
    });

    it('builds a valid config when SMTP and recipient env vars are present', () => {
        process.env.SMTP_HOST = 'smtp.mailprovider.com';
        process.env.SMTP_PORT = '465';
        process.env.SMTP_USER = 'ops@aerofren.gr';
        process.env.SMTP_PASS = 'smtp-secret-value';
        process.env.CONTACT_EMAIL = 'info@aerofren.gr, support@aerofren.gr';
        process.env.CONTACT_FROM_NAME = 'AEROFREN Contact';
        process.env.CONTACT_EMAIL_SUBJECT_PREFIX = '[AEROFREN Live]';

        const config = getContactEmailConfig();
        expect(config.configured).toBe(true);
        expect(config.smtpPort).toBe(465);
        expect(config.recipients).toEqual(['info@aerofren.gr', 'support@aerofren.gr']);
        expect(config.fromName).toBe('AEROFREN Contact');
        expect(config.subjectPrefix).toBe('[AEROFREN Live]');
    });

    it('returns non-attempt result when email transport is not configured', async () => {
        const result = await sendContactEmail(mockPayload);
        expect(result.attempted).toBe(false);
        expect(result.success).toBe(false);
        expect(result.error).toContain('CONTACT_EMAIL_NOT_CONFIGURED');
    });
});
