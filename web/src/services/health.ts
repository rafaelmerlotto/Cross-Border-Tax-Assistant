export type CheckStatus = 'ok' | 'error' | 'degraded';
export type OverallStatus = 'checking' | 'ok' | 'degraded' | 'error';

export interface HealthCheck {
    status: CheckStatus;
    message?: string;
    latency?: number;
}

export interface HealthResponse {
    status: OverallStatus;
    timestamp: string;
    uptime: number;
    responseTime: number;
    checks: Record<string, HealthCheck>;
}

const API_URL = import.meta.env.VITE_API_URL;
const TIMEOUT_MS = 8_000;

export async function checkServerHealth(): Promise<HealthResponse | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(`${API_URL}/api/health`, {
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!res.ok) return null;

        return (await res.json()) as HealthResponse;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

export function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export const STATUS_COLORS: Record<OverallStatus, string> = {
    ok: '#22c55e',
    degraded: '#eab308',
    error: '#ef4444',
    checking: '#9ca3af',
};

export const STATUS_LABELS: Record<OverallStatus, string> = {
    ok: 'Operational',
    degraded: 'Degraded',
    error: 'Down',
    checking: 'Checking',
};