import React from "react";
import { Link } from "react-router-dom";
import { Shield, FileText, Cookie, RotateCcw } from "lucide-react";

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="w-full shrink-0 border-t border-zinc-850/80 bg-zinc-950/70 backdrop-blur-md py-4 px-4 sm:px-8 mt-auto z-20 text-right"
            dir="rtl"
            role="contentinfo"
        >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-300">Persian VTT (Titipool)</span>
                    <span className="text-zinc-600">|</span>
                    <span>© {currentYear} تمامی حقوق محفوظ است.</span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-zinc-400" aria-label="پیوندهای حقوقی و خط‌مشی‌ها">
                    <Link
                        to="/terms-of-service"
                        className="hover:text-amber-400 transition-colors duration-150 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
                    >
                        <FileText className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                        <span>شرایط و قوانین</span>
                    </Link>
                    <Link
                        to="/privacy-policy"
                        className="hover:text-amber-400 transition-colors duration-150 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
                    >
                        <Shield className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                        <span>حریم خصوصی</span>
                    </Link>
                    <Link
                        to="/cookie-policy"
                        className="hover:text-amber-400 transition-colors duration-150 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
                    >
                        <Cookie className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                        <span>سیاست کوکی</span>
                    </Link>
                    <Link
                        to="/refund-policy"
                        className="hover:text-amber-400 transition-colors duration-150 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
                    >
                        <RotateCcw className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                        <span>بازگشت وجه</span>
                    </Link>
                </nav>

                <div className="text-zinc-500 text-[10px] font-mono">
                    پشتیبانی: <a href="mailto:support@titipool.ir" className="text-zinc-400 hover:text-amber-400 transition-colors">support@titipool.ir</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;