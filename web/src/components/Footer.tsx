import React from 'react';
import logo from "../assets/logo.png";
import ServerStatus from '../components/ServerStatus';
import { GitGraphIcon } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black text-white border-t-2 border-black">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-dashed border-neutral-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10  flex items-center justify-center">
                            <img src={logo} alt="TaxPri" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter uppercase leading-none">
                                TaxPri
                            </span>
                            <span className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
                                Cross-border tax
                            </span>
                        </div>
                    </div>

                    <div className="flex sm:flex-row flex-col items-center sm:gap-20 gap-8">
                        <a
                            href="/privacy"
                            className="font-sans text-xs uppercase tracking-widest text-neutral-400 hover:text-yellow-300 transition-colors"
                        >
                            → Privacy Policy
                        </a>
                        <ServerStatus />
                    </div>

                    <div className="font-sans text-xs uppercase tracking-widest text-neutral-500">
                        © {currentYear} TaxPri — All rights reserved
                    </div>
                </div>

                <div className="pt-6 flex flex-col gap-6">
                    <div className="flex items-start gap-3 max-w-3xl">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-yellow-300 shrink-0 mt-0.5">
                            [ Note ]
                        </span>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            <span className="font-semibold text-neutral-300 uppercase tracking-wide">Disclaimer:</span>{" "}
                            This is an autonomous consultation tool only.
                            We are not a tax advisory firm. Always consult with qualified tax professionals or
                            relevant authorities for advice specific to your situation.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 max-w-3xl">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-yellow-300 shrink-0 mt-0.5">
                            [ OSS ]
                        </span>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            <span className="font-semibold text-neutral-300 uppercase tracking-wide">Open Source:</span>{" "}
                            TaxPri is fully open source. Inspect the code, audit the rules, or contribute on{" "}
                            <a
                                href="https://github.com/rafaelmerlotto/Cross-Border-Tax-Assistant"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 align-baseline text-neutral-300 underline decoration-dotted hover:text-yellow-300 transition-colors"
                            >
                                GitHub
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}