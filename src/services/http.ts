export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = 'HttpError';
    }
}

export type AuthUser = {
    getIdToken: () => Promise<string>;
};

async function readJson<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
        return null as T;
    }
    try {
        return JSON.parse(text) as T;
    } catch (error) {
        throw new Error(`Invalid JSON response: ${(error as Error).message}`);
    }
}

export async function fetchJson<T>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> {
    const response = await fetch(input, init);
    const data = await readJson<T>(response);
    if (!response.ok) {
        const message =
            (data as { error?: string } | null)?.error ||
            `Request failed with status ${response.status}`;
        throw new HttpError(response.status, message);
    }
    return data;
}

export async function fetchWithAuth<T>(
    user: AuthUser | null,
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> {
    if (!user) {
        throw new Error('Authentication required');
    }

    const token = await user.getIdToken();
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);

    return fetchJson<T>(input, {
        ...init,
        headers,
    });
}
