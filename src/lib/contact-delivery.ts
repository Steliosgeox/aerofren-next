/**
 * Contact Delivery Utilities
 *
 * Email transport is intentionally decoupled from the API route to keep
 * submission logic testable and to support multi-channel delivery.
 */

const PLACEHOLDER_PATTERNS = [/^your-/i, /@example\.com$/i, /app-password/i];
const DEFAULT_FROM_NAME = 'AEROFREN Website';
const DEFAULT_SUBJECT_PREFIX = '[AEROFREN Contact]';

export type ContactSubmissionPayload = {
    requestId: string;
    name: string;
    email: string;
    message: string;
    phone?: string;
    company?: string;
    subject?: string;
    submittedAtISO: string;
    ipAddress?: string;
};

export type ContactEmailConfig = {
    configured: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    recipients: string[];
    fromEmail: string;
    fromName: string;
    subjectPrefix: string;
    missing: string[];
};

export type ContactEmailSendResult = {
    attempted: boolean;
    success: boolean;
    messageId?: string;
    error?: string;
};

const getEnv = (key: string): string => process.env[key]?.trim() ?? '';

const hasNonPlaceholderValue = (value: string): boolean => {
    if (!value) return false;
    return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
};

const safeToNumber = (value: string, fallback: number): number => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const escapeHtml = (input: string): string =>
    input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

const formatValue = (value?: string): string => (value?.trim() ? value.trim() : '—');

export function getContactEmailConfig(): ContactEmailConfig {
    const smtpHost = getEnv('SMTP_HOST');
    const smtpPort = safeToNumber(getEnv('SMTP_PORT'), 587);
    const smtpUser = getEnv('SMTP_USER');
    const smtpPass = getEnv('SMTP_PASS');
    const recipients = getEnv('CONTACT_EMAIL')
        .split(',')
        .map((recipient) => recipient.trim())
        .filter(Boolean);

    const fromEmail = getEnv('CONTACT_FROM_EMAIL') || smtpUser;
    const fromName = getEnv('CONTACT_FROM_NAME') || DEFAULT_FROM_NAME;
    const subjectPrefix = getEnv('CONTACT_EMAIL_SUBJECT_PREFIX') || DEFAULT_SUBJECT_PREFIX;

    const missing: string[] = [];
    if (!hasNonPlaceholderValue(smtpHost)) missing.push('SMTP_HOST');
    if (!hasNonPlaceholderValue(smtpUser)) missing.push('SMTP_USER');
    if (!hasNonPlaceholderValue(smtpPass)) missing.push('SMTP_PASS');
    if (recipients.length === 0) missing.push('CONTACT_EMAIL');
    if (!hasNonPlaceholderValue(fromEmail)) missing.push('CONTACT_FROM_EMAIL/SMTP_USER');

    return {
        configured: missing.length === 0,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        recipients,
        fromEmail,
        fromName,
        subjectPrefix,
        missing,
    };
}

const buildContactEmailBody = (submission: ContactSubmissionPayload) => {
    const subjectLine = formatValue(submission.subject);
    const phone = formatValue(submission.phone);
    const company = formatValue(submission.company);
    const ipAddress = formatValue(submission.ipAddress);

    const text = [
        `${DEFAULT_SUBJECT_PREFIX} Νέα υποβολή`,
        '',
        `Request ID: ${submission.requestId}`,
        `Ημερομηνία: ${submission.submittedAtISO}`,
        '',
        `Ονοματεπώνυμο: ${submission.name}`,
        `E-mail: ${submission.email}`,
        `Τηλέφωνο: ${phone}`,
        `Εταιρεία: ${company}`,
        `Θέμα: ${subjectLine}`,
        `IP: ${ipAddress}`,
        '',
        'Μήνυμα:',
        submission.message,
    ].join('\n');

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#13263b">
            <h2 style="margin:0 0 12px">${escapeHtml(DEFAULT_SUBJECT_PREFIX)} Νέα υποβολή</h2>
            <p style="margin:0 0 16px;font-size:14px;color:#41566f">
                Request ID: <strong>${escapeHtml(submission.requestId)}</strong><br />
                Ημερομηνία: ${escapeHtml(submission.submittedAtISO)}
            </p>
            <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px">
                <tr><td><strong>Ονοματεπώνυμο:</strong></td><td>${escapeHtml(submission.name)}</td></tr>
                <tr><td><strong>E-mail:</strong></td><td>${escapeHtml(submission.email)}</td></tr>
                <tr><td><strong>Τηλέφωνο:</strong></td><td>${escapeHtml(phone)}</td></tr>
                <tr><td><strong>Εταιρεία:</strong></td><td>${escapeHtml(company)}</td></tr>
                <tr><td><strong>Θέμα:</strong></td><td>${escapeHtml(subjectLine)}</td></tr>
                <tr><td><strong>IP:</strong></td><td>${escapeHtml(ipAddress)}</td></tr>
            </table>
            <hr style="margin:16px 0;border:none;border-top:1px solid #d1dae3" />
            <p style="white-space:pre-wrap;margin:0">${escapeHtml(submission.message)}</p>
        </div>
    `;

    return { text, html };
};

export async function sendContactEmail(
    submission: ContactSubmissionPayload
): Promise<ContactEmailSendResult> {
    const config = getContactEmailConfig();

    if (!config.configured) {
        return {
            attempted: false,
            success: false,
            error: `CONTACT_EMAIL_NOT_CONFIGURED: ${config.missing.join(',')}`,
        };
    }

    const { text, html } = buildContactEmailBody(submission);
    const rawSubject = submission.subject?.trim();
    const emailSubject = rawSubject
        ? `${config.subjectPrefix} ${rawSubject}`
        : `${config.subjectPrefix} Νέο μήνυμα επικοινωνίας`;

    try {
        const nodemailer = await import('nodemailer');

        const transportOptions = {
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpPort === 465,
            auth: {
                user: config.smtpUser,
                pass: config.smtpPass,
            },
            connectionTimeout: 10_000,
            greetingTimeout: 8_000,
            socketTimeout: 15_000,
        };

        const transporter = nodemailer.createTransport(transportOptions);

        const result = await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to: config.recipients,
            replyTo: submission.email,
            subject: emailSubject,
            text,
            html,
        });

        return {
            attempted: true,
            success: true,
            messageId: result.messageId,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown SMTP error';
        console.error('[contact-email] SMTP send failed', {
            requestId: submission.requestId,
            error: message,
        });

        return {
            attempted: true,
            success: false,
            error: message,
        };
    }
}
