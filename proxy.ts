import { NextRequest, NextResponse } from 'next/server';

function buildCspHeader(nonce: string) {
    const isDev = process.env.NODE_ENV === 'development';
    const scriptSrc = [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        'https://apis.google.com',
        'https://*.firebaseio.com',
        'https://*.firebase.com',
    ];

    if (isDev) {
        scriptSrc.push("'unsafe-eval'");
    }

    const styleSrc = [
        "'self'",
        `'nonce-${nonce}'`,
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
    ];

    const directives = [
        `default-src 'self'`,
        `script-src ${scriptSrc.join(' ')}`,
        `style-src ${styleSrc.join(' ')}`,
        `img-src 'self' data: blob: https:`,
        `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://api.mistral.ai wss://*.firebaseio.com`,
        `font-src 'self' https://fonts.gstatic.com data:`,
        `frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com https://maps.google.com`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'self'`,
    ];

    if (!isDev) {
        directives.push('upgrade-insecure-requests');
    }

    return directives.join('; ');
}

export function proxy(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspHeader = buildCspHeader(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
