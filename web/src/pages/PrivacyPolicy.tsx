import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function PrivacyPolicy() {
    const monoLabel = "font-sans text-[10px] uppercase tracking-widest text-neutral-500";
    const sectionTitle = "text-2xl font-black tracking-tighter uppercase flex items-center gap-3";

    return (
        <>
            <Header showNav={false} showBackToHome={true} mobileMenu={false} />
            <div className="min-h-screen bg-neutral-50 pt-32 py-12 px-4 text-neutral-900">
                <div className="max-w-5xl mx-auto bg-white border-2 border-black">

                    <div className="bg-yellow-300 border-b-2 border-black px-6 py-10">
                        <span className={monoLabel + " block mb-3"}>
                            [ Legal / Privacy ]
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
                            Privacy Policy & Terms of Use
                        </h1>
                        <p className="font-sans text-xs uppercase tracking-widest text-neutral-700 mt-3">
                            Last Updated: August 2026
                        </p>
                    </div>

                    <div className="p-6 md:p-10 space-y-10">
                        <div className="bg-black text-white p-6 md:p-8 border-2 border-black">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-yellow-300 border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight uppercase text-yellow-300">
                                        ⚠ Important Legal Disclaimer
                                    </h2>
                                    <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                                        <p>
                                            <strong className="text-white">This is an autonomous consultation tool only.</strong>
                                        </p>
                                        <p>
                                            We are <strong className="text-yellow-300">not a tax advisory firm, not a tax authority, and do not provide professional tax advice</strong>.
                                        </p>
                                        <p>
                                            The information provided by this application is for <strong className="text-white">informational and educational purposes only</strong>.
                                            It is based on publicly available information and general tax principles.
                                        </p>
                                        <p className="font-semibold">
                                            ! We take <strong className="text-yellow-300">no responsibility</strong> for decisions made based on this consultation.
                                            This tool does not replace professional tax advice.
                                        </p>
                                        <p>
                                            You should <strong className="text-white">always consult with a qualified tax professional</strong> or the relevant
                                            tax authorities (e.g., FURS in Slovenia) before making any tax-related decisions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>01 /</span> Introduction
                            </h2>
                            <div className="mt-4 text-neutral-700 space-y-4 border-l-4 border-black pl-5">
                                <p>
                                    Welcome to <strong className="text-black">TaxPri</strong> ("we," "our," or "us").
                                    We are committed to protecting your privacy and providing transparent information
                                    about how we handle your data.
                                </p>
                                <p>
                                    By using our application, you acknowledge that you have read, understood, and agree
                                    to the terms of this Privacy Policy and the legal disclaimers contained herein.
                                </p>
                                <div className="bg-yellow-50 p-4 border-2 border-black">
                                    <p className="text-sm text-neutral-800">
                                        <strong>Definition:</strong> Our service provides an <strong>autonomous consultation</strong>{" "}
                                        based on the information you provide. It generates possible scenarios and situations
                                        that may apply to you. It does not provide definitive answers or professional advice.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 md:p-8 border-2 border-black">
                            <h2 className={sectionTitle}>
                                <XCircle className="w-6 h-6 text-red-600" />
                                What We Do NOT Do
                            </h2>
                            <div className="mt-5 space-y-3">
                                {[
                                    <>We do <strong>not</strong> provide professional tax advice</>,
                                    <>We are <strong>not</strong> a certified tax advisory firm</>,
                                    <>We do <strong>not</strong> represent you before tax authorities</>,
                                    <>We do <strong>not</strong> file tax returns on your behalf</>,
                                    <>We do <strong>not</strong> guarantee the accuracy or completeness of the information provided</>,
                                    <>We do <strong>not</strong> take responsibility for decisions made based on our consultation</>,
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 border-l-4 border-red-600 bg-red-50">
                                        <span className={monoLabel + " shrink-0 mt-0.5"}>
                                            /{String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="text-sm text-neutral-800">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white p-6 md:p-8 border-2 border-black">
                            <h2 className={sectionTitle}>
                                <CheckCircle className="w-6 h-6" />
                                What We Do
                            </h2>
                            <div className="mt-5 space-y-3">
                                {[
                                    <>Provide an <strong>autonomous consultation tool</strong> for informational purposes</>,
                                    <>Show you <strong>possible scenarios and situations</strong> based on your inputs</>,
                                    <>Help you <strong>understand your tax situation</strong> and identify potential issues</>,
                                    <>Recommend <strong>consulting with qualified professionals</strong> when needed</>,
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 border-l-4 border-yellow-300 bg-yellow-50">
                                        <span className={monoLabel + " shrink-0 mt-0.5"}>
                                            /{String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="text-sm text-neutral-800">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>02 /</span> Information We Collect
                            </h2>
                            <div className="mt-4 space-y-5 text-neutral-700 border-l-4 border-black pl-5">
                                <div>
                                    <h3 className="font-sans text-xs uppercase tracking-widest text-neutral-500 mb-2">
                                        2.1 — Information You Provide
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            'Personal identification information (name, email address)',
                                            'Tax-related information you submit through the consultation',
                                            'Country of residence and employment details',
                                            'Responses to consultation questions',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <span className="font-sans text-xs text-neutral-400 mt-0.5">→</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-sans text-xs uppercase tracking-widest text-neutral-500 mb-2">
                                        2.2 — Automatically Collected Information
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            'Usage data (pages visited, time spent, features used)',
                                            'Device information (browser type, operating system, IP address)',
                                            'Cookies and similar tracking technologies',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <span className="font-sans text-xs text-neutral-400 mt-0.5">→</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>03 /</span> How We Use Your Information
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5">
                                <p className="mb-3 text-sm uppercase font-sans tracking-widest text-neutral-500">
                                    We use your information to:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Provide and maintain our consultation service',
                                        'Generate personalized tax situation reports',
                                        'Improve our algorithms and service quality',
                                        'Send you updates and relevant information (with your consent)',
                                        'Comply with legal obligations',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <span className="font-sans text-xs text-neutral-400 mt-0.5">
                                                /{String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>04 /</span> Data Storage and Security
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5 space-y-3 text-sm">
                                <p>Your data is stored on secure servers with industry-standard encryption.</p>
                                <p>We retain your data only as long as necessary to provide our services.</p>
                                <p>We implement appropriate technical and organizational measures to protect your data.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>05 /</span> Your Rights
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5">
                                <p className="mb-3 text-sm uppercase font-sans tracking-widest text-neutral-500">
                                    You have the right to:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Access your personal data',
                                        'Request correction of inaccurate data',
                                        'Request deletion of your data',
                                        'Opt-out of marketing communications',
                                        'Withdraw consent at any time',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <span className="font-sans text-xs text-neutral-400 mt-0.5">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>06 /</span> Third-Party Services
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5 text-sm">
                                <p>
                                    We may use third-party services (e.g., hosting providers, analytics) that
                                    may collect information about you. These services have their own privacy policies.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>07 /</span> Children's Privacy
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5 text-sm">
                                <p>Our service is not intended for children under 16. We do not knowingly collect personal information from children.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>08 /</span> Changes to This Policy
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5 text-sm">
                                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className={sectionTitle}>
                                <span className={monoLabel}>09 /</span> Contact Us
                            </h2>
                            <div className="mt-4 text-neutral-700 border-l-4 border-black pl-5 text-sm">
                                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                                <div className="mt-3 p-4 bg-black text-yellow-300 font-sans text-xs uppercase tracking-widest border-2 border-black inline-block">
                                    Email: info@oncestack.com
                                </div>
                            </div>
                        </section>

                        <div className="bg-neutral-50 p-6 md:p-8 border-2 border-black border-dashed">
                            <h3 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6" />
                                Final Disclaimer
                            </h3>
                            <div className="mt-4 text-sm text-neutral-700 space-y-3">
                                <p>
                                    <strong className="text-black">This service is provided "as is" without any warranties of any kind.</strong>
                                </p>
                                <p>
                                    The information provided is for general informational purposes only and does not constitute
                                    professional tax advice. You should <strong className="text-black">always consult with qualified tax professionals</strong>
                                    or the relevant tax authorities (such as FURS in Slovenia) for advice specific to your situation.
                                </p>
                                <p className={monoLabel}>
                                    By using this service, you agree that we are not liable for any decisions, actions, or outcomes
                                    resulting from the use of this consultation tool.
                                </p>
                                <p className={monoLabel}>
                                    Last Reviewed: August 2026
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    );
}