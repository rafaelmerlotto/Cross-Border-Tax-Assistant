import React, { useState, useEffect } from 'react';

export default function Loading() {
    const [dots, setDots] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => setIsVisible(true), 50);

        const timer = setInterval(() => {
            setDots((prev) => (prev.length < 5 ? prev + '.' : ''));
        }, 600);

        return () => {
            clearTimeout(showTimer);
            clearInterval(timer);
        };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center bg-neutral-50/90 transition-all duration-700 ease-out ${isFadingOut
                ? 'opacity-0 scale-95'
                : isVisible
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
        >
            <div className="flex flex-col items-center gap-6 bg-white border-2 border-black px-10 py-8 min-w-[320px]">
                <div className="w-full flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-neutral-500">
                    <span>[ Status ]</span>
                    <span>Processing</span>
                </div>

                <div className="w-full h-px bg-black" />

                <div className="flex items-center gap-3">
                    <span className="text-4xl font-black tracking-tighter uppercase text-neutral-900">
                        Loading
                    </span>
                    <div className="flex gap-1 min-w-[40px]">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-yellow-300 border border-black rounded-none transition-all duration-300 ease-in-out"
                                style={{
                                    animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                                    opacity: dots.length > i ? 1 : 0.2,
                                    transform: dots.length > i ? 'scale(1)' : 'scale(0.5)',
                                }}
                            />
                        ))}
                    </div>
                </div>

                <p className="font-sans text-xs uppercase tracking-widest text-neutral-500">
                    {dots.length === 0 && 'Initializing...'}
                    {dots.length === 1 && 'Loading...'}
                    {dots.length === 2 && 'Processing data...'}
                    {dots.length === 3 && 'Almost ready...'}
                    {dots.length === 4 && 'Finalizing...'}
                    {dots.length === 5 && 'Completed!'}
                </p>

                <div className="w-full h-px bg-black" />

                <div className="w-full h-1 bg-neutral-200">
                    <div
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${Math.min((dots.length / 5) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}