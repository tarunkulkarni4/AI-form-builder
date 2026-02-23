import React from 'react';
import { Mail, Phone, Zap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-600/10">
                            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">AI Form Builder</span>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs font-medium text-slate-400">
                        &copy; {new Date().getFullYear()} AI Form Builder. All rights reserved.
                    </p>

                    {/* Contact */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs font-medium text-slate-500">
                        <a
                            href="mailto:tarunkulkarni4@gmail.com"
                            className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            tarunkulkarni4@gmail.com
                        </a>
                        <div className="hidden sm:block w-px h-3 bg-slate-200 dark:bg-slate-800" />
                        <a
                            href="tel:+919632915734"
                            className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                        >
                            <Phone className="h-3.5 w-3.5" />
                            +91 9632915734
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
