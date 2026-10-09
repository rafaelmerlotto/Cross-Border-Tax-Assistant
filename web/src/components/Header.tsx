import React, { useState } from 'react'
import logo from "../assets/logo.png"
import { ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate, type NavigateFunction } from 'react-router';


type HeaderValues = {
    showNav: boolean;
    showBackToHome: boolean;
    mobileMenu: boolean
}

export default function Header({ showNav, showBackToHome, mobileMenu }: HeaderValues) {

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const navigate: NavigateFunction = useNavigate()


    return (
        <nav className="fixed top-0 w-full bg-neutral-50 border-b-2 border-black z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-10 flex items-center justify-center cursor-pointer">
                            <img src={logo} alt="" onClick={() => navigate("/")} className="object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">TaxPri</span>
                    </div>


                    <div className="hidden md:flex items-center gap-8 pr-38">
                        {showNav &&
                            <>
                                <a href="#how-it-works" className="font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">How it Works</a>
                                <a href="#benefits" className="font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">Benefits</a>
                                <a href="#consultation-form" className="font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">Start Analysis</a>
                            </>
                        }
                    </div>


                    <div className="flex items-center gap-4">
                        {showBackToHome &&
                            <button
                                onClick={() => { navigate("/") }}
                                className="px-4 py-2 gap-2 flex items-center bg-black text-yellow-300 font-sans text-xs uppercase tracking-widest border-2 border-black hover:bg-yellow-300 hover:text-black transition-colors"
                            >
                                <ArrowLeft size={16} /> Back To Home
                            </button>
                        }
                        {mobileMenu &&
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 border-2 border-black bg-white hover:bg-yellow-300 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        }
                    </div>


                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden bg-neutral-50 border-t-2 border-black border-b-2">
                    <div className="px-4 py-3 space-y-1">
                        <a href="#how-it-works" className="block py-3 font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black border-b border-dashed border-neutral-300">→ How it Works</a>
                        <a href="#benefits" className="block py-3 font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black border-b border-dashed border-neutral-300">→ Benefits</a>
                        <a href="#consultation-form" className="block py-3 font-sans text-xs uppercase tracking-widest text-neutral-500 hover:text-black">→ Start Analysis</a>
                    </div>
                </div>
            )}
        </nav>
    )
}