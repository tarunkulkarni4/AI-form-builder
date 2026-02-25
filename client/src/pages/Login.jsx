import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowRight, Sparkles, Brain, Wand2 } from 'lucide-react';
import Footer from '../components/Footer';

/* ── Feature chip ── */
const FeatureChip = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text2)]">
        <Icon className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
        {label}
    </div>
);

const Login = () => {
    const { login } = useAuth();

    return (
        <div className="relative min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
                <div className="w-full max-w-lg text-center">

                    {/* Logo */}
                    <div className="flex justify-center mb-10">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text3)]">
                        ai-form-builder
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1] mb-6">
                        Build forms with <span className="grad-text">AI magic.</span>
                    </h1>

                    <p className="text-base sm:text-lg font-medium mb-12 leading-relaxed max-w-sm mx-auto text-[var(--text2)]">
                        Describe your form idea — our AI engine designs, structures, and deploys it to Google Forms instantly.
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        <FeatureChip icon={Brain} label="AI Powered" />
                        <FeatureChip icon={Wand2} label="Google Forms" />
                        <FeatureChip icon={Sparkles} label="Instant Deploy" />
                    </div>

                    {/* CTA Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={login}
                            className="btn-primary px-10 py-4 text-base group flex items-center gap-3"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Footer note */}
                    <p className="mt-10 text-xs font-semibold text-[var(--text3)]">
                        No credit card required · Enterprise-grade security
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;
