import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Zap, ArrowRight, Sparkles, Brain, Wand2 } from 'lucide-react';
import Footer from '../components/Footer';

/* ── Floating particle ── */
const Particle = ({ x, y, size, color, delay, duration }) => (
    <div
        className="particle"
        style={{
            left: `${x}%`, top: `${y}%`,
            width: size, height: size,
            background: color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            opacity: 0.4,
        }}
    />
);

/* ── Feature chip ── */
const FeatureChip = ({ icon: Icon, label, delay }) => (
    <div
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] backdrop-blur text-sm font-medium text-[var(--text2)] anim-slide-up"
        style={{ animationDelay: `${delay}s` }}
    >
        <Icon className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
        {label}
    </div>
);

const particles = [
    { x: 8, y: 20, size: 6, color: '#6366f1', delay: 0, duration: 5.5 },
    { x: 85, y: 15, size: 10, color: '#8b5cf6', delay: 0.8, duration: 6.2 },
    { x: 15, y: 75, size: 8, color: '#ec4899', delay: 1.5, duration: 4.8 },
    { x: 90, y: 70, size: 5, color: '#6366f1', delay: 0.4, duration: 7 },
    { x: 50, y: 5, size: 7, color: '#8b5cf6', delay: 1.2, duration: 5.2 },
    { x: 30, y: 88, size: 9, color: '#6366f1', delay: 0.6, duration: 6 },
    { x: 72, y: 40, size: 4, color: '#ec4899', delay: 1.8, duration: 5.8 },
    { x: 5, y: 50, size: 6, color: '#8b5cf6', delay: 0.2, duration: 4.5 },
];

const Login = () => {
    const { login } = useAuth();
    const { isDark } = useTheme();
    const canvasRef = useRef(null);

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-[var(--bg)] transition-colors duration-500">

            {/* ── Mesh Background ── */}
            <div className="mesh-bg">
                <div className="mesh-orb w-[600px] h-[600px] top-[-15%] right-[-10%]"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', animationDuration: '10s' }} />
                <div className="mesh-orb w-[500px] h-[500px] bottom-[-10%] left-[-10%]"
                    style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animationDuration: '13s', animationDelay: '2s' }} />
                <div className="mesh-orb w-[400px] h-[400px] top-[40%] left-[40%]"
                    style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', animationDuration: '8s', animationDelay: '4s', opacity: '0.07' }} />
            </div>

            {/* ── Floating Particles ── */}
            {particles.map((p, i) => <Particle key={i} {...p} />)}

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 py-20">
                <div className="w-full max-w-lg text-center">

                    {/* Logo */}
                    <div className="flex justify-center mb-8 anim-scale-in">
                        <div className="glow-ring">
                            <div className="glow-ring-inner p-4" style={{ animation: 'pulse-ring 2.5s ease-in-out infinite' }}>
                                <Zap className="h-8 w-8 text-white" fill="rgba(255,255,255,0.2)" />
                            </div>
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="anim-slide-up mb-2 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text3)]">
                        ai-form-builder
                    </div>

                    {/* Headline */}
                    <h1 className="anim-slide-up delay-100 text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1] mb-4">
                        Build forms with <span className="grad-text">AI magic.</span>
                    </h1>

                    <p className="anim-slide-up delay-200 text-base sm:text-lg font-medium mb-10 leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text2)' }}>
                        Describe your form idea — our AI engine designs, structures, and deploys it to Google Forms instantly.
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        <FeatureChip icon={Brain} label="AI Powered" delay={0.3} />
                        <FeatureChip icon={Wand2} label="Google Forms" delay={0.4} />
                        <FeatureChip icon={Sparkles} label="Instant Deploy" delay={0.5} />
                    </div>

                    {/* CTA Button */}
                    <div className="anim-slide-up delay-300 flex justify-center">
                        <button onClick={login} className="btn-primary px-10 py-4 text-base group">
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
                    <p className="anim-fade delay-500 mt-8 text-xs font-medium" style={{ color: 'var(--text3)' }}>
                        No credit card required · Enterprise-grade security
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;
