import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Contact form validation schema
 */
const contactSchema = z.object({
    name: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες').max(100),
    email: z.string().email('Μη έγκυρο email'),
    phone: z.string().optional(),
    company: z.string().optional(),
    message: z.string().min(10, 'Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες').max(5000),
    honeypot: z.string().max(0).optional(), // Bot detection
});

/**
 * Contact API Route
 * Handles contact form submissions
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const validation = contactSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Validation failed' },
                { status: 400 }
            );
        }

        // Bot detection - if honeypot field is filled, silently succeed
        if (validation.data.honeypot) {
            return NextResponse.json({ success: true });
        }

        const { name, email, phone, company, message } = validation.data;

        // TODO: Implement actual email sending or database storage
        // For now, log and return success
        console.log('Contact form submission:', {
            name,
            email,
            phone,
            company,
            message: message.substring(0, 100) + '...',
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Το μήνυμά σας στάλθηκε επιτυχώς.',
        });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Contact API is running',
    });
}
