import React from 'react';
import { CheckCircle, Download, FileText, ArrowLeft, AlertTriangle, Calendar, Globe, Building2, User, Clock, Link2, ExternalLink, FileCheck, Shield, MapPin, Laptop, BriefcaseBusiness } from 'lucide-react';
import { downloadConsultationPdf } from '../services/api';
import type { Document, Requirement, Source, ResultDashboardProps } from '../interfaces/consultation';


export default function ResultConsultation({ result, onReset }: ResultDashboardProps) {
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [downloadError, setDownloadError] = React.useState<string | null>(null);

    const downloadPdf = async () => {
        if (!result.id) {
            setDownloadError('Invalid consultation ID');
            return;
        }

        setIsDownloading(true);
        setDownloadError(null);

        try {
            await downloadConsultationPdf(result.id);
        } catch (error: any) {
            console.error('Download error:', error);
            setDownloadError(error?.message || 'Failed to download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-600 text-white border-red-600';
            case 'medium':
                return 'bg-yellow-300 text-black border-black';
            case 'low':
                return 'bg-black text-yellow-300 border-black';
            default:
                return 'bg-neutral-200 text-neutral-800 border-neutral-400';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED':
                return 'bg-black text-yellow-300 border-black';
            case 'PENDING':
                return 'bg-yellow-300 text-black border-black';
            case 'FAILED':
                return 'bg-red-600 text-white border-red-600';
            default:
                return 'bg-neutral-200 text-neutral-800 border-neutral-400';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getCountryFlag = (countryCode: string) => {
        const flags: Record<string, string> = {
            'IT': 'Italia',
            'SI': 'Slovenia'
        };
        return flags[countryCode] || countryCode;
    };

    const hasRequirements = result.requirements && result.requirements.length > 0;
    const hasSummary = result.report?.summary && result.report.summary.length > 0;

    const requirementsByCategory = result.requirements?.reduce((acc: Record<string, Requirement[]>, req) => {
        const category = req.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(req);
        return acc;
    }, {});

    const categoryLabels: Record<string, string> = {
        'tax_reporting': 'Tax Reporting',
        'double_taxation': 'Double Taxation',
        'documents': 'Documentation',
        'residence': 'Tax Residence',
        'other': 'Other Requirements'
    };

    const cardClass = "p-6 md:p-8 bg-white border-2 border-black";
    const sectionTitle = "text-xl font-black tracking-tight uppercase mb-5 flex items-center gap-3 pb-3 border-b-2 border-black";
    const monoLabel = "font-sans text-[10px] uppercase tracking-widest text-neutral-500";

    return (
        <div className="max-w-6xl mx-auto px-4 py-36 space-y-6 text-neutral-900">

            <div className="p-6 md:p-8 bg-yellow-300 border-2 border-black">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className={monoLabel + " sm:hidden"}>[ Status ]</span>

                    <div className="w-14 h-14 bg-black flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-8 h-8 text-yellow-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                            Analysis Complete ✓
                        </h1>

                        <p className="text-sm text-neutral-800 mt-1">
                            Your cross-border tax consultation is ready for review
                        </p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                            <span className={`text-xs px-2 py-1 font-sans uppercase tracking-widest border-2 ${getStatusBadge(result.status)}`}>
                                {result.status}
                            </span>

                            <span className="font-sans text-xs uppercase tracking-widest text-neutral-700 flex items-center gap-1">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                Tax Year {result.taxYear}
                            </span>

                            {result.completedAt && (
                                <span className="font-sans text-xs uppercase tracking-widest text-neutral-700 flex items-center gap-1">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    Completed {formatDate(result.completedAt)}
                                </span>
                            )}
                        </div>
                    </div>

                    {onReset && (
                        <button
                            onClick={onReset}
                            className="w-full sm:w-auto px-4 py-2 bg-white text-black font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-black hover:bg-black hover:text-yellow-300 transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            New Consultation
                        </button>
                    )}
                </div>
            </div>

            <div className={cardClass}>
                <h2 className={sectionTitle}>
                    <User className="w-5 h-5" />
                    Your Situation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm border-b border-dashed border-neutral-300 pb-2">
                            <Globe className="w-4 h-4 text-neutral-500" />
                            <span className={monoLabel}>Residence:</span>
                            <span className="font-bold">
                                {getCountryFlag(result.caseContext.residenceCountry)} {result.caseContext.residenceCountry}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm border-b border-dashed border-neutral-300 pb-2">
                            <Building2 className="w-4 h-4 text-neutral-500" />
                            <span className={monoLabel}>Employer:</span>
                            <span className="font-bold">
                                {getCountryFlag(result.caseContext.employerCountry)} {result.caseContext.employerCountry}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield className="w-4 h-4 text-neutral-500" />
                            <span className={monoLabel}>Tax Residence:</span>
                            <span className="font-bold">
                                {getCountryFlag(result.caseContext.taxResidenceCountry)} {result.caseContext.taxResidenceCountry}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm border-b border-dashed border-neutral-300 pb-2">
                            <BriefcaseBusiness className="w-4 h-4 text-neutral-500" />
                            <span className={monoLabel}>Employment Type:</span>
                            <span className="font-bold uppercase">
                                {result.caseContext.employmentType?.toLowerCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm border-b border-dashed border-neutral-300 pb-2">
                            <Laptop className="w-4 h-4 text-neutral-500" />
                            <span className={monoLabel}>Remote Work:</span>
                            <span className={`font-bold uppercase ${result.caseContext.remoteWork ? 'text-black' : 'text-neutral-400'}`}>
                                {result.caseContext.remoteWork ? 'Yes' : 'No'}
                            </span>
                        </div>
                        {result.caseContext.workLocations?.length > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-neutral-500" />
                                <span className={monoLabel}>Work Locations:</span>
                                <span className="font-bold">
                                    {result.caseContext.workLocations.map(loc => getCountryFlag(loc)).join(' ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasSummary && (
                <div className={cardClass}>
                    <h2 className={sectionTitle}>
                        <FileCheck className="w-5 h-5" />
                        Executive Summary
                    </h2>
                    <div className="space-y-3">
                        {result.report.summary.map((item: string, index: number) => (
                            <div key={index} className="flex items-start gap-4 p-3 border-l-4 border-black bg-neutral-50">
                                <span className={`${monoLabel} shrink-0 mt-0.5`}>
                                    /{String(index + 1).padStart(2, '0')}
                                </span>
                                <p className="text-neutral-800">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasRequirements && requirementsByCategory && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-xl font-black tracking-tight uppercase">
                            Requirements ({result.requirements.length})
                        </h2>
                    </div>

                    {Object.entries(requirementsByCategory).map(([category, reqs]) => (
                        <div key={category} className={cardClass}>
                            <h3 className="font-sans text-xs uppercase tracking-widest text-neutral-500 mb-4 pb-3 border-b-2 border-black">
                                [ {categoryLabels[category] || category} ]
                            </h3>
                            <div className="space-y-4">
                                {reqs.map((req: Requirement) => (
                                    <div key={req.id} className="p-5 bg-neutral-50 border-2 border-black hover:bg-yellow-50 transition-colors">
                                        <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
                                            <h4 className="font-black text-lg tracking-tight uppercase">
                                                {req.title}
                                            </h4>
                                            <span className={`px-3 py-1 font-sans text-[10px] uppercase tracking-widest border-2 whitespace-nowrap ${getPriorityColor(req.priority)}`}>
                                                {req.priority} Priority
                                            </span>
                                        </div>

                                        <p className="text-sm text-neutral-700 mb-3">
                                            {req.description}
                                        </p>

                                        {req.action && (
                                            <div className="text-sm mb-3 flex items-start gap-2 border-l-4 border-yellow-300 pl-3">
                                                <span className="font-bold uppercase tracking-wide text-xs mt-0.5">Action:</span>
                                                <span className="text-neutral-800">{req.action}</span>
                                            </div>
                                        )}

                                        {req.documents && req.documents.length > 0 && (
                                            <div className="mt-4 pt-4 border-t-2 border-dashed border-neutral-400">
                                                <div className={monoLabel + " mb-3"}>
                                                    [ Required Documents ]
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {req.documents.map((doc: Document) => (
                                                        <div key={doc.id} className="flex items-start gap-3 text-sm bg-white px-3 py-2 border-2 border-black">
                                                            <FileText className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold">
                                                                    {doc.name}
                                                                    {doc.required && (
                                                                        <span className="text-red-600 ml-1">*</span>
                                                                    )}
                                                                </div>
                                                                {doc.purpose && (
                                                                    <div className="text-xs text-neutral-500">
                                                                        {doc.purpose}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {result.report?.sources && result.report.sources.length > 0 && (
                <div className={cardClass}>
                    <h2 className={sectionTitle}>
                        <Link2 className="w-5 h-5" />
                        Reference Sources
                    </h2>
                    <div className="space-y-3">
                        {result.report.sources.map((source: Source, index: number) => (
                            <div key={`${source.id}-${index}`} className="p-4 bg-neutral-50 border-2 border-black hover:bg-yellow-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 mb-2">
                                            <span className={monoLabel + " shrink-0 mt-0.5"}>
                                                /{String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h4 className="font-bold text-sm">
                                                {source.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-neutral-600 mb-1 pl-9">
                                            {source.authority}
                                        </p>
                                        {source.description && (
                                            <p className="text-xs text-neutral-500 mb-2 pl-9">
                                                {source.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2 pl-9">
                                            <span className="font-sans text-[10px] uppercase tracking-widest px-2 py-0.5 bg-black text-yellow-300">
                                                {source.type?.replace('_', ' ')}
                                            </span>
                                            {source.country && (
                                                <span className={monoLabel}>
                                                    {getCountryFlag(source.country)} {source.country}
                                                </span>
                                            )}
                                            {source.effectiveFrom && (
                                                <span className={monoLabel}>
                                                    Effective: {formatDate(source.effectiveFrom)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {source.url && (
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 border-2 border-black bg-white hover:bg-black hover:text-yellow-300 transition-colors flex-shrink-0"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result.report?.professionalReview?.recommended && (
                <div className="p-5 bg-yellow-300 border-2 border-black">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-black uppercase tracking-tight text-lg">
                                ⚠ Professional Review Recommended
                            </h4>
                            <p className="text-sm text-neutral-800 mt-1">
                                Due to the complexity of your situation, we recommend consulting with a tax professional.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <button
                    onClick={downloadPdf}
                    disabled={isDownloading}
                    className={`w-full py-5 bg-black text-yellow-300 font-black uppercase tracking-wider text-lg flex items-center justify-center gap-3 border-2 border-black transition-colors ${isDownloading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-yellow-300 hover:text-black'
                        }`}
                >
                    {isDownloading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download PDF Report
                        </>
                    )}
                </button>
                {downloadError && (
                    <p className="font-sans text-xs uppercase tracking-widest text-red-600 text-center">
                        ! {downloadError}
                    </p>
                )}
                <p className={monoLabel + " text-center"}>
                    Download your complete consultation report as a PDF document
                </p>
                {result.expiresAt && (
                    <p className={monoLabel + " text-center text-neutral-400"}>
                        Expires on {formatDate(result.expiresAt)}
                    </p>
                )}
            </div>
        </div>
    );
}