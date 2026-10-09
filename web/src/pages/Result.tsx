import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getConsultation } from "../services/api";
import Header from "../components/Header";
import ResultConsultation from "../components/ResultConsultation";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import NotFound from "./NotFound";

export default function Result() {
    const { consultationId } = useParams();
    const [res, setRes] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!consultationId) {
            setError('notfound');
            setLoading(false);
            return;
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(consultationId)) {
            setError('notfound');
            setLoading(false);
            return;
        }

        const loadConsultation = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await getConsultation(consultationId);
                setRes(result);
            } catch (err: any) {
                console.error('Failed to load consultation:', err);

                if (err?.status === 404 || err?.response?.status === 404) {
                    setError('notfound');
                } else {
                    setError(err?.message || 'Failed to load consultation. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadConsultation();
    }, [consultationId]);

    const handleReset = () => {
        window.location.href = '/';
    };

    if (loading) {
        return <Loading />;
    }

    if (error === 'notfound') {
        return <NotFound />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-mist-50">
                <Header showNav={false} showBackToHome={true} mobileMenu={false} />
                <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                    <p className="font-sans text-sm text-neutral-500 mb-6">{error}</p>
                    <button
                        onClick={handleReset}
                        className="px-8 py-4 bg-black text-yellow-300 font-black uppercase tracking-wider text-sm border-2 border-black hover:bg-yellow-300 hover:text-black transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!res?.consultation) {
        return <NotFound />;
    }

    return (
        <div className="min-h-screen bg-mist-50">
            <Header showNav={false} showBackToHome={true} mobileMenu={false} />
            <ResultConsultation
                result={res.consultation}
                onReset={handleReset}
            />
            <Footer />
        </div>
    );
}