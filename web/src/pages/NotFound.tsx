import { Link } from 'react-router';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <span className="font-black text-[120px] md:text-[180px] leading-none tracking-tighter text-black">
                        404
                    </span>
                </div>

                <div className="w-24 h-1 bg-yellow-300 mx-auto mb-8" />

                <h1 className="font-black uppercase tracking-tighter text-2xl md:text-3xl mb-4">
                    Page Not Found
                </h1>

                <p className="font-sans text-sm md:text-base text-neutral-500 leading-relaxed mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <Link to="/" className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-yellow-300 font-black uppercase tracking-wider text-sm border-2 border-black hover:bg-yellow-300 hover:text-black transition-colors">
                    ← Back to Home
                </Link>

            </div>
        </div>
    );
}