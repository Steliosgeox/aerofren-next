/**
 * Server-Side Rate Limiting Utility
 * In-memory rate limiter for API routes
 * 
 * For production, consider using Upstash Redis for distributed rate limiting
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
}

// In-memory store (resets on server restart - fine for single instance)
// For multi-instance, use Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetTime < now) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

/**
 * Check and record a rate limit attempt
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { success: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // If no entry or window expired, create new entry
    if (!entry || entry.resetTime < now) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    // Increment count
    entry.count++;
    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and standard proxies
 */
export function getClientIP(request: Request): string {
    // Vercel
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    // Cloudflare
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    // Real IP header
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    return 'anonymous';
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const RATE_LIMITS = {
    // Contact form: 5 requests per minute
    contact: { windowMs: 60000, maxRequests: 5 },

    // Chat API: 20 requests per minute
    chat: { windowMs: 60000, maxRequests: 20 },

    // Chat history: 30 requests per minute
    chatHistory: { windowMs: 60000, maxRequests: 30 },

    // Auth attempts: 5 per minute (brute force protection)
    auth: { windowMs: 60000, maxRequests: 5 },
} as const;
