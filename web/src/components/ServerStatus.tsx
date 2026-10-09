import { useEffect, useState, useCallback, useRef } from 'react';
import {
    checkServerHealth,
    formatUptime,
    STATUS_COLORS,
    STATUS_LABELS,
    type HealthResponse,
    type OverallStatus,
} from '../services/health';

const POLL_INTERVAL = 60 * 60 * 1000;

export default function ServerStatus() {
    const [status, setStatus] = useState<OverallStatus>('checking');
    const [data, setData] = useState<HealthResponse | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const isMounted = useRef(true);

    const runCheck = useCallback(async () => {
        const result = await checkServerHealth();
        if (!isMounted.current) return;

        if (result) {
            setData(result);
            setStatus(result.status);
        } else {
            setData(null);
            setStatus('error');
        }
        setLastChecked(new Date());
    }, []);

    useEffect(() => {
        isMounted.current = true;
        runCheck();
        const interval = setInterval(runCheck, POLL_INTERVAL);
        return () => {
            isMounted.current = false;
            clearInterval(interval);
        };
    }, [runCheck]);

    const color = STATUS_COLORS[status];
    const label = STATUS_LABELS[status];

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
        >
            <button
                type="button"
                className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-neutral-400 hover:text-yellow-300 transition-colors cursor-default"
                aria-label={`Server status: ${label}`}
            >
                <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                        animation:
                            status === 'checking'
                                ? 'pulse 1.5s ease-in-out infinite'
                                : undefined,
                    }}
                />
                <span>{label}</span>
            </button>

            {showDetails && (
                <Tooltip
                    label={label}
                    color={color}
                    data={data}
                    lastChecked={lastChecked}
                />
            )}
        </div>
    );
}

interface TooltipProps {
    label: string;
    color: string;
    data: HealthResponse | null;
    lastChecked: Date | null;
}

function Tooltip({ label, color, data, lastChecked }: TooltipProps) {
    return (
        <div className="absolute bottom-full mb-2 w-56 p-3 bg-neutral-900 border border-neutral-700 text-[10px] font-sans uppercase tracking-widest text-neutral-400 z-50">
            <Row label="Status" value={label} valueColor={color} />

            {data && (
                <>
                    <Row label="Uptime" value={formatUptime(data.uptime)} />
                    <Row label="Response" value={`${data.responseTime}ms`} />
                    <Row
                        label="Engine"
                        value={data.checks.engine?.status === 'ok' ? 'OK' : 'Error'}
                    />
                </>
            )}

            {lastChecked && (
                <div className="mt-2 pt-2 border-t border-neutral-700 flex justify-between">
                    <span>Checked</span>
                    <span className="text-neutral-300">
                        {lastChecked.toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
}

function Row({
    label,
    value,
    valueColor,
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div className="flex justify-between mb-1">
            <span>{label}</span>
            <span className="text-neutral-300" style={{ color: valueColor }}>
                {value}
            </span>
        </div>
    );
}