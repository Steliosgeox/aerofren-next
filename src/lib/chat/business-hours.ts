/**
 * Business hours checker for AEROFREN — Europe/Athens timezone.
 * Used by both server (API routes) and client (ChatContext).
 */

const TIMEZONE = 'Europe/Athens';
const BUSINESS_OPEN_HOUR = 9;
const BUSINESS_CLOSE_HOUR = 17;
// 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat (JS getDay: 0=Sun, 1=Mon, ..., 6=Sat)
const BUSINESS_DAYS = new Set([1, 2, 3, 4, 5, 6]);

const GREEK_DAY_NAMES: Record<number, string> = {
    0: 'Κυριακή',
    1: 'Δευτέρα',
    2: 'Τρίτη',
    3: 'Τετάρτη',
    4: 'Πέμπτη',
    5: 'Παρασκευή',
    6: 'Σάββατο',
};

function getAthensComponents(now?: Date): { hour: number; minute: number; dayOfWeek: number } {
    const date = now ?? new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hour12: false,
    }).formatToParts(date);

    let hour = 0;
    let minute = 0;
    let weekday = '';

    for (const part of parts) {
        if (part.type === 'hour') hour = Number(part.value);
        if (part.type === 'minute') minute = Number(part.value);
        if (part.type === 'weekday') weekday = part.value;
    }

    // Intl hour12:false can return 24 for midnight — normalize
    if (hour === 24) hour = 0;

    const dayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };

    return { hour, minute, dayOfWeek: dayMap[weekday] ?? 0 };
}

/**
 * Returns true if the current time in Athens is within business hours:
 * Monday–Saturday 09:00–17:00.
 */
export function isWithinBusinessHours(now?: Date): boolean {
    const { hour, dayOfWeek } = getAthensComponents(now);
    return BUSINESS_DAYS.has(dayOfWeek) && hour >= BUSINESS_OPEN_HOUR && hour < BUSINESS_CLOSE_HOUR;
}

/**
 * Returns the Greek label for the next business day opening.
 * Example: "τη Δευτέρα στις 09:00"
 */
export function getNextBusinessDayLabel(now?: Date): string {
    const { hour, dayOfWeek } = getAthensComponents(now);

    // If currently within hours, return "σήμερα"
    if (BUSINESS_DAYS.has(dayOfWeek) && hour >= BUSINESS_OPEN_HOUR && hour < BUSINESS_CLOSE_HOUR) {
        return 'σήμερα';
    }

    // If it's a business day but before opening
    if (BUSINESS_DAYS.has(dayOfWeek) && hour < BUSINESS_OPEN_HOUR) {
        return `σήμερα στις 0${BUSINESS_OPEN_HOUR}:00`;
    }

    // Find next business day
    let nextDay = (dayOfWeek + 1) % 7;
    while (!BUSINESS_DAYS.has(nextDay)) {
        nextDay = (nextDay + 1) % 7;
    }

    const accusative: Record<number, string> = {
        1: 'τη Δευτέρα',
        2: 'την Τρίτη',
        3: 'την Τετάρτη',
        4: 'την Πέμπτη',
        5: 'την Παρασκευή',
        6: 'το Σάββατο',
    };

    return `${accusative[nextDay]} στις 0${BUSINESS_OPEN_HOUR}:00`;
}
